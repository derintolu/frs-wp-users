import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Building2, User, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Profile {
	biography: string;
	city_state: string;
	custom_links?: Array<{ title: string; url: string }>;
	email: string;
	facebook_url?: string;
	first_name: string;
	headshot_url?: string;
	id: number;
	instagram_url?: string;
	job_title: string;
	last_name: string;
	linkedin_url?: string;
	mobile_number: string;
	namb_certifications?: string[];
	nar_designations?: string[];
	phone_number: string;
	service_areas?: string[];
	specialties?: string[];
	specialties_lo?: string[];
	tiktok_url?: string;
	twitter_url?: string;
	youtube_url?: string;
}

interface PreviewTabsProps {
	className?: string;
	profile: Profile;
}

export default function PreviewTabs({ className, profile }: PreviewTabsProps) {
	const [activeTab, setActiveTab] = useState('company');

	const getSocialLinks = () => {
		const links = [];
		if (profile.facebook_url) {links.push({ name: 'Facebook', url: profile.facebook_url });}
		if (profile.instagram_url) {links.push({ name: 'Instagram', url: profile.instagram_url });}
		if (profile.linkedin_url) {links.push({ name: 'LinkedIn', url: profile.linkedin_url });}
		if (profile.twitter_url) {links.push({ name: 'Twitter', url: profile.twitter_url });}
		if (profile.youtube_url) {links.push({ name: 'YouTube', url: profile.youtube_url });}
		if (profile.tiktok_url) {links.push({ name: 'TikTok', url: profile.tiktok_url });}
		return links;
	};

	return (
		<div className={className}>
			<div className="mb-4">
				<h3 className="mb-1 text-lg font-semibold">Live Preview</h3>
				<p className="text-sm text-gray-600">
					See how your profile will look across different formats
				</p>
			</div>

			<Tabs onValueChange={setActiveTab} value={activeTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger className="flex items-center gap-2" value="company">
						<Building2 className="size-4" />
						<span className="hidden sm:inline">Company</span>
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="profile">
						<User className="size-4" />
						<span className="hidden sm:inline">Profile Page</span>
					</TabsTrigger>
					<TabsTrigger className="flex items-center gap-2" value="biolink">
						<Link2 className="size-4" />
						<span className="hidden sm:inline">Biolink</span>
					</TabsTrigger>
				</TabsList>

				{/* Company Directory Preview */}
				<TabsContent value="company">
					<Card className="p-6">
						<div className="max-w-sm">
							<div className="mb-4 flex items-start gap-4">
								{profile.headshot_url ? (
									<img
										alt={`${profile.first_name} ${profile.last_name}`}
										className="size-20 rounded-full object-cover"
										src={profile.headshot_url}
									/>
								) : (
									<div className="flex size-20 items-center justify-center rounded-full bg-gray-200">
										<User className="size-10 text-gray-400" />
									</div>
								)}
								<div className="flex-1">
									<h4 className="text-lg font-bold">
										{profile.first_name} {profile.last_name}
									</h4>
									<p className="text-sm text-gray-600">{profile.job_title}</p>
									<p className="mt-1 text-sm text-gray-500">{profile.city_state}</p>
								</div>
							</div>
							<div className="space-y-2 text-sm">
								{profile.phone_number && (
									<div>
										<span className="font-medium">Phone:</span> {profile.phone_number}
									</div>
								)}
								{profile.email && (
									<div>
										<span className="font-medium">Email:</span> {profile.email}
									</div>
								)}
								{profile.service_areas && profile.service_areas.length > 0 && (
									<div>
										<span className="font-medium">Service Areas:</span>{' '}
										{profile.service_areas.slice(0, 3).join(', ')}
										{profile.service_areas.length > 3 && '...'}
									</div>
								)}
							</div>
							<Button className="mt-4 w-full" size="sm">
								View Full Profile
							</Button>
						</div>
					</Card>
				</TabsContent>

				{/* Profile Page Preview */}
				<TabsContent value="profile">
					<Card className="p-6">
						<div className="mx-auto max-w-2xl">
							{/* Header */}
							<div className="mb-6 text-center">
								{profile.headshot_url ? (
									<img
										alt={`${profile.first_name} ${profile.last_name}`}
										className="mx-auto mb-4 size-32 rounded-full object-cover"
										src={profile.headshot_url}
									/>
								) : (
									<div className="mx-auto mb-4 flex size-32 items-center justify-center rounded-full bg-gray-200">
										<User className="size-16 text-gray-400" />
									</div>
								)}
								<h1 className="mb-2 text-3xl font-bold">
									{profile.first_name} {profile.last_name}
								</h1>
								<p className="mb-2 text-xl text-gray-600">{profile.job_title}</p>
								<p className="text-gray-500">{profile.city_state}</p>
							</div>

							{/* Biography */}
							{profile.biography && (
								<div className="mb-6">
									<h3 className="mb-2 font-semibold">About</h3>
									<p className="text-sm leading-relaxed text-gray-700">
										{profile.biography.slice(0, 300)}
										{profile.biography.length > 300 && '...'}
									</p>
								</div>
							)}

							{/* Contact */}
							<div className="mb-6">
								<h3 className="mb-2 font-semibold">Contact</h3>
								<div className="space-y-1 text-sm">
									{profile.email && <div>Email: {profile.email}</div>}
									{profile.phone_number && <div>Phone: {profile.phone_number}</div>}
									{profile.mobile_number && <div>Mobile: {profile.mobile_number}</div>}
								</div>
							</div>

							{/* Specialties */}
							{(profile.specialties_lo?.length || profile.specialties?.length) && (
								<div className="mb-6">
									<h3 className="mb-2 font-semibold">Specialties</h3>
									<div className="flex flex-wrap gap-2">
										{profile.specialties_lo?.map((spec, idx) => (
											<span
												className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800"
												key={idx}
											>
												{spec}
											</span>
										))}
										{profile.specialties?.map((spec, idx) => (
											<span
												className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-800"
												key={idx}
											>
												{spec}
											</span>
										))}
									</div>
								</div>
							)}
						</div>
					</Card>
				</TabsContent>

				{/* Biolink Preview */}
				<TabsContent value="biolink">
					<Card className="p-6">
						<div className="mx-auto max-w-md">
							{/* Profile Header */}
							<div className="mb-6 text-center">
								{profile.headshot_url ? (
									<img
										alt={`${profile.first_name} ${profile.last_name}`}
										className="mx-auto mb-3 size-24 rounded-full object-cover"
										src={profile.headshot_url}
									/>
								) : (
									<div className="mx-auto mb-3 flex size-24 items-center justify-center rounded-full bg-gray-200">
										<User className="size-12 text-gray-400" />
									</div>
								)}
								<h2 className="text-2xl font-bold">
									{profile.first_name} {profile.last_name}
								</h2>
								<p className="text-gray-600">{profile.job_title}</p>
							</div>

							{/* Social Media Links */}
							{getSocialLinks().length > 0 && (
								<div className="mb-6">
									<div className="flex justify-center gap-3">
										{getSocialLinks().map((link, idx) => (
											<Button
												className="rounded-full"
												key={idx}
												size="sm"
												variant="outline"
											>
												{link.name}
											</Button>
										))}
									</div>
								</div>
							)}

							{/* Custom Links */}
							{profile.custom_links && profile.custom_links.length > 0 && (
								<div className="mb-6 space-y-2">
									{profile.custom_links.map((link, idx) => (
										<Button
											className="w-full justify-between"
											key={idx}
											variant="outline"
										>
											<span>{link.title}</span>
											<ExternalLink className="size-4" />
										</Button>
									))}
								</div>
							)}

							{/* Contact Button */}
							<Button className="w-full" size="lg">
								Contact Me
							</Button>
						</div>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
}
