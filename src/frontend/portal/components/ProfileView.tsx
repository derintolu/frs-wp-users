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
  arrive?: string;
  awards?: string;
  biography?: string;
  brand?: string;
  canva_folder_link?: string;
  city_state?: string;
  date_of_birth?: string;
  dre_license?: string;
  email: string;
  facebook_url?: string;
  first_name: string;
  frs_agent_id?: string;
  headshot_url?: string;
  id: number;
  instagram_url?: string;
  job_title?: string;
  languages?: string[];
  last_name: string;
  license_number?: string;
  linkedin_url?: string;
  loan_officer_profile?: number;
  loan_officer_user?: number;
  mobile_number?: string;
  namb_certifications?: string[];
  nar_designations?: string[];
  niche_bio_content?: string;
  nmls?: string;
  nmls_number?: string;
  office?: string;
  phone_number?: string;
  region?: string;
  select_person_type?: string;
  service_areas?: string[];
  specialties?: string[];
  specialties_lo?: string[];
  status?: string;
  tiktok_url?: string;
  twitter_url?: string;
  youtube_url?: string;
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
      } catch (error_) {
        setError(error_ instanceof Error ? error_.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="py-8 text-center">
        <p className="mb-4 text-red-600">{error || 'Profile not found'}</p>
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`;
  const personType = profile.select_person_type?.replace(/_/g, ' ').replaceAll(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="space-y-6 p-6">
      {/* Profile Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {profile.headshot_url && (
              <div className="shrink-0">
                <img
                  alt={fullName}
                  className="size-48 rounded-lg object-cover shadow-md"
                  src={profile.headshot_url}
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{fullName}</h1>
              {profile.job_title && (
                <p className="mb-3 text-lg text-gray-600">{profile.job_title}</p>
              )}

              <div className="mb-4 space-y-2">
                {profile.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="size-4" />
                    <a className="hover:underline" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="size-4" />
                    <a className="hover:underline" href={`tel:${profile.phone_number}`}>
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
      <Tabs className="w-full" defaultValue="contact">
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
                    <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">First Name</th>
                    <td className="py-3 text-gray-900">{profile.first_name}</td>
                  </tr>
                  <tr className="py-3">
                    <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Last Name</th>
                    <td className="py-3 text-gray-900">{profile.last_name}</td>
                  </tr>
                  <tr className="py-3">
                    <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Email</th>
                    <td className="py-3 text-gray-900">
                      <a className="text-blue-600 hover:underline" href={`mailto:${profile.email}`}>
                        {profile.email}
                      </a>
                    </td>
                  </tr>
                  {profile.phone_number && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Phone Number</th>
                      <td className="py-3 text-gray-900">
                        <a className="text-blue-600 hover:underline" href={`tel:${profile.phone_number}`}>
                          {profile.phone_number}
                        </a>
                      </td>
                    </tr>
                  )}
                  {profile.mobile_number && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Mobile Number</th>
                      <td className="py-3 text-gray-900">
                        <a className="text-blue-600 hover:underline" href={`tel:${profile.mobile_number}`}>
                          {profile.mobile_number}
                        </a>
                      </td>
                    </tr>
                  )}
                  {profile.office && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Office</th>
                      <td className="py-3 text-gray-900">{profile.office}</td>
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
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">FRS Agent ID</th>
                      <td className="py-3 text-gray-900">{profile.frs_agent_id}</td>
                    </tr>
                  )}
                  {personType && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Person Type</th>
                      <td className="py-3 text-gray-900">{personType}</td>
                    </tr>
                  )}
                  {profile.job_title && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Job Title</th>
                      <td className="py-3 text-gray-900">{profile.job_title}</td>
                    </tr>
                  )}
                  {profile.biography && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left align-top font-semibold text-gray-700">Biography</th>
                      <td className="py-3 text-gray-900" dangerouslySetInnerHTML={{ __html: profile.biography }} />
                    </tr>
                  )}
                  {profile.date_of_birth && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Date of Birth</th>
                      <td className="py-3 text-gray-900">{profile.date_of_birth}</td>
                    </tr>
                  )}
                  {profile.nmls && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">NMLS</th>
                      <td className="py-3 text-gray-900">{profile.nmls}</td>
                    </tr>
                  )}
                  {profile.nmls_number && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">NMLS Number</th>
                      <td className="py-3 text-gray-900">{profile.nmls_number}</td>
                    </tr>
                  )}
                  {profile.license_number && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">License Number</th>
                      <td className="py-3 text-gray-900">{profile.license_number}</td>
                    </tr>
                  )}
                  {profile.dre_license && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">DRE License</th>
                      <td className="py-3 text-gray-900">{profile.dre_license}</td>
                    </tr>
                  )}
                  {profile.specialties_lo && profile.specialties_lo.length > 0 && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Loan Officer Specialties</th>
                      <td className="py-3 text-gray-900">{profile.specialties_lo.join(', ')}</td>
                    </tr>
                  )}
                  {profile.specialties && profile.specialties.length > 0 && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Real Estate Specialties</th>
                      <td className="py-3 text-gray-900">{profile.specialties.join(', ')}</td>
                    </tr>
                  )}
                  {profile.languages && profile.languages.length > 0 && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Languages</th>
                      <td className="py-3 text-gray-900">{profile.languages.join(', ')}</td>
                    </tr>
                  )}
                  {profile.nar_designations && profile.nar_designations.length > 0 && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">NAR Designations</th>
                      <td className="py-3 text-gray-900">{profile.nar_designations.join(', ')}</td>
                    </tr>
                  )}
                  {profile.namb_certifications && profile.namb_certifications.length > 0 && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">NAMB Certifications</th>
                      <td className="py-3 text-gray-900">{profile.namb_certifications.join(', ')}</td>
                    </tr>
                  )}
                  {profile.awards && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Awards</th>
                      <td className="py-3 text-gray-900">{profile.awards}</td>
                    </tr>
                  )}
                  {profile.brand && (
                    <tr className="py-3">
                      <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Brand</th>
                      <td className="py-3 text-gray-900">{profile.brand}</td>
                    </tr>
                  )}
                  <tr className="py-3">
                    <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Status</th>
                    <td className="py-3 text-gray-900">
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
                <p className="italic text-gray-500">No location information available.</p>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {profile.city_state && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">City, State</th>
                        <td className="py-3 text-gray-900">{profile.city_state}</td>
                      </tr>
                    )}
                    {profile.region && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Region</th>
                        <td className="py-3 text-gray-900">{profile.region}</td>
                      </tr>
                    )}
                    {profile.service_areas && profile.service_areas.length > 0 && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Service Areas</th>
                        <td className="py-3 text-gray-900">
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
                <p className="italic text-gray-500">No social media links available.</p>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {profile.facebook_url && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Facebook</th>
                        <td className="py-3 text-gray-900">
                          <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={profile.facebook_url} rel="noopener noreferrer" target="_blank">
                            {profile.facebook_url}
                            <ExternalLink className="size-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.instagram_url && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Instagram</th>
                        <td className="py-3 text-gray-900">
                          <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={profile.instagram_url} rel="noopener noreferrer" target="_blank">
                            {profile.instagram_url}
                            <ExternalLink className="size-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.linkedin_url && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">LinkedIn</th>
                        <td className="py-3 text-gray-900">
                          <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={profile.linkedin_url} rel="noopener noreferrer" target="_blank">
                            {profile.linkedin_url}
                            <ExternalLink className="size-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.twitter_url && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Twitter</th>
                        <td className="py-3 text-gray-900">
                          <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={profile.twitter_url} rel="noopener noreferrer" target="_blank">
                            {profile.twitter_url}
                            <ExternalLink className="size-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.youtube_url && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">YouTube</th>
                        <td className="py-3 text-gray-900">
                          <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={profile.youtube_url} rel="noopener noreferrer" target="_blank">
                            {profile.youtube_url}
                            <ExternalLink className="size-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.tiktok_url && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">TikTok</th>
                        <td className="py-3 text-gray-900">
                          <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={profile.tiktok_url} rel="noopener noreferrer" target="_blank">
                            {profile.tiktok_url}
                            <ExternalLink className="size-3" />
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
                <p className="italic text-gray-500">No tools/platforms information available.</p>
              ) : (
                <table className="w-full">
                  <tbody className="divide-y divide-gray-200">
                    {profile.arrive && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">ARRIVE URL</th>
                        <td className="py-3 text-gray-900">
                          <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={profile.arrive} rel="noopener noreferrer" target="_blank">
                            {profile.arrive}
                            <ExternalLink className="size-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.canva_folder_link && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Canva Folder Link</th>
                        <td className="py-3 text-gray-900">
                          <a className="inline-flex items-center gap-1 text-blue-600 hover:underline" href={profile.canva_folder_link} rel="noopener noreferrer" target="_blank">
                            {profile.canva_folder_link}
                            <ExternalLink className="size-3" />
                          </a>
                        </td>
                      </tr>
                    )}
                    {profile.niche_bio_content && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left align-top font-semibold text-gray-700">Niche Bio Content</th>
                        <td className="py-3 text-gray-900">{profile.niche_bio_content}</td>
                      </tr>
                    )}
                    {profile.loan_officer_profile && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Loan Officer Profile ID</th>
                        <td className="py-3 text-gray-900">{profile.loan_officer_profile}</td>
                      </tr>
                    )}
                    {profile.loan_officer_user && (
                      <tr className="py-3">
                        <th className="w-1/3 py-3 pr-4 text-left font-semibold text-gray-700">Loan Officer User ID</th>
                        <td className="py-3 text-gray-900">{profile.loan_officer_user}</td>
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
