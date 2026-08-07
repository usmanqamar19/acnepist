import { useEffect, useRef, useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PuterBridge, type PuterBridgeHandle } from './PuterBridge';
import { sanitizeTherapeuticLanguage } from '../utils/safeLanguage';

interface Message {
  id: string;
  role: 'user' | 'therapist';
  content: string;
  timestamp: number;
  source?: 'puter' | 'local';
}

const CHAT_STORAGE_KEY = '@acnepist_chat_history';
const PUTER_TIMEOUT_MS = 5000; // 5 second timeout for Puter

// Fast local fallback responses
const LOCAL_RESPONSES = {
  greetings: [
    "Hello! I'm so glad you're here. How are you feeling today?",
    "Hi there! It's good to see you. What's on your mind?",
  ],
  sad: [
    "I hear that you're feeling down. Would you like to tell me more about what's happening?",
    "It sounds like things have been tough. I'm here to listen. What's weighing on you?",
  ],
  stressed: [
    "Stress can feel overwhelming. What's been causing the most pressure lately?",
    "I understand that feeling. What's one thing that's been particularly challenging?",
  ],
  skin: [
    "I know skin concerns can affect how we feel. How has it been impacting you?",
    "Skin journeys have ups and downs. What's been on your mind about your skin?",
  ],
  anxious: [
    "Anxiety can feel isolating, but you're not alone. What feels most overwhelming?",
    "I notice you're feeling anxious. Would you like to share what's triggering it?",
  ],
  default: [
    "I appreciate you sharing that. Can you tell me more about how that makes you feel?",
    "Thank you for opening up. What would feel most supportive right now?",
    "I hear you. Is there anything specific you'd like to explore together?",
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getLocalResponse(text: string): string {
  const lower = text.toLowerCase();
  if (/^(hi|hello|hey)\b/i.test(lower)) return pickRandom(LOCAL_RESPONSES.greetings);
  if (/sad|down|depressed|unhappy|crying/i.test(lower)) return pickRandom(LOCAL_RESPONSES.sad);
  if (/stress|overwhelm|pressure|exhausted/i.test(lower)) return pickRandom(LOCAL_RESPONSES.stressed);
  if (/skin|face|acne|pimple|breakout/i.test(lower)) return pickRandom(LOCAL_RESPONSES.skin);
  if (/anxious|anxiety|worried|nervous|panic/i.test(lower)) return pickRandom(LOCAL_RESPONSES.anxious);
  return pickRandom(LOCAL_RESPONSES.default);
}

export default function AITherapist({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [puterStatus, setPuterStatus] = useState<'connecting' | 'ready' | 'offline'>('connecting');
  const scrollViewRef = useRef<ScrollView>(null);
  const puterRef = useRef<PuterBridgeHandle>(null);

  // Check Puter status
  useEffect(() => {
    const interval = setInterval(() => {
      const ready = puterRef.current?.isReady() || false;
      setPuterStatus(ready ? 'ready' : 'connecting');
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (isLoaded && messages.length > 0) {
      saveChatHistory();
    }
  }, [messages, isLoaded]);

  // Auto-scroll to bottom
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const stored = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setIsLoaded(true);
          return;
        }
      }
    } catch (e) {}
    
    const welcomeMessage: Message = {
      id: generateId(),
      role: 'therapist',
      content: "Hi! I'm your AI companion. This is a safe, judgment-free space. How are you feeling today?",
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);
    setIsLoaded(true);
  };

  const saveChatHistory = async () => {
    try {
      const toSave = messages.slice(-50);
      await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {}
  };

  const clearChatHistory = async () => {
    try {
      await AsyncStorage.removeItem(CHAT_STORAGE_KEY);
      const welcomeMessage: Message = {
        id: generateId(),
        role: 'therapist',
        content: "Chat cleared! I'm here whenever you're ready to talk.",
        timestamp: Date.now(),
      };
      setMessages([welcomeMessage]);
    } catch (e) {}
  };

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const buildPuterPrompt = (userText: string): string => {
    const recent = messages.slice(-6).map(m => 
      `${m.role === 'user' ? 'User' : 'Therapist'}: ${m.content}`
    ).join('\n');

    return `You are a warm, empathetic AI therapist for skin wellness.

RULES:
- Be conversational and human-like
- Keep responses to 2-3 sentences max
- Ask ONE follow-up question
- NEVER use: diagnosis, treatment, cure, inflammation, cyst, pustule, prescription
- USE instead: observation, care, support, redness, sensitivity, blemish

Recent chat:
${recent}

User: ${userText}

Respond warmly in 2-3 sentences:`;
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);

    let response = '';
    let source: 'puter' | 'local' = 'local';

    // Try Puter with timeout, fallback to local
    try {
      const puterReady = puterRef.current?.isReady();
      
      if (puterReady) {
        // Race Puter against timeout
        const puterPromise = puterRef.current!.chat({ prompt: buildPuterPrompt(userMessage.content) });
        const timeoutPromise = new Promise<null>((_, reject) => 
          setTimeout(() => reject(new Error('timeout')), PUTER_TIMEOUT_MS)
        );

        try {
          const result = await Promise.race([puterPromise, timeoutPromise]);
          if (result && typeof result === 'string' && result.trim()) {
            response = sanitizeTherapeuticLanguage(result.trim());
            source = 'puter';
          }
        } catch (e) {
          // Puter timed out or failed, use local
        }
      }
    } catch (e) {}

    // Use local fallback if no Puter response
    if (!response) {
      await new Promise(r => setTimeout(r, 400)); // Brief delay for natural feel
      response = getLocalResponse(userMessage.content);
      source = 'local';
    }

    const therapistMessage: Message = {
      id: generateId(),
      role: 'therapist',
      content: response,
      timestamp: Date.now(),
      source,
    };

    setMessages(prev => [...prev, therapistMessage]);
    setIsTyping(false);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusColor = () => {
    if (puterStatus === 'ready') return '#10B981';
    if (puterStatus === 'connecting') return '#F59E0B';
    return '#94A3B8';
  };

  const getStatusText = () => {
    if (puterStatus === 'ready') return 'AI Online';
    if (puterStatus === 'connecting') return 'Connecting...';
    return 'Offline Mode';
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#60A5FA', '#93C5FD']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>Talk Now</Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
                <Text style={styles.statusText}>{getStatusText()}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={clearChatHistory} style={styles.clearBtn}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* AI Avatar Card */}
          <View style={styles.aiCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200' }}
              style={styles.aiAvatar}
            />
            <Text style={styles.aiName}>Olivia</Text>
            <Text style={styles.aiRole}>Your AI Companion</Text>
          </View>

          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.role === 'user' ? styles.userWrapper : styles.therapistWrapper,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  message.role === 'user' ? styles.userBubble : styles.therapistBubble,
                ]}
              >
                <Text style={[styles.messageText, message.role === 'user' ? styles.userText : styles.therapistText]}>
                  {message.content}
                </Text>
                <View style={styles.messageFooter}>
                  {message.source === 'puter' && (
                    <Text style={styles.puterBadge}>✨ AI</Text>
                  )}
                  <Text style={[styles.timestamp, message.role === 'user' ? styles.userTimestamp : styles.therapistTimestamp]}>
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={styles.therapistWrapper}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.dot, styles.dot1]} />
                  <View style={[styles.dot, styles.dot2]} />
                  <View style={[styles.dot, styles.dot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type your message..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              returnKeyType="send"
            />
          </View>
          <TouchableOpacity
            onPress={handleSend}
            disabled={!input.trim() || isTyping}
            style={[styles.sendBtn, (!input.trim() || isTyping) && styles.sendBtnDisabled]}
          >
            <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.sendBtnGradient}>
              <Ionicons name="send" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Hidden Puter Bridge */}
      <PuterBridge ref={puterRef} timeoutMs={PUTER_TIMEOUT_MS} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: { paddingBottom: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 6 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, color: 'rgba(255,255,255,0.9)' },
  clearBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1 },
  messagesContainer: { flex: 1 },
  messagesContent: { padding: 16, paddingBottom: 20 },
  
  aiCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  aiAvatar: { width: 60, height: 60, borderRadius: 30, marginBottom: 8, borderWidth: 2, borderColor: '#DBEAFE' },
  aiName: { fontSize: 16, fontWeight: '700', color: '#1E293B' },
  aiRole: { fontSize: 13, color: '#64748B', marginTop: 2 },
  
  messageWrapper: { marginBottom: 10, maxWidth: '82%' },
  userWrapper: { alignSelf: 'flex-end' },
  therapistWrapper: { alignSelf: 'flex-start' },
  bubble: { borderRadius: 18, padding: 12, paddingBottom: 6 },
  userBubble: { backgroundColor: '#3B82F6', borderBottomRightRadius: 4 },
  therapistBubble: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  messageText: { fontSize: 15, lineHeight: 21 },
  userText: { color: '#fff' },
  therapistText: { color: '#1E293B' },
  messageFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 4 },
  puterBadge: { fontSize: 10, color: '#3B82F6', marginRight: 6, fontWeight: '600' },
  timestamp: { fontSize: 10 },
  userTimestamp: { color: 'rgba(255,255,255,0.7)' },
  therapistTimestamp: { color: '#94A3B8' },
  
  typingBubble: { backgroundColor: '#fff', borderRadius: 18, padding: 12, borderBottomLeftRadius: 4 },
  typingDots: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#94A3B8', marginRight: 4 },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.8, marginRight: 0 },
  
  inputContainer: { flexDirection: 'row', padding: 12, paddingBottom: 28, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E2E8F0', alignItems: 'flex-end' },
  inputWrapper: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 24, paddingHorizontal: 16, marginRight: 10, minHeight: 46, justifyContent: 'center' },
  input: { fontSize: 15, color: '#1E293B', paddingVertical: 11, maxHeight: 100 },
  sendBtn: { justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnGradient: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
});
