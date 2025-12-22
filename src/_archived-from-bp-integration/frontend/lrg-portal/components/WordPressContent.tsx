/**
 * WordPress Content Renderer
 * Fetches and displays WordPress page/post content
 */

import * as React from "react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface WordPressContentProps {
  /**
   * Post ID or slug to fetch
   */
  identifier: string | number;

  /**
   * Post type (page, post, or custom post type)
   */
  postType?: string;

  /**
   * Whether to use slug or ID for lookup
   */
  useSlug?: boolean;
}

interface WPPost {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  slug: string;
  date: string;
  modified: string;
}

export function WordPressContent({
  identifier,
  postType = 'pages',
  useSlug = false,
}: WordPressContentProps) {
  const [content, setContent] = useState<WPPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true);
        setError(null);

        // Build the API URL
        const baseUrl = `/wp-json/wp/v2/${postType}`;
        const url = useSlug
          ? `${baseUrl}?slug=${identifier}`
          : `${baseUrl}/${identifier}`;

        const response = await fetch(url, {
          credentials: 'same-origin',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        // If using slug, API returns array
        const post = useSlug ? data[0] : data;

        if (!post) {
          throw new Error('Content not found');
        }

        setContent(post);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load content';
        setError(errorMessage);
        console.error('WordPress content fetch error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [identifier, postType, useSlug]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Content</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!content) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No Content Found</AlertTitle>
        <AlertDescription>
          The requested content could not be found.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <article className="prose prose-slate dark:prose-invert max-w-none">
      <h1
        dangerouslySetInnerHTML={{ __html: content.title.rendered }}
      />
      <div
        dangerouslySetInnerHTML={{ __html: content.content.rendered }}
      />
    </article>
  );
}
