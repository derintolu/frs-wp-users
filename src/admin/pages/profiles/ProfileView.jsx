import { useState, useEffect } from "react";
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

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${profile.first_name} ${profile.last_name}?`)) {
      return;
    }

    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}`, {
        method: 'DELETE',
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete profile');
      }

      toast.success('Profile deleted successfully');
      navigate('/profiles');
    } catch (err) {
      toast.error(err.message);
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
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    } else if (value && type === 'email') {
      displayValue = (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    } else if (value && type === 'phone') {
      displayValue = (
        <a href={`tel:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    } else if (value && type === 'code') {
      displayValue = (
        <code className="text-xs bg-muted px-2 py-1 rounded">{value}</code>
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
          <Button variant="outline" onClick={() => navigate('/profiles')}>
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
            variant="outline"
            onClick={() => {
              // Open public profile in new tab
              const slug = profile.profile_slug || `${profile.first_name}-${profile.last_name}`.toLowerCase().replace(/\s+/g, '-');
              const publicUrl = `${window.location.origin}/profile/${slug}`;
              window.open(publicUrl, '_blank');
            }}
          >
            View Public Profile
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const fluentUrl = `/wp-admin/admin.php?page=fluentcrm-admin#/subscribers/${profile.email}`;
              window.open(fluentUrl, '_blank');
            }}
          >
            View FluentCRM Profile
          </Button>
          {!profile.user_id && (
            <Button variant="outline" onClick={async () => {
              try {
                const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}/create-user`, {
                  method: 'POST',
                  headers: {
                    'X-WP-Nonce': wordpressPluginBoilerplate.nonce,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ send_email: true })
                });
                const data = await response.json();
                if (response.ok) {
                  toast.success('User account created successfully');
                  fetchProfile();
                } else {
                  toast.error(data.message || 'Failed to create user account');
                }
              } catch (err) {
                toast.error(err.message);
              }
            }}>
              Create User Account
            </Button>
          )}
          <Button variant="destructive" size="icon" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32">
                {profile.headshot_url ? (
                  <AvatarImage
                    src={profile.headshot_url}
                    alt={`${profile.first_name} ${profile.last_name}`}
                    className="object-cover"
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
                    <a href={`mailto:${profile.email}`} className="text-sm text-blue-600 hover:underline">
                      {profile.email}
                    </a>
                  </div>
                )}
                {profile.phone_number && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground">Phone:</span>
                    <a href={`tel:${profile.phone_number}`} className="text-sm text-blue-600 hover:underline">
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

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="professional">Professional</TabsTrigger>
          <TabsTrigger value="contact">Contact & Location</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="tools">Tools & Platforms</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
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

        <TabsContent value="professional" className="space-y-6">
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
                    <div className="font-medium text-muted-foreground mb-2 text-sm">
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
                    <div className="font-medium text-muted-foreground mb-2 text-sm">
                      Awards & Recognition
                    </div>
                    <div className="space-y-2">
                      {profile.awards.map((award, index) => (
                        <div key={index} className="flex items-center space-x-2">
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

        <TabsContent value="contact" className="space-y-6">
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

        <TabsContent value="social" className="space-y-6">
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

        <TabsContent value="tools" className="space-y-6">
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
                  <div className="font-medium text-muted-foreground mb-2 text-sm">
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
                  <div className="font-medium text-muted-foreground mb-2 text-sm">
                    Personal Branding Images
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {profile.personal_branding_images.map((image, index) => (
                      <img
                        key={index}
                        src={image.url || image}
                        alt={`Branding ${index + 1}`}
                        className="rounded-lg border max-w-sm"
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

        <TabsContent value="system" className="space-y-6">
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
