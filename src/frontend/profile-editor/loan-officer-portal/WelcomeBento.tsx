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
  const navigate = useNavigate();
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
    <div className="max-w-full h-full overflow-hidden max-md:p-[10px] md:p-0">
      {/* Main Grid: Left content (70%) | Right sidebar (30%) spanning 2 rows */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-3 auto-rows-min">
        {/* Left Column - 70% (7/10 cols) */}
        <div className="lg:col-span-7 space-y-3">
          {/* Row 1: Welcome/Clock | Market Matters */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-3">
            {/* Welcome Header + Clock/Calendar - 3 columns (30%) */}
            <div className="lg:col-span-3 h-full space-y-3 flex flex-col">
          {/* Welcome Header - Brand Navy Gradient */}
          <div className="relative overflow-hidden max-md:rounded-none md:rounded p-4 md:p-6 w-full shadow-xl flex-1 flex items-center" style={{
            background: 'var(--gradient-brand-navy)',
          }}>
            <div className="relative z-10 flex flex-col justify-center w-full">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                Welcome,<br />
                {profileData.firstName}
              </h1>
              <p className="text-sm md:text-base text-white/90">
                Your dashboard is ready
              </p>
            </div>
            <div className="absolute -right-10 -bottom-10 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Time & Date Widget - Clock + Tear-off Calendar */}
          <div className="grid grid-cols-2 gap-3">
            {/* Clock with AM/PM */}
            <div
              className="shadow-xl rounded-sm overflow-hidden flex flex-col items-center justify-center px-4 py-6"
              style={{
                background: 'var(--gradient-hero)',
              }}
            >
              <div
                style={{
                  color: '#ffffff',
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
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
            <div className="shadow-xl rounded-sm overflow-hidden bg-white">
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
              <div className="flex flex-col items-center justify-center py-3 bg-white">
                <div
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
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

            {/* Market Matters Widget - 4 columns (40%) */}
            <div className="lg:col-span-4 h-full">
              <Card className="w-full h-full shadow-xl border-0 overflow-hidden rounded" style={{
                background: 'var(--gradient-hero)',
              }}>
                <MarketMattersWidget />
              </Card>
            </div>
          </div>

          {/* Row 2: Toolbox */}
          <AppLauncher onNavigate={(view) => navigate(`/${view}`)} />
        </div>

        {/* Right Sidebar - 30% (3/10 cols) - Spans both rows */}
        <div className="lg:col-span-3 lg:row-span-2 h-full">
          <Card className="relative w-full h-full shadow-xl border border-gray-200 overflow-hidden rounded bg-white">
            <CardHeader className="pt-4 px-4 md:px-6 pb-0 border-b border-gray-200">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Bell className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                <span className="text-gray-900">
                Updates & News
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-3 overflow-y-auto max-h-[calc(100vh-200px)]">
              <div className="space-y-4">
                {/* Announcements Section */}
                {announcements.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Announcements</h3>
                    {announcements.map((announcement) => (
                      <div
                        key={announcement.id}
                        className="p-3 md:p-4 rounded cursor-pointer transition-all hover:shadow-lg bg-gray-50 border border-gray-200 hover:border-blue-300"
                        onClick={() => {
                          setSelectedAnnouncement(announcement);
                          setIsAnnouncementModalOpen(true);
                        }}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-xs md:text-sm flex-1 text-gray-900">
                            {announcement.title}
                          </h4>
                          {announcement.badge && (
                            <Badge className="text-blue-600 border-0 ml-2 bg-blue-100 text-xs px-1.5 py-0">
                              {announcement.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs md:text-sm line-clamp-1 mb-1">
                          {announcement.excerpt}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500 text-xs font-medium">
                            {new Date(announcement.date).toLocaleDateString()}
                          </span>
                          {announcement.priority === 'high' && (
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Blog Posts Section */}
                {blogPosts.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Latest Updates</h3>
                    {blogPosts.map((post) => (
                      <a
                        key={post.id}
                        href={post.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 md:p-4 rounded transition-all hover:shadow-lg bg-gray-50 border border-gray-200 hover:border-blue-300 no-underline"
                      >
                        <h4 className="font-semibold text-xs md:text-sm text-gray-900 line-clamp-2 mb-2">
                          {post.title}
                        </h4>
                        <p className="text-gray-600 text-xs line-clamp-2 mb-2">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-2">
                          <img
                            src={post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name || 'Author')}&background=2DD4DA&color=fff&size=96`}
                            alt={post.author_name}
                            className="w-5 h-5 rounded-full border border-gray-200"
                          />
                          <div className="flex-1 flex items-center gap-2 text-xs text-gray-500">
                            <span className="font-medium text-gray-700">{post.author_name}</span>
                            <span>•</span>
                            <span>{post.date}</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-gray-500" />
                        </div>
                      </a>
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {announcements.length === 0 && blogPosts.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500">No updates available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Old sections - Remove */}
      <div className="hidden">
        {/* Blog Post 1 - 1 column */}
        {blogPosts.length > 0 && (
          <div className="lg:col-span-1 h-full">
            <Card className="w-full shadow-xl border-0 overflow-hidden relative rounded h-full min-h-0">
              {blogPosts[0].featured_image && (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={blogPosts[0].featured_image}
                      alt={blogPosts[0].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
                </>
              )}
              <CardContent className="relative z-10 p-4 md:p-5 text-white flex flex-col justify-end h-full">
                <h3
                  className="text-lg md:text-xl lg:text-2xl font-bold mb-1.5 md:mb-2 line-clamp-2"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(37, 99, 235, 0.4), 0 0 20px rgba(45, 212, 218, 0.3)',
                    filter: 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.5))'
                  }}
                >
                  {blogPosts[0].title}
                </h3>
                <p className="text-white text-xs md:text-sm font-normal mb-2 md:mb-3 line-clamp-1 md:line-clamp-2">{blogPosts[0].excerpt}</p>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <img
                      src={blogPosts[0].author_avatar || `https://ui-avatars.com/api/?name=Author&background=2DD4DA&color=fff&size=96`}
                      alt={blogPosts[0].author_name || 'Author'}
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white/30"
                    />
                    <span className="text-white font-medium text-xs">{blogPosts[0].author_name || 'Author'}</span>
                    <span className="text-white/50 max-md:hidden">•</span>
                    <span className="text-white/90 max-md:hidden">{blogPosts[0].category_name || 'Blog'}</span>
                    <span className="text-white/50 max-md:hidden">•</span>
                    <span className="text-white/80 max-md:hidden">{blogPosts[0].date}</span>
                  </div>
                  <a
                    href={blogPosts[0].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white hover:text-white/80 transition-colors bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-sm font-medium"
                  >
                    Read more <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Blog Post 2 - 1 column */}
        {blogPosts.length > 1 && (
          <div className="lg:col-span-1 h-full">
            <Card className="w-full shadow-xl border-0 overflow-hidden relative rounded h-full min-h-0">
              {/* Featured image as background */}
              {blogPosts[1].featured_image && (
                <>
                  <div className="absolute inset-0">
                    <img
                      src={blogPosts[1].featured_image}
                      alt={blogPosts[1].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
                </>
              )}

              {/* Content overlaid on background */}
              <CardContent className="relative z-10 p-4 md:p-5 text-white flex flex-col justify-end h-full">
                <h3
                  className="text-lg md:text-xl lg:text-2xl font-bold mb-1.5 md:mb-2 line-clamp-2"
                  style={{
                    color: '#ffffff',
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(37, 99, 235, 0.4), 0 0 20px rgba(45, 212, 218, 0.3)',
                    filter: 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.5))'
                  }}
                >
                  {blogPosts[1].title}
                </h3>
                <p className="text-white text-xs md:text-sm font-normal mb-2 md:mb-3 line-clamp-1 md:line-clamp-2">{blogPosts[1].excerpt}</p>

                {/* Author, category and date info */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    {/* Author avatar and name - always show */}
                    <img
                      src={blogPosts[1].author_avatar || `https://ui-avatars.com/api/?name=Author&background=2DD4DA&color=fff&size=96`}
                      alt={blogPosts[1].author_name || 'Author'}
                      className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white/30"
                    />
                    <span className="text-white font-medium text-xs">{blogPosts[1].author_name || 'Author'}</span>
                    <span className="text-white/50 max-md:hidden">•</span>

                    {/* Category */}
                    <span className="text-white/90 max-md:hidden">{blogPosts[1].category_name || 'Blog'}</span>
                    <span className="text-white/50 max-md:hidden">•</span>

                    {/* Date */}
                    <span className="text-white/80 max-md:hidden">{blogPosts[1].date}</span>
                  </div>
                  <a
                    href={blogPosts[1].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-white hover:text-white/80 transition-colors bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-sm font-medium"
                  >
                    Read more <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty placeholder if needed */}
        <div className="lg:col-span-1 h-full">
          {/* Could add another widget here in the future */}
        </div>
      </div>

      {/* Old blog posts section - Remove */}
      <div className="hidden">
        {blogPosts.length > 0 && (
          <div className="lg:col-span-2 h-full grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
            {blogPosts.slice(2).map((blogPost) => (
              <Card key={blogPost.id} className="w-full shadow-xl border-0 overflow-hidden relative rounded h-full min-h-0">
                {/* Featured image as background */}
                {blogPost.featured_image && (
                  <>
                    <div className="absolute inset-0">
                      <img
                        src={blogPost.featured_image}
                        alt={blogPost.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30" />
                  </>
                )}

                {/* Content overlaid on background */}
                <CardContent className="relative z-10 p-4 md:p-5 text-white flex flex-col justify-end h-full">
                  <h3
                    className="text-lg md:text-xl lg:text-2xl font-bold mb-1.5 md:mb-2 line-clamp-2"
                    style={{
                      color: '#ffffff',
                      textShadow: '0 2px 8px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(37, 99, 235, 0.4), 0 0 20px rgba(45, 212, 218, 0.3)',
                      filter: 'drop-shadow(0 0 8px rgba(37, 99, 235, 0.5))'
                    }}
                  >
                    {blogPost.title}
                  </h3>
                  <p className="text-white text-xs md:text-sm font-normal mb-2 md:mb-3 line-clamp-1 md:line-clamp-2">{blogPost.excerpt}</p>

                  {/* Author, category and date info */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 text-xs">
                      {/* Author avatar and name - always show */}
                      <img
                        src={blogPost.author_avatar || `https://ui-avatars.com/api/?name=Author&background=2DD4DA&color=fff&size=96`}
                        alt={blogPost.author_name || 'Author'}
                        className="w-6 h-6 md:w-7 md:h-7 rounded-full border-2 border-white/30"
                      />
                      <span className="text-white font-medium text-xs">{blogPost.author_name || 'Author'}</span>
                      <span className="text-white/50 max-md:hidden">•</span>

                      {/* Category */}
                      <span className="text-white/90 max-md:hidden">{blogPost.category_name || 'Blog'}</span>
                      <span className="text-white/50 max-md:hidden">•</span>

                      {/* Date */}
                      <span className="text-white/80 max-md:hidden">{blogPost.date}</span>
                    </div>
                    <a
                      href={blogPost.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-white hover:text-white/80 transition-colors bg-white/15 hover:bg-white/25 px-2.5 py-1 rounded-lg backdrop-blur-sm font-medium"
                    >
                      Read more <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
