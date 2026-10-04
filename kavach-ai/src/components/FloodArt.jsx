export default function FloodArt() {
  return (
    <div className="relative mx-auto h-[520px] w-full max-w-[520px]">
      <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="sky" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#1a2130" />
            <stop offset="100%" stopColor="#0b0f16" />
          </linearGradient>
          <linearGradient id="water" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#2d4870" />
            <stop offset="100%" stopColor="#141b26" />
          </linearGradient>
          <linearGradient id="moon" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f3ecd8" />
            <stop offset="100%" stopColor="#d9951f" />
          </linearGradient>
          <radialGradient id="moonHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#d9951f" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#d9951f" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="route" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#d9951f" />
            <stop offset="100%" stopColor="#e3a634" />
          </linearGradient>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.1" />
          </filter>
        </defs>

        <rect x="0" y="0" width="520" height="520" rx="28" fill="url(#sky)" />

        <circle cx="390" cy="110" r="110" fill="url(#moonHalo)" />
        <circle cx="390" cy="110" r="42" fill="url(#moon)" />
        <circle cx="408" cy="98" r="42" fill="#0b0f16" opacity="0.75" />

        <g opacity="0.5">
          {Array.from({ length: 60 }).map((_, i) => (
            <line
              key={i}
              x1={10 + (i * 9) % 520}
              y1={30 + (i * 17) % 180}
              x2={14 + (i * 9) % 520}
              y2={48 + (i * 17) % 200}
              stroke="#f3ecd8"
              strokeWidth="0.6"
              opacity={0.3 + ((i * 13) % 7) / 20}
            />
          ))}
        </g>

        <g opacity="0.9">
          {[
            [40, 310, 70, 180],
            [120, 280, 55, 210],
            [185, 260, 90, 230],
            [285, 240, 60, 250],
            [355, 275, 70, 215],
            [435, 255, 55, 235],
          ].map(([x, y, w, h], i) => (
            <g key={i}>
              <rect x={x} y={y} width={w} height={h} fill="#0f141d" stroke="#1c2432" strokeWidth="1" />
              {Array.from({ length: Math.floor(h / 25) }).map((_, r) => (
                Array.from({ length: Math.floor(w / 18) }).map((_, c) => {
                  const lit = (r * 7 + c * 11 + i * 3) % 5 === 0;
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={x + 4 + c * 18}
                      y={y + 10 + r * 25}
                      width="10"
                      height="12"
                      fill={lit ? '#d9951f' : '#141b26'}
                      opacity={lit ? 0.85 : 1}
                    />
                  );
                })
              ))}
            </g>
          ))}
        </g>

        <g opacity="0.9">
          <path d="M0 400 Q 60 388 130 395 T 260 398 T 390 392 T 520 398 L 520 520 L 0 520 Z" fill="url(#water)" />
          <path d="M0 400 Q 60 388 130 395 T 260 398 T 390 392 T 520 398" stroke="#d9951f" strokeWidth="1.2" fill="none" opacity="0.5" />
        </g>

        <g opacity="0.5" filter="url(#soft)">
          <path d="M20 430 Q 100 420 180 428 T 340 426 T 500 430" stroke="#f3ecd8" strokeWidth="0.8" fill="none" />
          <path d="M20 460 Q 100 452 180 458 T 340 456 T 500 460" stroke="#f3ecd8" strokeWidth="0.6" fill="none" />
          <path d="M20 490 Q 100 482 180 488 T 340 486 T 500 490" stroke="#f3ecd8" strokeWidth="0.5" fill="none" />
        </g>

        <g>
          <circle cx="90" cy="408" r="24" fill="#d44a3a" opacity="0.25" />
          <circle cx="90" cy="408" r="12" fill="#d44a3a" opacity="0.55" />
          <circle cx="90" cy="408" r="5" fill="#d44a3a" />
        </g>
        <g>
          <circle cx="230" cy="402" r="28" fill="#f6b942" opacity="0.2" />
          <circle cx="230" cy="402" r="14" fill="#f6b942" opacity="0.5" />
          <circle cx="230" cy="402" r="5" fill="#f6b942" />
        </g>
        <g>
          <circle cx="430" cy="398" r="22" fill="#4ea880" opacity="0.25" />
          <circle cx="430" cy="398" r="11" fill="#4ea880" opacity="0.55" />
          <circle cx="430" cy="398" r="5" fill="#4ea880" />
        </g>

        <path
          d="M50 480 C 100 440 160 460 210 420 S 300 410 350 420 S 440 390 490 350"
          stroke="url(#route)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="2 7"
          fill="none"
        />
        <circle cx="50" cy="480" r="5" fill="#d9951f" />
        <circle cx="490" cy="350" r="7" fill="#4ea880" stroke="#f3ecd8" strokeWidth="1.5" />

        <g transform="translate(28 28)">
          <rect width="190" height="40" rx="12" fill="#141b26" stroke="rgba(243,236,216,0.14)" />
          <circle cx="20" cy="20" r="7" fill="#d44a3a" />
          <text x="34" y="24" fontFamily="Inter" fontSize="12" fill="#f3ecd8">Andheri subway impassable</text>
        </g>
        <g transform="translate(300 28)">
          <rect width="180" height="40" rx="12" fill="#141b26" stroke="rgba(243,236,216,0.14)" />
          <circle cx="20" cy="20" r="7" fill="#4ea880" />
          <text x="34" y="24" fontFamily="Inter" fontSize="12" fill="#f3ecd8">Safe route to hospital</text>
        </g>
      </svg>
    </div>
  );
}
