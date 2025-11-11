import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
	User,
	Share2,
	Link,
	MapPin,
	Award,
} from 'lucide-react';

interface SidebarProps {
	activeSection: string;
	onSectionChange: (section: string) => void;
	profile: any;
}

interface SectionItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	description: string;
}

const sections: SectionItem[] = [
	{
		id: 'about',
		label: 'About',
		icon: <User className="w-5 h-5" />,
		description: 'Basic information and biography',
	},
	{
		id: 'social',
		label: 'Social Media',
		icon: <Share2 className="w-5 h-5" />,
		description: 'Your social media profiles',
	},
	{
		id: 'links',
		label: 'Custom Links',
		icon: <Link className="w-5 h-5" />,
		description: 'Add custom links to your profile',
	},
	{
		id: 'service-areas',
		label: 'Service Areas',
		icon: <MapPin className="w-5 h-5" />,
		description: 'Where you serve clients',
	},
	{
		id: 'specialties',
		label: 'Specialties',
		icon: <Award className="w-5 h-5" />,
		description: 'Your areas of expertise',
	},
];

export default function Sidebar({
	activeSection,
	onSectionChange,
	profile,
}: SidebarProps) {
	return (
		<Card className="p-4 sticky top-4">
			<div className="mb-6">
				<div className="flex items-center gap-3 mb-2">
					{profile?.headshot_url ? (
						<img
							src={profile.headshot_url}
							alt={`${profile.first_name} ${profile.last_name}`}
							className="w-16 h-16 rounded-full object-cover"
						/>
					) : (
						<div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
							<User className="w-8 h-8 text-gray-400" />
						</div>
					)}
					<div>
						<h3 className="font-semibold text-lg">
							{profile?.first_name} {profile?.last_name}
						</h3>
						<p className="text-sm text-gray-600">{profile?.job_title}</p>
					</div>
				</div>
			</div>

			<nav className="space-y-1">
				{sections.map((section) => (
					<button
						key={section.id}
						onClick={() => onSectionChange(section.id)}
						className={cn(
							'w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-left',
							activeSection === section.id
								? 'bg-blue-50 text-blue-700 border border-blue-200'
								: 'hover:bg-gray-50 text-gray-700'
						)}
					>
						<span
							className={cn(
								'mt-0.5',
								activeSection === section.id ? 'text-blue-700' : 'text-gray-400'
							)}
						>
							{section.icon}
						</span>
						<div className="flex-1">
							<div className="font-medium text-sm">{section.label}</div>
							<div
								className={cn(
									'text-xs mt-0.5',
									activeSection === section.id
										? 'text-blue-600'
										: 'text-gray-500'
								)}
							>
								{section.description}
							</div>
						</div>
					</button>
				))}
			</nav>
		</Card>
	);
}
