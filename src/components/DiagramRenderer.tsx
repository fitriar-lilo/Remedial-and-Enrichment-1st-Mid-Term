import React from 'react';

interface DiagramProps {
  type?: string;
  caption?: string;
}

export const DiagramRenderer: React.FC<DiagramProps> = ({ type, caption }) => {
  if (!type) return null;

  return (
    <div className="my-5 flex flex-col items-center">
      <div className="w-full max-w-md bg-[#0D1817] border border-[#203D34] rounded-2xl p-4 shadow-lg shadow-black/20 flex flex-col items-center">
        {type === 'triangle_3_4_5' && (
          <svg viewBox="0 0 320 220" className="w-full max-w-[300px] h-auto select-none" aria-label="Right-angled triangle ABC">
            {/* Dark background */}
            <rect width="320" height="220" fill="#0A1413" rx="10" />
            
            {/* Triangle ABC: A at (50, 170), B at (230, 170), C at (230, 50) */}
            <polygon
              points="50,170 230,170 230,50"
              fill="#122B23"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Right angle marker at B */}
            <path d="M 215 170 L 215 155 L 230 155" fill="none" stroke="#34D399" strokeWidth="2" />

            {/* Angle A indicator */}
            <path d="M 85 170 A 35 35 0 0 0 78 152" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
            <text x="96" y="156" fill="#FBBF24" fontSize="13" fontWeight="bold">Angle A</text>

            {/* Vertices Labels */}
            <text x="30" y="180" fill="#F8FAFC" fontSize="16" fontWeight="bold">A</text>
            <text x="238" y="180" fill="#F8FAFC" fontSize="16" fontWeight="bold">B (90°)</text>
            <text x="238" y="46" fill="#F8FAFC" fontSize="16" fontWeight="bold">C</text>

            {/* Side Lengths */}
            <text x="135" y="194" fill="#94A3B8" fontSize="14" fontWeight="600" textAnchor="middle">AB = 3 cm</text>
            <text x="252" y="115" fill="#94A3B8" fontSize="14" fontWeight="600" textAnchor="start">BC = 4 cm</text>
            <text x="125" y="96" fill="#34D399" fontSize="14" fontWeight="bold" textAnchor="middle">AC = 5 cm (Hypotenuse)</text>
          </svg>
        )}

        {type === 'triangle_5_12_13' && (
          <svg viewBox="0 0 340 210" className="w-full max-w-[320px] h-auto select-none" aria-label="Right-angled triangle PQR">
            <rect width="340" height="210" fill="#0A1413" rx="10" />

            {/* Triangle PQR: P at (40, 160), Q at (260, 160), R at (260, 60) */}
            <polygon
              points="40,160 260,160 260,60"
              fill="#122B23"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Right angle marker at Q */}
            <path d="M 245 160 L 245 145 L 260 145" fill="none" stroke="#34D399" strokeWidth="2" />

            {/* Angle P indicator */}
            <path d="M 80 160 A 40 40 0 0 0 74 144" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
            <text x="92" y="148" fill="#FBBF24" fontSize="13" fontWeight="bold">Angle P</text>

            {/* Vertices Labels */}
            <text x="20" y="170" fill="#F8FAFC" fontSize="16" fontWeight="bold">P</text>
            <text x="268" y="170" fill="#F8FAFC" fontSize="16" fontWeight="bold">Q (90°)</text>
            <text x="268" y="56" fill="#F8FAFC" fontSize="16" fontWeight="bold">R</text>

            {/* Side Lengths */}
            <text x="150" y="186" fill="#94A3B8" fontSize="14" fontWeight="600" textAnchor="middle">PQ = 12 cm</text>
            <text x="275" y="115" fill="#94A3B8" fontSize="14" fontWeight="600">QR = 5 cm</text>
            <text x="135" y="96" fill="#34D399" fontSize="14" fontWeight="bold" textAnchor="middle">PR = 13 cm (Hypotenuse)</text>
          </svg>
        )}

        {type === 'triangle_def' && (
          <svg viewBox="0 0 340 210" className="w-full max-w-[320px] h-auto select-none" aria-label="Right-angled triangle DEF">
            <rect width="340" height="210" fill="#0A1413" rx="10" />

            {/* Triangle DEF: D at (45, 160), E at (240, 160), F at (240, 50) */}
            <polygon
              points="45,160 240,160 240,50"
              fill="#122B23"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />

            {/* Right angle marker at E */}
            <path d="M 225 160 L 225 145 L 240 145" fill="none" stroke="#34D399" strokeWidth="2" />

            {/* Angle D indicator */}
            <path d="M 80 160 A 35 35 0 0 0 74 142" fill="none" stroke="#F59E0B" strokeWidth="2.5" />
            <text x="90" y="146" fill="#FBBF24" fontSize="13" fontWeight="bold">Angle D</text>

            {/* Vertices Labels */}
            <text x="24" y="170" fill="#F8FAFC" fontSize="16" fontWeight="bold">D</text>
            <text x="248" y="170" fill="#F8FAFC" fontSize="16" fontWeight="bold">E (90°)</text>
            <text x="248" y="46" fill="#F8FAFC" fontSize="16" fontWeight="bold">F</text>

            {/* Side Lengths */}
            <text x="142" y="186" fill="#38BDF8" fontSize="14" fontWeight="bold" textAnchor="middle">DE = ? (Adjacent)</text>
            <text x="125" y="95" fill="#34D399" fontSize="14" fontWeight="bold" textAnchor="middle">DF = 15 cm (Hypotenuse)</text>
            <text x="170" y="24" fill="#94A3B8" fontSize="12" textAnchor="middle">cos(D) = 3 / 5</text>
          </svg>
        )}

        {type === 'scatter_positive' && (
          <svg viewBox="0 0 340 240" className="w-full max-w-[320px] h-auto select-none" aria-label="Positive correlation scatter diagram">
            <rect width="340" height="240" fill="#0A1413" rx="10" />

            {/* Grid lines */}
            {[70, 110, 150, 190].map((y) => (
              <line key={y} x1="55" y1={y} x2="310" y2={y} stroke="#172F27" strokeWidth="1" strokeDasharray="3 3" />
            ))}
            {[105, 155, 205, 255, 305].map((x) => (
              <line key={x} x1={x} y1="35" x2={x} y2={190} stroke="#172F27" strokeWidth="1" strokeDasharray="3 3" />
            ))}

            {/* Axes */}
            <line x1="55" y1="190" x2="315" y2="190" stroke="#10B981" strokeWidth="2" />
            <line x1="55" y1="30" x2="55" y2="190" stroke="#10B981" strokeWidth="2" />

            {/* Axis Labels */}
            <text x="185" y="222" fill="#E2E8F0" fontSize="13" fontWeight="600" textAnchor="middle">Hours studied</text>
            <text x="18" y="115" fill="#E2E8F0" fontSize="13" fontWeight="600" transform="rotate(-90 18 115)" textAnchor="middle">Test mark (%)</text>

            {/* Axis ticks numbers */}
            <text x="55" y="204" fill="#64748B" fontSize="11" textAnchor="middle">0</text>
            <text x="155" y="204" fill="#64748B" fontSize="11" textAnchor="middle">5</text>
            <text x="255" y="204" fill="#64748B" fontSize="11" textAnchor="middle">10</text>

            <text x="45" y="194" fill="#64748B" fontSize="11" textAnchor="end">0</text>
            <text x="45" y="114" fill="#64748B" fontSize="11" textAnchor="end">50</text>
            <text x="45" y="38" fill="#64748B" fontSize="11" textAnchor="end">100</text>

            {/* Plotted points (positive slope) */}
            {[
              [75, 168], [95, 155], [115, 142], [135, 130],
              [160, 120], [185, 105], [210, 88], [235, 76],
              [255, 60], [280, 48], [300, 40]
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4.5" fill="#34D399" stroke="#064E3B" strokeWidth="1.5" />
            ))}

            {/* Trend guide line */}
            <path d="M 80 170 L 290 50" fill="none" stroke="#10B981" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          </svg>
        )}

        {type === 'scatter_negative' && (
          <svg viewBox="0 0 340 240" className="w-full max-w-[320px] h-auto select-none" aria-label="Negative correlation scatter diagram">
            <rect width="340" height="240" fill="#0A1413" rx="10" />

            {/* Grid lines */}
            {[70, 110, 150, 190].map((y) => (
              <line key={y} x1="55" y1={y} x2="310" y2={y} stroke="#172F27" strokeWidth="1" strokeDasharray="3 3" />
            ))}
            {[105, 155, 205, 255, 305].map((x) => (
              <line key={x} x1={x} y1="35" x2={x} y2={190} stroke="#172F27" strokeWidth="1" strokeDasharray="3 3" />
            ))}

            {/* Axes */}
            <line x1="55" y1="190" x2="315" y2="190" stroke="#10B981" strokeWidth="2" />
            <line x1="55" y1="30" x2="55" y2="190" stroke="#10B981" strokeWidth="2" />

            {/* Axis Labels */}
            <text x="185" y="222" fill="#E2E8F0" fontSize="13" fontWeight="600" textAnchor="middle">Age of car (years)</text>
            <text x="18" y="115" fill="#E2E8F0" fontSize="13" fontWeight="600" transform="rotate(-90 18 115)" textAnchor="middle">Value ($000)</text>

            {/* Axis ticks */}
            <text x="55" y="204" fill="#64748B" fontSize="11" textAnchor="middle">0</text>
            <text x="155" y="204" fill="#64748B" fontSize="11" textAnchor="middle">5</text>
            <text x="255" y="204" fill="#64748B" fontSize="11" textAnchor="middle">10</text>

            <text x="45" y="194" fill="#64748B" fontSize="11" textAnchor="end">0</text>
            <text x="45" y="114" fill="#64748B" fontSize="11" textAnchor="end">15</text>
            <text x="45" y="38" fill="#64748B" fontSize="11" textAnchor="end">30</text>

            {/* Plotted points (downward slope) */}
            {[
              [75, 48], [95, 62], [120, 75], [140, 88],
              [165, 102], [190, 118], [215, 130], [240, 145],
              [265, 162], [290, 175]
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4.5" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.5" />
            ))}

            <path d="M 75 45 L 290 178" fill="none" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />
          </svg>
        )}

        {type === 'scatter_none' && (
          <svg viewBox="0 0 340 240" className="w-full max-w-[320px] h-auto select-none" aria-label="No correlation scatter diagram">
            <rect width="340" height="240" fill="#0A1413" rx="10" />

            {/* Grid */}
            {[70, 110, 150, 190].map((y) => (
              <line key={y} x1="55" y1={y} x2="310" y2={y} stroke="#172F27" strokeWidth="1" strokeDasharray="3 3" />
            ))}
            {[105, 155, 205, 255, 305].map((x) => (
              <line key={x} x1={x} y1="35" x2={x} y2={190} stroke="#172F27" strokeWidth="1" strokeDasharray="3 3" />
            ))}

            {/* Axes */}
            <line x1="55" y1="190" x2="315" y2="190" stroke="#10B981" strokeWidth="2" />
            <line x1="55" y1="30" x2="55" y2="190" stroke="#10B981" strokeWidth="2" />

            {/* Axis Labels */}
            <text x="185" y="222" fill="#E2E8F0" fontSize="13" fontWeight="600" textAnchor="middle">Shoe size (UK)</text>
            <text x="18" y="115" fill="#E2E8F0" fontSize="13" fontWeight="600" transform="rotate(-90 18 115)" textAnchor="middle">Quiz mark (%)</text>

            <text x="55" y="204" fill="#64748B" fontSize="11" textAnchor="middle">3</text>
            <text x="155" y="204" fill="#64748B" fontSize="11" textAnchor="middle">7</text>
            <text x="255" y="204" fill="#64748B" fontSize="11" textAnchor="middle">11</text>

            <text x="45" y="194" fill="#64748B" fontSize="11" textAnchor="end">0</text>
            <text x="45" y="114" fill="#64748B" fontSize="11" textAnchor="end">50</text>
            <text x="45" y="38" fill="#64748B" fontSize="11" textAnchor="end">100</text>

            {/* Scattered random dots */}
            {[
              [80, 50], [90, 160], [110, 110], [130, 45],
              [140, 140], [160, 80], [180, 170], [195, 60],
              [210, 125], [230, 40], [250, 150], [270, 95],
              [285, 165], [295, 55]
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4.5" fill="#94A3B8" stroke="#475569" strokeWidth="1.5" />
            ))}
          </svg>
        )}

        {type === 'scatter_best_fit' && (
          <svg viewBox="0 0 340 240" className="w-full max-w-[320px] h-auto select-none" aria-label="Line of best fit scatter diagram">
            <rect width="340" height="240" fill="#0A1413" rx="10" />

            {/* Grid lines */}
            {[70, 110, 150, 190].map((y) => (
              <line key={y} x1="55" y1={y} x2="310" y2={y} stroke="#172F27" strokeWidth="1" strokeDasharray="3 3" />
            ))}
            {[120, 185, 250].map((x) => (
              <line key={x} x1={x} y1="30" x2={x} y2={190} stroke="#172F27" strokeWidth="1" strokeDasharray="3 3" />
            ))}

            {/* Axes */}
            <line x1="55" y1="190" x2="315" y2="190" stroke="#10B981" strokeWidth="2" />
            <line x1="55" y1="30" x2="55" y2="190" stroke="#10B981" strokeWidth="2" />

            {/* Axis Labels */}
            <text x="185" y="222" fill="#E2E8F0" fontSize="13" fontWeight="600" textAnchor="middle">Temperature (°C)</text>
            <text x="18" y="115" fill="#E2E8F0" fontSize="13" fontWeight="600" transform="rotate(-90 18 115)" textAnchor="middle">Cold drinks sold</text>

            <text x="55" y="204" fill="#64748B" fontSize="11" textAnchor="middle">0</text>
            <text x="120" y="204" fill="#64748B" fontSize="11" textAnchor="middle">10</text>
            <text x="185" y="204" fill="#34D399" fontSize="12" fontWeight="bold" textAnchor="middle">20</text>
            <text x="250" y="204" fill="#64748B" fontSize="11" textAnchor="middle">30</text>

            <text x="45" y="194" fill="#64748B" fontSize="11" textAnchor="end">0</text>
            <text x="45" y="154" fill="#64748B" fontSize="11" textAnchor="end">25</text>
            <text x="45" y="114" fill="#34D399" fontSize="12" fontWeight="bold" textAnchor="end">50</text>
            <text x="45" y="74" fill="#64748B" fontSize="11" textAnchor="end">75</text>

            {/* Solid Line of Best Fit: Passes through (120, 142) and (185, 110) and (250, 78) */}
            <line x1="75" y1="164" x2="295" y2="55" stroke="#10B981" strokeWidth="3" />

            {/* Key Reading Point indicator: at x = 185 (20°C), y = 110 (50 drinks) */}
            <line x1="185" y1="190" x2="185" y2="110" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="185" y1="110" x2="55" y2="110" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="185" cy="110" r="5.5" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />

            {/* Plotted points */}
            {[
              [95, 150], [115, 148], [135, 132], [155, 126],
              [170, 114], [200, 106], [215, 92], [240, 84],
              [260, 70], [280, 64]
            ].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1" />
            ))}

            <text x="195" y="58" fill="#34D399" fontSize="11" fontWeight="bold">Line of best fit</text>
          </svg>
        )}

        {type === 'scatter_rules' && (
          <svg viewBox="0 0 340 210" className="w-full max-w-[320px] h-auto select-none" aria-label="Line of best fit concept">
            <rect width="340" height="210" fill="#0A1413" rx="10" />

            {/* Axes */}
            <line x1="45" y1="170" x2="305" y2="170" stroke="#475569" strokeWidth="1.5" />
            <line x1="45" y1="35" x2="45" y2="170" stroke="#475569" strokeWidth="1.5" />

            {/* Balanced points above & below */}
            <circle cx="90" cy="120" r="4.5" fill="#34D399" />
            <circle cx="140" cy="90" r="4.5" fill="#34D399" />
            <circle cx="210" cy="65" r="4.5" fill="#34D399" />
            <circle cx="260" cy="45" r="4.5" fill="#34D399" />

            <circle cx="110" cy="145" r="4.5" fill="#34D399" />
            <circle cx="170" cy="115" r="4.5" fill="#34D399" />
            <circle cx="230" cy="90" r="4.5" fill="#34D399" />
            <circle cx="280" cy="70" r="4.5" fill="#34D399" />

            {/* Line of best fit */}
            <line x1="60" y1="150" x2="300" y2="50" stroke="#10B981" strokeWidth="3" />

            <text x="175" y="32" fill="#F8FAFC" fontSize="13" fontWeight="bold" textAnchor="middle">Equal balance of points</text>
            <text x="175" y="192" fill="#94A3B8" fontSize="12" textAnchor="middle">Straight trend line without joining dots</text>
          </svg>
        )}

        {caption && (
          <p className="mt-2.5 text-xs text-slate-400 font-medium text-center">
            {caption}
          </p>
        )}
      </div>
    </div>
  );
};
