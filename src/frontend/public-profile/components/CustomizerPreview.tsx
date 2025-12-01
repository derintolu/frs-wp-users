import { Monitor, Tablet, Smartphone } from 'lucide-react';

export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

interface CustomizerPreviewProps {
  children: React.ReactNode;
  viewport?: Breakpoint;
}

const viewportWidths = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

export function CustomizerPreview({ children, viewport = 'desktop' }: CustomizerPreviewProps) {
  return (
    <div className="w-full flex justify-center bg-gray-100">
      <div
        className="@container bg-white transition-all duration-300 ease-in-out"
        style={{
          width: viewportWidths[viewport],
          maxWidth: '100%',
          boxShadow: viewport !== 'desktop' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
          margin: viewport !== 'desktop' ? '0 auto' : '0',
        }}
      >
        {children}
      </div>
    </div>
  );
}
