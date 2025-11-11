import { Grid2x2, Calculator, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';

interface AppTile {
  id: string;
  name: string;
  icon?: React.ComponentType<any>;
  image?: string;
  gradient: string;
  onClick: () => void;
}

interface AppLauncherProps {
  onNavigate?: ((view: string) => void) | undefined;
}

export function AppLauncher({ onNavigate }: AppLauncherProps) {
  const tools: AppTile[] = [
    {
      id: 'mortgage-calculator',
      name: 'Mortgage Calculator',
      icon: Calculator,
      gradient: 'var(--gradient-hero)',
      onClick: () => onNavigate?.('tools/mortgage-calculator'),
    },
    {
      id: 'property-valuation',
      name: 'Property Valuation',
      icon: Home,
      gradient: 'var(--gradient-brand-navy)',
      onClick: () => onNavigate?.('tools/property-valuation'),
    },
  ];

  const apps: AppTile[] = [
    {
      id: 'outlook',
      name: 'Outlook',
      image: '/wp-content/plugins/frs-lrg/icons8-outlook.svg',
      gradient: 'var(--brand-dark-navy)',
      onClick: () => window.open('https://outlook.office.com/', '_blank'),
    },
    {
      id: 'arive',
      name: 'Arive',
      image: '/wp-content/plugins/frs-partnership-portal/assets/images/Arive-Highlight-Logo - 01.webp',
      gradient: 'var(--brand-dark-navy)',
      onClick: () => window.open('https://app.arive.com/login', '_blank'),
    },
    {
      id: 'fub',
      name: 'Follow Up Boss',
      image: '/wp-content/plugins/frs-partnership-portal/assets/images/FUB LOG.webp',
      gradient: 'var(--brand-dark-navy)',
      onClick: () => window.open('https://app.followupboss.com/login', '_blank'),
    },
  ];

  return (
    <div className="grid grid-cols-7 gap-3">
      {/* Tools in 2-column grid within 3-column span (matching clock/calendar layout) */}
      <div className="col-span-3 grid grid-cols-2 gap-3">
        {tools.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={tool.onClick}
            className="relative shadow-lg rounded-lg overflow-hidden p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] bg-white border border-gray-100"
          >
            {tool.image ? (
              <img
                src={tool.image}
                alt={tool.name}
                className="w-14 h-14 object-contain relative z-10"
              />
            ) : tool.icon ? (
              <tool.icon className="w-14 h-14 text-blue-600 relative z-10" strokeWidth={1.5} />
            ) : null}
            <span className="text-gray-900 text-sm font-semibold text-center relative z-10">{tool.name}</span>
          </button>
        ))}
      </div>

      {/* Apps in remaining space */}
      <div className="col-span-4 grid grid-cols-3 gap-3">
        {apps.map((app) => (
        <button
          key={app.id}
          type="button"
          onClick={app.onClick}
          className="relative shadow-lg rounded-lg overflow-hidden p-6 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] bg-white border border-gray-100"
        >
          {app.image ? (
            <img
              src={app.image}
              alt={app.name}
              className={`object-contain relative z-10 ${app.id === 'arive' ? 'w-20 h-20' : 'w-14 h-14'}`}
            />
          ) : app.icon ? (
            <app.icon className="w-14 h-14 text-blue-600 relative z-10" strokeWidth={1.5} />
          ) : null}
          <span className="text-gray-900 text-sm font-semibold text-center relative z-10">{app.name}</span>
        </button>
        ))}
      </div>
    </div>
  );
}
