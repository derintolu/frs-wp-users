import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Sidebar from './Sidebar';
import AboutSection from './sections/AboutSection';
import SocialMediaSection from './sections/SocialMediaSection';
import LinksSection from './sections/LinksSection';
import ServiceAreasSection from './sections/ServiceAreasSection';
import SpecialtiesSection from './sections/SpecialtiesSection';
import PreviewTabs from './preview/PreviewTabs';

interface ProfileEditorProps {
	profileId: number;
	userId: number;
}

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

export default function ProfileEditor({ profileId, userId }: ProfileEditorProps) {
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);
	const [activeSection, setActiveSection] = useState('about');
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

	useEffect(() => {
		fetchProfile();
	}, [profileId]);

	const fetchProfile = async () => {
		try {
			const response = await fetch(
				`/wp-json/frs-users/v1/profiles/${profileId}`,
				{
					headers: {
						'X-WP-Nonce': (window as any).wpApiSettings?.nonce || '',
					},
				}
			);

			if (!response.ok) throw new Error('Failed to fetch profile');

			const data = await response.json();
			setProfile(data.data);
		} catch (error) {
			console.error('Error fetching profile:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSave = async () => {
		if (!profile) return;

		try {
			const response = await fetch(
				`/wp-json/frs-users/v1/profiles/${profileId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						'X-WP-Nonce': (window as any).wpApiSettings?.nonce || '',
					},
					body: JSON.stringify(profile),
				}
			);

			if (!response.ok) throw new Error('Failed to save profile');

			setHasUnsavedChanges(false);
			// Show success message
			alert('Profile saved successfully!');
		} catch (error) {
			console.error('Error saving profile:', error);
			alert('Failed to save profile. Please try again.');
		}
	};

	const handleProfileChange = (updates: Partial<Profile>) => {
		if (!profile) return;

		setProfile({ ...profile, ...updates });
		setHasUnsavedChanges(true);
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-gray-600">Loading your profile...</p>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="text-center py-12">
				<p className="text-red-600">Profile not found.</p>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
			{/* Header */}
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl md:text-3xl font-bold text-gray-900">
						Edit Your Profile
					</h1>
					<p className="text-gray-600 mt-1">
						Manage your public profile and visibility settings
					</p>
				</div>
				<div className="flex gap-2">
					<Button variant="outline" size="sm">
						View Live Profile
					</Button>
					<Button
						onClick={handleSave}
						disabled={!hasUnsavedChanges}
						size="sm"
					>
						{hasUnsavedChanges ? 'Save Changes' : 'Saved'}
					</Button>
				</div>
			</div>

			{/* Main Editor Layout */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
				{/* Sidebar Navigation */}
				<div className="lg:col-span-3">
					<Sidebar
						activeSection={activeSection}
						onSectionChange={setActiveSection}
						profile={profile}
					/>
				</div>

				{/* Editor Content Area */}
				<div className="lg:col-span-9">
					<Card className="p-6">
						{/* Preview Tabs at Top */}
						<PreviewTabs profile={profile} className="mb-6" />

						{/* Section Content */}
						<div className="mt-6">
							{activeSection === 'about' && (
								<AboutSection
									profile={profile}
									onChange={handleProfileChange}
								/>
							)}
							{activeSection === 'social' && (
								<SocialMediaSection
									profile={profile}
									onChange={handleProfileChange}
								/>
							)}
							{activeSection === 'links' && (
								<LinksSection
									profile={profile}
									onChange={handleProfileChange}
								/>
							)}
							{activeSection === 'service-areas' && (
								<ServiceAreasSection
									profile={profile}
									onChange={handleProfileChange}
								/>
							)}
							{activeSection === 'specialties' && (
								<SpecialtiesSection
									profile={profile}
									onChange={handleProfileChange}
								/>
							)}
						</div>
					</Card>
				</div>
			</div>

			{/* Unsaved Changes Warning */}
			{hasUnsavedChanges && (
				<div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg">
					<p className="text-sm text-yellow-800 mb-2">
						You have unsaved changes
					</p>
					<Button onClick={handleSave} size="sm">
						Save Now
					</Button>
				</div>
			)}
		</div>
	);
}
