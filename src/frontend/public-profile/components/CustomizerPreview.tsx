
export type Breakpoint = 'desktop' | 'tablet' | 'mobile';

interface CustomizerPreviewProps {
  children: React.ReactNode;
  viewport?: Breakpoint;
}

const viewportWidths = {
  desktop: '100%',
  mobile: '375px',
  tablet: '768px',
};

export function CustomizerPreview({ children, viewport = 'desktop' }: CustomizerPreviewProps) {
  return (
    <div className="flex w-full justify-center bg-gray-100">
      <div
        className="bg-white transition-all duration-300 ease-in-out @container"
        style={{
          boxShadow: viewport !== 'desktop' ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
          margin: viewport !== 'desktop' ? '0 auto' : '0',
          maxWidth: '100%',
          width: viewportWidths[viewport],
        }}
      >
        {children}
      </div>
    </div>
  );
}
