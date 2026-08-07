import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Habit {
  id: string;
  name: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  completed: boolean;
}

const initialHabits: Habit[] = [
  { id: '1', name: 'Fresh Pillowcase', description: 'Change or flip your pillowcase', icon: 'bed-outline', completed: false },
  { id: '2', name: 'Hydration Check', description: 'Drink a glass of water', icon: 'water-outline', completed: false },
  { id: '3', name: 'Gentle Cleanse', description: 'Wash face with lukewarm water', icon: 'sparkles-outline', completed: false },
  { id: '4', name: 'Mindful Moment', description: '2 minutes of deep breathing', icon: 'leaf-outline', completed: false },
  { id: '5', name: 'Touch Awareness', description: 'Notice face-touching habits', icon: 'hand-left-outline', completed: false },
  { id: '6', name: 'Sleep Prep', description: 'Start winding down routine', icon: 'moon-outline', completed: false },
];

export default function HabitStacking({ onBack }: { onBack: () => void }) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);

  const toggleHabit = (id: string) => {
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const completedCount = habits.filter(h => h.completed).length;
  const progress = (completedCount / habits.length) * 100;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Daily Habits</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Today's Progress</Text>
            <Text style={styles.progressCount}>{completedCount}/{habits.length}</Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient 
              colors={['#3B82F6', '#2563EB']} 
              style={[styles.progressBarFill, { width: `${progress}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
          <Text style={styles.progressMessage}>
            {completedCount === habits.length 
              ? "🎉 Amazing! You've completed all habits!"
              : completedCount > habits.length / 2
              ? "Great progress! Keep going!"
              : "Small steps lead to big changes"}
          </Text>
        </View>

        {/* Habits List */}
        <Text style={styles.sectionTitle}>Your Wellness Stack</Text>
        
        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            style={[styles.habitCard, habit.completed && styles.habitCardCompleted]}
            onPress={() => toggleHabit(habit.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.habitIcon, habit.completed && styles.habitIconCompleted]}>
              <Ionicons 
                name={habit.completed ? 'checkmark' : habit.icon} 
                size={24} 
                color={habit.completed ? '#fff' : '#3B82F6'} 
              />
            </View>
            <View style={styles.habitContent}>
              <Text style={[styles.habitName, habit.completed && styles.habitNameCompleted]}>
                {habit.name}
              </Text>
              <Text style={styles.habitDescription}>{habit.description}</Text>
            </View>
            <View style={[styles.checkbox, habit.completed && styles.checkboxCompleted]}>
              {habit.completed && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </TouchableOpacity>
        ))}

        {/* Tip Card */}
        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={24} color="#F59E0B" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Gentle Reminder</Text>
            <Text style={styles.tipText}>
              Stack habits onto existing routines. "After I brush my teeth, I will drink water."
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerGradient: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#fff' },
  content: { flex: 1, padding: 20 },
  
  // Progress Card
  progressCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  progressCount: { fontSize: 18, fontWeight: '700', color: '#3B82F6' },
  progressBarBg: { height: 8, backgroundColor: '#E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressBarFill: { height: '100%', borderRadius: 4 },
  progressMessage: { fontSize: 14, color: '#64748B', textAlign: 'center' },

  // Section
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },

  // Habit Card
  habitCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  habitCardCompleted: { backgroundColor: '#EFF6FF' },
  habitIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  habitIconCompleted: { backgroundColor: '#3B82F6' },
  habitContent: { flex: 1 },
  habitName: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
  habitNameCompleted: { textDecorationLine: 'line-through', color: '#64748B' },
  habitDescription: { fontSize: 13, color: '#94A3B8' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  checkboxCompleted: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },

  // Tip Card
  tipCard: { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: 16, padding: 16, marginTop: 8, marginBottom: 20 },
  tipContent: { flex: 1, marginLeft: 12 },
  tipTitle: { fontSize: 14, fontWeight: '600', color: '#92400E', marginBottom: 4 },
  tipText: { fontSize: 13, color: '#A16207', lineHeight: 20 },
});
