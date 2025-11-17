/**
 * WordPress Media Uploader Component
 *
 * Integrates with WordPress Media Library using wp.media API
 */
import { useState, useEffect } from 'react';
import { Button } from './button';
import { Upload, X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';

declare global {
  interface Window {
    wp: {
      media: (options: any) => {
        on: (event: string, callback: () => void) => void;
        state: () => {
          get: (key: string) => {
            first: () => {
              toJSON: () => {
                id: number;
                url: string;
                title: string;
                filename: string;
              };
            };
          };
        };
        open: () => void;
      };
    };
  }
}

interface MediaUploaderProps {
  value?: number | null; // attachment ID
  imageUrl?: string | null; // image URL
  onChange: (attachmentId: number | null, imageUrl: string | null) => void;
  buttonText?: string;
  className?: string;
  avatarSize?: string; // Tailwind class like "h-32 w-32"
  fallbackText?: string;
}

export function MediaUploader({
  value,
  imageUrl,
  onChange,
  buttonText = 'Upload Photo',
  className = '',
  avatarSize = 'h-32 w-32',
  fallbackText = 'N/A'
}: MediaUploaderProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(imageUrl || null);

  useEffect(() => {
    setCurrentImageUrl(imageUrl || null);
  }, [imageUrl]);

  const openMediaUploader = () => {
    // Check if wp.media is available
    if (!window.wp || !window.wp.media) {
      console.error('WordPress media library is not available');
      return;
    }

    // Create the media frame
    const frame = window.wp.media({
      title: 'Select or Upload Photo',
      button: {
        text: 'Use this photo'
      },
      multiple: false,
      library: {
        type: 'image'
      }
    });

    // When an image is selected
    frame.on('select', () => {
      const attachment = frame.state().get('selection').first().toJSON();
      setCurrentImageUrl(attachment.url);
      onChange(attachment.id, attachment.url);
    });

    // Open the modal
    frame.open();
  };

  const removeImage = () => {
    setCurrentImageUrl(null);
    onChange(null, null);
  };

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      <Avatar className={avatarSize}>
        {currentImageUrl ? (
          <AvatarImage src={currentImageUrl} alt="Profile photo" className="object-cover" />
        ) : (
          <AvatarFallback className="text-2xl">{fallbackText}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex flex-col gap-2">
        <Button type="button" onClick={openMediaUploader} variant="outline" size="sm">
          <Upload className="h-4 w-4 mr-2" />
          {buttonText}
        </Button>

        {currentImageUrl && (
          <Button type="button" onClick={removeImage} variant="destructive" size="sm">
            <X className="h-4 w-4 mr-2" />
            Remove Photo
          </Button>
        )}
      </div>
    </div>
  );
}
