import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PrintMarketing } from './PrintMarketing';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Share2, 
  Eye, 
  Edit,
  Plus,
  Calendar,
  TrendingUp,
  Printer,
  Globe,
  Palette
} from 'lucide-react';
import { PAGE_TYPE_LABELS, buildLandingEditorUrl } from '../constants/landing';
import { DataService, type User } from '../utils/dataService';
import { LoadingSpinner } from './ui/loading';

interface MarketingMaterialsProps {
  userRole: 'loan-officer' | 'realtor';
  userId: string;
  currentUser?: User;
}

export function MarketingMaterials({ userRole, userId, currentUser }: MarketingMaterialsProps) {
  const [activeTab, setActiveTab] = useState('landing-pages');
  const [loading, setLoading] = useState(true);
  const [landingPages, setLandingPages] = useState<any[]>([]);
  const [marketingMaterials, setMarketingMaterials] = useState<any[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load landing pages
        if (userRole === 'loan-officer') {
          console.log('Fetching landing pages for LO with userId:', userId);
          const pages = await DataService.getLandingPagesForLO(userId);
          console.log('Landing pages received:', pages);
          setLandingPages(pages);
        } else {
          const pages = await DataService.getCoBrandedPagesForRealtor(userId);
          setLandingPages(pages);
        }

        // Load marketing materials
        const materials = await DataService.getMarketingMaterials(userId);
        setMarketingMaterials(materials);
        
      } catch (error) {
        console.error('Failed to load marketing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, userRole]);


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--brand-dark-navy)]">Marketing Materials</h2>
          <p className="text-[var(--brand-slate)] mt-1">
            {userRole === 'loan-officer' 
              ? 'Create and manage co-branded marketing materials for your realtor partnerships' 
              : 'Access co-branded marketing materials from your loan officer partner'}
          </p>
        </div>
      </div>

      {/* Marketing Materials Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[var(--brand-pale-blue)] w-full justify-start">
          <TabsTrigger value="landing-pages" className="flex items-center space-x-2">
            <Globe className="h-4 w-4" />
            <span>Landing Pages</span>
          </TabsTrigger>
          <TabsTrigger value="social-media" className="flex items-center space-x-2">
            <Share2 className="h-4 w-4" />
            <span>Social Media</span>
          </TabsTrigger>
          <TabsTrigger value="print-media" className="flex items-center space-x-2">
            <Printer className="h-4 w-4" />
            <span>Print Media</span>
          </TabsTrigger>
        </TabsList>

        {/* Landing Pages Tab */}
        <TabsContent value="landing-pages" className="space-y-6">
          <LandingPagesSection userRole={userRole} userId={userId} currentUser={currentUser} />
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social-media" className="space-y-6">
          <SocialMediaSection userRole={userRole} userId={userId} />
        </TabsContent>

        {/* Print Media Tab */}
        <TabsContent value="print-media" className="space-y-6">
          <PrintMarketing userRole={userRole} userId={userId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Landing Pages Section Component
function LandingPagesSection({ userRole, userId, currentUser }: { userRole: 'loan-officer' | 'realtor', userId: string, currentUser?: User }) {
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
          setLandingPages(pages);
        } else {
          const pages = await DataService.getCoBrandedPagesForRealtor(userId);
          setLandingPages(pages);
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
              setLandingPages(pages);
            } else {
              const pages = await DataService.getCoBrandedPagesForRealtor(userId);
              setLandingPages(pages);
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
    // Use iframe editor for all page types (including biolink)
    setEditorPageId(pageId);
    setEditorOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      published: { color: 'bg-[var(--brand-cyan)]', label: 'Published' },
      draft: { color: 'bg-orange-500', label: 'Draft' },
      archived: { color: 'bg-[var(--brand-slate)]', label: 'Archived' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.draft;
    
    return (
      <Badge className={`${statusConfig.color} text-white`}>
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Biolink page is treated the same as any landing-page (no separate UI) */}

      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[var(--brand-dark-navy)]">Landing Pages</h3>
          <p className="text-sm text-[var(--brand-slate)]">
            {userRole === 'loan-officer' 
              ? 'Create and manage co-branded landing pages for lead generation'
              : 'View and share landing pages created by your loan officer partner'}
          </p>
        </div>
        {userRole === 'loan-officer' && (
          <Button className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Landing Page
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : landingPages.length === 0 ? (
        <Card className="border-[var(--brand-powder-blue)]">
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
            className="group border-[var(--brand-powder-blue)] hover:shadow-2xl hover:border-[var(--brand-electric-blue)] transition-all duration-500 cursor-pointer relative overflow-hidden rounded-xl"
          >
            <CardContent className="p-0 relative">
              {/* Landing Page Preview (live iframe) */}
              <div className="relative aspect-[16/9] overflow-hidden">
                <div className="w-full h-full flex items-center justify-center">
                  <iframe
                    src={page.url || `/?p=${page.id}`}
                    title={`preview-${page.id}`}
                    className="w-full h-full"
                    style={{
                      border: '0',
                      pointerEvents: 'none',
                      width: '100%',
                      height: page.type === 'biolink' ? 'calc(100% + 90px)' : page.type === 'prequal' ? 'calc(100% + 280px)' : '100%',
                      position: 'absolute',
                      top: page.type === 'biolink' ? '-85px' : page.type === 'prequal' ? '-280px' : '0',
                      left: '0',
                      transform: page.type === 'biolink' ? 'scale(1.1)' : page.type === 'prequal' ? 'scale(1.2)' : 'scale(1)'
                    }}
                    loading="lazy"
                  />
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
                          <span className="font-medium">{page.views.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <TrendingUp className="h-4 w-4" />
                          <span className="font-medium">{page.conversions}</span>
                        </div>we 
                      </div>
                      <div className="text-xs text-white/75 flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(page.lastModified).toLocaleDateString()}</span>
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
                          className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white text-white shadow-xl border-0 backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); openEditor(page.id); }}
                        >
                          <Edit className="h-5 w-5 mr-2" />
                          {page.type === 'biolink' ? 'Edit Profile' : 'Edit Page'}
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="bg-white/95 hover:bg-white border-white text-[var(--brand-dark-navy)] shadow-xl backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); setPreviewPageId(page.id); setPreviewOpen(true); }}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          {page.type === 'biolink' ? 'View Biolink' : 'Preview'}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          size="lg" 
                          className="bg-[var(--brand-cyan)] hover:bg-[var(--brand-cyan)]/90 text-white shadow-xl border-0 backdrop-blur-sm"
                          onClick={(e) => { e.stopPropagation(); setPreviewPageId(page.id); setPreviewOpen(true); }}
                        >
                          <Eye className="h-5 w-5 mr-2" />
                          View Page
                        </Button>
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="bg-white/95 hover:bg-white border-white text-[var(--brand-dark-navy)] shadow-xl backdrop-blur-sm"
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

// Social Media Section Component
function SocialMediaSection({ userRole, userId }: { userRole: 'loan-officer' | 'realtor', userId: string }) {
  const [loading, setLoading] = useState(true);
  const [socialContent, setSocialContent] = useState<any[]>([]);

  useEffect(() => {
    const loadSocialContent = async () => {
      try {
        setLoading(true);
        const materials = await DataService.getMarketingMaterials(userId);
        // Filter for social/print materials that contain Canva embeds
        const socialMaterials = materials.filter(m => m.type === 'social_print' && m.embed_code);
        setSocialContent(socialMaterials);
      } catch (error) {
        console.error('Failed to load social media content:', error);
        setSocialContent([]);
      } finally {
        setLoading(false);
      }
    };

    loadSocialContent();
  }, [userId]);


  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-[var(--brand-dark-navy)]">Social Media Content</h3>
          <p className="text-sm text-[var(--brand-slate)]">
            {userRole === 'loan-officer' 
              ? 'Create and manage co-branded social media content for your realtor partnerships'
              : 'Access co-branded social media content from your loan officer partner'}
          </p>
        </div>
        {userRole === 'loan-officer' && (
          <Button className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Create Content
          </Button>
        )}
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-[var(--brand-slate)]">Loading social media content...</span>
        </div>
      ) : socialContent.length > 0 ? (
        /* Social Media Content Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {socialContent.map((content) => (
          <Card 
            key={content.id} 
            className="group border-[var(--brand-powder-blue)] hover:shadow-2xl hover:border-[var(--brand-electric-blue)] transition-all duration-500 cursor-pointer relative overflow-hidden rounded-xl"
          >
            <CardContent className="p-0 relative">
              {/* Canva Embed Preview */}
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <div 
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: content.embed_code }}
                />
                
                {/* Overlay with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none"></div>
                
                {/* Content Info Overlay */}
                <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none">
                  {/* Top Section - Badge */}
                  <div className="flex justify-between items-start">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white pointer-events-auto">
                      Canva Design
                    </Badge>
                    <Badge variant="secondary" className="text-xs bg-white/90 text-[var(--brand-dark-navy)] backdrop-blur-sm shadow-lg pointer-events-auto">
                      Marketing Material
                    </Badge>
                  </div>
                  
                  {/* Bottom Section - Title and Date */}
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold text-white leading-tight drop-shadow-lg">
                      {content.title}
                    </h4>
                    <div className="flex justify-between items-end">
                      <div className="text-xs text-white/75 flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(content.lastModified).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Action Buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex space-x-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                    <Button 
                      size="lg" 
                      className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white shadow-xl border-0 backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Eye className="h-5 w-5 mr-2" />
                      Open in Canva
                    </Button>
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="bg-white/95 hover:bg-white border-white text-[var(--brand-dark-navy)] shadow-xl backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Share2 className="h-5 w-5 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>

              {/* Material Info Bar */}
              <div className="p-4 bg-gradient-to-r from-[var(--brand-pale-blue)] to-white border-t border-[var(--brand-powder-blue)]">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[var(--brand-cyan)] animate-pulse"></div>
                    <span className="text-sm font-medium text-[var(--brand-dark-navy)]">Ready to Use</span>
                  </div>
                  <Badge variant="outline" className="text-xs text-[var(--brand-slate)]">
                    {content.category}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      ) : (
        /* Empty State */
        <Card className="border-dashed border-2 border-[var(--brand-powder-blue)]">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Share2 className="h-16 w-16 text-[var(--brand-slate)] mb-4" />
            <h3 className="text-xl font-semibold text-[var(--brand-dark-navy)] mb-2">
              {userRole === 'loan-officer' ? 'No Social Media Content Yet' : 'No Shared Content Available'}
            </h3>
            <p className="text-[var(--brand-slate)] mb-6 max-w-md">
              {userRole === 'loan-officer' 
                ? 'Create your first social media post to share with your realtor partners. Build co-branded content that showcases your collaboration.'
                : 'Your loan officer partner hasn\'t shared any social media content yet. Check back later or reach out to coordinate co-branded posts.'}
            </p>
            {userRole === 'loan-officer' && (
              <Button className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Post
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Content Creation Tools */}
      <Card className="border-[var(--brand-powder-blue)] bg-gradient-to-r from-[var(--brand-pale-blue)] to-white">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[var(--brand-electric-blue)] rounded-lg flex items-center justify-center">
              <Palette className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[var(--brand-dark-navy)] mb-1">Content Creation Tools</h3>
              <p className="text-sm text-[var(--brand-slate)]">
                {userRole === 'loan-officer' 
                  ? 'Access professional templates and tools to create engaging social media content for your realtor partnerships.'
                  : 'Download and customize co-branded social media content created by your loan officer partner.'}
              </p>
            </div>
            <Button 
              variant="outline" 
              className="border-[var(--brand-electric-blue)] text-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)] hover:text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              {userRole === 'loan-officer' ? 'Create New' : 'Browse Templates'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
