import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
  Bell,
  Globe,
  X
} from 'lucide-react';
import { LoadingSpinner } from '../ui/loading';
import { DataService } from '../../utils/dataService';
import { AppLauncher } from './AppLauncher';

interface WelcomeProps {
  userId: string;
  tourAttributes?: {
    announcements?: string;
    profileSummary?: string;
  };
  onNavigate?: (view: string) => void;
}

export function Welcome({ userId, tourAttributes, onNavigate }: WelcomeProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User profile data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    title: '',
    company: '',
    nmls: '',
    location: '',
    bio: '',
    website: '',
    linkedin: '',
    facebook: '',
    instagram: '',
    profileImage: ''
  });

  // Person CPT data
  const [personCPTData, setPersonCPTData] = useState<any>(null);

  // Welcome tab data
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [customLinks, setCustomLinks] = useState<any[]>([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const user = await DataService.getCurrentUser();

        // Load user profile data
        const nameParts = (user.name || '').split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setProfileData({
          firstName: firstName,
          lastName: lastName,
          email: user.email,
          phone: user.phone || '',
          title: user.title || 'Loan Officer',
          company: user.company || '',
          nmls: user.nmls || user.nmls_id || '',
          location: user.location || '',
          bio: user.bio || '',
          website: user.website || '',
          linkedin: user.linkedin || '',
          facebook: user.facebook || '',
          instagram: user.instagram || '',
          profileImage: user.avatar || ''
        });

        // Load Person CPT if exists
        if (user.person_cpt_id) {
          const personCPT = await DataService.getPersonCPT(user.person_cpt_id);
          setPersonCPTData(personCPT);
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  useEffect(() => {
    const loadWelcomeData = async () => {
      try {
        const [announcementsData, linksData] = await Promise.all([
          DataService.getAnnouncements(),
          DataService.getCustomLinks()
        ]);
        setAnnouncements(announcementsData);
        setCustomLinks(linksData);
      } catch (error) {
        console.error('Failed to load welcome data:', error);
      }
    };

    loadWelcomeData();
  }, []);

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
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--brand-dark-navy)]">Welcome, {profileData.firstName || 'User'}</h1>
          <p className="text-sm text-[var(--brand-slate)] mt-2">
            View your profile overview, announcements, and quick links. Stay updated with important information and access your most-used tools.
          </p>
        </div>
      </div>

      {/* Content Grid - Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Announcements Card - Takes 2 columns */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-l-4 rounded-lg h-full" style={{ borderLeftColor: 'var(--brand-electric-blue)' }} data-tour={tourAttributes?.announcements}>
            <CardHeader className="h-12 flex items-center px-4 rounded-t-lg" style={{ backgroundColor: '#B6C7D9' }}>
              <CardTitle className="flex items-center gap-1 text-gray-700 text-sm">
                <Bell className="h-3 w-3" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      className="p-4 rounded-lg cursor-pointer transition-all hover:shadow-md border-l-4 border-l-[var(--brand-electric-blue)]"
                      style={{ backgroundColor: 'var(--brand-off-white)' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-pale-blue)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--brand-off-white)'}
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
                        setIsAnnouncementModalOpen(true);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h4 className="font-medium text-[var(--brand-dark-navy)] text-sm">
                              {announcement.title}
                            </h4>
                            {announcement.badge && (
                              <Badge
                                className={`text-xs px-2 py-0.5 ${
                                  announcement.badge === 'NEW'
                                    ? 'bg-[var(--brand-electric-blue)] text-white'
                                    : 'bg-[var(--brand-cyan)] text-white'
                                }`}
                              >
                                {announcement.badge}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[var(--brand-slate)] mb-2 line-clamp-2">
                            {announcement.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-[var(--brand-slate)]">
                              {new Date(announcement.date).toLocaleDateString()}
                            </p>
                            <div className="w-2 h-2 rounded-full" style={{
                              backgroundColor: announcement.priority === 'high' ? '#ef4444' : 'var(--brand-electric-blue)'
                            }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {announcements.length > 3 && (
                    <div className="text-center pt-2">
                      <p className="text-xs text-[var(--brand-slate)]">
                        +{announcements.length - 3} more announcements
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--brand-pale-blue)' }} />
                  <p className="text-sm text-[var(--brand-slate)]">
                    No announcements at this time
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* App Launcher - Takes 1 column */}
        <div className="lg:col-span-1">
          <AppLauncher onNavigate={onNavigate} />
        </div>
      </div>

      {/* Custom Links Section */}
      {customLinks.length > 0 && (
        <Card className="brand-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-[var(--brand-electric-blue)]" />
              <h3 className="text-lg font-semibold text-[var(--brand-dark-navy)]">Quick Links</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customLinks.map((link) => (
                <div
                  key={link.id}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow group"
                  onClick={() => window.open(link.url, '_blank')}
                  style={{ borderColor: link.color + '20', backgroundColor: link.color + '05' }}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: link.color + '15' }}
                    >
                      <span style={{ color: link.color }}>🔗</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[var(--brand-dark-navy)] text-sm truncate">
                        {link.title}
                      </h4>
                      <p className="text-xs text-[var(--brand-slate)] mt-1 line-clamp-2">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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
