import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LoadingSpinner } from '../ui/loading';
import { Input } from '../ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Users,
  Eye,
  Pencil,
  Copy,
  ExternalLink,
  TrendingUp,
  User,
  UsersRound,
  Globe,
  Edit,
  Share2,
  Calendar,
  Search
} from 'lucide-react';
import { DataService } from '../../utils/dataService';
import type { LandingPage } from '../../utils/dataService';
import { PAGE_TYPE_LABELS, buildLandingEditorUrl } from '../../constants/landing';

interface LandingPagesMarketingProps {
  userId: string;
  currentUser: any;
}

export function LandingPagesMarketing({ userId, currentUser }: LandingPagesMarketingProps) {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorPageId, setEditorPageId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewPageId, setPreviewPageId] = useState<string | null>(null);
  const [personalSearchQuery, setPersonalSearchQuery] = useState('');
  const [cobrandedSearchQuery, setCobrandedSearchQuery] = useState('');

  // Load landing pages from API
  useEffect(() => {
    const loadLandingPages = async () => {
      try {
        setIsLoading(true);
        const pages = await DataService.getLandingPagesForLO(userId);
        // Filter out biolink pages - they have their own section
        const filteredPages = pages.filter(page => page.type !== 'biolink');
        setLandingPages(filteredPages);
        setError(null);
      } catch (err) {
        console.error('Failed to load landing pages:', err);
        setError('Failed to load landing pages');
      } finally {
        setIsLoading(false);
      }
    };

    loadLandingPages();
  }, [userId]);

  // Listen for page save/close events from editor iframe
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event && event.data && event.data.type === 'frs:lp:saved') {
        setEditorOpen(false);
        setEditorPageId(null);
        (async () => {
          try {
            const pages = await DataService.getLandingPagesForLO(userId);
            // Filter out biolink pages - they have their own section
            const filteredPages = pages.filter(page => page.type !== 'biolink');
            setLandingPages(filteredPages);
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
  }, [userId]);

  const openEditor = (pageId: string) => {
    setEditorPageId(pageId);
    setEditorOpen(true);
  };

  // Filter function for search
  const filterPages = (pages: LandingPage[], searchQuery: string) => {
    if (!searchQuery.trim()) return pages;

    const query = searchQuery.toLowerCase();
    return pages.filter(page =>
      page.title.toLowerCase().includes(query) ||
      page.type.toLowerCase().includes(query)
    );
  };

  // Separate personal and co-branded pages
  const allPersonalPages = landingPages.filter(page => !page.isCoBranded);
  const allCobrandedPages = landingPages.filter(page => page.isCoBranded);

  // Apply search filter with separate queries for each tab
  const personalPages = filterPages(allPersonalPages, personalSearchQuery);
  const cobrandedPages = filterPages(allCobrandedPages, cobrandedSearchQuery);

  // Calculate stats for personal pages
  const personalStats = personalPages.reduce(
    (acc, page) => ({
      totalPages: acc.totalPages + 1,
      totalViews: acc.totalViews + (page.views || 0),
      totalConversions: acc.totalConversions + (page.conversions || 0),
    }),
    { totalPages: 0, totalViews: 0, totalConversions: 0 }
  );

  const personalConversionRate = personalStats.totalViews > 0
    ? ((personalStats.totalConversions / personalStats.totalViews) * 100).toFixed(1)
    : '0.0';

  // Calculate stats for co-branded pages
  const cobrandedStats = cobrandedPages.reduce(
    (acc, page) => ({
      totalPages: acc.totalPages + 1,
      totalViews: acc.totalViews + (page.views || 0),
      totalConversions: acc.totalConversions + (page.conversions || 0),
    }),
    { totalPages: 0, totalViews: 0, totalConversions: 0 }
  );

  const cobrandedConversionRate = cobrandedStats.totalViews > 0
    ? ((cobrandedStats.totalConversions / cobrandedStats.totalViews) * 100).toFixed(1)
    : '0.0';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  const renderLandingPageCard = (page: LandingPage) => {
    const pageConversionRate = page.views > 0
      ? ((page.conversions / page.views) * 100).toFixed(1)
      : '0.0';

    return (
      <Card
        key={page.id}
        className="brand-card group hover:shadow-2xl transition-all duration-500 cursor-pointer relative overflow-hidden"
      >
        <CardContent className="p-0 relative">
          {/* Landing Page Preview - Live Iframe */}
          <div className="relative aspect-[16/9] overflow-hidden bg-gradient-to-br from-[var(--brand-dark-navy)] to-[var(--brand-royal-blue)]">
            {page.url ? (
              <div className="absolute inset-0 overflow-hidden">
                <iframe
                  src={page.url}
                  title={`Preview of ${page.title}`}
                  className="absolute w-full border-0"
                  style={{
                    height: '200vh',
                    top: '-35vh',
                    left: 0,
                    margin: 0,
                    padding: 0
                  }}
                  scrolling="no"
                />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex flex-col items-center justify-center space-y-3 text-white/60">
                  <Globe className="h-16 w-16" />
                  <span className="text-sm font-medium">{PAGE_TYPE_LABELS[(page.type as any) || 'loan_officer'] || page.type}</span>
                </div>
              </div>
            )}

            {/* Overlay with Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/35"></div>

            {/* Landing Page Info Overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              {/* Top Section - Type and Status */}
              <div className="flex justify-between items-start">
                <Badge variant="secondary" className="text-xs bg-white/90 text-[var(--brand-dark-navy)] backdrop-blur-sm shadow-lg">
                  {PAGE_TYPE_LABELS[(page.type as any) || 'loan_officer'] || page.type}
                </Badge>
                {page.isCoBranded && (
                  <Badge className="text-xs bg-[var(--brand-rich-teal)] text-white backdrop-blur-sm shadow-lg">
                    <UsersRound className="h-3 w-3 mr-1" />
                    Co-branded
                  </Badge>
                )}
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
              </div>
            </div>
          </div>

          {/* Performance Summary Bar */}
          <div className="p-4 bg-gradient-to-r from-[var(--brand-pale-blue)] to-white border-t border-[var(--brand-powder-blue)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 rounded-full bg-[var(--brand-cyan)] animate-pulse"></div>
                <span className="text-sm font-medium text-[var(--brand-dark-navy)]">
                  {page.status === 'publish' ? 'Live' : page.status}
                </span>
              </div>
              <div className="text-sm text-[var(--brand-slate)]">
                {pageConversionRate}% conversion rate
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal ({personalPages.length})
          </TabsTrigger>
          <TabsTrigger value="cobranded" className="flex items-center gap-2">
            <UsersRound className="h-4 w-4" />
            Co-branded ({cobrandedPages.length})
          </TabsTrigger>
        </TabsList>

        {/* Personal Landing Pages Tab */}
        <TabsContent value="personal" className="space-y-6 mt-6">
          {/* Search Bar - Always visible */}
          <div className="max-w-md">
            <div className="flex items-center space-x-3 p-3 bg-gray-200 rounded-md border-gray-300">
              <Search className="h-4 w-4 text-[var(--brand-slate)] flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search landing pages..."
                value={personalSearchQuery}
                onChange={(e) => setPersonalSearchQuery(e.target.value)}
                className="!border-0 !bg-transparent !p-0 text-[var(--brand-dark-navy)] !focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Personal Stats Cards */}
          <div className="grid grid-cols-3 gap-4 max-md:hidden">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Personal Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-primary-blue)' }}>
                  {personalStats.totalPages}
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Your landing pages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-rich-teal)' }}>
                  {personalStats.totalViews.toLocaleString()}
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  All-time page views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                  {personalConversionRate}%
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {personalStats.totalConversions} conversions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Personal Pages Grid */}
          {personalPages.length === 0 ? (
            <Card className="brand-card">
              <CardContent className="text-center py-12">
                {personalSearchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No pages found</h3>
                    <p className="text-[var(--brand-slate)] mb-4">
                      Try adjusting your search terms
                    </p>
                    <Button
                      variant="outline"
                      className="brand-button"
                      onClick={() => setPersonalSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <Globe className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No Personal Landing Pages Yet</h3>
                    <p className="text-[var(--brand-slate)] mb-4">
                      Create your first landing page to start generating leads
                    </p>
                    <Button className="brand-button">
                      Create Landing Page
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {personalPages.map(renderLandingPageCard)}
            </div>
          )}
        </TabsContent>

        {/* Co-branded Landing Pages Tab */}
        <TabsContent value="cobranded" className="space-y-6 mt-6">
          {/* Search Bar - Always visible */}
          <div className="max-w-md">
            <div className="flex items-center space-x-3 p-3 bg-gray-200 rounded-md border-gray-300">
              <Search className="h-4 w-4 text-[var(--brand-slate)] flex-shrink-0" />
              <Input
                type="text"
                placeholder="Search co-branded pages..."
                value={cobrandedSearchQuery}
                onChange={(e) => setCobrandedSearchQuery(e.target.value)}
                className="!border-0 !bg-transparent !p-0 text-[var(--brand-dark-navy)] !focus:ring-0 focus:outline-none"
              />
            </div>
          </div>

          {/* Co-branded Stats Cards */}
          <div className="grid grid-cols-3 gap-4 max-md:hidden">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Co-branded Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-primary-blue)' }}>
                  {cobrandedStats.totalPages}
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  Partnership pages
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Total Views</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-rich-teal)' }}>
                  {cobrandedStats.totalViews.toLocaleString()}
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  All-time page views
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Conversion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold" style={{ color: 'var(--brand-navy)' }}>
                  {cobrandedConversionRate}%
                </div>
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {cobrandedStats.totalConversions} conversions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Co-branded Pages Grid */}
          {cobrandedPages.length === 0 ? (
            <Card className="brand-card">
              <CardContent className="text-center py-12">
                {cobrandedSearchQuery ? (
                  <>
                    <Search className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No pages found</h3>
                    <p className="text-[var(--brand-slate)] mb-4">
                      Try adjusting your search terms
                    </p>
                    <Button
                      variant="outline"
                      className="brand-button"
                      onClick={() => setCobrandedSearchQuery('')}
                    >
                      Clear Search
                    </Button>
                  </>
                ) : (
                  <>
                    <UsersRound className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No Co-branded Pages Yet</h3>
                    <p className="text-[var(--brand-slate)] mb-4">
                      Partner with realtors to create co-branded landing pages
                    </p>
                    <Button className="brand-button">
                      Create Co-branded Page
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {cobrandedPages.map(renderLandingPageCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Full-width Preview Modal */}
      {previewOpen && previewPageId && (
        <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
          <div className="relative w-[95vw] h-[80vh] bg-white rounded-lg overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="absolute top-0 left-0 right-0 z-10 bg-[var(--brand-dark-navy)] border-b border-gray-600 px-6 py-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">
                Page Preview
                {(() => {
                  const currentPage = landingPages.find(p => p.id === previewPageId);
                  return currentPage ? ` - ${currentPage.title}` : '';
                })()}
              </h3>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const currentPage = landingPages.find(p => p.id === previewPageId);
                    if (currentPage?.url) {
                      window.open(currentPage.url, '_blank');
                    } else {
                      window.open(`/?p=${currentPage?.id}`, '_blank');
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
                const previewUrl = currentPage?.url || `/?p=${previewPageId}`;
                console.log('🔍 Preview Modal Debug:', {
                  pageId: previewPageId,
                  pageTitle: currentPage?.title,
                  url: currentPage?.url,
                  fullUrl: previewUrl,
                  pageObject: currentPage
                });
                return previewUrl;
              })()}
              className="w-full h-full border-0"
              style={{ paddingTop: '64px' }}
              allow="fullscreen"
              onLoad={(e) => {
                console.log('✅ Iframe loaded successfully');
              }}
              onError={(e) => {
                console.error('❌ Iframe failed to load:', e);
              }}
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
              allow="fullscreen"
            />
          </div>
        </div>
      )}
    </div>
  );
}
