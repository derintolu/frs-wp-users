import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Phone,
  ExternalLink
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';

interface ProfileData {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  office?: string;
  job_title?: string;
  select_person_type?: string;
  status?: string;
  headshot_url?: string;
  frs_agent_id?: string;
  biography?: string;
  date_of_birth?: string;
  nmls?: string;
  nmls_number?: string;
  license_number?: string;
  dre_license?: string;
  specialties_lo?: string[];
  specialties?: string[];
  languages?: string[];
  nar_designations?: string[];
  namb_certifications?: string[];
  awards?: string;
  brand?: string;
  city_state?: string;
  region?: string;
  service_areas?: string[];
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  arrive?: string;
  canva_folder_link?: string;
  niche_bio_content?: string;
  loan_officer_profile?: number;
  loan_officer_user?: number;
}

interface ProfileViewProps {
  userId: string;
}

export function ProfileView({ userId }: ProfileViewProps) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`/wp-json/frs-users/v1/profiles/user/${userId}`, {
          credentials: 'include',
          headers: {
            'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || ''
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load profile');
        }

        const result = await response.json();
        setProfile(result.data || result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || 'Profile not found'}</p>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const personType = profile.select_person_type?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-6 p-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-6 items-start">
            {profile.headshot_url && (
              <div className="flex-shrink-0">
                <img
                  src={profile.headshot_url}
                  alt={fullName}
                  className="w-48 h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
              {profile.job_title && (
                <p className="text-lg text-gray-600 mb-3">{profile.job_title}</p>
              )}

              <div className="space-y-2 mb-4">
                {profile.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${profile.email}`} className="hover:underline">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${profile.phone_number}`} className="hover:underline">
                      {profile.phone_number}
                    </a>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {personType && (
                  <Badge className="bg-blue-600 text-white">{personType}</Badge>
                )}
                {profile.status && (
                  <Badge className={profile.status === 'active' ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}>
                    {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="contact" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="tools">Tools & Platforms</TabsTrigger>
        </TabsList>

        {/* Contact Info Tab */}
        <TabsContent value="contact">
          <Card>
            <CardContent className="p-6">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  <tr className="py-3">
                    <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">First Name</th>
                    <td className="text-gray-900 py-3">{profile.first_name}</td>
                  </tr>
                  <tr className="py-3">
                    <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Last Name</th>
                    <td className="text-gray-900 py-3">{profile.last_name}</td>
                  </tr>
                  <tr className="py-3">
                    <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Email</th>
                    <td className="text-gray-900 py-3">
                      <a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
                        {profile.email}
                      </a>
                    </td>
                  </tr>
                  {profile.phone_number && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Phone Number</th>
                      <td className="text-gray-900 py-3">
                        <a href={`tel:${profile.phone_number}`} className="text-blue-600 hover:underline">
                          {profile.phone_number}
                        </a>
                      </td>
                    </tr>
                  )}
                  {profile.mobile_number && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Mobile Number</th>
                      <td className="text-gray-900 py-3">
                        <a href={`tel:${profile.mobile_number}`} className="text-blue-600 hover:underline">
                          {profile.mobile_number}
                        </a>
                      </td>
                    </tr>
                  )}
                  {profile.office && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Office</th>
                      <td className="text-gray-900 py-3">{profile.office}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Professional Tab */}
        <TabsContent value="professional">
          <Card>
            <CardContent className="p-6">
              <table className="w-full">
                <tbody className="divide-y divide-gray-200">
                  {profile.frs_agent_id && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">FRS Agent ID</th>
                      <td className="text-gray-900 py-3">{profile.frs_agent_id}</td>
                    </tr>
                  )}
                  {personType && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Person Type</th>
                      <td className="text-gray-900 py-3">{personType}</td>
                    </tr>
                  )}
                  {profile.job_title && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Job Title</th>
                      <td className="text-gray-900 py-3">{profile.job_title}</td>
                    </tr>
                  )}
                  {profile.biography && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3 align-top">Biography</th>
                      <td className="text-gray-900 py-3" dangerouslySetInnerHTML={{ __html: profile.biography }} />
                    </tr>
                  )}
                  {profile.date_of_birth && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Date of Birth</th>
                      <td className="text-gray-900 py-3">{profile.date_of_birth}</td>
                    </tr>
                  )}
                  {profile.nmls && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">NMLS</th>
                      <td className="text-gray-900 py-3">{profile.nmls}</td>
                    </tr>
                  )}
                  {profile.nmls_number && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">NMLS Number</th>
                      <td className="text-gray-900 py-3">{profile.nmls_number}</td>
                    </tr>
                  )}
                  {profile.license_number && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">License Number</th>
                      <td className="text-gray-900 py-3">{profile.license_number}</td>
                    </tr>
                  )}
                  {profile.dre_license && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">DRE License</th>
                      <td className="text-gray-900 py-3">{profile.dre_license}</td>
                    </tr>
                  )}
                  {profile.specialties_lo && profile.specialties_lo.length > 0 && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Loan Officer Specialties</th>
                      <td className="text-gray-900 py-3">{profile.specialties_lo.join(', ')}</td>
                    </tr>
                  )}
                  {profile.specialties && profile.specialties.length > 0 && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Real Estate Specialties</th>
                      <td className="text-gray-900 py-3">{profile.specialties.join(', ')}</td>
                    </tr>
                  )}
                  {profile.languages && profile.languages.length > 0 && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Languages</th>
                      <td className="text-gray-900 py-3">{profile.languages.join(', ')}</td>
                    </tr>
                  )}
                  {profile.nar_designations && profile.nar_designations.length > 0 && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">NAR Designations</th>
                      <td className="text-gray-900 py-3">{profile.nar_designations.join(', ')}</td>
                    </tr>
                  )}
                  {profile.namb_certifications && profile.namb_certifications.length > 0 && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">NAMB Certifications</th>
                      <td className="text-gray-900 py-3">{profile.namb_certifications.join(', ')}</td>
                    </tr>
                  )}
                  {profile.awards && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Awards</th>
                      <td className="text-gray-900 py-3">{profile.awards}</td>
                    </tr>
                  )}
                  {profile.brand && (
                    <tr className="py-3">
                      <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Brand</th>
                      <td className="text-gray-900 py-3">{profile.brand}</td>
                    </tr>
                  )}
                  <tr className="py-3">
                    <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Status</th>
                    <td className="text-gray-900 py-3">
                      <span className={profile.status === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                        {profile.status?.charAt(0).toUpperCase() + (profile.status?.slice(1) || '')}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Location Tab */}
        <TabsContent value="location">
          <Card>
            <CardContent className="p-6">
              {!profile.city_state && !profile.region && (!profile.service_areas || profile.service_areas.length === 0) ? (
                <p className="text-gray-500 italic">No location information available.</p>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {profile.city_state && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">City, State</th>
                        <td className="text-gray-900 py-3">{profile.city_state}</td>
                      </tr>
                    )}
                    {profile.region && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Region</th>
                        <td className="text-gray-900 py-3">{profile.region}</td>
                      </tr>
                    )}
                    {profile.service_areas && profile.service_areas.length > 0 && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Service Areas</th>
                        <td className="text-gray-900 py-3">
                          <div className="flex flex-wrap gap-2">
                            {profile.service_areas.map((area, index) => (
                              <Badge key={index} variant="outline">{area}</Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <Card>
            <CardContent className="p-6">
              {!profile.facebook_url && !profile.instagram_url && !profile.linkedin_url &&
               !profile.twitter_url && !profile.youtube_url && !profile.tiktok_url ? (
                <p className="text-gray-500 italic">No social media links available.</p>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {profile.facebook_url && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Facebook</th>
                        <td className="text-gray-900 py-3">
                          <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {profile.facebook_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.instagram_url && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Instagram</th>
                        <td className="text-gray-900 py-3">
                          <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {profile.instagram_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.linkedin_url && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">LinkedIn</th>
                        <td className="text-gray-900 py-3">
                          <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {profile.linkedin_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.twitter_url && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Twitter</th>
                        <td className="text-gray-900 py-3">
                          <a href={profile.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {profile.twitter_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.youtube_url && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">YouTube</th>
                        <td className="text-gray-900 py-3">
                          <a href={profile.youtube_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {profile.youtube_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.tiktok_url && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">TikTok</th>
                        <td className="text-gray-900 py-3">
                          <a href={profile.tiktok_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {profile.tiktok_url}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools & Platforms Tab */}
        <TabsContent value="tools">
          <Card>
            <CardContent className="p-6">
              {!profile.arrive && !profile.canva_folder_link && !profile.niche_bio_content &&
               !profile.loan_officer_profile && !profile.loan_officer_user ? (
                <p className="text-gray-500 italic">No tools/platforms information available.</p>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {profile.arrive && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">ARRIVE URL</th>
                        <td className="text-gray-900 py-3">
                          <a href={profile.arrive} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {profile.arrive}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.canva_folder_link && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Canva Folder Link</th>
                        <td className="text-gray-900 py-3">
                          <a href={profile.canva_folder_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1">
                            {profile.canva_folder_link}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.niche_bio_content && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3 align-top">Niche Bio Content</th>
                        <td className="text-gray-900 py-3">{profile.niche_bio_content}</td>
                      </tr>
                    )}
                    {profile.loan_officer_profile && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Loan Officer Profile ID</th>
                        <td className="text-gray-900 py-3">{profile.loan_officer_profile}</td>
                      </tr>
                    )}
                    {profile.loan_officer_user && (
                      <tr className="py-3">
                        <th className="text-left font-semibold text-gray-700 py-3 pr-4 w-1/3">Loan Officer User ID</th>
                        <td className="text-gray-900 py-3">{profile.loan_officer_user}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
