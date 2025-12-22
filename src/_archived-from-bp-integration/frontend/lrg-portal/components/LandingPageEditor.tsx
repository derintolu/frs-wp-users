import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  Save,
  X,
  Eye,
  Plus,
  Trash2,
  Move3D,
  Type,
  Image as ImageIcon,
  Layout,
  Settings,
  Palette,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { LoadingSpinner } from './ui/loading';

interface LandingPageEditorProps {
  pageId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (pageData: any) => void;
  userRole: 'loan-officer' | 'realtor';
}

interface Block {
  id: string;
  type: 'hero' | 'features' | 'testimonial' | 'cta' | 'form';
  content: any;
  locked?: boolean;
}

const AVAILABLE_BLOCKS = [
  { type: 'hero', name: 'Hero Section', icon: Layout, description: 'Main header with title and call-to-action' },
  { type: 'features', name: 'Features', icon: Type, description: 'Highlight key benefits or services' },
  { type: 'testimonial', name: 'Testimonial', icon: ImageIcon, description: 'Customer review or success story' },
  { type: 'cta', name: 'Call to Action', icon: Palette, description: 'Conversion-focused section' },
  { type: 'form', name: 'Lead Form', icon: Settings, description: 'Contact or lead capture form' }
];

export function LandingPageEditor({ pageId, isOpen, onClose, onSave, userRole }: LandingPageEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeBlock, setActiveBlock] = useState<string | null>(null);
  const [pageData, setPageData] = useState({
    title: '',
    slug: '',
    status: 'draft' as 'draft' | 'published',
    blocks: [] as Block[]
  });

  useEffect(() => {
    if (pageId && isOpen) {
      // Load existing page data
      loadPageData(pageId);
    } else if (isOpen && !pageId) {
      // Initialize new page with default hero block
      setPageData({
        title: 'New Landing Page',
        slug: 'new-landing-page',
        status: 'draft',
        blocks: [{
          id: 'hero-1',
          type: 'hero',
          locked: true, // Hero is always required
          content: {
            title: 'Your Headline Here',
            subtitle: 'Compelling subtitle that converts visitors into leads',
            buttonText: 'Get Started',
            buttonUrl: '#contact',
            backgroundImage: '',
            textColor: '#ffffff'
          }
        }]
      });
    }
  }, [pageId, isOpen]);

  const loadPageData = async (id: string) => {
    // TODO: Load from WordPress API
    console.log('Loading page data for:', id);
  };

  const addBlock = (blockType: string) => {
    const newBlock: Block = {
      id: `${blockType}-${Date.now()}`,
      type: blockType as any,
      content: getDefaultContent(blockType)
    };

    setPageData(prev => ({
      ...prev,
      blocks: [...prev.blocks, newBlock]
    }));
  };

  const getDefaultContent = (blockType: string) => {
    switch (blockType) {
      case 'hero':
        return {
          title: 'Your Headline Here',
          subtitle: 'Compelling subtitle',
          buttonText: 'Get Started',
          buttonUrl: '#contact',
          backgroundImage: '',
          textColor: '#ffffff'
        };
      case 'features':
        return {
          title: 'Why Choose Us',
          features: [
            { title: 'Feature 1', description: 'Benefit description', icon: '⭐' },
            { title: 'Feature 2', description: 'Benefit description', icon: '🎯' },
            { title: 'Feature 3', description: 'Benefit description', icon: '💎' }
          ]
        };
      case 'testimonial':
        return {
          quote: 'This service was amazing and helped us achieve our goals.',
          author: 'John Doe',
          title: 'CEO, Company Name',
          avatar: '',
          rating: 5
        };
      case 'cta':
        return {
          title: 'Ready to Get Started?',
          subtitle: 'Join thousands of satisfied customers',
          buttonText: 'Contact Us Today',
          buttonUrl: '#contact',
          backgroundColor: '#2563eb'
        };
      case 'form':
        return {
          title: 'Get Your Free Consultation',
          subtitle: 'Fill out the form below and we\'ll get back to you within 24 hours',
          fields: [
            { name: 'name', label: 'Full Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'phone', label: 'Phone Number', type: 'tel', required: false },
            { name: 'message', label: 'Message', type: 'textarea', required: false }
          ],
          submitText: 'Send Message'
        };
      default:
        return {};
    }
  };

  const updateBlock = (blockId: string, newContent: any) => {
    setPageData(prev => ({
      ...prev,
      blocks: prev.blocks.map(block =>
        block.id === blockId
          ? { ...block, content: { ...block.content, ...newContent } }
          : block
      )
    }));
  };

  const deleteBlock = (blockId: string) => {
    setPageData(prev => ({
      ...prev,
      blocks: prev.blocks.filter(block => block.id !== blockId && !block.locked)
    }));
  };

  const moveBlock = (blockId: string, direction: 'up' | 'down') => {
    setPageData(prev => {
      const blocks = [...prev.blocks];
      const currentIndex = blocks.findIndex(b => b.id === blockId);
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

      if (newIndex >= 0 && newIndex < blocks.length) {
        [blocks[currentIndex], blocks[newIndex]] = [blocks[newIndex], blocks[currentIndex]];
      }

      return { ...prev, blocks };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save to WordPress API
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      onSave(pageData);
      onClose();
    } catch (error) {
      console.error('Failed to save landing page:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    // Open preview in new tab
    const previewData = encodeURIComponent(JSON.stringify(pageData));
    window.open(`/landing-page-preview?data=${previewData}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex">
      {/* Sidebar - Block Library */}
      <div className="w-80 bg-white border-r border-[var(--brand-powder-blue)] flex flex-col">
        <div className="p-6 border-b border-[var(--brand-powder-blue)]">
          <h3 className="text-lg font-medium text-[var(--brand-dark-navy)]">Block Library</h3>
          <p className="text-sm text-[var(--brand-slate)] mt-1">Drag or click to add blocks</p>
        </div>

        <div className="flex-1 p-4 space-y-3 overflow-y-auto">
          {AVAILABLE_BLOCKS.map((block) => {
            const IconComponent = block.icon;
            return (
              <Card
                key={block.type}
                className="cursor-pointer hover:shadow-md transition-shadow border-[var(--brand-powder-blue)]"
                onClick={() => addBlock(block.type)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-[var(--brand-pale-blue)] rounded-lg flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-[var(--brand-electric-blue)]" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--brand-dark-navy)] text-sm">{block.name}</h4>
                      <p className="text-xs text-[var(--brand-slate)] mt-1">{block.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-[var(--brand-powder-blue)] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-[var(--brand-dark-navy)]">
                {pageId ? 'Edit Landing Page' : 'Create Landing Page'}
              </h2>
              <Badge variant={pageData.status === 'published' ? 'default' : 'secondary'}>
                {pageData.status}
              </Badge>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handlePreview}>
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[var(--brand-electric-blue)] hover:bg-[var(--brand-electric-blue)]/90 text-white"
              >
                {isSaving ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Page Settings */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pageTitle">Page Title</Label>
              <Input
                id="pageTitle"
                value={pageData.title}
                onChange={(e) => setPageData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="pageSlug">URL Slug</Label>
              <Input
                id="pageSlug"
                value={pageData.slug}
                onChange={(e) => setPageData(prev => ({ ...prev, slug: e.target.value }))}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Block Editor */}
        <div className="flex-1 overflow-y-auto bg-[var(--brand-pale-blue)]/30">
          <div className="max-w-4xl mx-auto py-8 px-6 space-y-6">
            {pageData.blocks.map((block, index) => (
              <BlockEditor
                key={block.id}
                block={block}
                isActive={activeBlock === block.id}
                onClick={() => setActiveBlock(block.id)}
                onUpdate={(content) => updateBlock(block.id, content)}
                onDelete={() => deleteBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, 'up')}
                onMoveDown={() => moveBlock(block.id, 'down')}
                canMoveUp={index > 0}
                canMoveDown={index < pageData.blocks.length - 1}
              />
            ))}

            {pageData.blocks.length === 0 && (
              <div className="text-center py-12">
                <Plus className="h-12 w-12 text-[var(--brand-slate)] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[var(--brand-dark-navy)] mb-2">No blocks yet</h3>
                <p className="text-[var(--brand-slate)]">Add blocks from the sidebar to start building your landing page</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Block Editor Component
function BlockEditor({
  block,
  isActive,
  onClick,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: {
  block: Block;
  isActive: boolean;
  onClick: () => void;
  onUpdate: (content: any) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}) {
  const renderBlockContent = () => {
    switch (block.type) {
      case 'hero':
        return <HeroBlockEditor block={block} onUpdate={onUpdate} isActive={isActive} />;
      case 'features':
        return <FeaturesBlockEditor block={block} onUpdate={onUpdate} isActive={isActive} />;
      case 'testimonial':
        return <TestimonialBlockEditor block={block} onUpdate={onUpdate} isActive={isActive} />;
      case 'cta':
        return <CTABlockEditor block={block} onUpdate={onUpdate} isActive={isActive} />;
      case 'form':
        return <FormBlockEditor block={block} onUpdate={onUpdate} isActive={isActive} />;
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <div
      className={`relative group border-2 rounded-lg transition-all ${
        isActive
          ? 'border-[var(--brand-electric-blue)] shadow-lg'
          : 'border-transparent hover:border-[var(--brand-powder-blue)]'
      }`}
      onClick={onClick}
    >
      {/* Block Controls */}
      {isActive && (
        <div className="absolute -top-10 left-0 flex items-center space-x-2 bg-white rounded-md shadow-md border border-[var(--brand-powder-blue)] p-1">
          <Button size="sm" variant="ghost" onClick={onMoveUp} disabled={!canMoveUp}>
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onMoveDown} disabled={!canMoveDown}>
            <ArrowDown className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-[var(--brand-powder-blue)]" />
          {!block.locked && (
            <Button size="sm" variant="ghost" onClick={onDelete} className="text-red-500 hover:text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <div className="bg-white rounded-lg overflow-hidden">
        {renderBlockContent()}
      </div>
    </div>
  );
}

// Block Editor Components
function HeroBlockEditor({ block, onUpdate, isActive }: { block: Block; onUpdate: (content: any) => void; isActive: boolean }) {
  if (!isActive) {
    return (
      <div className="p-8 text-center bg-gradient-to-r from-[var(--brand-electric-blue)] to-[var(--brand-cyan)] text-white">
        <h1 className="text-3xl font-bold mb-2">{block.content.title}</h1>
        <p className="text-xl mb-6 opacity-90">{block.content.subtitle}</p>
        <button className="bg-white text-[var(--brand-electric-blue)] px-8 py-3 rounded-lg font-medium">
          {block.content.buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-medium text-[var(--brand-dark-navy)] mb-4">Hero Section</h3>
      <div>
        <Label>Title</Label>
        <Input
          value={block.content.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Textarea
          value={block.content.subtitle}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Button Text</Label>
          <Input
            value={block.content.buttonText}
            onChange={(e) => onUpdate({ buttonText: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Button URL</Label>
          <Input
            value={block.content.buttonUrl}
            onChange={(e) => onUpdate({ buttonUrl: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

function FeaturesBlockEditor({ block, onUpdate, isActive }: { block: Block; onUpdate: (content: any) => void; isActive: boolean }) {
  if (!isActive) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-center mb-8 text-[var(--brand-dark-navy)]">{block.content.title}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {block.content.features?.map((feature: any, index: number) => (
            <div key={index} className="text-center">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="font-medium text-[var(--brand-dark-navy)] mb-2">{feature.title}</h3>
              <p className="text-[var(--brand-slate)]">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-medium text-[var(--brand-dark-navy)] mb-4">Features Section</h3>
      <div>
        <Label>Section Title</Label>
        <Input
          value={block.content.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1"
        />
      </div>
      {/* Feature editing would go here */}
    </div>
  );
}

function TestimonialBlockEditor({ block, onUpdate, isActive }: { block: Block; onUpdate: (content: any) => void; isActive: boolean }) {
  if (!isActive) {
    return (
      <div className="p-8 bg-[var(--brand-pale-blue)]">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-4">"</div>
          <p className="text-lg text-[var(--brand-dark-navy)] mb-6 italic">{block.content.quote}</p>
          <div className="flex items-center justify-center space-x-4">
            <div className="w-12 h-12 bg-[var(--brand-powder-blue)] rounded-full"></div>
            <div>
              <div className="font-medium text-[var(--brand-dark-navy)]">{block.content.author}</div>
              <div className="text-[var(--brand-slate)]">{block.content.title}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-medium text-[var(--brand-dark-navy)] mb-4">Testimonial</h3>
      <div>
        <Label>Quote</Label>
        <Textarea
          value={block.content.quote}
          onChange={(e) => onUpdate({ quote: e.target.value })}
          className="mt-1"
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Author Name</Label>
          <Input
            value={block.content.author}
            onChange={(e) => onUpdate({ author: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Author Title</Label>
          <Input
            value={block.content.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

function CTABlockEditor({ block, onUpdate, isActive }: { block: Block; onUpdate: (content: any) => void; isActive: boolean }) {
  if (!isActive) {
    return (
      <div className="p-8 bg-[var(--brand-electric-blue)] text-white text-center">
        <h2 className="text-2xl font-bold mb-2">{block.content.title}</h2>
        <p className="text-lg mb-6 opacity-90">{block.content.subtitle}</p>
        <button className="bg-white text-[var(--brand-electric-blue)] px-8 py-3 rounded-lg font-medium">
          {block.content.buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-medium text-[var(--brand-dark-navy)] mb-4">Call to Action</h3>
      <div>
        <Label>Title</Label>
        <Input
          value={block.content.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Subtitle</Label>
        <Textarea
          value={block.content.subtitle}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Button Text</Label>
          <Input
            value={block.content.buttonText}
            onChange={(e) => onUpdate({ buttonText: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Button URL</Label>
          <Input
            value={block.content.buttonUrl}
            onChange={(e) => onUpdate({ buttonUrl: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

function FormBlockEditor({ block, onUpdate, isActive }: { block: Block; onUpdate: (content: any) => void; isActive: boolean }) {
  if (!isActive) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold text-center mb-2 text-[var(--brand-dark-navy)]">{block.content.title}</h2>
        <p className="text-center text-[var(--brand-slate)] mb-8">{block.content.subtitle}</p>
        <div className="max-w-md mx-auto space-y-4">
          {block.content.fields?.map((field: any, index: number) => (
            <div key={index}>
              <label className="block text-sm font-medium text-[var(--brand-dark-navy)] mb-1">
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <div className="w-full h-20 bg-[var(--brand-pale-blue)] rounded border"></div>
              ) : (
                <div className="w-full h-10 bg-[var(--brand-pale-blue)] rounded border"></div>
              )}
            </div>
          ))}
          <button className="w-full bg-[var(--brand-electric-blue)] text-white py-3 rounded-lg font-medium">
            {block.content.submitText}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h3 className="font-medium text-[var(--brand-dark-navy)] mb-4">Lead Form</h3>
      <div>
        <Label>Form Title</Label>
        <Input
          value={block.content.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Form Subtitle</Label>
        <Textarea
          value={block.content.subtitle}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          className="mt-1"
          rows={2}
        />
      </div>
      <div>
        <Label>Submit Button Text</Label>
        <Input
          value={block.content.submitText}
          onChange={(e) => onUpdate({ submitText: e.target.value })}
          className="mt-1"
        />
      </div>
    </div>
  );
}