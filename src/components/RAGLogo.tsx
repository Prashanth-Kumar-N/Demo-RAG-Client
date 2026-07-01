// RAGLogo.tsx
// Shield + warehouse grid logo for the defence/logistics RAG application

import type { ReactNode } from 'react';

interface RAGLogoProps {
  size?: number;
  showText?: boolean;
}

const RAGLogo = ({ size = 36, showText = true }: RAGLogoProps): ReactNode => {
  return (
    <div className="flex items-center gap-3">
      {/* SVG Logo Mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Shield base */}
        <path
          d="M24 3L5 11V24C5 34.5 13.5 43.2 24 46C34.5 43.2 43 34.5 43 24V11L24 3Z"
          fill="#C47200"
          opacity="0.12"
        />
        <path
          d="M24 3L5 11V24C5 34.5 13.5 43.2 24 46C34.5 43.2 43 34.5 43 24V11L24 3Z"
          stroke="#C47200"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Warehouse grid inside shield */}
        {/* Floor grid lines */}
        <line x1="15" y1="32" x2="33" y2="32" stroke="#C47200" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="15" y1="37" x2="33" y2="37" stroke="#C47200" strokeWidth="1.5" strokeLinecap="round" />

        {/* Shelving units */}
        <rect x="15" y="18" width="5" height="13" rx="0.5" fill="#8B4A00" opacity="0.7" />
        <rect x="22" y="14" width="5" height="17" rx="0.5" fill="#C47200" opacity="0.85" />
        <rect x="29" y="20" width="5" height="11" rx="0.5" fill="#8B4A00" opacity="0.7" />

        {/* Shelf lines on middle unit (tallest) */}
        <line x1="22" y1="19" x2="27" y2="19" stroke="#F7F3EE" strokeWidth="1" />
        <line x1="22" y1="23" x2="27" y2="23" stroke="#F7F3EE" strokeWidth="1" />
        <line x1="22" y1="27" x2="27" y2="27" stroke="#F7F3EE" strokeWidth="1" />

        {/* Small dot accent — top of shield */}
        <circle cx="24" cy="9" r="1.5" fill="#C47200" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span
            style={{
              fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '-0.01em',
              color: '#2C3340',
              lineHeight: 1.1,
            }}
          >
            LogiSense
          </span>
          <span
            style={{
              fontFamily: "'Söhne', 'Inter', system-ui, sans-serif",
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.12em',
              color: '#C47200',
              textTransform: 'uppercase',
              lineHeight: 1.4,
            }}
          >
            Intelligence System
          </span>
        </div>
      )}
    </div>
  );
};

export default RAGLogo;
