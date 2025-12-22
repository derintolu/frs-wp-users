import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { MapPin, Search } from 'lucide-react';
import { FloatingInput } from '../ui/floating-input';
import { FloatingSelect, FloatingSelectItem } from '../ui/floating-select';
import { PageHeader } from './PageHeader';

interface PropertySearchData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export function PropertyValuation() {

  const [formData, setFormData] = useState<PropertySearchData>({
    address: '',
    city: '',
    state: '',
    zipCode: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log('Form submitted', formData);

    if (!formData.address) {
      alert('Please enter a property address');
      return;
    }

    // Build URL parameters for the landing page
    // No need to pass type anymore - landing page will fetch both sale and rent data
    const params = new URLSearchParams({
      address: formData.address,
      city: formData.city || '',
      state: formData.state || '',
      zip: formData.zipCode || ''
    });

    // Open landing page in new tab with property data
    const landingPageUrl = `/property-valuation-results/?${params.toString()}`;
    console.log('Opening URL:', landingPageUrl);

    const newWindow = window.open(landingPageUrl, '_blank');

    if (!newWindow) {
      alert('Please allow popups for this site to view the property valuation results.');
    }
  };

  return (
    <div className="p-6">
      <main className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          icon={MapPin}
          title="Property Valuation Tool"
          iconBgColor="linear-gradient(135deg, #3b82f6 0%, #2DD4DA 100%)"
        />

        {/* Search Form Card */}
        <Card className="w-full shadow-lg border-0 bg-white">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <FloatingInput
                  label="Property Address"
                  type="text"
                  icon={<MapPin className="h-4 w-4" />}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder=" "
                  required
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FloatingInput
                    label="City"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder=" "
                  />

                  <FloatingSelect
                    label="State"
                    value={formData.state}
                    onValueChange={(val) => setFormData({ ...formData, state: val })}
                    placeholder="Select State"
                  >
                    <FloatingSelectItem value="CA">California</FloatingSelectItem>
                    <FloatingSelectItem value="TX">Texas</FloatingSelectItem>
                    <FloatingSelectItem value="FL">Florida</FloatingSelectItem>
                    <FloatingSelectItem value="NY">New York</FloatingSelectItem>
                    <FloatingSelectItem value="PA">Pennsylvania</FloatingSelectItem>
                    <FloatingSelectItem value="IL">Illinois</FloatingSelectItem>
                    <FloatingSelectItem value="OH">Ohio</FloatingSelectItem>
                    <FloatingSelectItem value="GA">Georgia</FloatingSelectItem>
                    <FloatingSelectItem value="NC">North Carolina</FloatingSelectItem>
                    <FloatingSelectItem value="MI">Michigan</FloatingSelectItem>
                  </FloatingSelect>

                  <FloatingInput
                    label="ZIP Code"
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    placeholder=" "
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-[#2DD4DA] hover:from-blue-700 hover:to-[#28C5D0] text-white py-6 text-lg font-semibold"
              >
                <Search className="w-5 h-5 mr-2" />
                Get Property Report
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-[#444B57] text-center">
                <strong>Comprehensive property analysis includes:</strong><br />
                Sale & Rent Estimates • Property Details • Market Statistics • Comparable Sales
              </p>
              <p className="text-xs text-[#666] text-center mt-2">
                Powered by Rentcast API - 140M+ properties nationwide
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
