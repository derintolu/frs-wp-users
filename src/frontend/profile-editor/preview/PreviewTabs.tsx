import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Building2, User, Link2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
	facebook_url?: string;
	instagram_url?: string;
	linkedin_url?: string;
	twitter_url?: string;
	youtube_url?: string;
	tiktok_url?: string;
	custom_links?: Array<{ title: string; url: string }>;
	service_areas?: string[];
	specialties?: string[];
	specialties_lo?: string[];
	nar_designations?: string[];
	namb_certifications?: string[];
}

interface PreviewTabsProps {
	profile: Profile;
	className?: string;
}

export default function PreviewTabs({ profile, className }: PreviewTabsProps) {
	const [activeTab, setActiveTab] = useState('company');

	const getSocialLinks = () => {
		const links = [];
		if (profile.facebook_url) links.push({ name: 'Facebook', url: profile.facebook_url });
		if (profile.instagram_url) links.push({ name: 'Instagram', url: profile.instagram_url });
		if (profile.linkedin_url) links.push({ name: 'LinkedIn', url: profile.linkedin_url });
		if (profile.twitter_url) links.push({ name: 'Twitter', url: profile.twitter_url });
		if (profile.youtube_url) links.push({ name: 'YouTube', url: profile.youtube_url });
		if (profile.tiktok_url) links.push({ name: 'TikTok', url: profile.tiktok_url });
		return links;
	};

	return (
		<div className={className}>
			<div className="mb-4">
				<h3 className="text-lg font-semibold mb-1">Live Preview</h3>
				<p className="text-sm text-gray-600">
					See how your profile will look across different formats
				</p>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab}>
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="company" className="flex items-center gap-2">
						<Building2 className="w-4 h-4" />
						<span className="hidden sm:inline">Company</span>
					</TabsTrigger>
					<TabsTrigger value="profile" className="flex items-center gap-2">
						<User className="w-4 h-4" />
						<span className="hidden sm:inline">Profile Page</span>
					</TabsTrigger>
					<TabsTrigger value="biolink" className="flex items-center gap-2">
						<Link2 className="w-4 h-4" />
						<span className="hidden sm:inline">Biolink</span>
					</TabsTrigger>
				</TabsList>

				{/* Company Directory Preview */}
				<TabsContent value="company">
					<Card className="p-6">
						<div className="max-w-sm">
							<div className="flex items-start gap-4 mb-4">
								{profile.headshot_url ? (
									<img
										src={profile.headshot_url}
										alt={`${profile.first_name} ${profile.last_name}`}
										className="w-20 h-20 rounded-full object-cover"
									/>
								) : (
									<div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
										<User className="w-10 h-10 text-gray-400" />
									</div>
								)}
								<div className="flex-1">
									<h4 className="font-bold text-lg">
										{profile.first_name} {profile.last_name}
									</h4>
									<p className="text-sm text-gray-600">{profile.job_title}</p>
									<p className="text-sm text-gray-500 mt-1">{profile.city_state}</p>
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
							<Button className="w-full mt-4" size="sm">
								View Full Profile
							</Button>
						</div>
					</Card>
				</TabsContent>

				{/* Profile Page Preview */}
				<TabsContent value="profile">
					<Card className="p-6">
						<div className="max-w-2xl mx-auto">
							{/* Header */}
							<div className="text-center mb-6">
								{profile.headshot_url ? (
									<img
										src={profile.headshot_url}
										alt={`${profile.first_name} ${profile.last_name}`}
										className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
									/>
								) : (
									<div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-4">
										<User className="w-16 h-16 text-gray-400" />
									</div>
								)}
								<h1 className="text-3xl font-bold mb-2">
									{profile.first_name} {profile.last_name}
								</h1>
								<p className="text-xl text-gray-600 mb-2">{profile.job_title}</p>
								<p className="text-gray-500">{profile.city_state}</p>
							</div>

							{/* Biography */}
							{profile.biography && (
								<div className="mb-6">
									<h3 className="font-semibold mb-2">About</h3>
									<p className="text-gray-700 text-sm leading-relaxed">
										{profile.biography.substring(0, 300)}
										{profile.biography.length > 300 && '...'}
									</p>
								</div>
							)}

							{/* Contact */}
							<div className="mb-6">
								<h3 className="font-semibold mb-2">Contact</h3>
								<div className="space-y-1 text-sm">
									{profile.email && <div>Email: {profile.email}</div>}
									{profile.phone_number && <div>Phone: {profile.phone_number}</div>}
									{profile.mobile_number && <div>Mobile: {profile.mobile_number}</div>}
								</div>
							</div>

							{/* Specialties */}
							{(profile.specialties_lo?.length || profile.specialties?.length) && (
								<div className="mb-6">
									<h3 className="font-semibold mb-2">Specialties</h3>
									<div className="flex flex-wrap gap-2">
										{profile.specialties_lo?.map((spec, idx) => (
											<span
												key={idx}
												className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
											>
												{spec}
											</span>
										))}
										{profile.specialties?.map((spec, idx) => (
											<span
												key={idx}
												className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs"
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
						<div className="max-w-md mx-auto">
							{/* Profile Header */}
							<div className="text-center mb-6">
								{profile.headshot_url ? (
									<img
										src={profile.headshot_url}
										alt={`${profile.first_name} ${profile.last_name}`}
										className="w-24 h-24 rounded-full object-cover mx-auto mb-3"
									/>
								) : (
									<div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3">
										<User className="w-12 h-12 text-gray-400" />
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
												key={idx}
												variant="outline"
												size="sm"
												className="rounded-full"
											>
												{link.name}
											</Button>
										))}
									</div>
								</div>
							)}

							{/* Custom Links */}
							{profile.custom_links && profile.custom_links.length > 0 && (
								<div className="space-y-2 mb-6">
									{profile.custom_links.map((link, idx) => (
										<Button
											key={idx}
											variant="outline"
											className="w-full justify-between"
										>
											<span>{link.title}</span>
											<ExternalLink className="w-4 h-4" />
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
