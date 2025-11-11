import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

interface EmailCampaignsMarketingProps {
  userId: string;
  currentUser: any;
}

export function EmailCampaignsMarketing({ userId, currentUser }: EmailCampaignsMarketingProps) {
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
              Email campaigns feature is in development
            </p>
          </div>
        </div>
        <Card className="blur-sm">
          <CardHeader>
            <CardTitle>Email Campaigns</CardTitle>
            <CardDescription>Create and manage email marketing campaigns</CardDescription>
          </CardHeader>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              Email campaign management tools
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
