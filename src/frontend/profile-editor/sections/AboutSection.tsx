import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { User, Upload } from 'lucide-react';

interface Profile {
	biography: string;
	city_state: string;
	email: string;
	first_name: string;
	headshot_url?: string;
	id: number;
	job_title: string;
	last_name: string;
	mobile_number: string;
	phone_number: string;
}

interface AboutSectionProps {
	onChange: (updates: Partial<Profile>) => void;
	profile: Profile;
}

export default function AboutSection({ onChange, profile }: AboutSectionProps) {
	const handleChange = (
		field: keyof Profile,
		value: string
	) => {
		onChange({ [field]: value });
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-2 text-2xl font-bold">About You</h2>
				<p className="text-gray-600">
					Basic information that appears on your public profile
				</p>
			</div>

			{/* Profile Photo */}
			<div className="border-b pb-6">
				<Label className="mb-3 block text-base font-semibold">
					Profile Photo
				</Label>
				<div className="flex items-start gap-6">
					<div className="relative">
						{profile.headshot_url ? (
							<img
								alt={`${profile.first_name} ${profile.last_name}`}
								className="size-32 rounded-full border-2 border-gray-200 object-cover"
								src={profile.headshot_url}
							/>
						) : (
							<div className="flex size-32 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-100">
								<User className="size-16 text-gray-400" />
							</div>
						)}
					</div>
					<div className="flex-1">
						<p className="mb-3 text-sm text-gray-600">
							Your profile photo appears on your public profile, directory listings,
							and biolink page. Recommended size: 400x400px
						</p>
						<Button size="sm" variant="outline">
							<Upload className="mr-2 size-4" />
							Upload Photo
						</Button>
					</div>
				</div>
			</div>

			{/* Name */}
			<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
				<div>
					<Label htmlFor="first_name">First Name</Label>
					<Input
						id="first_name"
						onChange={(e) => handleChange('first_name', e.target.value)}
						placeholder="John"
						value={profile.first_name || ''}
					/>
				</div>
				<div>
					<Label htmlFor="last_name">Last Name</Label>
					<Input
						id="last_name"
						onChange={(e) => handleChange('last_name', e.target.value)}
						placeholder="Doe"
						value={profile.last_name || ''}
					/>
				</div>
			</div>

			{/* Job Title */}
			<div>
				<Label htmlFor="job_title">Job Title</Label>
				<Input
					id="job_title"
					onChange={(e) => handleChange('job_title', e.target.value)}
					placeholder="Senior Loan Officer"
					value={profile.job_title || ''}
				/>
				<p className="mt-1 text-sm text-gray-500">
					This appears below your name on your profile
				</p>
			</div>

			{/* Contact Information */}
			<div className="border-t pt-6">
				<h3 className="mb-4 text-lg font-semibold">Contact Information</h3>
				<div className="space-y-4">
					<div>
						<Label htmlFor="email">Email Address</Label>
						<Input
							id="email"
							onChange={(e) => handleChange('email', e.target.value)}
							placeholder="john@example.com"
							type="email"
							value={profile.email || ''}
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div>
							<Label htmlFor="phone_number">Office Phone</Label>
							<Input
								id="phone_number"
								onChange={(e) => handleChange('phone_number', e.target.value)}
								placeholder="(555) 123-4567"
								type="tel"
								value={profile.phone_number || ''}
							/>
						</div>
						<div>
							<Label htmlFor="mobile_number">Mobile Phone</Label>
							<Input
								id="mobile_number"
								onChange={(e) => handleChange('mobile_number', e.target.value)}
								placeholder="(555) 987-6543"
								type="tel"
								value={profile.mobile_number || ''}
							/>
						</div>
					</div>
					<div>
						<Label htmlFor="city_state">City, State</Label>
						<Input
							id="city_state"
							onChange={(e) => handleChange('city_state', e.target.value)}
							placeholder="Los Angeles, CA"
							value={profile.city_state || ''}
						/>
					</div>
				</div>
			</div>

			{/* Biography */}
			<div className="border-t pt-6">
				<h3 className="mb-4 text-lg font-semibold">Biography</h3>
				<div>
					<Label htmlFor="biography">About You</Label>
					<Textarea
						className="resize-none"
						id="biography"
						onChange={(e) => handleChange('biography', e.target.value)}
						placeholder="Tell visitors about yourself, your experience, and what makes you unique..."
						rows={6}
						value={profile.biography || ''}
					/>
					<p className="mt-1 text-sm text-gray-500">
						This appears on your profile page. Write in first person and be personable.
					</p>
				</div>
			</div>
		</div>
	);
}
