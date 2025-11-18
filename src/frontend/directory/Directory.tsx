import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Linkedin, Facebook, Smartphone, Globe, Search } from 'lucide-react';

interface ProfileCardData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  job_title?: string;
  headshot_url?: string;
  city_state?: string;
  nmls_number?: string;
  nmls?: string;
  profile_slug?: string;
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
}

export default function Directory() {
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [displayCount, setDisplayCount] = useState(12); // Show 12 initially (3 rows of 4)

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await fetch('/wp-json/frs-users/v1/profiles', {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
          }
        });

        if (response.ok) {
          const result = await response.json();
          const profilesData = result.data || result;
          setProfiles(Array.isArray(profilesData) ? profilesData : []);
        } else {
          setError('Failed to load profiles');
        }
      } catch (err) {
        console.error('Error fetching profiles:', err);
        setError('Failed to load profiles');
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Filter profiles based on search query
  const filteredProfiles = useMemo(() => {
    if (!searchQuery.trim()) return profiles;

    const query = searchQuery.toLowerCase();
    return profiles.filter((profile) => {
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.toLowerCase();
      const jobTitle = (profile.job_title || '').toLowerCase();
      const location = (profile.city_state || '').toLowerCase();

      return fullName.includes(query) || jobTitle.includes(query) || location.includes(query);
    });
  }, [profiles, searchQuery]);

  // Profiles to display (with load more)
  const displayedProfiles = filteredProfiles.slice(0, displayCount);
  const hasMore = displayCount < filteredProfiles.length;

  const handleLoadMore = () => {
    setDisplayCount((prev) => prev + 12); // Load 12 more (3 rows)
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Team Directory</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white shadow-lg rounded border border-gray-200 p-6 animate-pulse">
                <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-300 rounded flex-1"></div>
                  <div className="h-10 bg-gray-300 rounded flex-1"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Team Directory</h1>

        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, job title, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 py-6 text-base"
          />
        </div>

        {/* Results Count */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {displayedProfiles.length} of {filteredProfiles.length} {filteredProfiles.length === 1 ? 'profile' : 'profiles'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedProfiles.map((profile) => {
            const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
            const initials = `${profile.first_name?.[0] || '?'}${profile.last_name?.[0] || ''}`;

            return (
              <div key={profile.id} className="bg-white shadow-lg rounded border border-gray-200 overflow-hidden">
                {/* Gradient Header */}
                <div className="h-24 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

                {/* Card Content */}
                <div className="px-6 pb-6 -mt-16 relative">
                  {/* Avatar */}
                  <div className="mb-4 flex justify-center">
                    <div
                      className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg"
                      style={{
                        backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      }}
                    >
                      {profile.headshot_url ? (
                        <img src={profile.headshot_url} alt={fullName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                          <span className="text-2xl text-gray-600 font-semibold">
                            {initials}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-xl font-bold text-center text-[#1A1A1A] mb-1">
                    {fullName || 'No Name'}
                  </h3>

                  {/* Job Title & NMLS */}
                  {profile.job_title && (
                    <p className="text-sm text-[#1D4FC4] text-center mb-1">
                      {profile.job_title}
                      {(profile.nmls || profile.nmls_number) && (
                        <span> | NMLS {profile.nmls || profile.nmls_number}</span>
                      )}
                    </p>
                  )}

                  {/* Location */}
                  {profile.city_state && (
                    <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-1 mb-3">
                      <MapPin className="h-4 w-4" />
                      {profile.city_state}
                    </p>
                  )}

                  {/* Social Media Icons */}
                  {(profile.linkedin_url || profile.facebook_url || profile.instagram_url || profile.twitter_url || profile.youtube_url) && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      {profile.linkedin_url && (
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-5 w-5 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                        </a>
                      )}
                      {profile.facebook_url && (
                        <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-5 w-5 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                        </a>
                      )}
                      {profile.instagram_url && (
                        <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer">
                          <Smartphone className="h-5 w-5 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                        </a>
                      )}
                      {profile.twitter_url && (
                        <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-5 w-5 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                        </a>
                      )}
                      {profile.youtube_url && (
                        <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-5 w-5 text-[#1A1A1A] hover:text-[#2563eb] transition-colors" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1"
                    >
                      <a href={`/profile/${profile.profile_slug || profile.id}`}>
                        View
                      </a>
                    </Button>
                    <Button
                      className="flex-1 text-white font-semibold shadow-lg"
                      style={{
                        background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                      }}
                    >
                      Schedule Meeting
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More Button */}
        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Button
              onClick={handleLoadMore}
              variant="outline"
              size="lg"
              className="px-8"
            >
              Load More
            </Button>
          </div>
        )}

        {/* No Results Message */}
        {filteredProfiles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No profiles found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
