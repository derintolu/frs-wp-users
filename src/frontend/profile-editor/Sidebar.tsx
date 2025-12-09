import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	User,
	Share2,
	Link,
	MapPin,
	Award,
	Copy,
	ExternalLink,
} from 'lucide-react';

interface SidebarProps {
	activeSection: string;
	onSectionChange: (section: string) => void;
	profile: any;
}

interface SectionItem {
	description: string;
	icon: React.ReactNode;
	id: string;
	label: string;
}

const sections: SectionItem[] = [
	{
		description: 'Basic information and biography',
		icon: <User className="size-5" />,
		id: 'about',
		label: 'About',
	},
	{
		description: 'Your social media profiles',
		icon: <Share2 className="size-5" />,
		id: 'social',
		label: 'Social Media',
	},
	{
		description: 'Add custom links to your profile',
		icon: <Link className="size-5" />,
		id: 'links',
		label: 'Custom Links',
	},
	{
		description: 'Where you serve clients',
		icon: <MapPin className="size-5" />,
		id: 'service-areas',
		label: 'Service Areas',
	},
	{
		description: 'Your areas of expertise',
		icon: <Award className="size-5" />,
		id: 'specialties',
		label: 'Specialties',
	},
];

export default function Sidebar({
	activeSection,
	onSectionChange,
	profile,
}: SidebarProps) {
	return (
		<Card className="sticky top-4 p-4">
			<div className="mb-6">
				<div className="mb-2 flex items-center gap-3">
					{profile?.headshot_url ? (
						<img
							alt={`${profile.first_name} ${profile.last_name}`}
							className="size-16 rounded-full object-cover"
							src={profile.headshot_url}
						/>
					) : (
						<div className="flex size-16 items-center justify-center rounded-full bg-gray-200">
							<User className="size-8 text-gray-400" />
						</div>
					)}
					<div>
						<h3 className="text-lg font-semibold">
							{profile?.first_name} {profile?.last_name}
						</h3>
						<p className="text-sm text-gray-600">{profile?.job_title}</p>
					</div>
				</div>
			</div>

			<nav className="space-y-1">
				{sections.map((section) => (
					<button
						className={cn(
							'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
							activeSection === section.id
								? 'border border-blue-200 bg-blue-50 text-blue-700'
								: 'text-gray-700 hover:bg-gray-50'
						)}
						key={section.id}
						onClick={() => onSectionChange(section.id)}
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
							<div className="text-sm font-medium">{section.label}</div>
							<div
								className={cn(
									'mt-0.5 text-xs',
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

			{/* Profile Completion Widget */}
			<div className="mt-4 rounded-lg border-b border-gray-200 bg-white px-4 py-3">
				<div className="mb-2 flex items-center justify-between">
					<div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
						Profile Completion
					</div>
					<div className="text-sm font-semibold text-gray-700">50%</div>
				</div>
				<div className="h-2 w-full rounded-full bg-gray-200">
					<div
						className="h-2 rounded-full"
						style={{
							background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
							width: '50%',
						}}
					/>
				</div>
			</div>

			{/* Profile Link Widget */}
			<div className="mt-4 rounded-lg border-t border-gray-200 bg-white px-4 py-3">
				<div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
					Profile Link
				</div>
				<div className="mb-2 truncate rounded border border-gray-300 bg-gray-50 p-2 text-sm text-gray-700">
					{profile?.profile_slug ? `${window.location.origin}/member/${profile.profile_slug}` : 'No profile slug'}
				</div>
				<div className="flex gap-2">
					<Button
						className="flex-1"
						onClick={() => {
							const url = profile?.profile_slug ? `${window.location.origin}/member/${profile.profile_slug}` : '';
							if (url) {navigator.clipboard.writeText(url);}
						}}
						size="sm"
						variant="outline"
					>
						<Copy className="mr-1 size-3" />
						Copy
					</Button>
					<Button
						className="flex-1"
						onClick={() => {
							const url = profile?.profile_slug ? `${window.location.origin}/member/${profile.profile_slug}` : '';
							if (url) {window.open(url, '_blank');}
						}}
						size="sm"
						variant="outline"
					>
						<ExternalLink className="mr-1 size-3" />
						Open
					</Button>
				</div>
			</div>
		</Card>
	);
}
