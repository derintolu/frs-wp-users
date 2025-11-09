import { createRoot } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';

interface BlockAttributes {
	userId: number;
	profileId: number;
	size: 'small' | 'medium' | 'large';
	detailLevel: 'minimal' | 'standard' | 'full';
	audience: 'internal' | 'external';
	showContactButtons: boolean;
}

interface Profile {
	id: number;
	first_name: string;
	last_name: string;
	full_name: string;
	email: string;
	phone_number?: string;
	mobile_number?: string;
	job_title?: string;
	headshot_url?: string;
	biography?: string;
	nmls_number?: string;
	city_state?: string;
	region?: string;
	specialties_lo?: string[];
	languages?: string[];
}

function LoanOfficerCardView({ attributes }: { attributes: BlockAttributes }) {
	const { profileId, size, detailLevel, audience, showContactButtons } = attributes;
	const [profile, setProfile] = useState<Profile | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!profileId) {
			setLoading(false);
			return;
		}

		apiFetch<Profile>({ path: `/frs-users/v1/profiles/${profileId}` })
			.then((data) => {
				setProfile(data);
				setLoading(false);
			})
			.catch(() => {
				setLoading(false);
			});
	}, [profileId]);

	if (loading) {
		return (
			<div className="frs-loan-officer-card">
				<div className="animate-pulse">
					<div className="h-48 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="frs-loan-officer-card">
				<p className="text-gray-500">No profile selected</p>
			</div>
		);
	}

	const cardSizeClasses = {
		small: 'max-w-xs',
		medium: 'max-w-md',
		large: 'max-w-2xl',
	};

	const showBio = detailLevel === 'full' || detailLevel === 'standard';
	const showSpecialties = detailLevel === 'full';
	const showExtendedInfo = detailLevel === 'full';

	return (
		<div className={`frs-loan-officer-card ${cardSizeClasses[size]} mx-auto`}>
			<div className="border rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border-gray-200 bg-white overflow-hidden">
				{/* Card Header */}
				<div className="p-6">
					<div className="flex gap-4 flex-col items-center text-center">
						{/* Avatar */}
						<div className="relative">
							{profile.headshot_url ? (
								<img
									src={profile.headshot_url}
									alt={profile.full_name}
									className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
								/>
							) : (
								<div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center border-4 border-blue-100">
									<span className="text-white text-2xl font-bold">
										{profile.first_name?.[0]}
										{profile.last_name?.[0]}
									</span>
								</div>
							)}
						</div>

						{/* Name & Title */}
						<div>
							<h3 className="text-xl font-bold text-gray-900">{profile.full_name}</h3>
							{profile.job_title && (
								<p className="text-sm text-gray-600 mt-1">{profile.job_title}</p>
							)}
							{profile.nmls_number && (
								<p className="text-sm text-gray-500 mt-1">NMLS# {profile.nmls_number}</p>
							)}
						</div>
					</div>

					{/* Bio */}
					{showBio && profile.biography && (
						<div className="mt-4">
							<p className="text-sm text-gray-700">{profile.biography}</p>
						</div>
					)}

					{/* Contact Info */}
					<div className="mt-4 space-y-2">
						{profile.email && (
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
								</svg>
								<a href={`mailto:${profile.email}`} className="text-blue-600 hover:underline">
									{profile.email}
								</a>
							</div>
						)}
						{profile.phone_number && (
							<div className="flex items-center gap-2 text-sm text-gray-600">
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
								</svg>
								<a href={`tel:${profile.phone_number}`} className="text-blue-600 hover:underline">
									{profile.phone_number}
								</a>
							</div>
						)}
					</div>

					{/* Specialties */}
					{showSpecialties && profile.specialties_lo && profile.specialties_lo.length > 0 && (
						<div className="mt-4">
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
								Specialties
							</p>
							<div className="flex flex-wrap gap-2">
								{profile.specialties_lo.map((specialty, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
									>
										{specialty}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Languages */}
					{showExtendedInfo && profile.languages && profile.languages.length > 0 && (
						<div className="mt-3">
							<p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
								Languages
							</p>
							<div className="flex flex-wrap gap-2">
								{profile.languages.map((language, index) => (
									<span
										key={index}
										className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
									>
										{language}
									</span>
								))}
							</div>
						</div>
					)}

					{/* Action Buttons */}
					{showContactButtons && (
						<div className="mt-6 flex gap-2">
							{profile.phone_number && (
								<a
									href={`tel:${profile.phone_number}`}
									className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors text-center"
								>
									Call Now
								</a>
							)}
							{profile.email && (
								<a
									href={`mailto:${profile.email}`}
									className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors text-center"
								>
									Email
								</a>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// Initialize all blocks on the page
document.addEventListener('DOMContentLoaded', () => {
	const blocks = document.querySelectorAll('.wp-block-frs-users-loan-officer-card');

	blocks.forEach((block) => {
		const htmlElement = block as HTMLElement;
		const attributes = JSON.parse(
			htmlElement.dataset.attributes || '{}'
		) as BlockAttributes;

		const root = createRoot(htmlElement);
		root.render(<LoanOfficerCardView attributes={attributes} />);
	});
});
