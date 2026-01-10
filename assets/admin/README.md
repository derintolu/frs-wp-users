# FRS Profiles Admin Interface

WordPress-native admin interface using @wordpress/dataviews and @wordpress/scripts.

## Development

### Install Dependencies

```bash
cd assets/admin
npm install
```

### Build for Production

```bash
npm run build
```

This creates optimized files in `build/`:
- `index.js` - Compiled JavaScript
- `index.css` - Compiled styles
- `index.asset.php` - Dependency manifest

### Development Mode

```bash
npm run start
```

Watches files and rebuilds on changes.

## Features

- **DataViews Table**: Modern Gutenberg table component
- **WordPress Native**: Uses core WordPress components
- **Role-Based**: Filters by loan officer, agent, staff, leadership
- **Quick Actions**: Edit user, view profile
- **Search & Filter**: Built-in DataViews capabilities
- **Responsive**: Mobile-friendly admin interface

## Tech Stack

- @wordpress/scripts - Build tooling
- @wordpress/dataviews - Table component
- @wordpress/components - UI components
- @wordpress/element - React wrapper
- @wordpress/api-fetch - REST API client
