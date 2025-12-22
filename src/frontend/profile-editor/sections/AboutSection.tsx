import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { User, Upload } from 'lucide-react';

interface Profile {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	phone_number: string;
	mobile_number: string;
	job_title: string;
	biography: string;
	city_state: string;
	headshot_url?: string;
}

interface AboutSectionProps {
	profile: Profile;
	onChange: (updates: Partial<Profile>) => void;
}

export default function AboutSection({ profile, onChange }: AboutSectionProps) {
	const handleChange = (
		field: keyof Profile,
		value: string
	) => {
		onChange({ [field]: value });
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">About You</h2>
				<p className="text-gray-600">
					Basic information that appears on your public profile
				</p>
			</div>

			{/* Profile Photo */}
			<div className="border-b pb-6">
				<Label className="text-base font-semibold mb-3 block">
					Profile Photo
				</Label>
				<div className="flex items-start gap-6">
					<div className="relative">
						{profile.headshot_url ? (
							<img
								src={profile.headshot_url}
								alt={`${profile.first_name} ${profile.last_name}`}
								className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
							/>
						) : (
							<div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
								<User className="w-16 h-16 text-gray-400" />
							</div>
						)}
					</div>
					<div className="flex-1">
						<p className="text-sm text-gray-600 mb-3">
							Your profile photo appears on your public profile, directory listings,
							and biolink page. Recommended size: 400x400px
						</p>
						<Button variant="outline" size="sm">
							<Upload className="w-4 h-4 mr-2" />
							Upload Photo
						</Button>
					</div>
				</div>
			</div>

			{/* Name */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<Label htmlFor="first_name">First Name</Label>
					<Input
						id="first_name"
						value={profile.first_name || ''}
						onChange={(e) => handleChange('first_name', e.target.value)}
						placeholder="John"
					/>
				</div>
				<div>
					<Label htmlFor="last_name">Last Name</Label>
					<Input
						id="last_name"
						value={profile.last_name || ''}
						onChange={(e) => handleChange('last_name', e.target.value)}
						placeholder="Doe"
					/>
				</div>
			</div>

			{/* Job Title */}
			<div>
				<Label htmlFor="job_title">Job Title</Label>
				<Input
					id="job_title"
					value={profile.job_title || ''}
					onChange={(e) => handleChange('job_title', e.target.value)}
					placeholder="Senior Loan Officer"
				/>
				<p className="text-sm text-gray-500 mt-1">
					This appears below your name on your profile
				</p>
			</div>

			{/* Contact Information */}
			<div className="border-t pt-6">
				<h3 className="text-lg font-semibold mb-4">Contact Information</h3>
				<div className="space-y-4">
					<div>
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							type="email"
							value={profile.email || ''}
							onChange={(e) => handleChange('email', e.target.value)}
							placeholder="john@example.com"
						/>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="phone_number">Office Phone</Label>
							<Input
								id="phone_number"
								type="tel"
								value={profile.phone_number || ''}
								onChange={(e) => handleChange('phone_number', e.target.value)}
								placeholder="(555) 123-4567"
							/>
						</div>
						<div>
							<Label htmlFor="mobile_number">Mobile Phone</Label>
							<Input
								id="mobile_number"
								type="tel"
								value={profile.mobile_number || ''}
								onChange={(e) => handleChange('mobile_number', e.target.value)}
								placeholder="(555) 987-6543"
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="city_state">City, State</Label>
						<Input
							id="city_state"
							value={profile.city_state || ''}
							onChange={(e) => handleChange('city_state', e.target.value)}
							placeholder="Los Angeles, CA"
						/>
					</div>
				</div>
			</div>

			{/* Biography */}
			<div className="border-t pt-6">
				<h3 className="text-lg font-semibold mb-4">Biography</h3>
				<div>
					<Label htmlFor="biography">About You</Label>
					<Textarea
						id="biography"
						value={profile.biography || ''}
						onChange={(e) => handleChange('biography', e.target.value)}
						placeholder="Tell visitors about yourself, your experience, and what makes you unique..."
						rows={6}
						className="resize-none"
					/>
					<p className="text-sm text-gray-500 mt-1">
						This appears on your profile page. Write in first person and be personable.
					</p>
				</div>
			</div>
		</div>
	);
}
