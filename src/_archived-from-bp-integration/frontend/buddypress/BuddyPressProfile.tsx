/**
 * BuddyPress Profile Component
 *
 * Displays combined FRS profile + BuddyPress data
 */

import { useState, useEffect } from 'react';

interface FRSProfile {
  id: number;
  user_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  bio?: string;
  nmls_id?: string;
  select_person_type?: string;
}

interface BPMember {
  id: number;
  name: string;
  mention_name: string;
  link: string;
  user_avatar: {
    full: string;
    thumb: string;
  };
  last_activity: {
    date: string;
    timediff: string;
  };
}

interface BPActivity {
  id: number;
  user_id: number;
  content: string;
  date: string;
  component: string;
  type: string;
}

export function BuddyPressProfile() {
  const [frsProfile, setFrsProfile] = useState<FRSProfile | null>(null);
  const [bpMember, setBpMember] = useState<BPMember | null>(null);
  const [bpActivity, setBpActivity] = useState<BPActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user ID and content_only from window config or data attribute
  const rootElement = document.getElementById('frs-buddypress-profile-root');
  const userId = (window as any).frsBPConfig?.userId || rootElement?.dataset.userId;
  const contentOnly = rootElement?.dataset.contentOnly === 'true';

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
      .catch((err) => {
        setError(err.message);
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!frsProfile || !bpMember) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-600">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <img
            src={bpMember.user_avatar.full}
            alt={frsProfile.first_name}
            className="w-32 h-32 rounded-full object-cover"
          />

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {frsProfile.first_name} {frsProfile.last_name}
            </h1>

            {frsProfile.select_person_type && (
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-3">
                {frsProfile.select_person_type.replace('_', ' ').toUpperCase()}
              </span>
            )}

            {frsProfile.nmls_id && (
              <p className="text-gray-600 mb-2">
                <strong>NMLS:</strong> #{frsProfile.nmls_id}
              </p>
            )}

            <p className="text-gray-600 mb-2">
              <strong>Email:</strong> {frsProfile.email}
            </p>

            {frsProfile.phone && (
              <p className="text-gray-600 mb-2">
                <strong>Phone:</strong> {frsProfile.phone}
              </p>
            )}

            <p className="text-sm text-gray-500 mt-3">
              Last active: {bpMember.last_activity.timediff}
            </p>

            <a
              href={bpMember.link}
              className="inline-block mt-3 text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              View BuddyPress Profile →
            </a>
          </div>
        </div>

        {/* Bio */}
        {frsProfile.bio && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-3">About</h2>
            <p className="text-gray-700 leading-relaxed">{frsProfile.bio}</p>
          </div>
        )}
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Recent Activity</h2>

        {bpActivity.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-4">
            {bpActivity.map((activity) => (
              <div
                key={activity.id}
                className="border-b border-gray-200 pb-4 last:border-b-0"
              >
                <div
                  className="text-gray-700"
                  dangerouslySetInnerHTML={{ __html: activity.content }}
                />
                <p className="text-sm text-gray-500 mt-2">
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
    frsNamespace: config.frsNamespace || 'frs-users/v1',
    bpSlugs: config.bpSlugs || {
      members: 'members',
      activity: 'activity',
      groups: 'groups',
      attachments: 'attachments',
    },
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
