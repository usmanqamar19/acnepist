import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image, Dimensions, Modal, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import SkinStateScan from './components/SkinStateScan';
import AITherapist from './components/AITherapist';
import HabitStacking from './components/HabitStacking';
import GentleShelf from './components/GentleShelf';
import ARMeshCamera from './components/ARMeshCamera';

const { width } = Dimensions.get('window');

type TabType = 'chat' | 'breathing' | 'skin' | 'shelf';
type ScreenType = 'tabs' | 'scan' | 'therapist' | 'habits' | 'shelf' | 'ar-mesh';

const moods = ['Calm', 'Neutral', 'Anxious', 'Stressed', 'Happy'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('tabs');
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [selectedMood, setSelectedMood] = useState<string>('Neutral');
  const [profileVisible, setProfileVisible] = useState(false);

  // Handle tab press - navigate to full screen for some tabs
  const handleTabPress = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'chat') setCurrentScreen('therapist');
    else if (tab === 'breathing') setCurrentScreen('habits');
    else if (tab === 'skin') setCurrentScreen('scan');
    else if (tab === 'shelf') setCurrentScreen('shelf');
  };

  // Full screen views - no wrapper, direct render
  if (currentScreen === 'scan') {
    return <SkinStateScan onBack={() => { setCurrentScreen('tabs'); setActiveTab('chat'); }} />;
  }
  if (currentScreen === 'therapist') {
    return <AITherapist onBack={() => { setCurrentScreen('tabs'); setActiveTab('chat'); }} />;
  }
  if (currentScreen === 'habits') {
    return <HabitStacking onBack={() => { setCurrentScreen('tabs'); setActiveTab('chat'); }} />;
  }
  if (currentScreen === 'shelf') {
    return <GentleShelf onBack={() => { setCurrentScreen('tabs'); setActiveTab('chat'); }} />;
  }
  if (currentScreen === 'ar-mesh') {
    return <ARMeshCamera onBack={() => { setCurrentScreen('tabs'); setActiveTab('chat'); }} />;
  }

  return (
    <>
      <View style={styles.container}>
        <StatusBar style="dark" />
        <LinearGradient 
          colors={['#E0F2FE', '#DBEAFE', '#F0F9FF']} 
          style={styles.gradient}
        >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Header with Profile */}
            <View style={styles.header}>
              <TouchableOpacity onPress={() => setProfileVisible(true)} style={styles.profileBtn}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100' }} 
                  style={styles.avatar}
                />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsBtn}>
                <Ionicons name="notifications-outline" size={22} color="#3B82F6" />
              </TouchableOpacity>
            </View>

            {/* Greeting */}
            <View style={styles.greeting}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={styles.greetingTitle}>Hi, how are you{'\n'}feeling today?</Text>
            </View>

            {/* Mood Selection */}
            <View style={styles.moodSection}>
              <View style={styles.moodHeader}>
                <Text style={styles.sectionLabel}>Select your current mood</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAll}>View All</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
                {moods.map((mood) => (
                  <TouchableOpacity
                    key={mood}
                    style={[styles.moodPill, selectedMood === mood && styles.moodPillActive]}
                    onPress={() => setSelectedMood(mood)}
                  >
                    <Text style={[styles.moodText, selectedMood === mood && styles.moodTextActive]}>
                      {mood}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Feature Cards */}
            <View style={styles.featureGrid}>
              <TouchableOpacity 
                style={[styles.featureCard, styles.featureCardPrimary]}
                onPress={() => handleTabPress('chat')}
              >
                <Ionicons name="chatbubbles" size={28} color="#fff" style={styles.featureIcon} />
                <Text style={styles.featureTitle}>Talk Now</Text>
                <Text style={styles.featureSubtitle}>Chat with your{'\n'}AI Companion</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.featureCard}
                onPress={() => handleTabPress('breathing')}
              >
                <Ionicons name="leaf" size={28} color="#3B82F6" style={styles.featureIcon} />
                <Text style={styles.featureTitleDark}>Guided{'\n'}Breathing</Text>
                <Text style={styles.featureSubtitleDark}>Relax & focus{'\n'}your mind</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.featureCard}
                onPress={() => handleTabPress('skin')}
              >
                <Ionicons name="scan" size={28} color="#3B82F6" style={styles.featureIcon} />
                <Text style={styles.featureTitleDark}>Skin{'\n'}Check-In</Text>
                <Text style={styles.featureSubtitleDark}>Daily skin{'\n'}snapshot</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.featureCard, styles.featureCardSecondary]}
                onPress={() => handleTabPress('shelf')}
              >
                <Ionicons name="heart" size={28} color="#fff" style={styles.featureIcon} />
                <Text style={styles.featureTitle}>Gentle{'\n'}Shelf</Text>
                <Text style={styles.featureSubtitle}>Product{'\n'}Recommendations</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.featureCard, styles.featureCardAR]}
                onPress={() => setCurrentScreen('ar-mesh')}
              >
                <Ionicons name="sparkles" size={28} color="#fff" style={styles.featureIcon} />
                <Text style={styles.featureTitle}>AR Face{'\n'}Mesh</Text>
                <Text style={styles.featureSubtitle}>3D Face{'\n'}Tracking</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Week</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>7</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>12</Text>
                  <Text style={styles.statLabel}>Check-ins</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>85%</Text>
                  <Text style={styles.statLabel}>Consistency</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('chat')}>
            <View style={[styles.tabIconWrap, activeTab === 'chat' && styles.tabIconWrapActive]}>
              <Ionicons name={activeTab === 'chat' ? 'chatbubbles' : 'chatbubbles-outline'} size={22} color={activeTab === 'chat' ? '#fff' : '#64748B'} />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'chat' && styles.tabLabelActive]}>Talk Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('breathing')}>
            <View style={[styles.tabIconWrap, activeTab === 'breathing' && styles.tabIconWrapActive]}>
              <Ionicons name={activeTab === 'breathing' ? 'leaf' : 'leaf-outline'} size={22} color={activeTab === 'breathing' ? '#fff' : '#64748B'} />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'breathing' && styles.tabLabelActive]}>Breathing</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('skin')}>
            <View style={[styles.tabIconWrap, activeTab === 'skin' && styles.tabIconWrapActive]}>
              <Ionicons name={activeTab === 'skin' ? 'scan' : 'scan-outline'} size={22} color={activeTab === 'skin' ? '#fff' : '#64748B'} />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'skin' && styles.tabLabelActive]}>Skin</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.tabItem} onPress={() => handleTabPress('shelf')}>
            <View style={[styles.tabIconWrap, activeTab === 'shelf' && styles.tabIconWrapActive]}>
              <Ionicons name={activeTab === 'shelf' ? 'heart' : 'heart-outline'} size={22} color={activeTab === 'shelf' ? '#fff' : '#64748B'} />
            </View>
            <Text style={[styles.tabLabel, activeTab === 'shelf' && styles.tabLabelActive]}>Shelf</Text>
          </TouchableOpacity>
        </View>
        </LinearGradient>
      </View>

      {/* Profile Modal */}
      <Modal
        visible={profileVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileVisible(false)}
      >
        <View style={styles.modalContainer}>
          <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.modalHeader}>
            <SafeAreaView>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Profile</Text>
                <TouchableOpacity onPress={() => setProfileVisible(false)} style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </LinearGradient>

          <ScrollView style={styles.modalContent}>
            <View style={styles.profileHeader}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200' }} 
                style={styles.profileAvatar}
              />
              <Text style={styles.profileName}>Welcome Back!</Text>
              <Text style={styles.profileSubtitle}>Your skin wellness journey</Text>
            </View>

            <View style={styles.profileStatsRow}>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>12</Text>
                <Text style={styles.profileStatLabel}>Check-ins</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>7</Text>
                <Text style={styles.profileStatLabel}>Day Streak</Text>
              </View>
              <View style={styles.profileStatItem}>
                <Text style={styles.profileStatNumber}>85%</Text>
                <Text style={styles.profileStatLabel}>Consistency</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.profileOption}>
              <Ionicons name="person-outline" size={22} color="#3B82F6" />
              <Text style={styles.profileOptionText}>Edit Profile</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileOption}>
              <Ionicons name="notifications-outline" size={22} color="#3B82F6" />
              <Text style={styles.profileOptionText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileOption}>
              <Ionicons name="moon-outline" size={22} color="#3B82F6" />
              <Text style={styles.profileOptionText}>Appearance</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileOption}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#3B82F6" />
              <Text style={styles.profileOptionText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.profileOption}>
              <Ionicons name="help-circle-outline" size={22} color="#3B82F6" />
              <Text style={styles.profileOptionText}>Help & Support</Text>
              <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.profileOption, styles.profileOptionDanger]}>
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
              <Text style={[styles.profileOptionText, { color: '#EF4444' }]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={20} color="#EF4444" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 20 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, paddingBottom: 20 },
  profileBtn: { padding: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, borderWidth: 3, borderColor: '#fff' },
  settingsBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },

  // Greeting
  greeting: { marginBottom: 24 },
  sparkle: { fontSize: 24, marginBottom: 8 },
  greetingTitle: { fontSize: 32, fontWeight: '700', color: '#1E293B', lineHeight: 40, letterSpacing: -0.5 },

  // Mood Section
  moodSection: { marginBottom: 24 },
  moodHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionLabel: { fontSize: 15, color: '#64748B', fontWeight: '500' },
  viewAll: { fontSize: 14, color: '#3B82F6', fontWeight: '600' },
  moodScroll: { flexDirection: 'row' },
  moodPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', marginRight: 10, borderWidth: 1.5, borderColor: '#E2E8F0' },
  moodPillActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  moodText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  moodTextActive: { color: '#fff' },

  // Feature Grid
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureCard: { width: (width - 52) / 2, backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 12, minHeight: 140, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureCardPrimary: { backgroundColor: '#3B82F6' },
  featureCardSecondary: { backgroundColor: '#1E40AF' },
  featureCardAR: { backgroundColor: '#9CAF88' },
  featureIcon: { marginBottom: 12 },
  featureTitle: { fontSize: 17, fontWeight: '700', color: '#fff', marginBottom: 6 },
  featureTitleDark: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 6 },
  featureSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 17 },
  featureSubtitleDark: { fontSize: 12, color: '#64748B', lineHeight: 17 },

  // Stats Card
  statsCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  statsTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginBottom: 16, textAlign: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#3B82F6' },
  statLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  statDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },

  // Tab Bar
  tabBar: { flexDirection: 'row', backgroundColor: '#fff', paddingTop: 8, paddingBottom: 28, paddingHorizontal: 8, borderTopWidth: 0.5, borderTopColor: '#E2E8F0', shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 8 },
  tabItem: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  tabIconWrap: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  tabIconWrapActive: { backgroundColor: '#3B82F6' },
  tabLabel: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  tabLabelActive: { color: '#3B82F6', fontWeight: '600' },

  // Modal
  modalContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: { paddingBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#fff' },
  modalCloseBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { flex: 1, padding: 20 },

  // Profile
  profileHeader: { alignItems: 'center', paddingVertical: 24 },
  profileAvatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 16, borderWidth: 4, borderColor: '#DBEAFE' },
  profileName: { fontSize: 24, fontWeight: '700', color: '#1E293B', marginBottom: 4 },
  profileSubtitle: { fontSize: 15, color: '#64748B' },
  profileStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 24, backgroundColor: '#fff', borderRadius: 16, padding: 16 },
  profileStatItem: { alignItems: 'center' },
  profileStatNumber: { fontSize: 24, fontWeight: '700', color: '#3B82F6' },
  profileStatLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
  profileOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 16, paddingHorizontal: 16, borderRadius: 16, marginBottom: 10 },
  profileOptionText: { flex: 1, fontSize: 16, color: '#1E293B', marginLeft: 12, fontWeight: '500' },
  profileOptionDanger: { marginTop: 10 },
});
