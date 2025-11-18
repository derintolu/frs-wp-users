import { createRoot } from 'react-dom/client';
import Directory from './Directory';
import '@/frontend/portal/index.css';

// Mount the Directory app
const container = document.getElementById('frs-directory-root');
if (container) {
  const root = createRoot(container);
  root.render(<Directory />);
}
