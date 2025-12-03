import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Building2, Users } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

export function CreatePartnerCompany() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_name: '',
    buddypress_group_id: '',
    primary_color: '#2563eb',
    secondary_color: '#2dd4da',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/wp-json/lrh/v1/partner-companies', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || 'Failed to create partner company');
      }

      const result = await response.json();

      // Navigate to the edit page for the newly created company
      navigate(`/partnerships/companies/${result.data.id}/edit`);
    } catch (err: any) {
      console.error('Failed to create partner company:', err);
      setError(err.message || 'Failed to create partner company. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
      <div className="max-w-3xl mx-auto">
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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Add Partner Company</h1>
          <p className="text-gray-600 text-lg">Create a new partner company portal</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Basic information about the partner real estate company
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

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
                <p className="text-sm text-gray-600">
                  The name of the real estate partner company
                </p>
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
                  The ID of the BuddyPress group that contains all realtors from this company
                </p>
              </div>

              {/* Branding Colors */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Branding (Optional)</h3>
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

                {/* Color Preview */}
                <div className="mt-4">
                  <Label>Color Preview</Label>
                  <div
                    className="h-20 rounded-lg mt-2"
                    style={{
                      background: `linear-gradient(135deg, ${formData.primary_color} 0%, ${formData.secondary_color} 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/partnerships/companies')}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !formData.company_name || !formData.buddypress_group_id}
                  className="flex-1"
                  style={{ background: 'var(--gradient-hero)', color: 'white' }}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Building2 className="h-4 w-4 mr-2" />
                      Create Partner Company
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Info Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>After creating the partner company, you can:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Upload a CSV file with realtor contact information</li>
                <li>Customize the portal branding with logos and colors</li>
                <li>Add additional loan officers to manage this company</li>
                <li>View analytics and track portal performance</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
