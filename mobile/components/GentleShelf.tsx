import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  category: string;
  note: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const products: Product[] = [
  { id: '1', name: 'Gentle Foaming Cleanser', category: 'For daily cleansing', note: 'Removes impurities without stripping', icon: 'water-outline', color: '#3B82F6' },
  { id: '2', name: 'Calming Moisturizer', category: 'For hydration', note: 'Lightweight, non-comedogenic', icon: 'leaf-outline', color: '#10B981' },
  { id: '3', name: 'Soothing Serum', category: 'For sensitivity', note: 'With niacinamide and centella', icon: 'flask-outline', color: '#8B5CF6' },
  { id: '4', name: 'Mineral Sunscreen', category: 'For protection', note: 'SPF 30+ zinc-based formula', icon: 'sunny-outline', color: '#F59E0B' },
  { id: '5', name: 'Spot Treatment Gel', category: 'For targeted care', note: 'Salicylic acid 2%', icon: 'medical-outline', color: '#EF4444' },
  { id: '6', name: 'Silk Pillowcase', category: 'For sleep', note: 'Reduces friction and bacteria', icon: 'bed-outline', color: '#EC4899' },
];

const categories = ['All', 'Cleansing', 'Hydration', 'Protection'];

export default function GentleShelf({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#3B82F6', '#60A5FA']} style={styles.headerGradient}>
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gentle Shelf</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introCard}>
          <Ionicons name="heart-outline" size={28} color="#3B82F6" />
          <Text style={styles.introTitle}>Curated with Care</Text>
          <Text style={styles.introText}>
            These are friendly suggestions, not prescriptions. Always patch test new products and listen to your skin.
          </Text>
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[styles.categoryPill, selectedCategory === cat && styles.categoryPillActive]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Products */}
        <Text style={styles.sectionTitle}>Recommended Products</Text>
        
        {products.map((product) => (
          <TouchableOpacity key={product.id} style={styles.productCard} activeOpacity={0.7}>
            <View style={[styles.productIcon, { backgroundColor: `${product.color}20` }]}>
              <Ionicons name={product.icon} size={24} color={product.color} />
            </View>
            <View style={styles.productContent}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productCategory}>{product.category}</Text>
              <Text style={styles.productNote}>{product.note}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#94A3B8" />
          </TouchableOpacity>
        ))}

        {/* Disclaimer */}
        <View style={styles.disclaimerCard}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          <Text style={styles.disclaimerText}>
            Always do a patch test before trying new products. These are suggestions from our community, not medical advice.
          </Text>
        </View>

        {/* Learn More */}
        <TouchableOpacity style={styles.learnMoreBtn}>
          <LinearGradient colors={['#3B82F6', '#2563EB']} style={styles.learnMoreGradient}>
            <Text style={styles.learnMoreText}>Learn About Ingredients</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
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

  // Intro Card
  introCard: { backgroundColor: '#EFF6FF', borderRadius: 20, padding: 20, alignItems: 'center', marginBottom: 20 },
  introTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginTop: 12, marginBottom: 8 },
  introText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22 },

  // Categories
  categoryScroll: { marginBottom: 24 },
  categoryPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#fff', marginRight: 10, borderWidth: 1.5, borderColor: '#E2E8F0' },
  categoryPillActive: { backgroundColor: '#3B82F6', borderColor: '#3B82F6' },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#64748B' },
  categoryTextActive: { color: '#fff' },

  // Section
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#1E293B', marginBottom: 16 },

  // Product Card
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  productIcon: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  productContent: { flex: 1 },
  productName: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 2 },
  productCategory: { fontSize: 13, color: '#3B82F6', fontWeight: '500', marginBottom: 4 },
  productNote: { fontSize: 12, color: '#94A3B8' },

  // Disclaimer
  disclaimerCard: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, marginTop: 8, marginBottom: 16 },
  disclaimerText: { flex: 1, fontSize: 12, color: '#64748B', marginLeft: 10, lineHeight: 18 },

  // Learn More
  learnMoreBtn: { marginBottom: 30, borderRadius: 16, overflow: 'hidden' },
  learnMoreGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  learnMoreText: { color: '#fff', fontSize: 16, fontWeight: '600', marginRight: 8 },
});
