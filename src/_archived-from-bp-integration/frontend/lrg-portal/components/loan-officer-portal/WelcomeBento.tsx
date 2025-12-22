import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Bell,
  TrendingUp,
  Calendar,
  Users,
  ArrowRight,
  ExternalLink,
  X
} from 'lucide-react';
import { LoadingSpinner } from '../ui/loading';
import { DataService } from '../../utils/dataService';
import { AppLauncher } from './AppLauncher';
import { MarketMattersWidget } from './MarketMattersWidget';

interface WelcomeBentoProps {
  userId: string;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  link: string;
  date: string;
  featured_image?: string;
  author_name?: string;
  author_avatar?: string;
  category_name?: string;
}

interface DashboardStats {
  activeLeads: number;
  partnerships: number;
}

export function WelcomeBento({ userId }: WelcomeBentoProps) {
  // Try to get navigate, but make it optional for use outside router
  let navigate;
  try {
    navigate = useNavigate();
  } catch (e) {
    navigate = () => {}; // No-op if not in router context
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
  });
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeLeads: 0,
    partnerships: 0,
  });
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second for live clock

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get user first (needed for other calls)
        const user = await DataService.getCurrentUser();
        const nameParts = (user.name || '').split(' ');
        setProfileData({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
        });

        // Run all independent API calls in parallel for faster loading
        await Promise.all([
          // Load announcements
          DataService.getAnnouncements().then(data => {
            setAnnouncements(data.slice(0, 2));
          }).catch(err => console.error('Failed to load announcements:', err)),

          // Load blog posts
          (async () => {
            try {
              const nonce = (window as any).frsPortalConfig?.restNonce;
              const headers = nonce ? { 'X-WP-Nonce': nonce } : {};

              const postsResponse = await fetch(`/wp-json/wp/v2/posts?per_page=2&_embed`, { headers });
              if (!postsResponse.ok) {
                console.error('Failed to fetch posts:', postsResponse.status);
                return;
              }

              const posts = await postsResponse.json();
              if (posts.length === 0) {
                console.warn('No posts found for category');
                return;
              }

              // Process each post
              const processedPosts = await Promise.all(posts.map(async (post: any) => {
                console.log('Post data:', post);
                console.log('Embedded data:', post._embedded);

                // Decode HTML entities
                const titleDiv = document.createElement('div');
                titleDiv.innerHTML = post.title.rendered;
                const decodedTitle = titleDiv.textContent || titleDiv.innerText || '';

                const excerptDiv = document.createElement('div');
                excerptDiv.innerHTML = post.excerpt.rendered;
                const decodedExcerpt = excerptDiv.textContent || excerptDiv.innerText || '';

                // Get category name from embedded data
                const categoryData = post._embedded?.['wp:term']?.[0]?.[0];
                const categoryName = categoryData?.name || 'Blog';

                // Get author data - try multiple paths
                let authorData = post._embedded?.author?.[0];

                // If no author in _embedded, fetch author separately
                if (!authorData && post.author) {
                  try {
                    const authorResponse = await fetch(`/wp-json/wp/v2/users/${post.author}`, { headers });
                    if (authorResponse.ok) {
                      authorData = await authorResponse.json();
                    }
                  } catch (err) {
                    console.error('Failed to fetch author:', err);
                  }
                }

                console.log('Author data:', authorData);

                const authorName = authorData?.name || authorData?.display_name || 'Author';

                // Get avatar URL
                let authorAvatar = '';
                if (authorData?.avatar_urls) {
                  authorAvatar = authorData.avatar_urls['96'] ||
                                 authorData.avatar_urls['48'] ||
                                 authorData.avatar_urls['24'] ||
                                 Object.values(authorData.avatar_urls)[0];
                }

                if (!authorAvatar) {
                  authorAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=2DD4DA&color=fff&size=96`;
                }

                console.log('Final author name:', authorName);
                console.log('Final author avatar:', authorAvatar);

                return {
                  id: post.id,
                  title: decodedTitle,
                  excerpt: decodedExcerpt.substring(0, 150) + '...',
                  link: post.link,
                  date: new Date(post.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                  featured_image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
                  author_name: authorName,
                  author_avatar: authorAvatar,
                  category_name: categoryName,
                };
              }));

              setBlogPosts(processedPosts);
            } catch (err) {
              console.error('Failed to load blog post:', err);
            }
          })(),
        ]);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="max-w-full h-full overflow-visible m-4 md:m-6 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Fluid grid layout */}
      <div className="space-y-3">
        {/* Welcome + Market section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Welcome Header + Clock/Calendar */}
          <div className="h-full space-y-2 flex flex-col">
          {/* Welcome Header - Brand Navy Gradient */}
          <div className="relative overflow-hidden max-md:rounded-none md:rounded-lg p-4 w-full shadow-[0_4px_16px_rgba(38,48,66,0.4),0_2px_6px_rgba(0,0,0,0.2)] flex-1 flex items-center ring-1 ring-white/10" style={{
            background: 'var(--gradient-brand-navy)',
          }}>
            <div className="relative z-10 flex flex-col justify-center w-full">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Welcome,<br />
                {profileData.firstName}
              </h1>
              <p className="text-sm text-white/90">
                Your dashboard is ready
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Time & Date Widget - Clock + Tear-off Calendar */}
          <div className="grid grid-cols-2 gap-2">
            {/* Clock with AM/PM */}
            <div
              className="shadow-[0_2px_8px_rgba(37,99,235,0.3),0_1px_3px_rgba(0,0,0,0.1)] rounded-lg overflow-hidden flex flex-col items-center justify-center px-3 py-4 ring-1 ring-white/20"
              style={{
                background: 'var(--gradient-hero)',
              }}
            >
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(1.5rem, 3vw, 2rem)',
                  fontWeight: 700,
                  lineHeight: '1',
                  fontFamily: 'Poppins, -apple-system, sans-serif'
                }}
              >
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: true
                }).split(' ')[0]}
              </div>
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(0.8rem, 1.5vw, 1rem)',
                  fontWeight: 500,
                  marginTop: '0.25em',
                  fontFamily: 'Poppins, -apple-system, sans-serif'
                }}
              >
                {currentTime.toLocaleTimeString('en-US', {
                  hour12: true
                }).split(' ')[1]}
              </div>
            </div>

            {/* Tear-off Calendar */}
            <div className="shadow-[0_2px_8px_rgba(0,0,0,0.12),0_1px_3px_rgba(0,0,0,0.08)] rounded-lg overflow-hidden bg-white ring-1 ring-black/5">
              {/* Month header (tear-off top) */}
              <div
                className="text-center py-1.5"
                style={{
                  background: 'linear-gradient(135deg, var(--brand-primary-blue) 0%, var(--brand-rich-teal) 100%)',
                  color: '#ffffff',
                  fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
                  fontWeight: 600,
                  fontFamily: 'Poppins, -apple-system, sans-serif',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase'
                }}
              >
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][currentTime.getMonth()]}
              </div>

              {/* Date number */}
              <div className="flex flex-col items-center justify-center py-2 bg-white">
                <div
                  style={{
                    fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                    fontWeight: 700,
                    lineHeight: '1',
                    color: 'var(--brand-dark-navy)',
                    fontFamily: 'Poppins, -apple-system, sans-serif'
                  }}
                >
                  {currentTime.getDate()}
                </div>
                <div
                  style={{
                    fontSize: 'clamp(0.7rem, 1.2vw, 0.85rem)',
                    fontWeight: 500,
                    color: 'var(--brand-slate)',
                    marginTop: '0.25em',
                    fontFamily: 'Poppins, -apple-system, sans-serif'
                  }}
                >
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentTime.getDay()]}
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* Market Matters Widget */}
          <Card className="w-full min-h-[240px] border-0 overflow-hidden rounded-lg shadow-[0_4px_16px_rgba(37,99,235,0.3),0_2px_6px_rgba(0,0,0,0.15)] ring-1 ring-white/20" style={{
            background: 'var(--gradient-hero)',
          }}>
            <MarketMattersWidget />
          </Card>
        </div>

        {/* Blog Posts Section */}
        <div className="h-full">
          <Card className="relative w-full h-full overflow-hidden bg-white/80 backdrop-blur-sm">
            <CardHeader className="pt-3 px-3 pb-1 border-b border-slate-100">
              <CardTitle className="brand-section-header mb-0">
                <Bell className="h-4 w-4 brand-section-icon" />
                <span className="brand-section-title">Latest Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 pt-2 overflow-y-auto max-h-[300px]">
              <div className="space-y-2">
                {/* Blog Posts Section */}
                {blogPosts.length > 0 && (
                  <div className="space-y-2">
                    {blogPosts.map((post) => (
                      <a
                        key={post.id}
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-2 rounded-lg transition-all hover:bg-slate-50 no-underline"
                      >
                        <h4 className="font-semibold text-xs text-[var(--brand-dark-navy)] line-clamp-1 mb-1">
                          {post.title}
                        </h4>
                        <p className="text-[var(--brand-slate)] text-xs line-clamp-1 mb-1">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-1">
                          <img
                            src={post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || 'Author')}&background=2563EB&color=fff&size=96`}
                            alt={post.author_name}
                            className="w-4 h-4 rounded-full border border-[var(--brand-light-gray)]"
                          />
                          <div className="flex-1 flex items-center gap-1 text-xs text-[var(--brand-slate)]">
                            <span className="font-medium text-[var(--brand-dark-navy)]">{post.author_name}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-[var(--brand-slate)]" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {blogPosts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="brand-card-icon w-16 h-16 mx-auto mb-4">
                      <Bell className="h-8 w-8" />
                    </div>
                    <p className="brand-card-description">No updates available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* App Launcher */}
        <AppLauncher onNavigate={(view) => navigate(`/${view}`)} />
      </div>

      {/* Announcement Modal */}
      {isAnnouncementModalOpen && selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-semibold text-[var(--brand-dark-navy)]">
                  {selectedAnnouncement.title}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-[var(--brand-slate)]">
                  {new Date(selectedAnnouncement.date).toLocaleDateString()}
                </p>

                {selectedAnnouncement.thumbnail && (
                  <img
                    src={selectedAnnouncement.thumbnail}
                    alt={selectedAnnouncement.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}

                <div
                  className="prose max-w-none text-[var(--brand-dark-navy)]"
                  dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                />
              </div>

              <div className="mt-6 pt-4 border-t flex justify-end">
                <Button
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
