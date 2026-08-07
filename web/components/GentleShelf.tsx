'use client';

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  useCase: string;
  gentleNote: string;
}

const products: Product[] = [
  {
    id: '1',
    name: 'Soothing Calm Serum',
    category: 'For soothing redness',
    description: 'A gentle, hydrating serum with calming botanical extracts',
    useCase: 'When your skin feels sensitive or shows signs of redness',
    gentleNote: 'Patch test on a small area first. Works best when applied to clean, slightly damp skin.',
  },
  {
    id: '2',
    name: 'Gentle Cleansing Balm',
    category: 'For deep cleaning',
    description: 'A nourishing balm that melts away daily buildup without stripping',
    useCase: 'For evening routine to gently remove surface congestion',
    gentleNote: 'Massage gently in circular motions, then rinse with lukewarm water.',
  },
  {
    id: '3',
    name: 'Hydration Boost Mist',
    category: 'For maintaining balance',
    description: 'A refreshing mist to support your skin\'s natural moisture barrier',
    useCase: 'Throughout the day when your skin needs a moment of refreshment',
    gentleNote: 'Can be used over makeup or on bare skin. Keep it in your bag for on-the-go support.',
  },
  {
    id: '4',
    name: 'Overnight Comfort Mask',
    category: 'For overnight support',
    description: 'A lightweight mask that works while you sleep to support skin recovery',
    useCase: 'On nights when your skin needs extra care and comfort',
    gentleNote: 'Apply a thin layer before bed. A little goes a long way.',
  },
  {
    id: '5',
    name: 'Daily Protection Cream',
    category: 'For daily care',
    description: 'A non-comedogenic moisturizer that supports without overwhelming',
    useCase: 'As part of your morning routine to maintain skin balance',
    gentleNote: 'Suitable for most skin types. If you notice any sensitivity, reduce frequency.',
  },
];

export default function GentleShelf({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 text-[#7A9370] hover:text-[#9CAF88] transition-colors"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-light text-[#7A9370] mb-2">The Gentle Shelf</h2>
          <p className="text-[#6B6B6B] mb-4">
            Curated recommendations from a friend—not medical advice, just gentle suggestions
          </p>
          <div className="bg-[#C4D9E8]/30 rounded-2xl p-4 border border-[#A8C5D9]">
            <p className="text-sm text-[#6B6B6B]">
              <strong className="text-[#7FA3C0]">Remember:</strong> These are suggestions, not prescriptions. 
              Always patch test new products and listen to what your skin tells you. What works for one person 
              may not work for another, and that's completely normal.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-[#E8E0D3] hover:shadow-lg transition-all"
            >
              <div className="mb-4">
                <span className="inline-block bg-gradient-to-r from-[#9CAF88] to-[#B8D4A6] text-white text-xs px-3 py-1 rounded-full mb-3">
                  {product.category}
                </span>
                <h3 className="text-2xl font-light text-[#7A9370] mb-2">{product.name}</h3>
                <p className="text-[#6B6B6B] text-sm leading-relaxed mb-4">{product.description}</p>
              </div>

              <div className="space-y-3">
                <div className="bg-[#F5F1E8] rounded-2xl p-4">
                  <p className="text-xs text-[#7A9370] font-light mb-1">When to use</p>
                  <p className="text-sm text-[#6B6B6B]">{product.useCase}</p>
                </div>

                <div className="bg-[#C4D9E8]/20 rounded-2xl p-4 border border-[#A8C5D9]/30">
                  <p className="text-xs text-[#7FA3C0] font-light mb-1">Gentle reminder</p>
                  <p className="text-sm text-[#6B6B6B]">{product.gentleNote}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-[#E8E0D3]">
          <h3 className="text-xl font-light text-[#7A9370] mb-3">About These Recommendations</h3>
          <p className="text-[#6B6B6B] leading-relaxed mb-4">
            The Gentle Shelf is our way of sharing products that many people find helpful, 
            organized by what they might support rather than medical conditions. Think of it 
            like asking a friend what they use—informative, but not diagnostic.
          </p>
          <p className="text-[#6B6B6B] leading-relaxed text-sm">
            If you have concerns about your skin or are considering new products, we always 
            recommend consulting with a dermatologist or skincare professional who can provide 
            personalized guidance based on your unique needs.
          </p>
        </div>
      </div>
    </div>
  );
}

