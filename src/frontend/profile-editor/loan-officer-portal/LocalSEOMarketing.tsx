import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface LocalSEOMarketingProps {
  userId: string;
  currentUser: any;
}

export function LocalSEOMarketing({ userId, currentUser }: LocalSEOMarketingProps) {
  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div
              className="text-2xl font-bold mb-2"
              style={{ color: 'var(--brand-primary-blue)' }}
            >
              Coming Soon
            </div>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Local SEO tools are in development
            </p>
          </div>
        </div>
        <Card className="blur-sm">
          <CardHeader>
            <CardTitle>Local SEO Management</CardTitle>
            <CardDescription>Optimize your local search presence and rankings</CardDescription>
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Local SEO optimization tools
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
