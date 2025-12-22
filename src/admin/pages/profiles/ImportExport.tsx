import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";

export default function ImportExport() {
  const [selectedExportFields, setSelectedExportFields] = useState<string[]>([
    'first_name', 'last_name', 'email', 'phone_number', 'nmls', 'arrive', 'avatar_url'
  ]);
  const [exportActiveOnly, setExportActiveOnly] = useState(false);
  const [exportWithUsersOnly, setExportWithUsersOnly] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [updateExisting, setUpdateExisting] = useState(true);
  const [createUsers, setCreateUsers] = useState(false);
  const [importing, setImporting] = useState(false);

  const availableFields: Record<string, string> = {
    id: 'Profile ID',
    user_id: 'User ID',
    first_name: 'First Name',
    last_name: 'Last Name',
    email: 'Email',
    phone_number: 'Phone Number',
    mobile_number: 'Mobile Number',
    office: 'Office',
    headshot_id: 'Headshot ID',
    avatar_url: 'Avatar/Headshot URL',
    job_title: 'Job Title',
    biography: 'Biography',
    date_of_birth: 'Date of Birth',
    nmls: 'NMLS',
    nmls_number: 'NMLS Number',
    license_number: 'License Number',
    dre_license: 'DRE License',
    brand: 'Brand',
    city_state: 'City, State',
    region: 'Region',
    facebook_url: 'Facebook URL',
    instagram_url: 'Instagram URL',
    linkedin_url: 'LinkedIn URL',
    twitter_url: 'Twitter URL',
    youtube_url: 'YouTube URL',
    tiktok_url: 'TikTok URL',
    arrive: 'Arrive Link',
    canva_folder_link: 'Canva Folder Link',
    status: 'Status',
    created_at: 'Created At',
    updated_at: 'Updated At',
  };

  const toggleField = (field: string) => {
    if (selectedExportFields.includes(field)) {
      setSelectedExportFields(selectedExportFields.filter(f => f !== field));
    } else {
      setSelectedExportFields([...selectedExportFields, field]);
    }
  };

  const selectAllFields = () => {
    setSelectedExportFields(Object.keys(availableFields));
  };

  const deselectAllFields = () => {
    setSelectedExportFields([]);
  };

  const handleExport = async () => {
    if (selectedExportFields.length === 0) {
      toast.error('Please select at least one field to export');
      return;
    }

    try {
      // Build query parameters
      const params = new URLSearchParams();
      selectedExportFields.forEach(field => params.append('fields[]', field));
      if (exportActiveOnly) params.append('active_only', '1');
      if (exportWithUsersOnly) params.append('with_users_only', '1');

      // Download via API
      const url = `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/export?${params.toString()}`;

      window.location.href = url;
      toast.success('Export started');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Export failed');
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    setImporting(true);
    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('update_existing', updateExisting ? '1' : '0');
    formData.append('create_users', createUsers ? '1' : '0');

    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/import`, {
        method: 'POST',
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        },
        body: formData
      });

      if (!response.ok) throw new Error('Import failed');

      const data = await response.json();
      toast.success(data.message || 'Import completed successfully');
      setImportFile(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import / Export Profiles</h1>
        <p className="text-sm text-muted-foreground">
          Export profiles to CSV or import profiles from CSV file
        </p>
      </div>

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Export Profiles to CSV</CardTitle>
              <CardDescription>
                Select the fields you want to include in the export
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Field Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-base font-semibold">Select Fields</Label>
                  <div className="flex gap-2">
                    <Button type="button" onClick={selectAllFields} variant="outline" size="sm">
                      Select All
                    </Button>
                    <Button type="button" onClick={deselectAllFields} variant="outline" size="sm">
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(availableFields).map(([key, label]) => (
                    <label key={key} className="flex items-center space-x-2 cursor-pointer">
                      <Checkbox
                        checked={selectedExportFields.includes(key)}
                        onCheckedChange={() => toggleField(key)}
                      />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Options */}
              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">Filter Options</Label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={exportActiveOnly}
                      onCheckedChange={setExportActiveOnly}
                    />
                    <span className="text-sm">Export active profiles only</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={exportWithUsersOnly}
                      onCheckedChange={setExportWithUsersOnly}
                    />
                    <span className="text-sm">Export profiles with WordPress users only</span>
                  </label>
                </div>
              </div>

              {/* Export Button */}
              <div className="border-t pt-6">
                <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export to CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Profiles from CSV</CardTitle>
              <CardDescription>
                Upload a CSV file to import profiles. The first row should contain column headers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* File Upload */}
              <div>
                <Label htmlFor="import-file" className="text-base font-semibold mb-4 block">
                  CSV File
                </Label>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                />
                {importFile && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Selected: {importFile.name}
                  </p>
                )}
              </div>

              {/* Import Options */}
              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">Import Options</Label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={updateExisting}
                      onCheckedChange={setUpdateExisting}
                    />
                    <span className="text-sm">Update existing profiles if email matches</span>
                  </label>
                  <p className="text-xs text-muted-foreground ml-6">
                    If unchecked, existing profiles will be skipped
                  </p>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={createUsers}
                      onCheckedChange={setCreateUsers}
                    />
                    <span className="text-sm">Create WordPress user accounts for profiles without users</span>
                  </label>
                  <p className="text-xs text-muted-foreground ml-6">
                    Users will be created with role "subscriber" if not specified
                  </p>
                </div>
              </div>

              {/* CSV Format Help */}
              <div className="border-t pt-6">
                <Label className="text-base font-semibold mb-4 block">CSV Format</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Your CSV should have column headers matching field names:
                </p>
                <code className="block text-xs bg-muted p-3 rounded">
                  first_name,last_name,email,phone_number,nmls,arrive
                  <br />
                  John,Doe,john@example.com,555-1234,123456,https://arrive.com/123456
                </code>
                <p className="text-sm text-muted-foreground mt-4 mb-2">Available field names:</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.keys(availableFields).map(field => (
                    <code key={field} className="bg-muted px-2 py-1 rounded">{field}</code>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-semibold mb-1">Auto-Generation:</p>
                  <p className="text-xs text-muted-foreground">
                    Arrive links will be automatically generated if arrive field is empty and NMLS is present.
                    <br />
                    Pattern: https://21stcenturylending.my1003app.com/{'{NMLS}'}/register
                  </p>
                </div>
              </div>

              {/* Import Button */}
              <div className="border-t pt-6">
                <Button onClick={handleImport} disabled={!importFile || importing}>
                  <Upload className="mr-2 h-4 w-4" />
                  {importing ? 'Importing...' : 'Import CSV'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
