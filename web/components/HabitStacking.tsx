'use client';

import { useState } from 'react';

interface Habit {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  checked: boolean;
}

const initialHabits: Habit[] = [
  {
    id: 'sleep',
    name: 'Restful Sleep',
    description: '7-9 hours of quality sleep',
    icon: '😴',
    color: 'from-[#9CAF88] to-[#B8D4A6]',
    checked: false,
  },
  {
    id: 'hydration',
    name: 'Hydration',
    description: 'Drinking enough water throughout the day',
    icon: '💧',
    color: 'from-[#A8C5D9] to-[#C4D9E8]',
    checked: false,
  },
  {
    id: 'stress',
    name: 'Stress Management',
    description: 'Moments of calm and relaxation',
    icon: '🧘',
    color: 'from-[#9CAF88] to-[#B8D4A6]',
    checked: false,
  },
  {
    id: 'pillowcase',
    name: 'Fresh Pillowcase',
    description: 'Clean pillowcase for tonight',
    icon: '🛏️',
    color: 'from-[#A8C5D9] to-[#C4D9E8]',
    checked: false,
  },
  {
    id: 'touching',
    name: 'Gentle Hands',
    description: 'Avoided touching face today',
    icon: '🤲',
    color: 'from-[#9CAF88] to-[#B8D4A6]',
    checked: false,
  },
];

export default function HabitStacking({ onBack }: { onBack: () => void }) {
  const [habits, setHabits] = useState<Habit[]>(initialHabits);
  const [showNotification, setShowNotification] = useState(false);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === id ? { ...habit, checked: !habit.checked } : habit
      )
    );
  };

  const completedCount = habits.filter((h) => h.checked).length;
  const completionPercentage = (completedCount / habits.length) * 100;

  return (
    <div className="min-h-screen bg-[#FAF8F3] p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-[#7A9370] hover:text-[#9CAF88] transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[#E8E0D3] mb-6">
          <h2 className="text-3xl font-light text-[#7A9370] mb-2">Holistic Habits</h2>
          <p className="text-[#6B6B6B] mb-6">
            Gentle lifestyle support for your skin wellness journey
          </p>

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-[#6B6B6B]">Today's Progress</span>
              <span className="text-sm font-light text-[#7A9370]">
                {completedCount} of {habits.length}
              </span>
            </div>
            <div className="w-full bg-[#E8E0D3] rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#9CAF88] to-[#B8D4A6] h-full transition-all duration-500 rounded-full"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>

          {/* Habits List */}
          <div className="space-y-4">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all ${
                  habit.checked
                    ? `bg-gradient-to-br ${habit.color} border-transparent text-white`
                    : 'bg-white/40 border-[#E8E0D3] text-[#6B6B6B] hover:border-[#9CAF88]'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{habit.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-light mb-1">{habit.name}</h3>
                    <p className={`text-sm ${habit.checked ? 'text-white/90' : 'text-[#6B6B6B]'}`}>
                      {habit.description}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      habit.checked
                        ? 'bg-white border-white'
                        : 'border-[#9CAF88] bg-transparent'
                    }`}
                  >
                    {habit.checked && (
                      <svg className="w-4 h-4 text-[#9CAF88]" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Gentle Nudges Section */}
        <div className="bg-[#C4D9E8]/30 rounded-3xl p-6 border border-[#A8C5D9]">
          <h3 className="text-xl font-light text-[#7FA3C0] mb-3">💡 Gentle Nudges</h3>
          <p className="text-[#6B6B6B] leading-relaxed mb-4">
            Remember, these habits are about supporting your overall wellness, not perfection. 
            Every small step counts, and it's okay to have days when you don't check everything off.
          </p>
          <button
            onClick={() => setShowNotification(!showNotification)}
            className="text-sm text-[#7FA3C0] hover:text-[#A8C5D9] transition-colors"
          >
            {showNotification ? '✓ Notifications enabled' : 'Enable gentle reminders'}
          </button>
        </div>
      </div>
    </div>
  );
}

