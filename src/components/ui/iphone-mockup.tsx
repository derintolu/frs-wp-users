import React from 'react';

interface IPhoneMockupProps {
  url: string;
  title?: string;
  className?: string;
}

export function IPhoneMockup({ url, title = 'Profile Preview', className = '' }: IPhoneMockupProps) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: '375px' }}>
      {/* iPhone Frame */}
      <div
        className="relative bg-black rounded-[3rem] shadow-2xl overflow-hidden"
        style={{
          padding: '16px',
          border: '12px solid #1f1f1f',
        }}
      >
        {/* Notch */}
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-black rounded-b-2xl z-10"
          style={{
            width: '150px',
            height: '28px',
          }}
        >
          {/* Speaker */}
          <div
            className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-gray-800 rounded-full"
            style={{
              width: '60px',
              height: '6px',
            }}
          />
          {/* Camera */}
          <div
            className="absolute top-2 right-6 bg-gray-700 rounded-full"
            style={{
              width: '12px',
              height: '12px',
            }}
          />
        </div>

        {/* Screen */}
        <div
          className="relative bg-white overflow-hidden"
          style={{
            borderRadius: '36px',
            height: '812px',
          }}
        >
          {/* Status Bar */}
          <div className="absolute top-0 left-0 right-0 h-11 bg-white z-10 flex items-center justify-between px-6 pt-2">
            <div className="text-xs font-semibold text-black">9:41</div>
            <div className="flex items-center gap-1">
              {/* Signal */}
              <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 16 12">
                <rect width="2" height="4" x="0" y="8" rx="0.5" />
                <rect width="2" height="6" x="3" y="6" rx="0.5" />
                <rect width="2" height="8" x="6" y="4" rx="0.5" />
                <rect width="2" height="10" x="9" y="2" rx="0.5" />
                <rect width="2" height="12" x="12" y="0" rx="0.5" />
              </svg>
              {/* WiFi */}
              <svg className="w-4 h-3" fill="currentColor" viewBox="0 0 16 12">
                <path d="M8 12c-.8 0-1.5-.7-1.5-1.5S7.2 9 8 9s1.5.7 1.5 1.5S8.8 12 8 12zm0-4c-1.9 0-3.5 1.6-3.5 3.5 0 .4.1.8.2 1.2-.9-.6-1.5-1.6-1.5-2.7 0-1.9 1.6-3.5 3.5-3.5h1.3c1.9 0 3.5 1.6 3.5 3.5 0 1.1-.6 2.1-1.5 2.7.1-.4.2-.8.2-1.2C11.5 9.6 9.9 8 8 8z"/>
              </svg>
              {/* Battery */}
              <svg className="w-6 h-3" fill="none" viewBox="0 0 24 12">
                <rect width="18" height="10" x="1" y="1" stroke="currentColor" strokeWidth="1" rx="2" />
                <rect width="14" height="6" x="3" y="3" fill="currentColor" rx="1" />
                <rect width="2" height="6" x="21" y="3" fill="currentColor" rx="0.5" />
              </svg>
            </div>
          </div>

          {/* Content - iframe */}
          <iframe
            src={url}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-same-origin allow-scripts allow-forms"
            style={{ marginTop: '44px', height: 'calc(100% - 44px)' }}
          />
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-50" />
      </div>
    </div>
  );
}
