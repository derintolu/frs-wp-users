# Development Workflows

## Creating a New Admin Page (React SPA - PREFERRED)

**🎯 Use this approach for profile-related features.**

### Step 1: Create REST API endpoint

**File:** `includes/Routes/Api.php`

```php
register_rest_route(
    self::$namespace,
    '/my-data',
    array(
        'methods' => 'GET',
        'callback' => array(self::$actions, 'get_my_data'),
        'permission_callback' => array(self::$actions, 'check_read_permissions'),
    )
);
```

### Step 2: Create React component

**File:** `src/admin/pages/MyFeature.tsx`

```tsx
import { useState, useEffect } from 'react';

interface MyData {
  id: number;
  name: string;
}

export default function MyFeature() {
  const [data, setData] = useState<MyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/wp-json/frs-users/v1/my-data')
      .then(res => res.json())
      .then(result => {
        setData(result.data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Feature</h1>
      {/* Your UI here using shadcn/ui components */}
    </div>
  );
}
```

### Step 3: Add route

**File:** `src/admin/routes.jsx`

```jsx
import MyFeature from "./pages/MyFeature";

export const router = createHashRouter([
  {
    path: "/",
    element: <ApplicationLayout />,
    children: [
      // ... existing routes
      {
        path: "my-feature",
        element: <MyFeature />,
      }
    ],
  },
]);
```

### Step 4: Add menu item

**File:** `includes/Admin/Menu.php`

```php
add_submenu_page(
    'frs-profiles',
    __('My Feature', 'frs-users'),
    __('My Feature', 'frs-users'),
    'manage_options',
    'frs-profiles#/my-feature',  // Note: #/route for React router
    [$this, 'render_react_app']
);
```

### Step 5: Build and test

```bash
npm run dev:admin  # Development
# OR
npm run build      # Production
```

## Creating Traditional WordPress Admin Page (LEGACY)

**⚠️ Only use for simple, non-profile features.**

### Step 1: Create template

**File:** `views/admin/my-page.php`

```php
<div class="wrap">
    <h1><?php echo esc_html($title); ?></h1>
    <table class="form-table">
        <tr>
            <th><?php _e('Field Name', 'frs-users'); ?></th>
            <td><?php echo esc_html($value); ?></td>
        </tr>
    </table>
</div>
```

### Step 2: Create class

**File:** `includes/Admin/MyPage.php`

```php
namespace FRSUsers\Admin;

use FRSUsers\Traits\Base;

class MyPage {
    use Base;

    public function init() {
        add_action('admin_menu', [$this, 'add_menu']);
    }

    public function add_menu() {
        add_submenu_page(
            'frs-profiles',
            __('My Page', 'frs-users'),
            __('My Page', 'frs-users'),
            'manage_options',
            'frs-my-page',
            [$this, 'render']
        );
    }

    public function render() {
        $title = __('My Page', 'frs-users');
        $value = 'Example value';
        include FRS_USERS_DIR . 'views/admin/my-page.php';
    }
}
```

### Step 3: Register in plugin.php

```php
// plugin.php
if (is_admin()) {
    MyPage::get_instance()->init();
}
```

## Creating a New REST API Endpoint

### Step 1: Add route

**File:** `includes/Routes/Api.php`

```php
register_rest_route(
    self::$namespace,
    '/my-endpoint',
    array(
        'methods' => 'GET',
        'callback' => array(self::$actions, 'my_method'),
        'permission_callback' => array(self::$actions, 'check_read_permissions'),
    )
);
```

### Step 2: Add method in controller

**File:** `includes/Controllers/Profiles/Actions.php`

```php
public function my_method($request) {
    $data = Profile::all();

    return rest_ensure_response([
        'success' => true,
        'data' => $data
    ]);
}
```

## Creating a New Eloquent Model

**File:** `includes/Models/MyModel.php`

```php
namespace FRSUsers\Models;

use Prappo\WpEloquent\Database\Eloquent\Model;

class MyModel extends Model {
    protected $table = 'my_table';
    protected $fillable = ['field1', 'field2'];
}
```

## Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/descriptive-name-YYYY-MM-DD

# 2. Make changes following standards

# 3. Build for production
npm run build

# 4. Commit with proper message
git add .
git commit -m "feat: descriptive commit message"

# 5. Push to remote
git push origin feature/descriptive-name-YYYY-MM-DD

# 6. Merge to main (after testing)
git checkout main
git merge feature/descriptive-name-YYYY-MM-DD
git push origin main
```
