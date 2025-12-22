import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ProfileForm } from "@/admin/pages/settings/profile-form";
import { SyncSettings } from "@/admin/pages/settings/SyncSettings";
import SettingsLayout from "@/admin/pages/settings/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Settings() {
  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Settings</h3>
          <p className="text-sm text-muted-foreground">
            Manage your application settings and preferences.
          </p>
        </div>
        <Separator />

        <Tabs defaultValue="sync" className="space-y-4">
          <TabsList>
            <TabsTrigger value="sync">API Sync</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="sync" className="space-y-4">
            <SyncSettings />
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Profile</h3>
              <p className="text-sm text-muted-foreground">
                This is how others will see you on the site.
              </p>
            </div>
            <ProfileForm />
          </TabsContent>
        </Tabs>
      </div>
    </SettingsLayout>
  );
}