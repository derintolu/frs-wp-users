import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ArrowLeft, Building2, Palette, Save, Upload as UploadIcon } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface PartnerCompany {
  id: number;
  company_name: string;
  buddypress_group_id: number;
  branding: {
    primary_color: string;
    secondary_color: string;
    custom_logo: number;
    header_background: number;
    button_style: string;
  };
}

export function EditPartnerCompany() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [company, setCompany] = useState<PartnerCompany | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    buddypress_group_id: '',
    primary_color: '#2563eb',
    secondary_color: '#2dd4da',
    button_style: 'rounded',
  });

  // Load company data
  useEffect(() => {
    loadCompany();
  }, [id]);

  const loadCompany = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/wp-json/lrh/v1/partner-companies/${id}`, {
        credentials: 'include',
        headers: {
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load partner company');
      }

      const result = await response.json();
      const companyData = result.data;
      setCompany(companyData);

      // Populate form
      setFormData({
        company_name: companyData.company_name || '',
        buddypress_group_id: String(companyData.buddypress_group_id || ''),
        primary_color: companyData.branding?.primary_color || '#2563eb',
        secondary_color: companyData.branding?.secondary_color || '#2dd4da',
        button_style: companyData.branding?.button_style || 'rounded',
      });
    } catch (err) {
      console.error('Failed to load company:', err);
      setError('Failed to load partner company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/wp-json/lrh/v1/partner-companies/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to update partner company');
      }

      setSuccessMessage('Partner company updated successfully!');

      // Reload company data
      await loadCompany();
    } catch (err: any) {
      console.error('Failed to update partner company:', err);
      setError(err.message || 'Failed to update partner company. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSuccessMessage(null); // Clear success message when editing
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Loading partner company...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertDescription>Partner company not found.</AlertDescription>
          </Alert>
          <Button
            onClick={() => navigate('/partnerships/companies')}
            className="mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partner Companies
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/partnerships/companies')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partner Companies
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Edit Partner Company</h1>
          <p className="text-gray-600 text-lg">{company.company_name}</p>
        </div>

        {/* Messages */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200 text-green-800">
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="company" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="company">
                <Building2 className="h-4 w-4 mr-2" />
                Company Info
              </TabsTrigger>
              <TabsTrigger value="branding">
                <Palette className="h-4 w-4 mr-2" />
                Branding
              </TabsTrigger>
            </TabsList>

            {/* Company Info Tab */}
            <TabsContent value="company">
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>
                    Basic information about the partner company
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="company_name">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="company_name"
                      value={formData.company_name}
                      onChange={(e) => handleChange('company_name', e.target.value)}
                      placeholder="e.g., Keller Williams Downtown"
                      required
                    />
                  </div>

                  {/* BuddyPress Group ID */}
                  <div className="space-y-2">
                    <Label htmlFor="buddypress_group_id">
                      BuddyPress Group ID <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="buddypress_group_id"
                      type="number"
                      value={formData.buddypress_group_id}
                      onChange={(e) => handleChange('buddypress_group_id', e.target.value)}
                      placeholder="e.g., 123"
                      required
                    />
                    <p className="text-sm text-gray-600">
                      The BuddyPress group containing all realtors from this company
                    </p>
                  </div>

                  {/* Quick Actions */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/partnerships/companies/${id}/upload`)}
                        className="flex items-center justify-center gap-2"
                      >
                        <UploadIcon className="h-4 w-4" />
                        Bulk Upload Realtors
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.open(company.url, '_blank')}
                        className="flex items-center justify-center gap-2"
                      >
                        View Portal
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branding Tab */}
            <TabsContent value="branding">
              <Card>
                <CardHeader>
                  <CardTitle>Portal Branding</CardTitle>
                  <CardDescription>
                    Customize the look and feel of this partner company's portal
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Brand Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Primary Brand Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primary_color"
                          type="color"
                          value={formData.primary_color}
                          onChange={(e) => handleChange('primary_color', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.primary_color}
                          onChange={(e) => handleChange('primary_color', e.target.value)}
                          placeholder="#2563eb"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Secondary Brand Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondary_color"
                          type="color"
                          value={formData.secondary_color}
                          onChange={(e) => handleChange('secondary_color', e.target.value)}
                          className="w-20 h-10"
                        />
                        <Input
                          type="text"
                          value={formData.secondary_color}
                          onChange={(e) => handleChange('secondary_color', e.target.value)}
                          placeholder="#2dd4da"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Button Style */}
                  <div className="space-y-2">
                    <Label htmlFor="button_style">Button Style</Label>
                    <select
                      id="button_style"
                      value={formData.button_style}
                      onChange={(e) => handleChange('button_style', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="rounded">Rounded</option>
                      <option value="square">Square</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>

                  {/* Color Preview */}
                  <div className="space-y-2">
                    <Label>Portal Preview</Label>
                    <div
                      className="h-32 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`,
                      }}
                    >
                      <div className="text-white text-center">
                        <h3 className="text-2xl font-bold mb-2">{formData.company_name}</h3>
                        <Button
                          type="button"
                          className={`${
                            formData.button_style === 'square' ? 'rounded-none' :
                            formData.button_style === 'rounded' ? 'rounded-full' :
                            'rounded-md'
                          } bg-white text-gray-900 hover:bg-gray-100`}
                          style={
                            formData.button_style === 'gradient'
                              ? { background: `linear-gradient(90deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`, color: 'white' }
                              : {}
                          }
                        >
                          Sample Button
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Logo Upload Placeholder */}
                  <div className="border-t pt-6">
                    <Label>Custom Logo</Label>
                    <p className="text-sm text-gray-600 mb-3">
                      Logo uploads will be available in the WordPress admin panel
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => window.open(`/wp-admin/post.php?post=${id}&action=edit`, '_blank')}
                    >
                      Manage in WordPress Admin
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/partnerships/companies')}
                  disabled={isSaving}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSaving || !formData.company_name || !formData.buddypress_group_id}
                  className="flex-1"
                  style={{ background: 'var(--gradient-hero)', color: 'white' }}
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
