import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading';
import {
  Globe,
  Eye,
  Edit,
  Share2,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { DataService, type User as UserType } from '../../utils/dataService';
import { PAGE_TYPE_LABELS, buildLandingEditorUrl } from '../../constants/landing';

interface CobrandedMarketingProps {
  userRole: 'loan-officer' | 'realtor';
  userId: string;
}

export function CobrandedMarketing({ userRole, userId }: CobrandedMarketingProps) {
  const [loading, setLoading] = useState(true);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorPageId, setEditorPageId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);

  useEffect(() => {
    const loadLandingPages = async () => {
      try {
        setLoading(true);

        // Load landing pages based on user role
        if (userRole === 'loan-officer') {
          const pages = await DataService.getLandingPagesForLO(userId);
          // Filter out biolink pages - only show prequal and open house
          const filteredPages = pages.filter(page => page.type !== 'biolink');
          setLandingPages(filteredPages);
        } else {
          const pages = await DataService.getCoBrandedPagesForRealtor(userId);
          // Filter out biolink pages - only show prequal and open house
          const filteredPages = pages.filter(page => page.type !== 'biolink');
          setLandingPages(filteredPages);
        }

      } catch (error) {
        console.error('Failed to load landing pages:', error);
        setLandingPages([]);
      } finally {
        setLoading(false);
      }
    };

    loadLandingPages();
  }, [userId, userRole]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event && event.data && event.data.type === 'frs:lp:saved') {
        setEditorOpen(false);
        setEditorPageId(null);
        (async () => {
          try {
            if (userRole === 'loan-officer') {
              const pages = await DataService.getLandingPagesForLO(userId);
              const filteredPages = pages.filter(page => page.type !== 'biolink');
              setLandingPages(filteredPages);
            } else {
              const pages = await DataService.getCoBrandedPagesForRealtor(userId);
              const filteredPages = pages.filter(page => page.type !== 'biolink');
              setLandingPages(filteredPages);
            }
          } catch (e) {}
        })();
      }

      if (event && event.data && event.data.type === 'frs:lp:close') {
        setEditorOpen(false);
        setEditorPageId(null);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [userId, userRole]);

  const openEditor = (pageId: string) => {
    setEditorPageId(pageId);
    setEditorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : landingPages.length === 0 ? (
        <Card className="brand-card">
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No Landing Pages Yet</h3>
            <p className="text-[var(--brand-slate)]">
              {userRole === 'loan-officer'
                ? 'Create your first landing page to start generating leads'
                : 'Your loan officer hasn\'t created any landing pages yet. Check back later or contact them directly.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Landing Pages Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {landingPages.map((page) => (
          <Card
            key={page.id}
            className="brand-card group hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
          >
            <CardContent className="p-0 relative">
              {/* Landing Page Preview (static thumbnail) */}
              <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--brand-dark-navy)] to-[var(--brand-royal-blue)]">
                {/* Featured Image or Placeholder */}
                <div className="w-full h-full flex items-center justify-center">
                  {page.featured_image ? (
                    <img
                      src={page.featured_image}
                      alt={page.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-3 text-white/60">
                      <Globe className="h-16 w-16" />
                      <span className="text-sm font-medium">{PAGE_TYPE_LABELS[(page.type as any) || 'loan_officer'] || page.type}</span>
                    </div>
                  )}
                </div>

                {/* Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35"></div>

                {/* Landing Page Info Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4">
                  {/* Top Section - Type Only */}
                  <div className="flex justify-start items-start">
                    <Badge variant="secondary" className="text-xs bg-white/90 text-[var(--brand-dark-navy)] backdrop-blur-sm shadow-lg">
                      {PAGE_TYPE_LABELS[(page.type as any) || 'loan_officer'] || page.type}
                    </Badge>
                  </div>

                  {/* Bottom Section - Title and Stats */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white leading-tight drop-shadow-lg">
                      {page.title}
                    </h4>
                    <div className="flex justify-between items-end">
                      <div className="flex space-x-4 text-white/90">
                        <div className="flex items-center space-x-1 text-sm">
                          <Eye className="h-4 w-4" />
                          <span className="font-medium">{page.views?.toLocaleString() || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{page.conversions || 0}</span>
                        </div>
                      </div>
                      <div className="text-xs text-white/75 flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(page.lastModified || page.updated || page.created).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                    {userRole === 'loan-officer' ? (
                      <>
                        <Button
                          size="lg"
                          className="brand-button brand-button-primary shadow-xl border-0 backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); openEditor(page.id); }}
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          Edit Page
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="brand-button brand-button-hover bg-white/95 shadow-xl backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); setPreviewPageId(page.id); setPreviewOpen(true); }}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          Preview
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          size="lg"
                          className="brand-button brand-button-primary shadow-xl border-0 backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); setPreviewPageId(page.id); setPreviewOpen(true); }}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          View Page
                        </Button>
                        <Button
                          size="lg"
                          variant="outline"
                          className="brand-button brand-button-hover bg-white/95 shadow-xl backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); window.open(page.url || `/?p=${page.id}`, '_blank'); }}
                        >
                          <Share2 className="h-5 w-5 mr-2" />
                          Share
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Performance Summary Bar */}
              <div className="p-4 bg-gradient-to-r from-[var(--brand-pale-blue)] to-white border-t border-[var(--brand-powder-blue)]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-cyan)] animate-pulse"></div>
                    <span className="text-sm font-medium text-[var(--brand-dark-navy)]">Live</span>
                  </div>
                  <div className="text-sm text-[var(--brand-slate)]">
                    {page.views > 0 ? ((page.conversions / page.views) * 100).toFixed(1) : '0.0'}% conversion rate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
            ))}
          </div>
        </>
      )}

      {/* Full-width Preview Modal */}
      {previewOpen && previewPageId && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
          <div className="relative w-[95vw] h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-[var(--brand-dark-navy)] border-b border-gray-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Page Preview</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentPage = landingPages.find(p => p.id === previewPageId);
                    if (currentPage) {
                      window.open(currentPage.url || `/?p=${currentPage.id}`, '_blank');
                    }
                  }}
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setPreviewOpen(false); setPreviewPageId(null); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </Button>
              </div>
            </div>

            {/* Full Page iframe */}
            <iframe
              title="Page Preview"
              src={(() => {
                const currentPage = landingPages.find(p => p.id === previewPageId);
                return currentPage?.url || `/?p=${previewPageId}`;
              })()}
              className="w-full h-full border-0"
              style={{ paddingTop: '64px' }}
            />
          </div>
        </div>
      )}

      {/* Frontend Block Editor Modal (iframe) */}
      {editorOpen && editorPageId && (
        <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center pt-16">
          <div className="relative w-[95vw] h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-[var(--brand-dark-navy)] border-b border-gray-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Page Editor</h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => { setEditorOpen(false); setEditorPageId(null); }}
                  className="text-gray-300 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </div>

            <iframe
              title="Landing Page Editor"
              src={(() => {
                const currentPage = landingPages.find(p => p.id === editorPageId);
                return buildLandingEditorUrl(editorPageId, true, currentPage?.type);
              })()}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}
    </div>
  );
}
