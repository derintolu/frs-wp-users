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

export default function ProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/wp-json/frs-users/v1/profiles/${id}`);
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

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const renderField = (label, value, type = 'text') => {
    if (!value) return null;

    let displayValue = value;

    if (type === 'url') {
      displayValue = (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    } else if (type === 'email') {
      displayValue = (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    } else if (type === 'phone') {
      displayValue = (
        <a href={`tel:${value}`} className="text-blue-600 hover:underline">
          {value}
        </a>
      );
    } else if (type === 'code') {
      displayValue = (
        <code className="text-xs bg-muted px-2 py-1 rounded">{value}</code>
      );
    } else if (type === 'array') {
      displayValue = Array.isArray(value) ? value.join(', ') : value;
    } else if (type === 'date') {
      displayValue = new Date(value).toLocaleDateString();
    }

    return (
      <div className="grid grid-cols-3 gap-4 py-3">
        <div className="font-medium text-muted-foreground">{label}</div>
        <div className="col-span-2">{displayValue}</div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-red-500 mb-4">
            {error || 'Profile not found'}
          </p>
          <Button onClick={() => navigate('/profiles')}>
            Back to Profiles
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => navigate('/profiles')}>
            ← Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {profile.first_name} {profile.last_name}
            </h2>
            <p className="text-muted-foreground">{profile.job_title}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Link to={`/profiles/${id}/edit`}>
            <Button>Edit Profile</Button>
          </Link>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {profile.headshot_url ? (
                <img
                  src={profile.headshot_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="rounded-lg max-w-md"
                />
              ) : (
                <Avatar className="h-32 w-32">
                  <AvatarFallback className="text-3xl">
                    {getInitials(profile.first_name, profile.last_name)}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="text-2xl font-bold">
                  {profile.first_name} {profile.last_name}
                </h3>
                {profile.job_title && (
                  <p className="text-lg text-muted-foreground">
                    {profile.job_title}
                  </p>
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
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>
            Primary contact details and office information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {renderField('Email', profile.email, 'email')}
          {renderField('Phone Number', profile.phone_number, 'phone')}
          {renderField('Mobile Number', profile.mobile_number, 'phone')}
          {renderField('Office', profile.office)}
          {renderField('City, State', profile.city_state)}
          {renderField('Region', profile.region)}
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            Licenses, certifications, and professional details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {profile.biography && (
            <>
              <div className="py-3">
                <div className="font-medium text-muted-foreground mb-2">
                  Biography
                </div>
                <div
                  className="prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: profile.biography }}
                />
              </div>
              <Separator />
            </>
          )}
          {renderField('Date of Birth', profile.date_of_birth, 'date')}
          {renderField('Person Type', profile.select_person_type)}
          {renderField('NMLS', profile.nmls, 'code')}
          {renderField('NMLS Number', profile.nmls_number, 'code')}
          {renderField('License Number', profile.license_number, 'code')}
          {renderField('DRE License', profile.dre_license, 'code')}
          {renderField('Brand', profile.brand)}
          {renderField('Status', profile.status)}
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
          {profile.awards && Array.isArray(profile.awards) && profile.awards.length > 0 && (
            <>
              <Separator />
              <div className="py-3">
                <div className="font-medium text-muted-foreground mb-2">
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
          )}
        </CardContent>
      </Card>

      {/* Social Media */}
      {(profile.facebook_url ||
        profile.instagram_url ||
        profile.linkedin_url ||
        profile.twitter_url ||
        profile.youtube_url ||
        profile.tiktok_url) && (
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Social media profiles and links</CardDescription>
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
      )}

      {/* Tools & Platforms */}
      {(profile.arrive ||
        profile.canva_folder_link ||
        profile.niche_bio_content ||
        profile.personal_branding_images) && (
        <Card>
          <CardHeader>
            <CardTitle>Tools & Platforms</CardTitle>
            <CardDescription>
              Marketing tools and platform integrations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {renderField('ARRIVE Platform', profile.arrive, 'url')}
            {renderField('Canva Folder', profile.canva_folder_link, 'url')}
            {profile.niche_bio_content && (
              <div className="py-3">
                <div className="font-medium text-muted-foreground mb-2">
                  Niche Bio Content
                </div>
                <div
                  className="prose prose-sm"
                  dangerouslySetInnerHTML={{ __html: profile.niche_bio_content }}
                />
              </div>
            )}
            {profile.personal_branding_images &&
              Array.isArray(profile.personal_branding_images) &&
              profile.personal_branding_images.length > 0 && (
                <div className="py-3">
                  <div className="font-medium text-muted-foreground mb-2">
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
              )}
          </CardContent>
        </Card>
      )}

      {/* Additional Fields */}
      {(profile.loan_officer_profile || profile.loan_officer_user) && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Linked profiles and relationships</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {renderField('Loan Officer Profile ID', profile.loan_officer_profile)}
            {renderField('Loan Officer User ID', profile.loan_officer_user)}
          </CardContent>
        </Card>
      )}

      {/* System Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
          <CardDescription>System metadata and timestamps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {renderField('Profile ID', profile.id, 'code')}
          {renderField('User ID', profile.user_id, 'code')}
          {renderField('FRS Agent ID', profile.frs_agent_id, 'code')}
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
    </div>
  );
}
