import React from 'react';

export function BluLogo() {
  return (
    <div className="flex items-center gap-3">
      {/* Box Logo Gradasi Biru-Putih */}
      <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 p-[2px] shadow-lg shadow-blue-500/30">
        <div className="flex items-center justify-center w-full h-full bg-[#0a1128] rounded-[10px]">
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 4H14C17.3137 4 20 6.68629 20 10C20 13.3137 17.3137 16 14 16H6V4Z"
              stroke="url(#blue-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="rgba(0, 210, 255, 0.08)"
            />
            <path
              d="M6 12H15"
              stroke="url(#blue-gradient)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M10 16L17 21"
              stroke="#00d2ff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient
                id="blue-gradient"
                x1="6"
                y1="4"
                x2="20"
                y2="21"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#ffffff" />
                <stop offset="0.5" stopColor="#00d2ff" />
                <stop offset="1" stopColor="#0052ff" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className="text-base font-bold tracking-wider text-white font-sans">
          blu<span className="text-cyan-400">.</span>
        </span>
        <span className="text-[8px] text-cyan-200/60 uppercase tracking-widest -mt-1 font-semibold">
          Financial Hub
        </span>
      </div>
    </div>
  );
}