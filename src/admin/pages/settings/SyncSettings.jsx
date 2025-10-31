import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

export function SyncSettings() {
  const [settings, setSettings] = useState({
    sync_loan_officers: true,
    sync_realtors: false,
    sync_staff: false,
    sync_leadership: false,
    sync_assistants: false
  });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/sync-settings`, {
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        }
      });
      if (settings.ok) {
        const data = await settings.json();
        if (data.data) {
          setSettings(data.data);
        }
      }
    } catch (error) {
      console.error('Failed to load sync settings:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/sync-stats`, {
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load sync stats:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/sync-settings`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast.success('Sync settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSync = async () => {
    setSyncing(true);
    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/trigger-sync`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message || 'Sync completed successfully');
        loadStats(); // Reload stats after sync
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleCheckboxChange = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>FRS API Sync Settings</CardTitle>
          <CardDescription>
            Configure which profile types to sync from the FRS API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sync_loan_officers}
                onChange={() => handleCheckboxChange('sync_loan_officers')}
                className="rounded"
              />
              <div>
                <div className="font-medium">Loan Officers</div>
                <div className="text-sm text-muted-foreground">Sync loan officer profiles from FRS API</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sync_realtors}
                onChange={() => handleCheckboxChange('sync_realtors')}
                className="rounded"
              />
              <div>
                <div className="font-medium">Real Estate Partners</div>
                <div className="text-sm text-muted-foreground">Sync realtor profiles from FRS API</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sync_staff}
                onChange={() => handleCheckboxChange('sync_staff')}
                className="rounded"
              />
              <div>
                <div className="font-medium">Staff</div>
                <div className="text-sm text-muted-foreground">Sync staff profiles from FRS API</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sync_leadership}
                onChange={() => handleCheckboxChange('sync_leadership')}
                className="rounded"
              />
              <div>
                <div className="font-medium">Leadership</div>
                <div className="text-sm text-muted-foreground">Sync leadership profiles from FRS API</div>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.sync_assistants}
                onChange={() => handleCheckboxChange('sync_assistants')}
                className="rounded"
              />
              <div>
                <div className="font-medium">Assistants</div>
                <div className="text-sm text-muted-foreground">Sync assistant profiles from FRS API</div>
              </div>
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveSettings} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button onClick={triggerSync} disabled={syncing} variant="outline">
              {syncing ? 'Syncing...' : 'Trigger Manual Sync'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Statistics</CardTitle>
            <CardDescription>
              Overview of synced profiles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-2xl font-bold">{stats.total_profiles || 0}</div>
                <div className="text-sm text-muted-foreground">Total Profiles</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.synced_profiles || 0}</div>
                <div className="text-sm text-muted-foreground">Synced from API</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.guest_profiles || 0}</div>
                <div className="text-sm text-muted-foreground">Guest Profiles</div>
              </div>
            </div>
            {stats.last_sync && (
              <div className="text-sm text-muted-foreground">
                Last sync: {new Date(stats.last_sync * 1000).toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
