'use client';

import { useState } from 'react';
import SkinStateScan from '@/components/SkinStateScan';
import AITherapist from '@/components/AITherapist';
import HabitStacking from '@/components/HabitStacking';
import GentleShelf from '@/components/GentleShelf';
import FaceTracking3D from '@/components/FaceTracking3D';
import QRCode from '@/components/QRCode';

type View = 'home' | 'scan' | 'therapist' | 'habits' | 'shelf' | 'face3d' | 'qrcode';

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('home');

  if (currentView === 'scan') return <SkinStateScan onBack={() => setCurrentView('home')} />;
  if (currentView === 'therapist') return <AITherapist onBack={() => setCurrentView('home')} />;
  if (currentView === 'habits') return <HabitStacking onBack={() => setCurrentView('home')} />;
  if (currentView === 'shelf') return <GentleShelf onBack={() => setCurrentView('home')} />;
  if (currentView === 'face3d') return <FaceTracking3D onBack={() => setCurrentView('home')} />;
  if (currentView === 'qrcode') {
    const qrValue = typeof window !== 'undefined' ? window.location.href : 'https://acnepist.app';
    return <QRCode value={qrValue} onBack={() => setCurrentView('home')} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl font-light text-[#7A9370] mb-3">AcnePist</h1>
          <p className="text-lg text-[#6B6B6B] italic">Your skin, understood. Your mind, supported.</p>
        </header>

        {/* Main Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <FeatureCard
            title="Skin State Check-In"
            description="A gentle look at how your skin is feeling today"
            icon="🔍"
            onClick={() => setCurrentView('scan')}
            color="from-[#9CAF88] to-[#B8D4A6]"
          />
          <FeatureCard
            title="Your AI Therapist"
            description="A compassionate companion for your skin journey"
            icon="💬"
            onClick={() => setCurrentView('therapist')}
            color="from-[#A8C5D9] to-[#C4D9E8]"
          />
          <FeatureCard
            title="Holistic Habits"
            description="Gentle nudges for lifestyle wellness"
            icon="🌱"
            onClick={() => setCurrentView('habits')}
            color="from-[#9CAF88] to-[#B8D4A6]"
          />
          <FeatureCard
            title="The Gentle Shelf"
            description="Curated recommendations from a friend"
            icon="✨"
            onClick={() => setCurrentView('shelf')}
            color="from-[#A8C5D9] to-[#C4D9E8]"
          />
          <FeatureCard
            title="3D Face Tracking"
            description="Futuristic AR face mesh overlay"
            icon="👁️"
            onClick={() => setCurrentView('face3d')}
            color="from-[#9CAF88] to-[#B8D4A6]"
          />
          <FeatureCard
            title="QR Code"
            description="Share this app with a quick scan"
            icon="📱"
            onClick={() => setCurrentView('qrcode')}
            color="from-[#A8C5D9] to-[#C4D9E8]"
          />
        </div>

        {/* Philosophy Section */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[#E8E0D3]">
          <h2 className="text-2xl font-light text-[#7A9370] mb-4">Our Approach</h2>
          <p className="text-[#6B6B6B] leading-relaxed mb-4">
            AcnePist is built on the belief that your skin journey is deeply personal. We're here to offer 
            therapeutic support, not clinical diagnosis. Every feature is designed to lower stress, not increase it.
          </p>
          <p className="text-[#6B6B6B] leading-relaxed">
            Think of us as a gentle friend who understands—someone who validates your feelings first, 
            then offers supportive guidance when you're ready.
          </p>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  icon,
  onClick,
  color,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${color} rounded-3xl p-8 text-left hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] border border-white/30`}
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-2xl font-light text-white mb-2">{title}</h3>
      <p className="text-white/90 text-sm leading-relaxed">{description}</p>
    </button>
  );
}
