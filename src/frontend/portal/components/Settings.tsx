import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SettingsProps {
  userId: string;
}

export function Settings({ userId }: SettingsProps) {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
