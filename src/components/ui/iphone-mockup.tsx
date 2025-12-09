import React from 'react';

interface IPhoneMockupProps {
  className?: string;
  title?: string;
  url: string;
}

export function IPhoneMockup({ className = '', title = 'Profile Preview', url }: IPhoneMockupProps) {
  return (
    <div className={`relative mx-auto ${className}`} style={{ width: '375px' }}>
      {/* iPhone Frame */}
      <div
        className="relative overflow-hidden rounded-[3rem] bg-black shadow-2xl"
        style={{
          border: '12px solid #1f1f1f',
          padding: '16px',
        }}
      >
        {/* Notch */}
        <div
          className="absolute left-1/2 top-0 z-10 -translate-x-1/2 rounded-b-2xl bg-black"
          style={{
            height: '28px',
            width: '150px',
          }}
        >
          {/* Speaker */}
          <div
            className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-gray-800"
            style={{
              height: '6px',
              width: '60px',
            }}
          />
          {/* Camera */}
          <div
            className="absolute right-6 top-2 rounded-full bg-gray-700"
            style={{
              height: '12px',
              width: '12px',
            }}
          />
        </div>

        {/* Screen */}
        <div
          className="relative overflow-hidden bg-white"
          style={{
            borderRadius: '36px',
            height: '812px',
          }}
        >
          {/* Status Bar */}
          <div className="absolute inset-x-0 top-0 z-10 flex h-11 items-center justify-between bg-white px-6 pt-2">
            <div className="text-xs font-semibold text-black">9:41</div>
            <div className="flex items-center gap-1">
              {/* Signal */}
              <svg className="h-3 w-4" fill="currentColor" viewBox="0 0 16 12">
                <rect height="4" rx="0.5" width="2" x="0" y="8" />
                <rect height="6" rx="0.5" width="2" x="3" y="6" />
                <rect height="8" rx="0.5" width="2" x="6" y="4" />
                <rect height="10" rx="0.5" width="2" x="9" y="2" />
                <rect height="12" rx="0.5" width="2" x="12" y="0" />
              </svg>
              {/* WiFi */}
              <svg className="h-3 w-4" fill="currentColor" viewBox="0 0 16 12">
                <path d="M8 12c-.8 0-1.5-.7-1.5-1.5S7.2 9 8 9s1.5.7 1.5 1.5S8.8 12 8 12zm0-4c-1.9 0-3.5 1.6-3.5 3.5 0 .4.1.8.2 1.2-.9-.6-1.5-1.6-1.5-2.7 0-1.9 1.6-3.5 3.5-3.5h1.3c1.9 0 3.5 1.6 3.5 3.5 0 1.1-.6 2.1-1.5 2.7.1-.4.2-.8.2-1.2C11.5 9.6 9.9 8 8 8z"/>
              </svg>
              {/* Battery */}
              <svg className="h-3 w-6" fill="none" viewBox="0 0 24 12">
                <rect height="10" rx="2" stroke="currentColor" strokeWidth="1" width="18" x="1" y="1" />
                <rect fill="currentColor" height="6" rx="1" width="14" x="3" y="3" />
                <rect fill="currentColor" height="6" rx="0.5" width="2" x="21" y="3" />
              </svg>
            </div>
          </div>

          {/* Content - iframe */}
          <iframe
            className="size-full border-0"
            sandbox="allow-same-origin allow-scripts allow-forms"
            src={url}
            style={{ height: 'calc(100% - 44px)', marginTop: '44px' }}
            title={title}
          />
        </div>

        {/* Home Indicator */}
        <div className="absolute bottom-2 left-1/2 h-1 w-32 -translate-x-1/2 rounded-full bg-white opacity-50" />
      </div>
    </div>
  );
}
