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

export default function ProfileList() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch(`${wordpressPluginBoilerplate.apiUrl}frs-users/v1/profiles`, {
        headers: {
          'X-WP-Nonce': wordpressPluginBoilerplate.nonce
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch profiles');
      }
      const data = await response.json();
      setProfiles(data.data || []);
    } catch (err) {
      setError(err.message);
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
          <CardTitle>All Profiles</CardTitle>
          <CardDescription>
            A list of all profiles in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
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
              {profiles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No profiles found
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={profile.headshot_url} />
                        <AvatarFallback>
                          {getInitials(profile.first_name, profile.last_name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      {profile.first_name} {profile.last_name}
                    </TableCell>
                    <TableCell>{profile.email}</TableCell>
                    <TableCell>{profile.phone_number || '—'}</TableCell>
                    <TableCell>
                      {profile.nmls || profile.nmls_number ? (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
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
                        <Badge variant="success">Profile+</Badge>
                      ) : (
                        <Badge variant="warning">Profile Only</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
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
        </CardContent>
      </Card>
    </div>
  );
}
