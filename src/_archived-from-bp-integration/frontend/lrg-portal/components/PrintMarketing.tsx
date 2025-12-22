import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Printer,
  Image as ImageIcon,
  FileText,
  Download,
  Share2,
  Plus,
  Edit,
  Eye,
  ExternalLink,
  Calendar,
  Users,
  Mail,
  ClipboardList,
  Target,
  Palette
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { LoadingCard, LoadingSpinner } from './ui/loading';
import { DataService } from '../utils/dataService';

interface PrintTemplate {
  id: string;
  title: string;
  category: 'flyer' | 'brochure' | 'postcard' | 'business-card' | 'door-hanger';
  thumbnail: string;
  canvaUrl: string;
  description: string;
  lastModified: string;
  createdBy: 'admin';
}

interface PrintMarketingProps {
  userRole: 'loan-officer' | 'realtor';
  userId: string;
}

export function PrintMarketing({ userRole, userId }: PrintMarketingProps) {
  const [activeTab, setActiveTab] = useState('templates');
  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<PrintTemplate[]>([]);

  // Load print materials from backend
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const materials = await DataService.getMarketingMaterials(userId);

        // Convert marketing materials to print template format
        const printTemplates: PrintTemplate[] = materials
          .filter(m => m.type === 'print' && m.embed_code)
          .map(material => ({
            id: material.id,
            title: material.title,
            category: material.category || 'flyer',
            thumbnail: material.thumbnail || '',
            canvaUrl: material.embed_code,
            description: material.description || `Print material: ${material.title}`,
            createdBy: 'admin',
            lastModified: material.lastModified || new Date().toISOString()
          }));

        setTemplates(printTemplates);
      } catch (error) {
        console.error('Failed to load print materials:', error);
        setTemplates([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, [userId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'flyer': return FileText;
      case 'brochure': return FileText;
      case 'postcard': return Mail;
      case 'business-card': return Users;
      case 'door-hanger': return Target;
      default: return FileText;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'flyer': return 'bg-[var(--brand-electric-blue)]';
      case 'brochure': return 'bg-[var(--brand-cyan)]';
      case 'postcard': return 'bg-[var(--brand-light-blue)]';
      case 'business-card': return 'bg-[var(--brand-steel-blue)]';
      case 'door-hanger': return 'bg-[var(--brand-slate)]';
      default: return 'bg-[var(--brand-powder-blue)]';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--brand-dark-navy)]">Print Marketing Materials</h2>
          <p className="text-[var(--brand-slate)] mt-1">
            {userRole === 'loan-officer'
              ? 'Access professionally designed templates for your realtor partnerships'
              : 'Access co-branded print materials from your loan officer partner'}
          </p>
        </div>

        <div className="bg-[var(--brand-pale-blue)] px-3 py-2 rounded-lg">
          <p className="text-xs text-[var(--brand-steel-blue)] flex items-center">
            <Users className="h-3 w-3 mr-1" />
            Templates managed by admins
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-[var(--brand-pale-blue)]">
          <TabsTrigger value="templates" className="flex items-center space-x-2">
            <Palette className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center space-x-2">
            <ClipboardList className="h-4 w-4" />
            <span>{userRole === 'loan-officer' ? 'Requests' : 'My Requests'}</span>
          </TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <LoadingCard type="grid" count={6} />
            </div>
          ) : templates.length === 0 ? (
            <div className="border-2 border-dashed border-[var(--brand-powder-blue)] rounded-lg p-12 text-center bg-[var(--brand-pale-blue)]/30">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[var(--brand-electric-blue)] rounded-lg mx-auto flex items-center justify-center">
                  <Printer className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-medium text-[var(--brand-dark-navy)]">
                  No Print Materials Available
                </h3>
                <p className="text-sm text-[var(--brand-slate)] max-w-md mx-auto">
                  {userRole === 'loan-officer'
                    ? 'Print materials will appear here once they are added by administrators. Contact support to request specific templates for your realtor partnerships.'
                    : 'Your loan officer partner hasn\'t set up print materials yet. Check back later or contact them directly about available templates.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.category);
                return (
                  <Card
                    key={template.id}
                    className="group border-[var(--brand-powder-blue)] hover:shadow-2xl hover:border-[var(--brand-electric-blue)] transition-all duration-500 cursor-pointer relative overflow-hidden rounded-xl"
                  >
                    <CardContent className="p-0 relative">
                      {/* Template Preview */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        <ImageWithFallback
                          src={template.thumbnail}
                          alt={template.title}
                          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                        />

                        {/* Overlay with Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>

                        {/* Template Info Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-between p-4">
                          {/* Top Section - Category Badge */}
                          <div className="flex justify-between items-start">
                            <Badge className={`text-xs ${getCategoryColor(template.category)} text-white shadow-lg backdrop-blur-sm flex items-center space-x-1`}>
                              <CategoryIcon className="h-3 w-3" />
                              <span className="capitalize">{template.category.replace('-', ' ')}</span>
                            </Badge>
                            <Badge variant="secondary" className="text-xs bg-white/90 text-[var(--brand-dark-navy)] backdrop-blur-sm shadow-lg">
                              Admin Template
                            </Badge>
                          </div>

                          {/* Bottom Section - Title and Meta */}
                          <div className="space-y-2">
                            <h4 className="text-lg font-semibold text-white leading-tight drop-shadow-lg">
                              {template.title}
                            </h4>
                            <p className="text-xs text-white/80 drop-shadow">
                              {template.description}
                            </p>
                            <div className="text-xs text-white/75 flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>Updated {new Date(template.lastModified).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover Action Buttons */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex space-x-3 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                            <Button
                              size="lg"
                              className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white text-white shadow-xl border-0 backdrop-blur-sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(template.canvaUrl, '_blank');
                              }}
                            >
                              <Eye className="h-5 w-5 mr-2" />
                              View in Canva
                            </Button>
                            <Button
                              size="lg"
                              variant="outline"
                              className="bg-white/95 hover:bg-white border-white text-[var(--brand-dark-navy)] shadow-xl backdrop-blur-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Download className="h-5 w-5 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-6">
          <RequestsSection userRole={userRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Requests Section Component
function RequestsSection({ userRole }: { userRole: 'loan-officer' | 'realtor' }) {
  const [typeformUrl, setTypeformUrl] = useState<string>('');
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [tempUrl, setTempUrl] = useState<string>('');
  const [isSavingUrl, setIsSavingUrl] = useState(false);

  const handleSaveUrl = async () => {
    setIsSavingUrl(true);
    // Simulate API call to save the Typeform URL
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTypeformUrl(tempUrl);
    setIsEditingUrl(false);
    setIsSavingUrl(false);
  };

  const handleCancelEdit = () => {
    setTempUrl(typeformUrl);
    setIsEditingUrl(false);
  };

  const startEditing = () => {
    setTempUrl(typeformUrl);
    setIsEditingUrl(true);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section for Loan Officers */}
      {userRole === 'loan-officer' && (
        <Card className="border-[var(--brand-powder-blue)]">
          <CardHeader>
            <CardTitle className="text-[var(--brand-dark-navy)] flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" />
              Request Form Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="typeform-url">Typeform URL</Label>
              <p className="text-sm text-[var(--brand-slate)] mb-3">
                Embed your Typeform to collect custom material requests from your realtor partners.
              </p>
              {isEditingUrl ? (
                <div className="space-y-3">
                  <Input
                    id="typeform-url"
                    value={tempUrl}
                    onChange={(e) => setTempUrl(e.target.value)}
                    placeholder="https://your-form.typeform.com/to/your-form-id"
                    disabled={isSavingUrl}
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveUrl}
                      className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
                      disabled={isSavingUrl}
                    >
                      {isSavingUrl ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        'Save URL'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancelEdit}
                      disabled={isSavingUrl}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Input
                    value={typeformUrl || 'No Typeform URL configured'}
                    readOnly
                    className="flex-1 bg-[var(--brand-pale-blue)]"
                  />
                  <Button variant="outline" onClick={startEditing}>
                    <Edit className="h-4 w-4 mr-2" />
                    {typeformUrl ? 'Edit' : 'Add URL'}
                  </Button>
                </div>
              )}
            </div>

            {typeformUrl && (
              <div className="bg-[var(--brand-pale-blue)] p-4 rounded-lg">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-[var(--brand-cyan)] animate-pulse"></div>
                  <span className="font-medium text-[var(--brand-dark-navy)]">Form is live and accepting submissions</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Typeform Iframe Section */}
      <Card className="border-[var(--brand-powder-blue)]">
        <CardHeader>
          <CardTitle className="text-[var(--brand-dark-navy)]">
            {userRole === 'loan-officer' ? 'Request Form Preview' : 'Submit Material Request'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {typeformUrl ? (
            <div className="space-y-4">
              <div className="bg-[var(--brand-pale-blue)] p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-[var(--brand-dark-navy)] flex items-center">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Custom Material Request Form
                  </h4>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(typeformUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                </div>
                <p className="text-sm text-[var(--brand-slate)] mb-4">
                  {userRole === 'loan-officer'
                    ? 'This is how your realtor partners will see the request form.'
                    : 'Fill out this form to request custom print materials from your loan officer partner.'}
                </p>
              </div>

              {/* Typeform Iframe */}
              <div className="border-2 border-[var(--brand-powder-blue)] rounded-lg overflow-hidden bg-white" style={{ height: '600px' }}>
                <iframe
                  src={typeformUrl}
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  marginHeight={0}
                  marginWidth={0}
                  title="Material Request Form"
                  className="w-full h-full"
                >
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center space-y-3">
                      <ExternalLink className="h-12 w-12 text-[var(--brand-pale-blue)] mx-auto" />
                      <h5 className="font-medium text-[var(--brand-dark-navy)]">Unable to load form</h5>
                      <p className="text-sm text-[var(--brand-slate)]">
                        Please check the URL or open the form in a new tab.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => window.open(typeformUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open Form
                      </Button>
                    </div>
                  </div>
                </iframe>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-[var(--brand-powder-blue)] rounded-lg p-12 text-center bg-[var(--brand-pale-blue)]/30">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-[var(--brand-electric-blue)] rounded-lg mx-auto flex items-center justify-center">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <h5 className="font-medium text-[var(--brand-dark-navy)]">
                  {userRole === 'loan-officer' ? 'No Request Form Configured' : 'No Request Form Available'}
                </h5>
                <p className="text-sm text-[var(--brand-slate)] max-w-md mx-auto">
                  {userRole === 'loan-officer'
                    ? 'Add your Typeform URL above to enable realtor partners to submit custom material requests through an embedded form.'
                    : 'Your loan officer hasn\'t set up a request form yet. Contact them directly to request custom print materials.'}
                </p>
                {userRole === 'loan-officer' && (
                  <Button
                    variant="outline"
                    className="border-[var(--brand-electric-blue)] text-[var(--brand-electric-blue)]"
                    onClick={startEditing}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Configure Form
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card className="border-[var(--brand-powder-blue)] bg-gradient-to-r from-[var(--brand-pale-blue)] to-white">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-[var(--brand-cyan)] rounded-lg flex items-center justify-center flex-shrink-0">
              <ExternalLink className="h-5 w-5 text-white" />
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-[var(--brand-dark-navy)]">
                {userRole === 'loan-officer' ? 'How to Set Up Your Request Form' : 'How to Submit Requests'}
              </h4>
              {userRole === 'loan-officer' ? (
                <div className="text-sm text-[var(--brand-slate)] space-y-2">
                  <p>1. Create a Typeform at <strong>typeform.com</strong> with fields for material type, description, deadlines, etc.</p>
                  <p>2. Copy the embed URL from your Typeform's share settings</p>
                  <p>3. Paste it in the configuration section above</p>
                  <p>4. Your realtor partners will see the embedded form in their Print Marketing section</p>
                </div>
              ) : (
                <div className="text-sm text-[var(--brand-slate)] space-y-2">
                  <p>Once your loan officer sets up the request form, you'll be able to:</p>
                  <p>• Submit detailed requests for custom print materials</p>
                  <p>• Upload reference images or examples</p>
                  <p>• Set deadlines and priority levels</p>
                  <p>• Track the status of your requests</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}