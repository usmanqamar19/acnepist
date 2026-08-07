'use client';

import { QRCodeSVG } from 'react-qr-code';

interface QRCodeProps {
  value: string;
  size?: number;
  onBack?: () => void;
}

export default function QRCode({ value, size = 256, onBack }: QRCodeProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-8">
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 border border-[#E8E0D3] max-w-md w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 text-[#7A9370] hover:text-[#9CAF88] transition-colors"
          >
            ← Back
          </button>
        )}
        <div className="text-center">
          <h2 className="text-2xl font-light text-[#7A9370] mb-6">QR Code</h2>
          <div className="bg-white p-6 rounded-2xl inline-block mb-4">
            <QRCodeSVG
              value={value}
              size={size}
              level="H"
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              viewBox={`0 0 ${size} ${size}`}
            />
          </div>
          <p className="text-sm text-[#6B6B6B] break-all mt-4">{value}</p>
        </div>
      </div>
    </div>
  );
}

