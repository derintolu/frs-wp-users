import { useState, useEffect, useMemo } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { DirectoryProfileCard } from '@/components/DirectoryProfileCard';
import { DirectorySidebar } from './components/DirectorySidebar';

interface ProfileCardData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  job_title?: string;
  headshot_url?: string;
  city_state?: string;
  zip?: string;
  nmls_number: string; // Required - it's illegal not to have NMLS
  nmls?: string;
  profile_slug?: string;
  select_person_type?: 'loan_officer' | 'agent' | 'staff' | 'leadership' | 'assistant';
  linkedin_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  website?: string;
  arrive?: string;
  directory_button_type?: 'schedule' | 'call' | 'contact';
}

export default function Directory() {
  const [profiles, setProfiles] = useState<ProfileCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const profilesPerPage = 9; // 3 rows of 3
  const gradientUrl = (window as any).frsPortalConfig?.gradientUrl || '';

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        // Fetch all profiles (set per_page to a high number to get all at once)
        const response = await fetch('/wp-json/frs-users/v1/profiles?per_page=1000', {
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

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProfiles.length / profilesPerPage);
  const startIndex = (currentPage - 1) * profilesPerPage;
  const endIndex = startIndex + profilesPerPage;
  const displayedProfiles = filteredProfiles.slice(startIndex, endIndex);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);

      // Adjust if current page is near start or end
      if (currentPage <= 3) {
        endPage = Math.min(4, totalPages - 1);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(totalPages - 3, 2);
      }

      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('ellipsis');
      }

      // Add pages in range
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('ellipsis');
      }

      // Always show last page
      pages.push(totalPages);
    }

    return pages;
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <DirectorySidebar
          searchQuery=""
          onSearchChange={() => {}}
          profileCount={0}
        />

        {/* Main Content */}
        <div style={{ marginLeft: '320px', padding: '15px' }}>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
              <div
                key={i}
                className="relative overflow-hidden w-full animate-pulse bg-gray-100 rounded"
              >
                <div className="h-[115px] bg-gradient-to-r from-blue-400 to-cyan-400 opacity-30"></div>
                <div className="-mt-[74px] mx-auto w-[148px] h-[148px] bg-gray-300 rounded-full"></div>
                <div className="text-center px-4 mt-4 space-y-2">
                  <div className="h-7 bg-gray-300 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                </div>
                <div className="px-8 pb-5 mt-[10px] flex gap-2">
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
      <div className="min-h-screen">
        <DirectorySidebar
          searchQuery=""
          onSearchChange={() => {}}
          profileCount={0}
        />

        {/* Main Content */}
        <div style={{ marginLeft: '320px', padding: '15px' }}>
          <div className="bg-red-50 border border-red-200 rounded p-4 text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <DirectorySidebar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        profileCount={filteredProfiles.length}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {/* Main Content */}
      <div style={{ marginLeft: '320px', padding: '15px' }}>
        <div className="grid grid-cols-3 gap-4">
          {displayedProfiles.map((profile, index) => (
            <div
              key={profile.id}
              className="transition-all duration-500 ease-out"
              style={{
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`,
              }}
            >
              <DirectoryProfileCard {...profile} />
            </div>
          ))}

          {/* No Results Message */}
          {filteredProfiles.length === 0 && (
            <div className="text-center py-12 col-span-3">
              <p className="text-gray-500 text-lg">No profiles found matching "{searchQuery}"</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center col-span-3">
              <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage(currentPage - 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {getPageNumbers().map((page, index) => (
                  <PaginationItem key={index}>
                    {page === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(page as number);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        isActive={currentPage === page}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage(currentPage + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
          )}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
