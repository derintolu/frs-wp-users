import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ProfileList() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [filterType, setFilterType] = useState("");
  const [guestsOnly, setGuestsOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [creatingUser, setCreatingUser] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, [filterType, guestsOnly, page]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: '20'
      });

      if (filterType) params.append('type', filterType);
      if (guestsOnly) params.append('guests_only', 'true');

      const response = await fetch(
        `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles?${params}`,
        {
          headers: {
            'X-WP-Nonce': wordpressPluginBoilerplate.nonce
          }
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      const data = await response.json();
      setProfiles(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getProfileTypeBadgeColor = (type) => {
    const colors = {
      loan_officer: 'bg-blue-500',
      realtor_partner: 'bg-green-500',
      staff: 'bg-purple-500',
      leadership: 'bg-red-500',
      assistant: 'bg-yellow-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const toggleSelectProfile = (profileId) => {
    setSelectedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const toggleSelectAll = () => {
    const guestProfiles = profiles.filter(p => !p.user_id);
    if (selectedProfiles.length === guestProfiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(guestProfiles.map(p => p.id));
    }
  };

  const createUserAccount = async (profileId) => {
    setCreatingUser(profileId);
    try {
      const response = await fetch(
        `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${profileId}/create-user`,
        {
          method: 'POST',
          headers: {
            'X-WP-Nonce': wordpressPluginBoilerplate.nonce,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ send_email: true })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create user account');
      }

      const data = await response.json();
      toast.success(`User account created: ${data.data.username}`);
      fetchProfiles(); // Refresh list
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreatingUser(null);
    }
  };

  const bulkCreateUsers = async () => {
    if (selectedProfiles.length === 0) {
      toast.error('Please select profiles first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/bulk-create-users`,
        {
          method: 'POST',
          headers: {
            'X-WP-Nonce': wordpressPluginBoilerplate.nonce,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            profile_ids: selectedProfiles,
            send_email: true
          })
        }
      );

      if (!response.ok) {
        throw new Error('Bulk create failed');
      }

      const data = await response.json();
      toast.success(data.message);
      setSelectedProfiles([]);
      fetchProfiles(); // Refresh list
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles.filter(profile => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      profile.first_name?.toLowerCase().includes(search) ||
      profile.last_name?.toLowerCase().includes(search) ||
      profile.email?.toLowerCase().includes(search) ||
      profile.nmls?.toLowerCase().includes(search) ||
      profile.nmls_number?.toLowerCase().includes(search)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg">Loading profiles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profiles</h2>
          <p className="text-muted-foreground">
            Manage user profiles and information
          </p>
        </div>
        <Link to="/profiles/new">
          <Button>Add New Profile</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Profiles</CardTitle>
              <CardDescription>
                A list of all profiles in the system
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search profiles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters and Bulk Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Profile Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="loan_officer">Loan Officers</SelectItem>
                <SelectItem value="realtor_partner">Real Estate Partners</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="assistant">Assistants</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={guestsOnly}
                onChange={(e) => setGuestsOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Guest Profiles Only</span>
            </label>

            {selectedProfiles.length > 0 && (
              <Button onClick={bulkCreateUsers} variant="default">
                Create {selectedProfiles.length} User Accounts
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    checked={
                      profiles.filter(p => !p.user_id).length > 0 &&
                      selectedProfiles.length === profiles.filter(p => !p.user_id).length
                    }
                    onChange={toggleSelectAll}
                    className="rounded"
                  />
                </TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>NMLS</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center">
                    No profiles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      {!profile.user_id && (
                        <input
                          type="checkbox"
                          checked={selectedProfiles.includes(profile.id)}
                          onChange={() => toggleSelectProfile(profile.id)}
                          className="rounded"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="w-12 h-12 rounded-full overflow-hidden">
                        {profile.headshot_url ? (
                          <img
                            src={profile.headshot_url}
                            alt={`${profile.first_name} ${profile.last_name}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-lg font-semibold text-gray-600">
                            {getInitials(profile.first_name, profile.last_name)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link to={`/profiles/${profile.id}`} className="hover:underline">
                        {profile.first_name} {profile.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${profile.email}`} className="hover:underline">
                        {profile.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      {profile.phone_number ? (
                        <a href={`tel:${profile.phone_number}`} className="hover:underline">
                          {profile.phone_number}
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.nmls || profile.nmls_number ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {profile.nmls || profile.nmls_number}
                        </code>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.select_person_type && (
                        <Badge
                          className={getProfileTypeBadgeColor(
                            profile.select_person_type
                          )}>
                          {profile.select_person_type.replace('_', ' ')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.user_id ? (
                        <Badge className="bg-green-500">Profile+</Badge>
                      ) : (
                        <Badge className="bg-yellow-500">Profile Only</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!profile.user_id && (
                        <Button
                          size="sm"
                          onClick={() => createUserAccount(profile.id)}
                          disabled={creatingUser === profile.id}
                          variant="default"
                        >
                          {creatingUser === profile.id ? 'Creating...' : 'Create User'}
                        </Button>
                      )}
                      <Link to={`/profiles/${profile.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      <Link to={`/profiles/${profile.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
