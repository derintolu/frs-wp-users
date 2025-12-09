import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}`, {
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data.data || {});
    } catch (error_) {
      setError(error_.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${profile.first_name} ${profile.last_name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}`, {
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        },
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      toast.success('Profile deleted successfully');
      navigate('/profiles');
    } catch (error_) {
      toast.error(error_.message);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const renderField = (label, value, type = 'text') => {
    let displayValue = value || '—';

    if (value && type === 'url') {
      displayValue = (
        <a
          className="text-blue-600 hover:underline"
          href={value}
          rel="noopener noreferrer"
          target="_blank">
          {value}
        </a>
      );
    } else if (value && type === 'email') {
      displayValue = (
        <a className="text-blue-600 hover:underline" href={`mailto:${value}`}>
          {value}
        </a>
      );
    } else if (value && type === 'phone') {
      displayValue = (
        <a className="text-blue-600 hover:underline" href={`tel:${value}`}>
          {value}
        </a>
      );
    } else if (value && type === 'code') {
      displayValue = (
        <code className="rounded bg-muted px-2 py-1 text-xs">{value}</code>
      );
    } else if (type === 'array') {
      displayValue = Array.isArray(value) && value.length > 0 ? value.join(', ') : '—';
    } else if (value && type === 'date') {
      displayValue = new Date(value).toLocaleDateString();
    }

    return (
      <div className="grid grid-cols-3 gap-4 py-3">
        <div className="font-medium text-muted-foreground">{label}</div>
        <div className="col-span-2">{displayValue}</div>
      </div>
    );
  };

  if (!profile) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={() => navigate('/profiles')} variant="outline">
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {profile.first_name} {profile.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">{profile.job_title}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link to={`/profiles/${id}/edit`}>
            <Button>Edit Profile</Button>
          </Link>
          <Button
            onClick={() => {
              // Open public profile in new tab
              const slug = profile.profile_slug || `${profile.first_name}-${profile.last_name}`.toLowerCase().replaceAll(/\s+/g, '-');
              const publicUrl = `${window.location.origin}/profile/${slug}`;
              window.open(publicUrl, '_blank');
            }}
            variant="outline"
          >
            View Public Profile
          </Button>
          <Button
            onClick={() => {
              const fluentUrl = `/wp-admin/admin.php?page=fluentcrm-admin#/subscribers/${profile.email}`;
              window.open(fluentUrl, '_blank');
            }}
            variant="outline"
          >
            View FluentCRM Profile
          </Button>
          {!profile.user_id && (
            <Button onClick={async () => {
              try {
                const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}/create-user`, {
                  body: JSON.stringify({ send_email: true }),
                  headers: {
                    'Content-Type': 'application/json',
                    'X-WP-Nonce': wordpressPluginBoilerplate.nonce
                  },
                  method: 'POST'
                });
                const data = await response.json();
                if (response.ok) {
                  toast.success('User account created successfully');
                  fetchProfile();
                } else {
                  toast.error(data.message || 'Failed to create user account');
                }
              } catch (error_) {
                toast.error(error_.message);
              }
            }} variant="outline">
              Create User Account
            </Button>
          )}
          <Button onClick={handleDelete} size="icon" variant="destructive">
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <div className="shrink-0">
              <Avatar className="size-32">
                {profile.headshot_url ? (
                  <AvatarImage
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="object-cover"
                    src={profile.headshot_url}
                  />
                ) : (
                  <AvatarFallback className="text-3xl">
                    {getInitials(profile.first_name, profile.last_name)}
                  </AvatarFallback>
                )}
              </Avatar>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h3>
                {profile.job_title && (
                  <p className="text-sm text-muted-foreground">
                    {profile.job_title}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                {profile.email && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Email:</span>
                    <a className="text-sm text-blue-600 hover:underline" href={`mailto:${profile.email}`}>
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                    <a className="text-sm text-blue-600 hover:underline" href={`tel:${profile.phone_number}`}>
                      {profile.phone_number}
                    </a>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.select_person_type && (
                  <Badge variant="default">
                    {profile.select_person_type.replace('_', ' ')}
                  </Badge>
                )}
                {profile.user_id ? (
                  <Badge variant="success">Profile+</Badge>
                ) : (
                  <Badge variant="warning">Profile Only</Badge>
                )}
                {profile.status && (
                  <Badge variant={profile.status === 'active' ? 'success' : 'secondary'}>
                    {profile.status}
                  </Badge>
                )}
                {profile.roles && Array.isArray(profile.roles) && profile.roles.length > 0 && (
                  profile.roles.map((role, index) => (
                    <Badge key={index} variant="outline">
                      {role.replace('_', ' ')}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs className="space-y-4" defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="contact">Contact & Location</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="tools">Tools & Platforms</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="overview">
          {/* License & Professional Numbers */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">License & Professional Numbers</CardTitle>
              <CardDescription className="text-sm">
                Professional license and identification numbers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {renderField('NMLS', profile.nmls, 'code')}
              {renderField('NMLS Number', profile.nmls_number, 'code')}
              {renderField('License Number', profile.license_number, 'code')}
              {renderField('DRE License', profile.dre_license, 'code')}
              {renderField('FRS Agent ID', profile.frs_agent_id, 'code')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="professional">
          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Professional Information</CardTitle>
              <CardDescription className="text-sm">
                Professional details, certifications, and specialties
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {renderField('Job Title', profile.job_title)}
              {profile.biography ? (
                <>
                  <div className="py-3">
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                      Biography
                    </div>
                    <div
                      className="prose prose-sm"
                      dangerouslySetInnerHTML={{ __html: profile.biography }}
                    />
                  </div>
                  <Separator />
                </>
              ) : (
                renderField('Biography', null)
              )}
              {renderField('Date of Birth', profile.date_of_birth, 'date')}
              {renderField('Person Type', profile.select_person_type)}
              {renderField('Brand', profile.brand)}
              {renderField('Status', profile.status)}
              {renderField('Headshot ID', profile.headshot_id, 'code')}
              {renderField(
                'Loan Officer Specialties',
                profile.specialties_lo,
                'array'
              )}
              {renderField('Specialties', profile.specialties, 'array')}
              {renderField('Languages', profile.languages, 'array')}
              {renderField('NAR Designations', profile.nar_designations, 'array')}
              {renderField(
                'NAMB Certifications',
                profile.namb_certifications,
                'array'
              )}
              {profile.awards && Array.isArray(profile.awards) && profile.awards.length > 0 ? (
                <>
                  <Separator />
                  <div className="py-3">
                    <div className="mb-2 text-sm font-medium text-muted-foreground">
                      Awards & Recognition
                    </div>
                    <div className="space-y-2">
                      {profile.awards.map((award, index) => (
                        <div className="flex items-center space-x-2" key={index}>
                          <Badge variant="outline">
                            {award.year} - {award.award}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                renderField('Awards & Recognition', null, 'array')
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="contact">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
              <CardDescription className="text-sm">
                Primary contact details and office information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {renderField('Email', profile.email, 'email')}
              {renderField('Phone Number', profile.phone_number, 'phone')}
              {renderField('Mobile Number', profile.mobile_number, 'phone')}
              {renderField('Office', profile.office)}
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
              <CardDescription className="text-sm">
                Geographic location details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {renderField('City, State', profile.city_state)}
              {renderField('Region', profile.region)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="social">
          {/* Social Media */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Media</CardTitle>
              <CardDescription className="text-sm">Social media profiles and links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {renderField('Facebook', profile.facebook_url, 'url')}
              {renderField('Instagram', profile.instagram_url, 'url')}
              {renderField('LinkedIn', profile.linkedin_url, 'url')}
              {renderField('Twitter', profile.twitter_url, 'url')}
              {renderField('YouTube', profile.youtube_url, 'url')}
              {renderField('TikTok', profile.tiktok_url, 'url')}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="tools">
          {/* Tools & Platforms */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tools & Platforms</CardTitle>
              <CardDescription className="text-sm">
                Marketing tools and platform integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {renderField('ARRIVE Platform', profile.arrive, 'url')}
              {renderField('Canva Folder', profile.canva_folder_link, 'url')}
              {profile.niche_bio_content ? (
                <div className="py-3">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Niche Bio Content
                  </div>
                  <div
                    className="prose prose-sm"
                    dangerouslySetInnerHTML={{ __html: profile.niche_bio_content }}
                  />
                </div>
              ) : (
                renderField('Niche Bio Content', null)
              )}
              {profile.personal_branding_images &&
              Array.isArray(profile.personal_branding_images) &&
              profile.personal_branding_images.length > 0 ? (
                <div className="py-3">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Personal Branding Images
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {profile.personal_branding_images.map((image, index) => (
                      <img
                        alt={`Branding ${index + 1}`}
                        className="max-w-sm rounded-lg border"
                        key={index}
                        src={image.url || image}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                renderField('Personal Branding Images', null, 'array')
              )}
            </CardContent>
          </Card>

          {/* Additional Fields */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Information</CardTitle>
              <CardDescription className="text-sm">Linked profiles and relationships</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {renderField('Loan Officer Profile ID', profile.loan_officer_profile)}
              {renderField('Loan Officer User ID', profile.loan_officer_user)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="system">
          {/* System Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Information</CardTitle>
              <CardDescription className="text-sm">System metadata and timestamps</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1">
              {renderField('Profile ID', profile.id, 'code')}
              {renderField('User ID', profile.user_id, 'code')}
              {profile.roles && Array.isArray(profile.roles) && profile.roles.length > 0 ? (
                <div className="grid grid-cols-3 gap-4 py-3">
                  <div className="font-medium text-muted-foreground">WordPress Roles</div>
                  <div className="col-span-2">
                    <div className="flex flex-wrap gap-2">
                      {profile.roles.map((role, index) => (
                        <Badge key={index} variant="outline">
                          {role.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                renderField('WordPress Roles', null, 'array')
              )}
              {renderField('Is Active', profile.is_active ? 'Yes' : 'No')}
              {renderField('Created At', profile.created_at, 'date')}
              {renderField('Updated At', profile.updated_at, 'date')}
              {renderField(
                'Synced to FluentCRM',
                profile.synced_to_fluentcrm_at,
                'date'
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
