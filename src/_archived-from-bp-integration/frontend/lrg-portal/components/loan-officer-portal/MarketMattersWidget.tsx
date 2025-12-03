import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, ExternalLink, TrendingUpIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface MortgageRateData {
  frm_30: string;
  frm_15: string;
  week: string;
}

interface MortgageRate {
  week: string;
  data: MortgageRateData;
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

export function MarketMattersWidget() {
  const [rates, setRates] = useState<MortgageRate | null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch mortgage rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.api-ninjas.com/v1/mortgagerate', {
          method: 'GET',
          headers: {
            'X-Api-Key': 'TYgp30Q8LTuwp3KTbCku1Q==MFnAgH2amAue4QiZ',
          },
        });

        if (response.ok) {
          const data: MortgageRate[] = await response.json();
          if (data && data.length > 0) {
            setRates(data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch mortgage rates:', err);
        // Fallback rates
        setRates({
          week: 'current',
          data: {
            frm_30: '6.85',
            frm_15: '6.10',
            week: new Date().toISOString().split('T')[0],
          }
        });
      }
    };

    fetchRates();
  }, []);

  // Fetch blog posts
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('/wp-json/wp/v2/posts?per_page=2&_embed');
        if (response.ok) {
          const posts = await response.json();
          const formattedPosts = posts.map((post: any) => ({
            id: post.id,
            title: post.title.rendered,
            excerpt: post.excerpt.rendered.replace(/<[^>]*>/g, '').substring(0, 80),
            link: post.link,
            date: new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }),
            featured_image: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
            author_name: post._embedded?.author?.[0]?.name || 'Author',
            author_avatar: post._embedded?.author?.[0]?.avatar_urls?.['96'] || '',
            category_name: post._embedded?.['wp:term']?.[0]?.[0]?.name || 'Blog',
          }));
          setBlogPosts(formattedPosts);
        }
      } catch (err) {
        console.error('Failed to fetch blog posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPosts();
  }, []);

  if (loading) {
    return (
      <>
        <CardHeader className="pt-2 px-3 pb-0 border-b border-white/20">
          <CardTitle className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-white" />
            <span className="text-white">
            Market Matters
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-2">
          <div className="space-y-3 animate-pulse">
            <div className="h-24 bg-white/10 rounded"></div>
            <div className="h-24 bg-white/10 rounded"></div>
          </div>
        </CardContent>
      </>
    );
  }

  return (
    <>
      <CardHeader className="pt-2 px-3 pb-0 border-b border-white/20">
        <CardTitle className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4 text-white" />
          <span className="text-white">
          Market Matters
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 pt-2">
        <div className="space-y-3">
          {/* 30-Year Rate Tile */}
          <div className="relative overflow-hidden p-4 bg-white/10 border border-white/20 rounded-lg">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">30-Year Fixed</span>
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <div className="text-3xl font-bold text-white">
                {rates?.data?.frm_30 ? parseFloat(rates.data.frm_30).toFixed(2) : '—'}%
              </div>
              <div className="text-xs text-white/70 mt-1">
                {rates?.data?.week ? new Date(rates.data.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
              </div>
            </div>
          </div>

          {/* 15-Year Rate Tile */}
          <div className="relative overflow-hidden p-4 bg-white/10 border border-white/20 rounded-lg">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">15-Year Fixed</span>
                <TrendingDown className="h-4 w-4 text-white" />
              </div>
              <div className="text-3xl font-bold text-white">
                {rates?.data?.frm_15 ? parseFloat(rates.data.frm_15).toFixed(2) : '—'}%
              </div>
              <div className="text-xs text-white/70 mt-1">
                {rates?.data?.week ? new Date(rates.data.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
              </div>
            </div>
          </div>

        </div>
      </CardContent>
    </>
  );
}
