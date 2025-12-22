# Weekend Sprint: React Intranet with BuddyPress Backend

**Timeline:** 48 hours (Saturday-Sunday)
**Stack:** React 18 + TypeScript + BuddyPress REST API + shadcn/ui
**Goal:** Launch a functional React-based intranet consuming BuddyPress APIs

---

## 🎯 Architecture Decision

**Frontend:** Custom React SPA (matching your existing stack)
**Backend:** BuddyPress REST API
**UI Components:** shadcn/ui + Tailwind (your existing design system)
**Build:** Vite (7th config for intranet app)

**Why This Approach:**
- ✅ Free (no BuddyBoss cost)
- ✅ Consistent with your existing React architecture
- ✅ Full control over UX
- ✅ Lightweight backend
- ✅ Modern, fast, maintainable

---

## 📁 Project Structure

```
frs-wp-users/
├── src/
│   └── intranet/                    # NEW React app
│       ├── index.tsx                # Entry point
│       ├── App.tsx                  # Main app component
│       ├── routes.tsx               # React Router
│       ├── components/
│       │   ├── ActivityFeed.tsx     # Main feed
│       │   ├── PostComposer.tsx     # Create posts
│       │   ├── MessageInbox.tsx     # Private messages
│       │   ├── GroupList.tsx        # Groups/departments
│       │   ├── Notifications.tsx    # Notification center
│       │   └── ui/                  # shadcn/ui components
│       ├── hooks/
│       │   ├── useBuddyPress.ts     # BP API hooks
│       │   ├── useActivity.ts       # Activity feed
│       │   ├── useMessages.ts       # Messaging
│       │   └── useGroups.ts         # Groups
│       ├── lib/
│       │   ├── api.ts               # API client
│       │   └── types.ts             # TypeScript types
│       └── styles/
│           └── intranet.css         # Custom styles
├── vite.intranet.config.js          # NEW Vite config
└── includes/
    ├── Admin/
    │   └── IntranetPage.php         # Mount point
    └── Integrations/
        └── BuddyPressSync.php       # Sync layer
```

---

## ⏰ Hour-by-Hour Schedule

### Saturday (10 hours)

#### Morning Session 1 (9am-12pm) - Backend Setup

**Hour 1: BuddyPress Installation (9am-10am)**
```bash
# Install BuddyPress
wp plugin install buddypress --activate

# Enable only what we need (lightweight!)
wp bp component activate activity
wp bp component activate messages
wp bp component activate groups
wp bp component activate notifications
wp bp component deactivate xprofile  # Using frs-wp-users
wp bp component deactivate friends   # Optional
wp rewrite flush

# Create users for guest profiles
wp frs-users bulk-create-users
```

**Hour 2: BuddyPress Configuration (10am-11am)**
- [ ] Configure BP settings via WP Admin
- [ ] Set up REST API authentication
- [ ] Test API endpoints in Postman/browser
- [ ] Create department groups via WP-CLI

**Hour 3: Sync Integration (11am-12pm)**
- [ ] Create `BuddyPressSync.php` integration class
- [ ] Link profiles to BP via `user_id`
- [ ] Auto-assign users to groups
- [ ] Test sync

#### Lunch (12pm-1pm)

#### Afternoon Session 1 (1pm-5pm) - React Foundation

**Hour 4: Vite Config & Project Setup (1pm-2pm)**
- [ ] Create `vite.intranet.config.js`
- [ ] Set up TypeScript config
- [ ] Configure Tailwind for intranet
- [ ] Create entry point

**Hour 5: API Client & Hooks (2pm-3pm)**
- [ ] Build BuddyPress API client
- [ ] Create custom React hooks
- [ ] Set up React Query for caching
- [ ] Type definitions for BP API

**Hour 6: Activity Feed Component (3pm-4pm)**
- [ ] Build `ActivityFeed.tsx`
- [ ] Build `PostComposer.tsx`
- [ ] Build `ActivityItem.tsx`
- [ ] Wire up to BP Activity API

**Hour 7: Testing Activity Feed (4pm-5pm)**
- [ ] Test posting updates
- [ ] Test loading feed
- [ ] Add loading states
- [ ] Add error handling

#### Dinner Break (5pm-7pm)

#### Evening Session (7pm-9pm) - Messaging

**Hour 8-9: Private Messaging (7pm-9pm)**
- [ ] Build `MessageInbox.tsx`
- [ ] Build `MessageThread.tsx`
- [ ] Build `ComposeMessage.tsx`
- [ ] Wire up to BP Messages API

**Saturday Total: 10 hours**

---

### Sunday (9 hours)

#### Morning Session 1 (9am-12pm) - Groups & Notifications

**Hour 1: Groups UI (9am-10am)**
- [ ] Build `GroupList.tsx`
- [ ] Build `GroupCard.tsx`
- [ ] Build `GroupDetail.tsx`
- [ ] Wire up to BP Groups API

**Hour 2: Group Activity (10am-11am)**
- [ ] Group-specific activity feeds
- [ ] Group member list
- [ ] Join/leave functionality
- [ ] File uploads in groups

**Hour 3: Notifications (11am-12pm)**
- [ ] Build `Notifications.tsx`
- [ ] Build notification dropdown
- [ ] Mark as read functionality
- [ ] Real-time updates (polling)

#### Lunch (12pm-1pm)

#### Afternoon Session 1 (1pm-4pm) - Integration & Polish

**Hour 4: Navigation & Layout (1pm-2pm)**
- [ ] Main layout component
- [ ] Sidebar navigation
- [ ] Header with search
- [ ] Mobile responsive

**Hour 5: Profile Integration (2pm-3pm)**
- [ ] Link activity items to frs-wp-users profiles
- [ ] User avatars from frs-wp-users
- [ ] @mention autocomplete
- [ ] Profile cards

**Hour 6: Build & Deploy (3pm-4pm)**
- [ ] Build production assets
- [ ] Test on staging
- [ ] Fix build errors
- [ ] Optimize bundle size

#### Break (4pm-5pm)

#### Evening Session (5pm-8pm) - Testing & Launch

**Hour 7: Full Testing (5pm-6pm)**
- [ ] Test all workflows end-to-end
- [ ] Test as different user types
- [ ] Mobile testing
- [ ] Fix critical bugs

**Hour 8: Content & Documentation (6pm-7pm)**
- [ ] Create welcome post
- [ ] Seed initial content
- [ ] Write quick user guide
- [ ] Prepare launch email

**Hour 9: Launch! (7pm-8pm)**
- [ ] Final checks
- [ ] Deploy to production
- [ ] Send announcement
- [ ] Monitor for issues

**Sunday Total: 9 hours**

---

## 💻 Implementation Code

### 1. Vite Config for Intranet

**File:** `vite.intranet.config.js`

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteForWp } from '@kucrut/vite-for-wp';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    viteForWp({
      input: {
        intranet: 'src/intranet/index.tsx',
      },
      outDir: 'assets/intranet/dist',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@intranet': path.resolve(__dirname, './src/intranet'),
    },
  },
  server: {
    port: 5178,
    strictPort: true,
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

**Update `package.json`:**

```json
{
  "scripts": {
    "dev": "concurrently \"vite -c vite.frontend.config.js --port 5173\" \"vite -c vite.admin.config.js --port 5174\"",
    "dev:intranet": "vite -c vite.intranet.config.js --port 5178",
    "build:intranet": "vite build -c vite.intranet.config.js",
    "build": "vite build -c vite.frontend.config.js && vite build -c vite.admin.config.js && npm run build:portal && npm run build:profile-editor && npm run build:directory && npm run build:intranet && npm run widget:build"
  }
}
```

### 2. BuddyPress API Client

**File:** `src/intranet/lib/api.ts`

```typescript
const API_BASE = '/wp-json/buddypress/v1';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

class BuddyPressAPI {
  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, ...fetchOptions } = options;

    let url = `${API_BASE}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(
        Object.entries(params).map(([key, value]) => [key, String(value)])
      );
      url += `?${searchParams}`;
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': (window as any).wpData?.nonce || '',
        ...fetchOptions.headers,
      },
      credentials: 'same-origin',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Activity endpoints
  async getActivity(params?: { page?: number; per_page?: number; scope?: string }) {
    return this.request('/activity', { params });
  }

  async postActivity(content: string, component = 'activity', type = 'activity_update') {
    return this.request('/activity', {
      method: 'POST',
      body: JSON.stringify({ content, component, type }),
    });
  }

  async deleteActivity(id: number) {
    return this.request(`/activity/${id}`, { method: 'DELETE' });
  }

  async addActivityComment(activityId: number, content: string) {
    return this.request(`/activity/${activityId}/comment`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Messages endpoints
  async getMessages(params?: { box?: string; page?: number }) {
    return this.request('/messages', { params });
  }

  async getThread(id: number) {
    return this.request(`/messages/${id}`);
  }

  async sendMessage(recipients: number[], subject: string, content: string) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipients, subject, message: content }),
    });
  }

  async deleteMessage(id: number) {
    return this.request(`/messages/${id}`, { method: 'DELETE' });
  }

  // Groups endpoints
  async getGroups(params?: { page?: number; per_page?: number; scope?: string }) {
    return this.request('/groups', { params });
  }

  async getGroup(id: number) {
    return this.request(`/groups/${id}`);
  }

  async joinGroup(id: number) {
    return this.request(`/groups/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ user_id: (window as any).wpData?.currentUser?.id }),
    });
  }

  async leaveGroup(id: number) {
    return this.request(`/groups/${id}/members`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: (window as any).wpData?.currentUser?.id }),
    });
  }

  // Notifications endpoints
  async getNotifications(params?: { page?: number; is_new?: boolean }) {
    return this.request('/notifications', { params });
  }

  async markNotificationRead(id: number) {
    return this.request(`/notifications/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ is_new: false }),
    });
  }

  async markAllNotificationsRead() {
    return this.request('/notifications/read-all', { method: 'PUT' });
  }
}

export const bpAPI = new BuddyPressAPI();
```

### 3. React Hooks for BuddyPress

**File:** `src/intranet/hooks/useActivity.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bpAPI } from '@intranet/lib/api';

export interface Activity {
  id: number;
  user_id: number;
  content: { rendered: string };
  date: string;
  user_avatar: { full: string; thumb: string };
  user_name: string;
  comments: any[];
  can_comment: boolean;
  can_favorite: boolean;
  favorited: boolean;
}

export function useActivity(scope = 'all', page = 1) {
  return useQuery({
    queryKey: ['activity', scope, page],
    queryFn: () => bpAPI.getActivity({ scope, page, per_page: 20 }),
    refetchInterval: 30000, // Poll every 30 seconds
  });
}

export function usePostActivity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => bpAPI.postActivity(content),
    onSuccess: () => {
      // Invalidate and refetch activity
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ activityId, content }: { activityId: number; content: string }) =>
      bpAPI.addActivityComment(activityId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] });
    },
  });
}
```

**File:** `src/intranet/hooks/useMessages.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bpAPI } from '@intranet/lib/api';

export interface Message {
  id: number;
  subject: { rendered: string };
  message: { rendered: string };
  date: string;
  unread_count: number;
  sender_ids: number[];
  recipients: any[];
}

export function useMessages(box = 'inbox') {
  return useQuery({
    queryKey: ['messages', box],
    queryFn: () => bpAPI.getMessages({ box }),
    refetchInterval: 15000, // Poll every 15 seconds
  });
}

export function useThread(id: number) {
  return useQuery({
    queryKey: ['message-thread', id],
    queryFn: () => bpAPI.getThread(id),
    enabled: !!id,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      recipients,
      subject,
      content,
    }: {
      recipients: number[];
      subject: string;
      content: string;
    }) => bpAPI.sendMessage(recipients, subject, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
```

**File:** `src/intranet/hooks/useGroups.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bpAPI } from '@intranet/lib/api';

export interface Group {
  id: number;
  name: string;
  description: { rendered: string };
  status: string;
  creator_id: number;
  date_created: string;
  total_member_count: number;
  avatar_urls: { full: string; thumb: string };
}

export function useGroups(scope = 'all') {
  return useQuery({
    queryKey: ['groups', scope],
    queryFn: () => bpAPI.getGroups({ scope, per_page: 50 }),
  });
}

export function useGroup(id: number) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => bpAPI.getGroup(id),
    enabled: !!id,
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: number) => bpAPI.joinGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}
```

### 4. Activity Feed Component

**File:** `src/intranet/components/ActivityFeed.tsx`

```typescript
import { useState } from 'react';
import { useActivity } from '@intranet/hooks/useActivity';
import { PostComposer } from './PostComposer';
import { ActivityItem } from './ActivityItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ActivityFeed() {
  const [scope, setScope] = useState('all');
  const { data: activities, isLoading, error } = useActivity(scope);

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Failed to load activity feed</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PostComposer />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setScope('all')}
          className={`px-4 py-2 rounded-md ${
            scope === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary'
          }`}
        >
          All Updates
        </button>
        <button
          onClick={() => setScope('mentions')}
          className={`px-4 py-2 rounded-md ${
            scope === 'mentions'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary'
          }`}
        >
          Mentions
        </button>
        <button
          onClick={() => setScope('favorites')}
          className={`px-4 py-2 rounded-md ${
            scope === 'favorites'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary'
          }`}
        >
          Favorites
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities?.map((activity: any) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
```

**File:** `src/intranet/components/PostComposer.tsx`

```typescript
import { useState } from 'react';
import { usePostActivity } from '@intranet/hooks/useActivity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function PostComposer() {
  const [content, setContent] = useState('');
  const postActivity = usePostActivity();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      await postActivity.mutateAsync(content);
      setContent('');
      toast.success('Posted successfully!');
    } catch (error) {
      toast.error('Failed to post update');
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={postActivity.isPending || !content.trim()}
            >
              {postActivity.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Post Update
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
```

**File:** `src/intranet/components/ActivityItem.tsx`

```typescript
import { useState } from 'react';
import { useAddComment } from '@intranet/hooks/useActivity';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, Heart, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItemProps {
  activity: any;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const addComment = useAddComment();

  const handleComment = async () => {
    if (!commentText.trim()) return;

    try {
      await addComment.mutateAsync({
        activityId: activity.id,
        content: commentText,
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex gap-4">
          <Avatar>
            <AvatarImage src={activity.user_avatar?.thumb} />
            <AvatarFallback>{activity.user_name?.[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{activity.user_name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.date), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div
              className="mt-3 prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: activity.content.rendered }}
            />

            <div className="flex gap-4 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowComments(!showComments)}
              >
                <MessageCircle className="h-4 w-4 mr-1" />
                {activity.comments?.length || 0}
              </Button>
              <Button variant="ghost" size="sm">
                <Heart className="h-4 w-4 mr-1" />
                Like
              </Button>
              <Button variant="ghost" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>

            {showComments && (
              <div className="mt-4 space-y-4">
                {activity.comments?.map((comment: any) => (
                  <div key={comment.id} className="flex gap-3 pl-4 border-l-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.user_avatar?.thumb} />
                      <AvatarFallback>{comment.user_name?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-semibold">{comment.user_name}</p>
                      <div
                        className="text-sm"
                        dangerouslySetInnerHTML={{ __html: comment.content.rendered }}
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-2 pl-4">
                  <Textarea
                    placeholder="Write a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={2}
                    className="resize-none"
                  />
                  <Button onClick={handleComment} disabled={addComment.isPending}>
                    Post
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### 5. Main App Structure

**File:** `src/intranet/index.tsx`

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import '../styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

const container = document.getElementById('frs-intranet-root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </React.StrictMode>
  );
}
```

**File:** `src/intranet/App.tsx`

```typescript
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ActivityFeed } from './components/ActivityFeed';
import { MessageInbox } from './components/MessageInbox';
import { GroupList } from './components/GroupList';
import { GroupDetail } from './components/GroupDetail';
import { Toaster } from '@/components/ui/sonner';

export function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/feed" replace />} />
          <Route path="/feed" element={<ActivityFeed />} />
          <Route path="/messages" element={<MessageInbox />} />
          <Route path="/messages/:threadId" element={<MessageThread />} />
          <Route path="/groups" element={<GroupList />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
        </Routes>
      </Layout>
      <Toaster />
    </HashRouter>
  );
}
```

**File:** `src/intranet/components/Layout.tsx`

```typescript
import { Link, useLocation } from 'react-router-dom';
import { Home, MessageSquare, Users, Bell } from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold">21st Century Intranet</h1>
            <nav className="flex gap-6">
              <Link
                to="/feed"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/feed') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Home className="h-4 w-4" />
                Feed
              </Link>
              <Link
                to="/messages"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/messages') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Messages
              </Link>
              <Link
                to="/groups"
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  isActive('/groups') ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Users className="h-4 w-4" />
                Groups
              </Link>
            </nav>
          </div>
          <NotificationDropdown />
        </div>
      </header>

      <main className="container py-8">
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
```

### 6. WordPress Integration

**File:** `includes/Admin/IntranetPage.php`

```php
<?php
namespace FRSUsers\Admin;

use FRSUsers\Traits\Base;

class IntranetPage {
    use Base;

    public function init() {
        add_action('admin_menu', [$this, 'add_menu_page']);
    }

    public function add_menu_page() {
        add_menu_page(
            __('Intranet', 'frs-users'),
            __('Intranet', 'frs-users'),
            'read', // All logged-in users
            'frs-intranet',
            [$this, 'render_page'],
            'dashicons-groups',
            3
        );
    }

    public function render_page() {
        // Enqueue React app
        \FRSUsers\Libs\Assets\enqueue_script(
            'frs-intranet',
            'intranet/dist/intranet.js',
            ['deps' => ['wp-element']],
            'frs-users',
            '1.0.0'
        );

        // Pass data to React
        wp_localize_script('frs-intranet', 'wpData', [
            'nonce' => wp_create_nonce('wp_rest'),
            'apiUrl' => rest_url(),
            'currentUser' => [
                'id' => get_current_user_id(),
                'name' => wp_get_current_user()->display_name,
                'avatar' => get_avatar_url(get_current_user_id()),
            ],
        ]);

        // Render container
        echo '<div id="frs-intranet-root" class="wrap"></div>';
    }
}
```

**Activate in `plugin.php`:**

```php
// In FRSUsers::init()
\FRSUsers\Admin\IntranetPage::get_instance()->init();
```

### 7. BuddyPress Sync Integration

**File:** `includes/Integrations/BuddyPressSync.php`

```php
<?php
namespace FRSUsers\Integrations;

use FRSUsers\Models\Profile;
use FRSUsers\Traits\Base;

class BuddyPressSync {
    use Base;

    public function init() {
        // Only run if BuddyPress is active
        if (!function_exists('bp_is_active')) {
            return;
        }

        // Sync profile updates
        add_action('frs_users_profile_updated', [$this, 'sync_to_bp'], 10, 2);

        // Auto-assign groups
        add_action('frs_users_profile_updated', [$this, 'auto_assign_groups'], 10, 2);

        // Redirect BP profile URLs
        add_filter('bp_core_get_user_domain', [$this, 'override_profile_url'], 10, 4);
    }

    public function sync_to_bp($profile_id, $profile_data) {
        $profile = Profile::find($profile_id);
        if (!$profile || !$profile->user_id) {
            return;
        }

        // Update WordPress user
        wp_update_user([
            'ID' => $profile->user_id,
            'display_name' => $profile->display_name ?: trim($profile->first_name . ' ' . $profile->last_name),
        ]);

        // Clear BP cache
        if (function_exists('bp_core_clear_user_object_cache')) {
            bp_core_clear_user_object_cache($profile->user_id);
        }
    }

    public function auto_assign_groups($profile_id, $profile_data) {
        if (!function_exists('groups_join_group')) {
            return;
        }

        $profile = Profile::find($profile_id);
        if (!$profile || !$profile->user_id) {
            return;
        }

        $group_mapping = [
            'loan_officer' => get_option('frs_bp_group_loan_officers'),
            'agent' => get_option('frs_bp_group_agents'),
            'staff' => get_option('frs_bp_group_staff'),
            'leadership' => get_option('frs_bp_group_leadership'),
            'assistant' => get_option('frs_bp_group_assistants'),
        ];

        $group_id = $group_mapping[$profile->select_person_type] ?? null;
        if ($group_id && !groups_is_user_member($profile->user_id, $group_id)) {
            groups_join_group($group_id, $profile->user_id);
        }
    }

    public function override_profile_url($domain, $user_id, $user_nicename, $user_login) {
        $profile = Profile::where('user_id', $user_id)->first();
        if ($profile && $profile->slug) {
            return home_url('/profile/' . $profile->slug . '/');
        }
        return $domain;
    }
}
```

---

## 📋 Weekend Checklist

### Friday Night Prep (30 minutes)
- [ ] Backup staging site
- [ ] Review this document
- [ ] Install React Query: `npm install @tanstack/react-query`
- [ ] Install date-fns: `npm install date-fns`
- [ ] Clear weekend schedule

### Saturday Morning
- [ ] Install BuddyPress
- [ ] Configure components
- [ ] Create users for guest profiles
- [ ] Test BP REST API

### Saturday Afternoon
- [ ] Create Vite config
- [ ] Build API client
- [ ] Build activity feed
- [ ] Test posting

### Saturday Evening
- [ ] Build messaging UI
- [ ] Test conversations
- [ ] Fix bugs

### Sunday Morning
- [ ] Build groups UI
- [ ] Build notifications
- [ ] Test all features

### Sunday Afternoon
- [ ] Polish UI
- [ ] Mobile testing
- [ ] Build production
- [ ] Deploy

### Sunday Evening
- [ ] Final testing
- [ ] Launch! 🚀

---

## 🚀 Quick Start Commands

```bash
# Saturday morning - Backend
wp plugin install buddypress --activate
wp bp component activate activity messages groups notifications
wp bp component deactivate xprofile
wp frs-users bulk-create-users
wp rewrite flush

# Saturday afternoon - Frontend
npm install @tanstack/react-query date-fns
npm run dev:intranet

# Sunday evening - Deploy
npm run build:intranet
```

---

## 💡 Weekend Success Tips

1. **Use What You Have:** Leverage existing shadcn/ui components
2. **Copy-Paste Smart:** Reuse patterns from portal/admin apps
3. **MVP Mindset:** Basic functionality > perfect design
4. **Test Often:** Test each feature as you build
5. **Take Breaks:** Avoid burnout, stay fresh

---

## 🎯 MVP Feature Scope

**MUST HAVE:**
- ✅ Activity feed (post, read, comment)
- ✅ Private messaging
- ✅ Groups (view, join)
- ✅ Basic notifications

**NICE TO HAVE:**
- ⚠️ File uploads
- ⚠️ @mentions autocomplete
- ⚠️ Real-time updates
- ⚠️ Advanced search

**SKIP FOR NOW:**
- ❌ Forums (add later with bbPress)
- ❌ Video integration
- ❌ Advanced analytics
- ❌ Mobile app

---

Ready to build? Let's start Saturday 9am! 💪

**First command:**
```bash
wp plugin install buddypress --activate
```
