import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, Edit, Trash2, Archive, ArchiveRestore, Merge, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { Profile, ProfilesApiResponse } from "@/admin/types/profile";

// Utility function to safely parse service areas
function parseServiceAreas(serviceAreas: string[] | string | null | undefined): string[] {
  if (!serviceAreas) {return [];}
  if (Array.isArray(serviceAreas)) {return serviceAreas;}
  if (typeof serviceAreas === 'string') {
    try {
      const parsed = JSON.parse(serviceAreas);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function ProfileList() {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProfiles, setSelectedProfiles] = useState<number[]>([]);
  const [filterType, setFilterType] = useState<string>("");
  const [guestsOnly, setGuestsOnly] = useState<boolean>(false);
  const [showArchived, setShowArchived] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [creatingUser, setCreatingUser] = useState<number | null>(null);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("first_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const fetchProfiles = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        order: sortOrder,
        orderby: sortBy,
        page: page.toString(),
        per_page: '20'
      });

      if (filterType) {params.append('type', filterType);}
      if (guestsOnly) {params.append('guests_only', 'true');}
      if (showArchived) {params.append('show_archived', 'true');}
      if (searchTerm) {params.append('search', searchTerm);}

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
      const data: ProfilesApiResponse = await response.json();
      setProfiles(data.data || []);
      setTotalPages(data.pages || 1);
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'An error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [filterType, guestsOnly, showArchived, page, sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const getInitials = (firstName: string | null, lastName: string | null): string => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getProfileTypeBadgeColor = (type: string): string => {
    const colors: Record<string, string> = {
      assistant: 'bg-yellow-500',
      leadership: 'bg-red-500',
      loan_officer: 'bg-blue-500',
      pending_lo: 'bg-orange-500',
      realtor_partner: 'bg-green-500',
      staff: 'bg-purple-500',
    };
    return colors[type] || 'bg-gray-500';
  };

  const toggleSelectProfile = (profileId: number): void => {
    setSelectedProfiles(prev =>
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const toggleSelectAll = (): void => {
    if (selectedProfiles.length === profiles.length) {
      setSelectedProfiles([]);
    } else {
      setSelectedProfiles(profiles.map(p => p.id));
    }
  };

  const createUserAccount = async (profileId: number): Promise<void> => {
    setCreatingUser(profileId);
    try {
      const response = await fetch(
        `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${profileId}/create-user`,
        {
          body: JSON.stringify({ send_email: true }),
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wordpressPluginBoilerplate.nonce
          },
          method: 'POST'
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create user account');
      }

      const data = await response.json();
      toast.success(`User account created: ${data.data.username}`);
      fetchProfiles(); // Refresh list
    } catch (error_) {
      toast.error(error_.message);
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
          body: JSON.stringify({
            profile_ids: selectedProfiles,
            send_email: true
          }),
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wordpressPluginBoilerplate.nonce
          },
          method: 'POST'
        }
      );

      if (!response.ok) {
        throw new Error('Bulk create failed');
      }

      const data = await response.json();
      toast.success(data.message);
      setSelectedProfiles([]);
      fetchProfiles(); // Refresh list
    } catch (error_) {
      toast.error(error_.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProfile = async (profileId: number): Promise<void> => {
    if (!confirm('Are you sure you want to delete this profile?')) {return;}

    try {
      const response = await fetch(
        `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${profileId}`,
        {
          headers: {
            'X-WP-Nonce': wordpressPluginBoilerplate.nonce
          },
          method: 'DELETE'
        }
      );

      if (!response.ok) {throw new Error('Failed to delete profile');}

      toast.success('Profile deleted successfully');
      fetchProfiles();
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'Failed to delete profile';
      toast.error(errorMessage);
    }
  };

  const archiveProfile = async (profileId: number): Promise<void> => {
    try {
      const response = await fetch(
        `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${profileId}`,
        {
          body: JSON.stringify({ is_active: 0 }),
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wordpressPluginBoilerplate.nonce
          },
          method: 'PUT'
        }
      );

      if (!response.ok) {throw new Error('Failed to archive profile');}

      toast.success('Profile archived');
      fetchProfiles();
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'Failed to archive profile';
      toast.error(errorMessage);
    }
  };

  const unarchiveProfile = async (profileId: number): Promise<void> => {
    try {
      const response = await fetch(
        `${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles/${profileId}`,
        {
          body: JSON.stringify({ is_active: 1 }),
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': wordpressPluginBoilerplate.nonce
          },
          method: 'PUT'
        }
      );

      if (!response.ok) {throw new Error('Failed to unarchive profile');}

      toast.success('Profile unarchived');
      fetchProfiles();
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'Failed to unarchive profile';
      toast.error(errorMessage);
    }
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedProfiles.length === 0) {
      toast.error('Please select profiles and an action');
      return;
    }

    switch (bulkAction) {
      case 'bulk_create_users':
        bulkCreateUsers();
        break;
      case 'bulk_archive':
        bulkArchiveProfiles();
        break;
      case 'bulk_unarchive':
        bulkUnarchiveProfiles();
        break;
      case 'bulk_merge':
        if (selectedProfiles.length < 2) {
          toast.error('Please select at least 2 profiles to merge');
          return;
        }
        window.location.href = `/wp-admin/admin.php?page=frs-profile-merge&profile_ids=${selectedProfiles.join(',')}`;
        break;
    }
  };

  const bulkArchiveProfiles = async () => {
    setLoading(true);
    try {
      for (const id of selectedProfiles) {
        await archiveProfile(id);
      }
      toast.success(`Archived ${selectedProfiles.length} profiles`);
      setSelectedProfiles([]);
      setBulkAction("");
      fetchProfiles();
    } catch (error_) {
      toast.error(error_.message);
    } finally {
      setLoading(false);
    }
  };

  const bulkUnarchiveProfiles = async () => {
    setLoading(true);
    try {
      for (const id of selectedProfiles) {
        await unarchiveProfile(id);
      }
      toast.success(`Unarchived ${selectedProfiles.length} profiles`);
      setSelectedProfiles([]);
      setBulkAction("");
      fetchProfiles();
    } catch (error_) {
      toast.error(error_.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProfiles = profiles
    .filter(profile => {
      if (!searchTerm) {return true;}
      const search = searchTerm.toLowerCase();
      return (
        profile.first_name?.toLowerCase().includes(search) ||
        profile.last_name?.toLowerCase().includes(search) ||
        profile.email?.toLowerCase().includes(search) ||
        profile.nmls?.toLowerCase().includes(search) ||
        profile.nmls_number?.toLowerCase().includes(search)
      );
    });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profiles</h1>
          <p className="text-sm text-muted-foreground">
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
              <CardTitle className="text-lg">All Profiles</CardTitle>
              <CardDescription className="text-sm">
                A list of all profiles in the system
              </CardDescription>
            </div>
            <Input
              className="max-w-sm"
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search profiles..."
              value={searchTerm}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Bulk Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <Select onValueChange={(value) => setFilterType(value === "all" ? "" : value)} value={filterType || "all"}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Profile Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Profile Types</SelectItem>
                <SelectItem value="loan_officer">Loan Officers</SelectItem>
                <SelectItem value="pending_lo">Pending LOs (No NMLS)</SelectItem>
                <SelectItem value="realtor_partner">Real Estate Partners</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="leadership">Leadership</SelectItem>
                <SelectItem value="assistant">Assistants</SelectItem>
              </SelectContent>
            </Select>

            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={guestsOnly}
                onCheckedChange={setGuestsOnly}
              />
              <span className="text-sm">Guest Profiles Only</span>
            </label>

            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={showArchived}
                onCheckedChange={setShowArchived}
              />
              <span className="text-sm">Show Archived</span>
            </label>

            {selectedProfiles.length > 0 && (
              <div className="flex items-center gap-2">
                <Select onValueChange={setBulkAction} value={bulkAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulk_create_users">Create User Accounts</SelectItem>
                    <SelectItem value="bulk_archive">Archive</SelectItem>
                    <SelectItem value="bulk_unarchive">Unarchive</SelectItem>
                    <SelectItem value="bulk_merge">Merge Profiles</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleBulkAction} variant="default">
                  Apply to {selectedProfiles.length} selected
                </Button>
              </div>
            )}
          </div>

          {/* Pagination - Top */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  size="sm"
                  variant="outline"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={
                      profiles.length > 0 &&
                      selectedProfiles.length === profiles.length
                    }
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Photo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>NMLS</TableHead>
                <TableHead>Service Areas</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12 text-center">Public</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={11}>
                    No profiles found
                  </TableCell>
                </TableRow>
              ) : (
                filteredProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProfiles.includes(profile.id)}
                        onCheckedChange={() => toggleSelectProfile(profile.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Avatar className="size-16">
                        {profile.headshot_url ? (
                          <AvatarImage
                            alt={`${profile.first_name} ${profile.last_name}`}
                            className="object-cover"
                            src={profile.headshot_url}
                          />
                        ) : (
                          <AvatarFallback className="text-lg">
                            {getInitials(profile.first_name, profile.last_name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link className="text-primary hover:underline" to={`/profiles/${profile.id}`}>
                        {profile.first_name} {profile.last_name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <a className="hover:underline" href={`mailto:${profile.email}`}>
                        {profile.email}
                      </a>
                    </TableCell>
                    <TableCell>
                      {profile.phone_number ? (
                        <a className="hover:underline" href={`tel:${profile.phone_number}`}>
                          {profile.phone_number}
                        </a>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.nmls || profile.nmls_number ? (
                        <code className="rounded bg-muted px-2 py-1 text-xs">
                          {profile.nmls || profile.nmls_number}
                        </code>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const areas = parseServiceAreas(profile.service_areas);
                        if (areas.length === 0) {return '—';}

                        return (
                          <div className="flex flex-wrap gap-1">
                            {areas.slice(0, 2).map((area, idx) => (
                              <Badge className="text-xs" key={idx} variant="outline">
                                {area}
                              </Badge>
                            ))}
                            {areas.length > 2 && (
                              <Badge className="text-xs" variant="secondary">
                                +{areas.length - 2}
                              </Badge>
                            )}
                          </div>
                        );
                      })()}
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
                      <div className="flex items-center gap-2">
                        {!profile.is_active ? (
                          <Badge className="bg-gray-100" variant="outline">Archived</Badge>
                        ) : profile.user_id ? (
                          <Badge variant="default">Profile+</Badge>
                        ) : (
                          <Badge variant="secondary">Profile Only</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {profile.profile_slug ? (
                        <Button
                          className="size-8"
                          onClick={() => {
                            const publicUrl = `${window.location.origin}/profile/${profile.profile_slug}`;
                            window.open(publicUrl, '_blank');
                          }}
                          size="icon"
                          title="View Public Profile"
                          variant="ghost"
                        >
                          <ExternalLink className="size-4 text-blue-600" />
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button className="size-8" size="icon" variant="ghost">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link className="flex cursor-pointer items-center" to={`/profiles/${profile.id}`}>
                              <Eye className="mr-2 size-4" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link className="flex cursor-pointer items-center" to={`/profiles/${profile.id}/edit`}>
                              <Edit className="mr-2 size-4" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const slug = profile.profile_slug || `${profile.first_name}-${profile.last_name}`.toLowerCase().replaceAll(/\s+/g, '-');
                              const publicUrl = `${window.location.origin}/profile/${slug}`;
                              window.open(publicUrl, '_blank');
                            }}
                          >
                            <ExternalLink className="mr-2 size-4" />
                            View Public Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              const fluentUrl = `/wp-admin/admin.php?page=fluentcrm-admin#/subscribers/${profile.email}`;
                              window.open(fluentUrl, '_blank');
                            }}
                          >
                            <ExternalLink className="mr-2 size-4" />
                            View FluentCRM Profile
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {profile.is_active ? (
                            <DropdownMenuItem onClick={() => archiveProfile(profile.id)}>
                              <Archive className="mr-2 size-4" />
                              Archive
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => unarchiveProfile(profile.id)}>
                              <ArchiveRestore className="mr-2 size-4" />
                              Unarchive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              window.location.href = `/wp-admin/admin.php?page=frs-profile-merge-select&source_id=${profile.id}`;
                            }}
                          >
                            <Merge className="mr-2 size-4" />
                            Merge with...
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteProfile(profile.id)}
                          >
                            <Trash2 className="mr-2 size-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  size="sm"
                  variant="outline"
                >
                  Previous
                </Button>
                <Button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  size="sm"
                  variant="outline"
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
