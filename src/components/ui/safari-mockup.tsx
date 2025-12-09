import React from 'react';

interface SafariMockupProps {
  className?: string;
  title?: string;
  url: string;
}

export function SafariMockup({ className = '', title = 'Profile Preview', url }: SafariMockupProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-gray-300 bg-white shadow-2xl ${className}`}>
      {/* Browser Chrome */}
      <div className="border-b border-gray-300 bg-gradient-to-b from-gray-100 to-gray-50">
        {/* Traffic Lights */}
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex gap-2">
            <div className="size-3 rounded-full bg-red-500"></div>
            <div className="size-3 rounded-full bg-yellow-500"></div>
            <div className="size-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Address Bar */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 shadow-sm">
            <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
            <span className="flex-1 truncate text-sm text-gray-600">{url}</span>
            <svg className="size-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          </div>
        </div>
      </div>

      {/* Content - iframe */}
      <div className="bg-white">
        <iframe
          className="w-full border-0"
          sandbox="allow-same-origin allow-scripts allow-forms"
          src={url}
          style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
          title={title}
        />
      </div>
    </div>
  );
}
