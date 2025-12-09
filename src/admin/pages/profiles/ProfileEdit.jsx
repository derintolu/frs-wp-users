import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaUploader } from "@/components/ui/media-uploader";
import { toast } from "sonner";

const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

export default function ProfileEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    arrive: "",
    biography: "",
    brand: "",
    canva_folder_link: "",
    city_state: "",
    date_of_birth: "",
    dre_license: "",
    email: "",
    facebook_url: "",
    first_name: "",
    headshot_id: null,
    headshot_url: null,
    instagram_url: "",
    job_title: "",
    last_name: "",
    license_number: "",
    linkedin_url: "",
    mobile_number: "",
    niche_bio_content: "",
    nmls: "",
    nmls_number: "",
    office: "",
    phone_number: "",
    profile_slug: "",
    region: "",
    select_person_type: "",
    status: "active",
    tiktok_url: "",
    twitter_url: "",
    youtube_url: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}`, {
        headers: { 'X-WP-Nonce': wordpressPluginBoilerplate.nonce }
      });
      if (!response.ok) {throw new Error('Failed to fetch profile');}
      const data = await response.json();

      // Remove computed fields that shouldn't be in state
      const {
        created_at,
        full_name,
        headshot_url,
        is_guest,
        roles,
        synced_to_fluentcrm_at,
        updated_at,
        ...editableProfile
      } = data.data;

      setProfile(editableProfile);
    } catch (error) {
      toast.error(error.message);
    }
  }, [id]);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchProfile();
    }
  }, [id, fetchProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Only send database fields, exclude computed fields like headshot_url, roles, etc.
    const saveableFields = [
      'user_id', 'frs_agent_id', 'email', 'first_name', 'last_name',
      'phone_number', 'mobile_number', 'office', 'headshot_id', 'job_title',
      'biography', 'date_of_birth', 'select_person_type', 'nmls', 'nmls_number',
      'license_number', 'dre_license', 'specialties_lo', 'specialties',
      'languages', 'awards', 'nar_designations', 'namb_certifications',
      'brand', 'status', 'city_state', 'region', 'facebook_url',
      'instagram_url', 'linkedin_url', 'twitter_url', 'youtube_url',
      'tiktok_url', 'arrive', 'canva_folder_link', 'niche_bio_content',
      'personal_branding_images', 'loan_officer_profile', 'loan_officer_user'
    ];

    const dataToSave = {};
    saveableFields.forEach(field => {
      if (profile[field] !== undefined) {
        dataToSave[field] = profile[field];
      }
    });

    const jsonString = JSON.stringify(dataToSave);
    const sizeInBytes = new Blob([jsonString]).size;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);

    console.log('Data to save:', dataToSave);
    console.log(`Payload size: ${sizeInKB} KB (${sizeInBytes} bytes)`);

    // Check each field size
    Object.keys(dataToSave).forEach(key => {
      const fieldSize = new Blob([JSON.stringify(dataToSave[key] || '')]).size;
      if (fieldSize > 10_000) { // Show fields over 10KB
        console.log(`Large field: ${key} = ${(fieldSize / 1024).toFixed(2)} KB`);
      }
    });

    try {
      const url = id === 'new'
        ? `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles`
        : `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}`;

      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        body: JSON.stringify(dataToSave),
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        },
        method
      });

      if (!response.ok) {throw new Error('Failed to save profile');}

      const data = await response.json();
      toast.success(id === 'new' ? 'Profile created successfully' : 'Profile updated successfully');
      navigate(`/profiles/${data.data.id}`);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {id === 'new' ? 'Add New Profile' : 'Edit Profile'}
          </h1>
        </div>
        <Button onClick={() => navigate(id === 'new' ? '/profiles' : `/profiles/${id}`)} variant="outline">
          Cancel
        </Button>
      </div>

      {/* Profile Photo Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Photo</CardTitle>
        </CardHeader>
        <CardContent>
          <MediaUploader
            avatarSize="h-32 w-32"
            buttonText={profile.headshot_url ? "Change Photo" : "Upload Photo"}
            fallbackText={getInitials(profile.first_name, profile.last_name)}
            imageUrl={profile.headshot_url}
            onChange={(attachmentId, imageUrl) => {
              setProfile(prev => ({
                ...prev,
                headshot_id: attachmentId,
                headshot_url: imageUrl
              }));
            }}
            value={profile.headshot_id}
          />
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Tabs className="space-y-4" defaultValue="contact">
          <TabsList>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="social">Social Media</TabsTrigger>
            <TabsTrigger value="tools">Tools & Platforms</TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input onChange={(e) => handleChange('first_name', e.target.value)} required value={profile.first_name} />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input onChange={(e) => handleChange('last_name', e.target.value)} required value={profile.last_name} />
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input onChange={(e) => handleChange('email', e.target.value)} required type="email" value={profile.email} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input onChange={(e) => handleChange('phone_number', e.target.value)} value={profile.phone_number} />
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <Input onChange={(e) => handleChange('mobile_number', e.target.value)} value={profile.mobile_number} />
                  </div>
                </div>
                <div>
                  <Label>Office</Label>
                  <Input onChange={(e) => handleChange('office', e.target.value)} value={profile.office} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Job Title</Label>
                  <Input onChange={(e) => handleChange('job_title', e.target.value)} value={profile.job_title} />
                </div>
                <div>
                  <Label>Biography</Label>
                  <Textarea onChange={(e) => handleChange('biography', e.target.value)} rows={5} value={profile.biography} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input onChange={(e) => handleChange('date_of_birth', e.target.value)} type="date" value={profile.date_of_birth} />
                </div>
                <div>
                  <Label>Person Type</Label>
                  <Select onValueChange={(value) => handleChange('select_person_type', value)} value={profile.select_person_type}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="loan_officer">Loan Officer</SelectItem>
                      <SelectItem value="realtor_partner">Realtor Partner</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="leadership">Leadership</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>NMLS</Label>
                    <Input onChange={(e) => handleChange('nmls', e.target.value)} value={profile.nmls} />
                  </div>
                  <div>
                    <Label>NMLS Number</Label>
                    <Input onChange={(e) => handleChange('nmls_number', e.target.value)} value={profile.nmls_number} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>License Number</Label>
                    <Input onChange={(e) => handleChange('license_number', e.target.value)} value={profile.license_number} />
                  </div>
                  <div>
                    <Label>DRE License</Label>
                    <Input onChange={(e) => handleChange('dre_license', e.target.value)} value={profile.dre_license} />
                  </div>
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input onChange={(e) => handleChange('brand', e.target.value)} value={profile.brand} />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select onValueChange={(value) => handleChange('status', value)} value={profile.status}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Public Profile Slug</Label>
                  <Input
                    onChange={(e) => handleChange('profile_slug', e.target.value.toLowerCase().replaceAll(/[^\da-z-]/g, ''))}
                    placeholder="john-doe"
                    value={profile.profile_slug}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    URL: {window.location.origin}/profile/{profile.profile_slug || 'your-slug'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>City, State</Label>
                  <Input onChange={(e) => handleChange('city_state', e.target.value)} value={profile.city_state} />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input onChange={(e) => handleChange('region', e.target.value)} value={profile.region} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Facebook URL</Label>
                  <Input onChange={(e) => handleChange('facebook_url', e.target.value)} type="url" value={profile.facebook_url} />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input onChange={(e) => handleChange('instagram_url', e.target.value)} type="url" value={profile.instagram_url} />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input onChange={(e) => handleChange('linkedin_url', e.target.value)} type="url" value={profile.linkedin_url} />
                </div>
                <div>
                  <Label>Twitter URL</Label>
                  <Input onChange={(e) => handleChange('twitter_url', e.target.value)} type="url" value={profile.twitter_url} />
                </div>
                <div>
                  <Label>YouTube URL</Label>
                  <Input onChange={(e) => handleChange('youtube_url', e.target.value)} type="url" value={profile.youtube_url} />
                </div>
                <div>
                  <Label>TikTok URL</Label>
                  <Input onChange={(e) => handleChange('tiktok_url', e.target.value)} type="url" value={profile.tiktok_url} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tools & Platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ARRIVE URL</Label>
                  <Input onChange={(e) => handleChange('arrive', e.target.value)} type="url" value={profile.arrive} />
                </div>
                <div>
                  <Label>Canva Folder Link</Label>
                  <Input onChange={(e) => handleChange('canva_folder_link', e.target.value)} type="url" value={profile.canva_folder_link} />
                </div>
                <div>
                  <Label>Niche Bio Content</Label>
                  <Textarea onChange={(e) => handleChange('niche_bio_content', e.target.value)} rows={5} value={profile.niche_bio_content} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex gap-2">
          <Button disabled={loading} type="submit">
            {loading ? 'Saving...' : (id === 'new' ? 'Create Profile' : 'Update Profile')}
          </Button>
          <Button onClick={() => navigate(id === 'new' ? '/profiles' : `/profiles/${id}`)} type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
