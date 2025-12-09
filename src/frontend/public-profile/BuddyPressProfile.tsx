/**
 * BuddyPress Profile Component
 *
 * Displays combined FRS profile + BuddyPress data
 */

import { useState, useEffect } from 'react';

interface FRSProfile {
  bio?: string;
  email: string;
  first_name: string;
  id: number;
  last_name: string;
  nmls_id?: string;
  phone?: string;
  select_person_type?: string;
  user_id: number | null;
}

interface BPMember {
  id: number;
  last_activity: {
    date: string;
    timediff: string;
  };
  link: string;
  mention_name: string;
  name: string;
  user_avatar: {
    full: string;
    thumb: string;
  };
}

interface BPActivity {
  component: string;
  content: string;
  date: string;
  id: number;
  type: string;
  user_id: number;
}

export function BuddyPressProfile() {
  const [frsProfile, setFrsProfile] = useState<FRSProfile | null>(null);
  const [bpMember, setBpMember] = useState<BPMember | null>(null);
  const [bpActivity, setBpActivity] = useState<BPActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user ID from window config or data attribute
  const userId = (window as any).frsBPConfig?.userId ||
                 document.getElementById('frs-buddypress-profile-root')?.dataset.userId;

  useEffect(() => {
    if (!userId) {
      setError('No user ID provided');
      setLoading(false);
      return;
    }

    Promise.all([
      fetchFRSProfile(userId),
      fetchBPMember(userId),
      fetchBPActivity(userId),
    ])
      .then(([frs, bp, activity]) => {
        setFrsProfile(frs);
        setBpMember(bp);
        setBpActivity(activity);
        setLoading(false);
      })
      .catch((error_) => {
        setError(error_.message);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!frsProfile || !bpMember) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <p className="text-yellow-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* Profile Header */}
      <div className="mb-6 rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <img
            alt={frsProfile.first_name}
            className="size-32 rounded-full object-cover"
            src={bpMember.user_avatar.full}
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              {frsProfile.first_name} {frsProfile.last_name}
            </h1>

            {frsProfile.select_person_type && (
              <span className="mb-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {frsProfile.select_person_type.replace('_', ' ').toUpperCase()}
              </span>
            )}

            {frsProfile.nmls_id && (
              <p className="mb-2 text-gray-600">
                <strong>NMLS:</strong> #{frsProfile.nmls_id}
              </p>
            )}

            <p className="mb-2 text-gray-600">
              <strong>Email:</strong> {frsProfile.email}
            </p>

            {frsProfile.phone && (
              <p className="mb-2 text-gray-600">
                <strong>Phone:</strong> {frsProfile.phone}
              </p>
            )}

            <p className="mt-3 text-sm text-gray-500">
              Last active: {bpMember.last_activity.timediff}
            </p>

            <a
              className="mt-3 inline-block text-blue-600 hover:underline"
              href={bpMember.link}
              rel="noopener noreferrer"
              target="_blank"
            >
              View BuddyPress Profile →
            </a>
          </div>
        </div>

        {/* Bio */}
        {frsProfile.bio && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-xl font-semibold">About</h2>
            <p className="leading-relaxed text-gray-700">{frsProfile.bio}</p>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Recent Activity</h2>

        {bpActivity.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {bpActivity.map((activity) => (
              <div
                className="border-b border-gray-200 pb-4 last:border-b-0"
                key={activity.id}
              >
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: activity.content }}
                />
                <p className="mt-2 text-sm text-gray-500">
                  {new Date(activity.date).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// API Helper Functions

/**
 * Get API configuration from window
 * Accounts for custom BuddyPress namespace and route slug renaming
 */
function getAPIConfig() {
  const config = (window as any).frsBPConfig || {};
  return {
    apiUrl: config.apiUrl || '/wp-json/',
    bpNamespace: config.bpNamespace || 'buddypress/v1',
    bpSlugs: config.bpSlugs || {
      activity: 'activity',
      attachments: 'attachments',
      groups: 'groups',
      members: 'members',
    },
    frsNamespace: config.frsNamespace || 'frs-users/v1',
    nonce: config.restNonce || '',
  };
}

async function fetchFRSProfile(userId: string | number): Promise<FRSProfile> {
  const config = getAPIConfig();
  const url = `${config.apiUrl}${config.frsNamespace}/profiles/user/${userId}`;

  const response = await fetch(url, {
    headers: {
      'X-WP-Nonce': config.nonce,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch FRS profile');
  }
  const data = await response.json();
  return data.data;
}

async function fetchBPMember(userId: string | number): Promise<BPMember> {
  const config = getAPIConfig();
  // Use dynamic route slug (accounts for custom BP route renaming)
  const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs.members}/${userId}`;

  const response = await fetch(url, {
    headers: {
      'X-WP-Nonce': config.nonce,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch BuddyPress member');
  }
  return response.json();
}

async function fetchBPActivity(userId: string | number): Promise<BPActivity[]> {
  const config = getAPIConfig();
  // Use dynamic route slug (accounts for custom BP route renaming)
  const url = `${config.apiUrl}${config.bpNamespace}/${config.bpSlugs.activity}?user_id=${userId}&per_page=10`;

  const response = await fetch(url, {
    headers: {
      'X-WP-Nonce': config.nonce,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch activity');
  }
  return response.json();
}
