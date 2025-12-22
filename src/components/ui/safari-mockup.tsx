import React from 'react';

interface SafariMockupProps {
  url: string;
  title?: string;
  className?: string;
}

export function SafariMockup({ url, title = 'Profile Preview', className = '' }: SafariMockupProps) {
  return (
    <div className={`rounded-xl border border-gray-300 bg-white shadow-2xl overflow-hidden ${className}`}>
      {/* Browser Chrome */}
      <div className="bg-gradient-to-b from-gray-100 to-gray-50 border-b border-gray-300">
        {/* Traffic Lights */}
        <div className="flex items-center gap-2 px-4 py-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
          </div>
        </div>

        {/* Address Bar */}
        <div className="px-4 pb-3">
          <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-gray-600 truncate flex-1">{url}</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
        </div>
      </div>

      {/* Content - iframe */}
      <div className="bg-white">
        <iframe
          src={url}
          className="w-full border-0"
          style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
          title={title}
          sandbox="allow-same-origin allow-scripts allow-forms"
        />
      </div>
    </div>
  );
}
