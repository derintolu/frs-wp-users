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
    arrive: 'Arrive Link',
    avatar_url: 'Avatar/Headshot URL',
    biography: 'Biography',
    brand: 'Brand',
    canva_folder_link: 'Canva Folder Link',
    city_state: 'City, State',
    created_at: 'Created At',
    date_of_birth: 'Date of Birth',
    dre_license: 'DRE License',
    email: 'Email',
    facebook_url: 'Facebook URL',
    first_name: 'First Name',
    headshot_id: 'Headshot ID',
    id: 'Profile ID',
    instagram_url: 'Instagram URL',
    job_title: 'Job Title',
    last_name: 'Last Name',
    license_number: 'License Number',
    linkedin_url: 'LinkedIn URL',
    mobile_number: 'Mobile Number',
    nmls: 'NMLS',
    nmls_number: 'NMLS Number',
    office: 'Office',
    phone_number: 'Phone Number',
    region: 'Region',
    status: 'Status',
    tiktok_url: 'TikTok URL',
    twitter_url: 'Twitter URL',
    updated_at: 'Updated At',
    user_id: 'User ID',
    youtube_url: 'YouTube URL',
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
      if (exportActiveOnly) {params.append('active_only', '1');}
      if (exportWithUsersOnly) {params.append('with_users_only', '1');}

      // Download via API
      const url = `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/export?${params.toString()}`;

      window.location.href = url;
      toast.success('Export started');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Export failed');
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
        body: formData,
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        },
        method: 'POST'
      });

      if (!response.ok) {throw new Error('Import failed');}

      const data = await response.json();
      toast.success(data.message || 'Import completed successfully');
      setImportFile(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Import failed');
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

      <Tabs className="space-y-4" defaultValue="export">
        <TabsList>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="export">
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
                <div className="mb-4 flex items-center justify-between">
                  <Label className="text-base font-semibold">Select Fields</Label>
                  <div className="flex gap-2">
                    <Button onClick={selectAllFields} size="sm" type="button" variant="outline">
                      Select All
                    </Button>
                    <Button onClick={deselectAllFields} size="sm" type="button" variant="outline">
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(availableFields).map(([key, label]) => (
                    <label className="flex cursor-pointer items-center space-x-2" key={key}>
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
                <Label className="mb-4 block text-base font-semibold">Filter Options</Label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <Checkbox
                      checked={exportActiveOnly}
                      onCheckedChange={setExportActiveOnly}
                    />
                    <span className="text-sm">Export active profiles only</span>
                  </label>
                  <label className="flex cursor-pointer items-center space-x-2">
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
                  <Download className="mr-2 size-4" />
                  Export to CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="import">
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
                <Label className="mb-4 block text-base font-semibold" htmlFor="import-file">
                  CSV File
                </Label>
                <Input
                  accept=".csv"
                  id="import-file"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  type="file"
                />
                {importFile && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Selected: {importFile.name}
                  </p>
                )}
              </div>

              {/* Import Options */}
              <div className="border-t pt-6">
                <Label className="mb-4 block text-base font-semibold">Import Options</Label>
                <div className="space-y-3">
                  <label className="flex cursor-pointer items-center space-x-2">
                    <Checkbox
                      checked={updateExisting}
                      onCheckedChange={setUpdateExisting}
                    />
                    <span className="text-sm">Update existing profiles if email matches</span>
                  </label>
                  <p className="ml-6 text-xs text-muted-foreground">
                    If unchecked, existing profiles will be skipped
                  </p>

                  <label className="flex cursor-pointer items-center space-x-2">
                    <Checkbox
                      checked={createUsers}
                      onCheckedChange={setCreateUsers}
                    />
                    <span className="text-sm">Create WordPress user accounts for profiles without users</span>
                  </label>
                  <p className="ml-6 text-xs text-muted-foreground">
                    Users will be created with role &quot;subscriber&quot; if not specified
                  </p>
                </div>
              </div>

              {/* CSV Format Help */}
              <div className="border-t pt-6">
                <Label className="mb-4 block text-base font-semibold">CSV Format</Label>
                <p className="mb-2 text-sm text-muted-foreground">
                  Your CSV should have column headers matching field names:
                </p>
                <code className="block rounded bg-muted p-3 text-xs">
                  first_name,last_name,email,phone_number,nmls,arrive
                  <br />
                  John,Doe,john@example.com,555-1234,123456,https://arrive.com/123456
                </code>
                <p className="mb-2 mt-4 text-sm text-muted-foreground">Available field names:</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.keys(availableFields).map(field => (
                    <code className="rounded bg-muted px-2 py-1" key={field}>{field}</code>
                  ))}
                </div>
                <div className="mt-4 rounded border border-blue-200 bg-blue-50 p-3">
                  <p className="mb-1 text-sm font-semibold">Auto-Generation:</p>
                  <p className="text-xs text-muted-foreground">
                    Arrive links will be automatically generated if arrive field is empty and NMLS is present.
                    <br />
                    Pattern: https://21stcenturylending.my1003app.com/{'{NMLS}'}/register
                  </p>
                </div>
              </div>

              {/* Import Button */}
              <div className="border-t pt-6">
                <Button disabled={!importFile || importing} onClick={handleImport}>
                  <Upload className="mr-2 size-4" />
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
