/**
 * AppLauncher Component
 *
 * A grid of tool and app shortcuts for quick access.
 * Refactored to use unified ToolCard components.
 */

import { Calculator, Home } from 'lucide-react';
import { ToolCard, ToolCardGrid } from '../ui/cards';

interface AppLauncherProps {
  onNavigate?: ((view: string) => void) | undefined;
}

export function AppLauncher({ onNavigate }: AppLauncherProps) {
  const tools = [
    {
      id: 'mortgage-calculator',
      title: 'Mortgage Calculator',
      icon: <Calculator className="w-full h-full" strokeWidth={1.5} />,
      iconColor: 'var(--brand-electric-blue)',
      onClick: () => onNavigate?.('tools/mortgage-calculator'),
    },
    {
      id: 'property-valuation',
      title: 'Property Valuation',
      icon: <Home className="w-full h-full" strokeWidth={1.5} />,
      iconColor: 'var(--brand-navy)',
      onClick: () => onNavigate?.('tools/property-valuation'),
    },
  ];

  const apps = [
    {
      id: 'outlook',
      title: 'Outlook',
      image: '/wp-content/plugins/frs-lrg/icons8-outlook.svg',
      href: 'https://outlook.office.com/',
    },
    {
      id: 'arive',
      title: 'Arive',
      image: '/wp-content/plugins/frs-lrg/assets/images/Arive-Highlight-Logo - 01.webp',
      href: 'https://app.arive.com/login',
    },
    {
      id: 'fub',
      title: 'Follow Up Boss',
      image: '/wp-content/plugins/frs-lrg/assets/images/FUB LOG.webp',
      href: 'https://app.followupboss.com/login',
    },
  ];

  return (
    <ToolCardGrid gap="sm">
      {/* Internal Tools */}
      {tools.map((tool) => (
        <ToolCard
          key={tool.id}
          title={tool.title}
          icon={tool.icon}
          iconColor={tool.iconColor}
          onClick={tool.onClick}
          size="md"
        />
      ))}

      {/* External Apps */}
      {apps.map((app) => (
        <ToolCard
          key={app.id}
          title={app.title}
          image={app.image}
          href={app.href}
          size="md"
        />
      ))}
    </ToolCardGrid>
  );
}
