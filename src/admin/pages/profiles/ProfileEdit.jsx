import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

export default function ProfileEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    mobile_number: "",
    office: "",
    job_title: "",
    biography: "",
    date_of_birth: "",
    select_person_type: "",
    nmls: "",
    nmls_number: "",
    license_number: "",
    dre_license: "",
    brand: "",
    status: "active",
    city_state: "",
    region: "",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    twitter_url: "",
    youtube_url: "",
    tiktok_url: "",
    arrive: "",
    canva_folder_link: "",
    niche_bio_content: "",
  });

  useEffect(() => {
    if (id && id !== 'new') {
      fetchProfile();
    }
  }, [id]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}`, {
        headers: { 'X-WP-Nonce': wordpressPluginBoilerplate.nonce }
      });
      if (!response.ok) throw new Error('Failed to fetch profile');
      const data = await response.json();
      setProfile(data.data);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = id === 'new'
        ? `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles`
        : `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${id}`;

      const method = id === 'new' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(profile)
      });

      if (!response.ok) throw new Error('Failed to save profile');

      const data = await response.json();
      toast.success(id === 'new' ? 'Profile created successfully' : 'Profile updated successfully');
      navigate(`/profiles/${data.data.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {id === 'new' ? 'Add New Profile' : 'Edit Profile'}
          </h2>
        </div>
        <Button variant="outline" onClick={() => navigate('/profiles')}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="contact" className="space-y-4">
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
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input required value={profile.first_name} onChange={(e) => handleChange('first_name', e.target.value)} />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input required value={profile.last_name} onChange={(e) => handleChange('last_name', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input type="email" required value={profile.email} onChange={(e) => handleChange('email', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Phone Number</Label>
                    <Input value={profile.phone_number} onChange={(e) => handleChange('phone_number', e.target.value)} />
                  </div>
                  <div>
                    <Label>Mobile Number</Label>
                    <Input value={profile.mobile_number} onChange={(e) => handleChange('mobile_number', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Office</Label>
                  <Input value={profile.office} onChange={(e) => handleChange('office', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional">
            <Card>
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Job Title</Label>
                  <Input value={profile.job_title} onChange={(e) => handleChange('job_title', e.target.value)} />
                </div>
                <div>
                  <Label>Biography</Label>
                  <Textarea rows={5} value={profile.biography} onChange={(e) => handleChange('biography', e.target.value)} />
                </div>
                <div>
                  <Label>Date of Birth</Label>
                  <Input type="date" value={profile.date_of_birth} onChange={(e) => handleChange('date_of_birth', e.target.value)} />
                </div>
                <div>
                  <Label>Person Type</Label>
                  <select className="w-full border rounded px-3 py-2" value={profile.select_person_type} onChange={(e) => handleChange('select_person_type', e.target.value)}>
                    <option value="">Select Type</option>
                    <option value="loan_officer">Loan Officer</option>
                    <option value="realtor_partner">Realtor Partner</option>
                    <option value="staff">Staff</option>
                    <option value="leadership">Leadership</option>
                    <option value="assistant">Assistant</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>NMLS</Label>
                    <Input value={profile.nmls} onChange={(e) => handleChange('nmls', e.target.value)} />
                  </div>
                  <div>
                    <Label>NMLS Number</Label>
                    <Input value={profile.nmls_number} onChange={(e) => handleChange('nmls_number', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>License Number</Label>
                    <Input value={profile.license_number} onChange={(e) => handleChange('license_number', e.target.value)} />
                  </div>
                  <div>
                    <Label>DRE License</Label>
                    <Input value={profile.dre_license} onChange={(e) => handleChange('dre_license', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label>Brand</Label>
                  <Input value={profile.brand} onChange={(e) => handleChange('brand', e.target.value)} />
                </div>
                <div>
                  <Label>Status</Label>
                  <select className="w-full border rounded px-3 py-2" value={profile.status} onChange={(e) => handleChange('status', e.target.value)}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location">
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>City, State</Label>
                  <Input value={profile.city_state} onChange={(e) => handleChange('city_state', e.target.value)} />
                </div>
                <div>
                  <Label>Region</Label>
                  <Input value={profile.region} onChange={(e) => handleChange('region', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Facebook URL</Label>
                  <Input type="url" value={profile.facebook_url} onChange={(e) => handleChange('facebook_url', e.target.value)} />
                </div>
                <div>
                  <Label>Instagram URL</Label>
                  <Input type="url" value={profile.instagram_url} onChange={(e) => handleChange('instagram_url', e.target.value)} />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input type="url" value={profile.linkedin_url} onChange={(e) => handleChange('linkedin_url', e.target.value)} />
                </div>
                <div>
                  <Label>Twitter URL</Label>
                  <Input type="url" value={profile.twitter_url} onChange={(e) => handleChange('twitter_url', e.target.value)} />
                </div>
                <div>
                  <Label>YouTube URL</Label>
                  <Input type="url" value={profile.youtube_url} onChange={(e) => handleChange('youtube_url', e.target.value)} />
                </div>
                <div>
                  <Label>TikTok URL</Label>
                  <Input type="url" value={profile.tiktok_url} onChange={(e) => handleChange('tiktok_url', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools">
            <Card>
              <CardHeader>
                <CardTitle>Tools & Platforms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>ARRIVE URL</Label>
                  <Input type="url" value={profile.arrive} onChange={(e) => handleChange('arrive', e.target.value)} />
                </div>
                <div>
                  <Label>Canva Folder Link</Label>
                  <Input type="url" value={profile.canva_folder_link} onChange={(e) => handleChange('canva_folder_link', e.target.value)} />
                </div>
                <div>
                  <Label>Niche Bio Content</Label>
                  <Textarea rows={5} value={profile.niche_bio_content} onChange={(e) => handleChange('niche_bio_content', e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (id === 'new' ? 'Create Profile' : 'Update Profile')}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/profiles')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
