import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { PageHeader } from './PageHeader';
import {
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Users
} from 'lucide-react';

interface User {
  id: number;
  name: string;
  email: string;
  has_calendar: boolean;
  setup_complete: boolean;
}

export function CalendarReset() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const nonce = (window as any).frsCalendarAdmin?.restNonce;
      const response = await fetch('/wp-json/frs/v1/calendar/users', {
        headers: {
          'X-WP-Nonce': nonce,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleReset = async () => {
    if (selectedUsers.length === 0) {
      setError('Please select at least one user');
      return;
    }

    if (!confirm(`Reset calendar setup for ${selectedUsers.length} user(s)? They will see the setup wizard on next visit.`)) {
      return;
    }

    try {
      setResetting(true);
      setError(null);
      setSuccess(null);

      const nonce = (window as any).frsCalendarAdmin?.restNonce;
      const response = await fetch('/wp-json/frs/v1/calendar/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          user_ids: selectedUsers,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset calendars');
      }

      const data = await response.json();
      setSuccess(`Successfully reset calendar setup for ${data.reset_count} user(s)`);
      setSelectedUsers([]);

      // Reload users to see updated status
      await loadUsers();
    } catch (err) {
      console.error('Failed to reset calendars:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset calendars');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Calendar Setup Reset"
        description="Reset calendar setup for loan officers to show wizard again"
        icon={Calendar}
      />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Loan Officers
            </span>
            {selectedUsers.length > 0 && (
              <Button
                onClick={handleReset}
                disabled={resetting}
                variant="destructive"
                size="sm"
              >
                {resetting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset {selectedUsers.length} User(s)
                  </>
                )}
              </Button>
            )}
          </CardTitle>
          <CardDescription>
            Select users to reset their calendar setup wizard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Loading users...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No loan officers found
            </div>
          ) : (
            <div className="space-y-4">
              {/* Select All */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Checkbox
                  id="select-all"
                  checked={selectedUsers.length === users.length}
                  onCheckedChange={handleSelectAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-medium cursor-pointer flex-1"
                >
                  Select All ({users.length} users)
                </label>
              </div>

              {/* User List */}
              <div className="space-y-2">
                {users.map(user => (
                  <div
                    key={user.id}
                    className={`flex items-center gap-3 p-4 rounded-lg border transition-colors ${
                      selectedUsers.includes(user.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => handleSelectUser(user.id)}
                    />
                    <label
                      htmlFor={`user-${user.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </label>
                    <div className="flex gap-2">
                      {user.has_calendar ? (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Calendar className="mr-1 h-3 w-3" />
                          Has Calendar
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                          No Calendar
                        </Badge>
                      )}
                      {user.setup_complete ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Setup Done
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <AlertCircle className="mr-1 h-3 w-3" />
                          Needs Setup
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Bar */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-sm font-medium text-blue-900">
                    {selectedUsers.length} user(s) selected
                  </span>
                  <Button
                    onClick={handleReset}
                    disabled={resetting}
                    variant="destructive"
                  >
                    {resetting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Reset Calendar Setup
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2 text-blue-900">What does this do?</h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Removes the "setup complete" flag from selected users</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Forces the setup wizard to show on their next calendar visit</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Does NOT delete existing calendars - only resets the wizard flag</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>Useful for testing or re-onboarding users</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
