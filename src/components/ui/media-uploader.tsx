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
        open: () => void;
        state: () => {
          get: (key: string) => {
            first: () => {
              toJSON: () => {
                filename: string;
                id: number;
                title: string;
                url: string;
              };
            };
          };
        };
      };
    };
  }
}

interface MediaUploaderProps {
  avatarSize?: string; 
  buttonText?: string; 
  className?: string;
  // Tailwind class like "h-32 w-32"
  fallbackText?: string;
  // attachment ID
  imageUrl?: string | null;
  // image URL
  onChange: (attachmentId: number | null, imageUrl: string | null) => void; 
  value?: number | null;
}

export function MediaUploader({
  avatarSize = 'h-32 w-32',
  buttonText = 'Upload Photo',
  className = '',
  fallbackText = 'N/A',
  imageUrl,
  onChange,
  value
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
      button: {
        text: 'Use this photo'
      },
      library: {
        type: 'image'
      },
      multiple: false,
      title: 'Select or Upload Photo'
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
          <AvatarImage alt="Profile photo" className="object-cover" src={currentImageUrl} />
        ) : (
          <AvatarFallback className="text-2xl">{fallbackText}</AvatarFallback>
        )}
      </Avatar>

      <div className="flex flex-col gap-2">
        <Button onClick={openMediaUploader} size="sm" type="button" variant="outline">
          <Upload className="mr-2 size-4" />
          {buttonText}
        </Button>

        {currentImageUrl && (
          <Button onClick={removeImage} size="sm" type="button" variant="destructive">
            <X className="mr-2 size-4" />
            Remove Photo
          </Button>
        )}
      </div>
    </div>
  );
}
