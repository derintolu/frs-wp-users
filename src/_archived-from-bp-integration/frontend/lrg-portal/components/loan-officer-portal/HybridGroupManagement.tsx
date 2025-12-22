/**
 * Hybrid Group Management - Individual Partner Company View
 *
 * Shows detailed view of a single partner company with BP group integration.
 * Tabs: Overview, Activity, Members, Invites (admin/mod only)
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Building2,
  Users,
  Activity,
  TrendingUp,
  ArrowLeft,
  Settings,
  UserPlus,
  Mail,
  Trash2,
  Send,
} from 'lucide-react';

interface Member {
  id: number;
  name: string;
  avatar_url: string;
  role: 'admin' | 'mod' | 'member';
}

interface ActivityItem {
  id: number;
  user_id: number;
  user_name: string;
  avatar_url: string;
  content: string;
  date: string;
  type: string;
}

interface PartnerCompany {
  id: number;
  name: string;
  description: string;
  slug: string;
  avatar_urls: {
    full: string;
    thumb: string;
  };
  member_count: number;
  user_role: 'admin' | 'mod' | 'member';
  branding: {
    primary_color: string;
    secondary_color: string;
    button_style: string;
  };
  stats: {
    activity_count: number;
    page_views: number;
  };
  members: Member[];
}

export function HybridGroupManagement() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<PartnerCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Members state
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Activity state
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activityContent, setActivityContent] = useState('');
  const [postingActivity, setPostingActivity] = useState(false);

  // Invite dialog state
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (slug) {
      loadCompanyData();
    }
  }, [slug]);

  useEffect(() => {
    if (slug && activeTab === 'members') {
      loadMembers();
    }
  }, [slug, activeTab]);

  useEffect(() => {
    if (slug && activeTab === 'activity') {
      loadActivity();
    }
  }, [slug, activeTab]);

  const getNonce = () => {
    return (window as any).wpApiSettings?.nonce || (window as any).frsPortalConfig?.restNonce || '';
  };

  const loadCompanyData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/wp-json/lrh/v1/partner-companies/by-slug/${slug}`, {
        credentials: 'include',
        headers: {
          'X-WP-Nonce': getNonce(),
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load company data');
      }

      const result = await response.json();
      setCompany(result.data);
    } catch (err) {
      console.error('Failed to load company:', err);
      setError('Failed to load partner company. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      setLoadingMembers(true);

      const response = await fetch(`/wp-json/lrh/v1/partner-companies/by-slug/${slug}/members`, {
        credentials: 'include',
        headers: {
          'X-WP-Nonce': getNonce(),
        },
      });

      if (response.ok) {
        const result = await response.json();
        setMembers(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadActivity = async () => {
    try {
      setLoadingActivity(true);

      const response = await fetch(`/wp-json/lrh/v1/partner-companies/by-slug/${slug}/activity`, {
        credentials: 'include',
        headers: {
          'X-WP-Nonce': getNonce(),
        },
      });

      if (response.ok) {
        const result = await response.json();
        setActivities(result.data || []);
      }
    } catch (err) {
      console.error('Failed to load activity:', err);
    } finally {
      setLoadingActivity(false);
    }
  };

  const handlePostActivity = async () => {
    if (!activityContent.trim()) return;

    try {
      setPostingActivity(true);

      const response = await fetch(`/wp-json/lrh/v1/partner-companies/by-slug/${slug}/activity`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': getNonce(),
        },
        body: JSON.stringify({ content: activityContent }),
      });

      if (response.ok) {
        setActivityContent('');
        loadActivity(); // Reload activity
      } else {
        throw new Error('Failed to post activity');
      }
    } catch (err) {
      console.error('Failed to post activity:', err);
      alert('Failed to post activity. Please try again.');
    } finally {
      setPostingActivity(false);
    }
  };

  const handleSendInvite = async () => {
    if (!inviteUserId) {
      alert('Please enter a user ID');
      return;
    }

    try {
      setSendingInvite(true);

      const response = await fetch(`/wp-json/lrh/v1/partner-companies/by-slug/${slug}/invite`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': getNonce(),
        },
        body: JSON.stringify({ user_id: parseInt(inviteUserId) }),
      });

      if (response.ok) {
        alert('Invite sent successfully!');
        setInviteDialogOpen(false);
        setInviteEmail('');
        setInviteUserId('');
      } else {
        const result = await response.json();
        throw new Error(result.message || 'Failed to send invite');
      }
    } catch (err: any) {
      console.error('Failed to send invite:', err);
      alert(err.message || 'Failed to send invite. Please try again.');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      const response = await fetch(`/wp-json/lrh/v1/partner-companies/by-slug/${slug}/members/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'X-WP-Nonce': getNonce(),
        },
      });

      if (response.ok) {
        loadMembers(); // Reload members
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (err) {
      console.error('Failed to remove member:', err);
      alert('Failed to remove member. Please try again.');
    }
  };

  const handleChangeMemberRole = async (userId: number, newRole: string) => {
    try {
      const response = await fetch(`/wp-json/lrh/v1/partner-companies/by-slug/${slug}/members/${userId}/role`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': getNonce(),
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        loadMembers(); // Reload members
      } else {
        throw new Error('Failed to change member role');
      }
    } catch (err) {
      console.error('Failed to change member role:', err);
      alert('Failed to change member role. Please try again.');
    }
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Loading partner company...</p>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4">
            {error || 'Company not found'}
          </div>
          <Button onClick={handleBackClick} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partnerships
          </Button>
        </div>
      </div>
    );
  }

  const isAdmin = company.user_role === 'admin';
  const isMod = company.user_role === 'mod';
  const canManage = isAdmin || isMod;

  return (
    <div className="w-full min-h-screen p-4 md:p-8 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <Button onClick={handleBackClick} variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Partnerships
          </Button>
        </div>

        {/* Company Header */}
        <Card className="mb-6">
          <CardHeader
            className="pb-8"
            style={{
              background: `linear-gradient(135deg, ${company.branding.primary_color} 0%, ${company.branding.secondary_color} 100%)`,
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white/20">
                  <AvatarImage src={company.avatar_urls.full} alt={company.name} />
                  <AvatarFallback>
                    <Building2 className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl text-white mb-2">{company.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      {company.user_role === 'admin' && 'Administrator'}
                      {company.user_role === 'mod' && 'Moderator'}
                      {company.user_role === 'member' && 'Member'}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white border-0">
                      <Users className="h-3 w-3 mr-1" />
                      {company.member_count} Members
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700">{company.description || 'No description available.'}</p>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Members</p>
                  <p className="text-3xl font-bold text-gray-900">{company.member_count}</p>
                </div>
                <Users className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Activity</p>
                  <p className="text-3xl font-bold text-gray-900">{company.stats.activity_count}</p>
                </div>
                <Activity className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Page Views</p>
                  <p className="text-3xl font-bold text-gray-900">{company.stats.page_views}</p>
                </div>
                <TrendingUp className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">About</h3>
                    <p className="text-gray-700">{company.description || 'No description available.'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Members ({members.length})</CardTitle>
                  {canManage && (
                    <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Invite Member
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {loadingMembers ? (
                  <p className="text-gray-600 text-center py-8">Loading members...</p>
                ) : members.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No members yet</p>
                ) : (
                  <div className="space-y-3">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.avatar_url} alt={member.name} />
                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            {canManage ? (
                              <Select
                                value={member.role}
                                onValueChange={(value) => handleChangeMemberRole(member.id, value)}
                              >
                                <SelectTrigger className="w-32 h-7 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="mod">Moderator</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="capitalize text-xs">
                                {member.role}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {canManage && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <Card className="mb-4">
              <CardHeader>
                <CardTitle>Post Update</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Textarea
                    placeholder="Share an update with the group..."
                    value={activityContent}
                    onChange={(e) => setActivityContent(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handlePostActivity}
                    disabled={postingActivity || !activityContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {postingActivity ? 'Posting...' : 'Post Update'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingActivity ? (
                  <p className="text-gray-600 text-center py-8">Loading activity...</p>
                ) : activities.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3 p-4 border rounded-lg">
                        <Avatar>
                          <AvatarImage src={activity.avatar_url} alt={activity.user_name} />
                          <AvatarFallback>{activity.user_name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{activity.user_name}</span>
                            <span className="text-xs text-gray-500">
                              {new Date(activity.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div
                            className="text-gray-700"
                            dangerouslySetInnerHTML={{ __html: activity.content }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Member Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite a user to join this partner company. Enter the WordPress user ID.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="user-id" className="text-sm font-medium">
                User ID
              </label>
              <Input
                id="user-id"
                type="number"
                placeholder="Enter user ID"
                value={inviteUserId}
                onChange={(e) => setInviteUserId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendInvite} disabled={sendingInvite || !inviteUserId}>
              {sendingInvite ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
