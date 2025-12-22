import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';
import { DataService } from '../../utils/dataService';
import { LoadingSpinner } from '../ui/loading';

interface MarketingMaterialsProps {
  userId: string;
  currentUser: any;
}

export function MarketingOrders({ userId, currentUser }: MarketingMaterialsProps) {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setLoading(true);
        const materialsData = await DataService.getMarketingMaterials(userId);
        setMaterials(materialsData || []);
      } catch (err) {
        console.error('Failed to load marketing materials:', err);
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [userId]);

  return (
    <div className="space-y-4">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-5 gap-4">

        {/* Left Column - Marketing Materials Bento (3 columns) */}
        <div className="col-span-3 space-y-4 max-h-[calc(100vh-150px)] overflow-y-auto">

          {/* Materials Grid */}
          {loading ? (
            <Card className="shadow-md" style={{ border: '1px solid var(--brand-powder-blue)' }}>
              <CardContent className="p-8 flex items-center justify-center">
                <LoadingSpinner size="sm" />
                <span className="ml-2 text-sm" style={{ color: 'var(--brand-slate)' }}>Loading materials...</span>
              </CardContent>
            </Card>
          ) : materials.length > 0 ? (
            <div className="space-y-3">
              {materials.map((material, index) => (
                <Card key={material.id || index} className="overflow-hidden shadow-md hover:shadow-lg transition-shadow" style={{ border: '1px solid var(--brand-powder-blue)' }}>
                  <CardContent className="p-0">
                    {material.embed_code ? (
                      <div
                        className="w-full aspect-video"
                        dangerouslySetInnerHTML={{ __html: material.embed_code }}
                      />
                    ) : material.thumbnail ? (
                      <img
                        src={material.thumbnail}
                        alt={material.title || 'Marketing Material'}
                        className="w-full aspect-video object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                        <ImageIcon className="h-8 w-8" style={{ color: 'var(--brand-powder-blue)' }} />
                      </div>
                    )}
                    <div className="p-3">
                      <h4 className="font-semibold text-xs mb-1" style={{ color: 'var(--brand-dark-navy)' }}>
                        {material.title || 'Untitled Material'}
                      </h4>
                      {material.description && (
                        <p className="text-xs mb-2" style={{ color: 'var(--brand-slate)' }}>
                          {material.description.substring(0, 60)}...
                        </p>
                      )}
                      {material.url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs"
                          onClick={() => window.open(material.url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          View Template
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="shadow-md" style={{ border: '1px solid var(--brand-powder-blue)' }}>
              <CardContent className="p-8 text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-3" style={{ color: 'var(--brand-powder-blue)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--brand-dark-navy)' }}>No Materials Yet</p>
                <p className="text-xs" style={{ color: 'var(--brand-slate)' }}>Marketing materials will appear here when added by admin</p>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Column - Order Form (2 columns) */}
        <div className="col-span-2">
          <Card className="overflow-hidden shadow-lg" style={{ border: '1px solid var(--brand-powder-blue)' }}>
            <CardContent className="p-0">
              <iframe
                src="https://form.typeform.com/to/ZIe9rOkM?typeform-embed-id=7203837511092579&typeform-embed=embed-widget&typeform-source=www-mastersresourceguide-com.filesusr.com&typeform-medium=snippet&typeform-medium-version=next&embed-opacity=100&typeform-embed-handles-redirect=1"
                style={{
                  width: '100%',
                  height: 'calc(100vh - 280px)',
                  minHeight: '600px',
                  border: 'none'
                }}
                title="Marketing Order Form"
              />
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
