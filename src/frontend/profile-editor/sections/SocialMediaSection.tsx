import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Facebook,
	Instagram,
	Linkedin,
	Twitter,
	Youtube,
	Music,
} from 'lucide-react';

interface Profile {
	facebook_url?: string;
	instagram_url?: string;
	linkedin_url?: string;
	twitter_url?: string;
	youtube_url?: string;
	tiktok_url?: string;
}

interface SocialMediaSectionProps {
	profile: Profile;
	onChange: (updates: Partial<Profile>) => void;
}

interface SocialPlatform {
	id: keyof Profile;
	label: string;
	icon: React.ReactNode;
	placeholder: string;
	color: string;
}

const platforms: SocialPlatform[] = [
	{
		id: 'facebook_url',
		label: 'Facebook',
		icon: <Facebook className="w-5 h-5" />,
		placeholder: 'https://facebook.com/yourprofile',
		color: 'text-blue-600',
	},
	{
		id: 'instagram_url',
		label: 'Instagram',
		icon: <Instagram className="w-5 h-5" />,
		placeholder: 'https://instagram.com/yourprofile',
		color: 'text-pink-600',
	},
	{
		id: 'linkedin_url',
		label: 'LinkedIn',
		icon: <Linkedin className="w-5 h-5" />,
		placeholder: 'https://linkedin.com/in/yourprofile',
		color: 'text-blue-700',
	},
	{
		id: 'twitter_url',
		label: 'Twitter / X',
		icon: <Twitter className="w-5 h-5" />,
		placeholder: 'https://twitter.com/yourprofile',
		color: 'text-sky-500',
	},
	{
		id: 'youtube_url',
		label: 'YouTube',
		icon: <Youtube className="w-5 h-5" />,
		placeholder: 'https://youtube.com/@yourprofile',
		color: 'text-red-600',
	},
	{
		id: 'tiktok_url',
		label: 'TikTok',
		icon: <Music className="w-5 h-5" />,
		placeholder: 'https://tiktok.com/@yourprofile',
		color: 'text-black',
	},
];

export default function SocialMediaSection({
	profile,
	onChange,
}: SocialMediaSectionProps) {
	const handleChange = (field: keyof Profile, value: string) => {
		onChange({ [field]: value });
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Social Media</h2>
				<p className="text-gray-600">
					Connect your social media profiles. These will appear as links on your
					public profile and biolink page.
				</p>
			</div>

			<div className="space-y-4">
				{platforms.map((platform) => (
					<div key={platform.id} className="flex items-start gap-3">
						<div
							className={`mt-2 flex-shrink-0 ${platform.color}`}
							aria-hidden="true"
						>
							{platform.icon}
						</div>
						<div className="flex-1">
							<Label htmlFor={platform.id}>{platform.label}</Label>
							<Input
								id={platform.id}
								type="url"
								value={(profile[platform.id] as string) || ''}
								onChange={(e) => handleChange(platform.id, e.target.value)}
								placeholder={platform.placeholder}
								className="mt-1"
							/>
						</div>
					</div>
				))}
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
				<h4 className="font-semibold text-blue-900 mb-2">Tips for Social Media</h4>
				<ul className="text-sm text-blue-800 space-y-1">
					<li>• Use complete URLs including https://</li>
					<li>• Make sure your profiles are set to public</li>
					<li>
						• Keep your social media content professional and aligned with your
						brand
					</li>
					<li>
						• Social links will be displayed with icons on your profile and biolink
						page
					</li>
				</ul>
			</div>
		</div>
	);
}
