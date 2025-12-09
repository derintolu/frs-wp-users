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
	tiktok_url?: string;
	twitter_url?: string;
	youtube_url?: string;
}

interface SocialMediaSectionProps {
	onChange: (updates: Partial<Profile>) => void;
	profile: Profile;
}

interface SocialPlatform {
	color: string;
	icon: React.ReactNode;
	id: keyof Profile;
	label: string;
	placeholder: string;
}

const platforms: SocialPlatform[] = [
	{
		color: 'text-blue-600',
		icon: <Facebook className="size-5" />,
		id: 'facebook_url',
		label: 'Facebook',
		placeholder: 'https://facebook.com/yourprofile',
	},
	{
		color: 'text-pink-600',
		icon: <Instagram className="size-5" />,
		id: 'instagram_url',
		label: 'Instagram',
		placeholder: 'https://instagram.com/yourprofile',
	},
	{
		color: 'text-blue-700',
		icon: <Linkedin className="size-5" />,
		id: 'linkedin_url',
		label: 'LinkedIn',
		placeholder: 'https://linkedin.com/in/yourprofile',
	},
	{
		color: 'text-sky-500',
		icon: <Twitter className="size-5" />,
		id: 'twitter_url',
		label: 'Twitter / X',
		placeholder: 'https://twitter.com/yourprofile',
	},
	{
		color: 'text-red-600',
		icon: <Youtube className="size-5" />,
		id: 'youtube_url',
		label: 'YouTube',
		placeholder: 'https://youtube.com/@yourprofile',
	},
	{
		color: 'text-black',
		icon: <Music className="size-5" />,
		id: 'tiktok_url',
		label: 'TikTok',
		placeholder: 'https://tiktok.com/@yourprofile',
	},
];

export default function SocialMediaSection({
	onChange,
	profile,
}: SocialMediaSectionProps) {
	const handleChange = (field: keyof Profile, value: string) => {
		onChange({ [field]: value });
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-2 text-2xl font-bold">Social Media</h2>
				<p className="text-gray-600">
					Connect your social media profiles. These will appear as links on your
					public profile and biolink page.
				</p>
			</div>

			<div className="space-y-4">
				{platforms.map((platform) => (
					<div className="flex items-start gap-3" key={platform.id}>
						<div
							aria-hidden="true"
							className={`mt-2 shrink-0 ${platform.color}`}
						>
							{platform.icon}
						</div>
						<div className="flex-1">
							<Label htmlFor={platform.id}>{platform.label}</Label>
							<Input
								className="mt-1"
								id={platform.id}
								onChange={(e) => handleChange(platform.id, e.target.value)}
								placeholder={platform.placeholder}
								type="url"
								value={(profile[platform.id] as string) || ''}
							/>
						</div>
					</div>
				))}
			</div>

			<div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
				<h4 className="mb-2 font-semibold text-blue-900">Tips for Social Media</h4>
				<ul className="space-y-1 text-sm text-blue-800">
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
