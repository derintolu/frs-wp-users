1import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, Download, CheckCircle, AlertCircle, ArrowLeft, FileText } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface RealtorUploadResult {
  success: boolean;
  email: string;
  first_name: string;
  last_name: string;
  message?: string;
}

export function BulkUploadRealtors() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<RealtorUploadResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
        setError('Please upload a CSV or Excel file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setUploadResults([]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !id) return;

    setIsUploading(true);
    setError(null);

    try {
      // Parse CSV file
      const text = await selectedFile.text();
      const lines = text.split('\n').filter(line => line.trim());

      // Skip header row and parse data
      const realtors = lines.slice(1).map(line => {
        const [email, first_name, last_name, phone] = line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''));
        return { email, first_name, last_name, phone };
      }).filter(r => r.email); // Only include rows with email

      if (realtors.length === 0) {
        setError('No valid realtor data found in the file');
        setIsUploading(false);
        return;
      }

      // Upload to API
      const response = await fetch(`/wp-json/lrh/v1/partner-companies/${id}/realtors`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '',
        },
        body: JSON.stringify({ realtors }),
      });

      if (!response.ok) {
        throw new Error('Failed to upload realtors');
      }

      const result = await response.json();
      setUploadResults(result.results || []);
    } catch (err) {
      console.error('Failed to upload realtors:', err);
      setError('Failed to upload realtors. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create CSV template
    const csvContent = 'email,first_name,last_name,phone\njohn.doe@example.com,John,Doe,555-1234\njane.smith@example.com,Jane,Smith,555-5678';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'realtor_upload_template.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const successCount = uploadResults.filter(r => r.success).length;
  const failureCount = uploadResults.filter(r => !r.success).length;

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/partnerships/companies`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partner Companies
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bulk Upload Realtors</h1>
          <p className="text-gray-600 text-lg">Upload a CSV file to add multiple realtors to this partner company</p>
        </div>

        {/* Upload Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Upload Realtor Data</CardTitle>
            <CardDescription>
              Upload a CSV file with realtor information. The file should include email, first name, last name, and phone number.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Download Template Button */}
            <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Need a template?</p>
                  <p className="text-sm text-gray-600">Download our CSV template to get started</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Template
              </Button>
            </div>

            {/* File Input */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileSelect}
                className="hidden"
              />
              {selectedFile ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose Different File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-1">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-600">CSV or Excel files only</p>
                  </div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: 'var(--gradient-hero)', color: 'white' }}
                  >
                    Select File
                  </Button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full"
                style={{ background: 'var(--gradient-hero)', color: 'white' }}
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Realtors
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        {uploadResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Results</CardTitle>
              <CardDescription>
                {successCount} successful, {failureCount} failed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {uploadResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {result.first_name} {result.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{result.email}</p>
                      </div>
                    </div>
                    {result.message && (
                      <p className={`text-sm ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                        {result.message}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {successCount > 0 && (
                <Button
                  onClick={() => navigate('/partnerships/companies')}
                  className="w-full mt-6"
                  style={{ background: 'var(--gradient-hero)', color: 'white' }}
                >
                  Done
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>CSV Format Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-gray-600">
              <p>Your CSV file should have the following columns:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>email</strong> - Realtor's email address (required)</li>
                <li><strong>first_name</strong> - First name (required)</li>
                <li><strong>last_name</strong> - Last name (required)</li>
                <li><strong>phone</strong> - Phone number (optional)</li>
              </ul>
              <p className="mt-4">
                <strong>Note:</strong> If a user with the email already exists, they will be added to the partner company's BuddyPress group.
                If they don't exist, a new WordPress user will be created automatically.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
