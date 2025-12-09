import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Award, Linkedin, Facebook, Instagram, Twitter } from 'lucide-react';

/**
 * Loan Officer Profile Data Interface
 */
export interface LoanOfficerProfile {
	awards?: string[];
	biography?: string;
	city_state?: string;
	email: string;
	facebook_url?: string;
	first_name: string;
	full_name: string;
	headshot_url?: string;
	id: number;
	instagram_url?: string;
	job_title?: string;
	languages?: string[];
	last_name: string;
	license_number?: string;
	linkedin_url?: string;
	mobile_number?: string;
	nmls_number?: string;
	phone_number?: string;
	region?: string;
	select_person_type?: string;
	specialties_lo?: string[];
	twitter_url?: string;
}

/**
 * Card size variants
 */
const cardVariants = cva(
	'transition-all duration-300 hover:shadow-lg',
	{
		defaultVariants: {
			audience: 'external',
			size: 'medium',
		},
		variants: {
			audience: {
				external: 'border-gray-200 bg-white',
				internal: 'border-blue-200 bg-blue-50/50',
			},
			size: {
				large: 'max-w-2xl',
				medium: 'max-w-md',
				small: 'max-w-xs',
			},
		},
	}
);

/**
 * Detail level configuration
 */
export type DetailLevel = 'minimal' | 'standard' | 'full';

/**
 * Props for LoanOfficerCard component
 */
export interface LoanOfficerCardProps
	extends React.HTMLAttributes<HTMLDivElement>,
		VariantProps<typeof cardVariants> {
	detailLevel?: DetailLevel;
	onContactClick?: (profile: LoanOfficerProfile, method: 'phone' | 'email') => void;
	profile: LoanOfficerProfile;
	showContactButtons?: boolean;
}

/**
 * Get initials from name for avatar fallback
 */
const getInitials = (firstName: string, lastName: string): string => {
	return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

/**
 * Format phone number for display
 */
const formatPhone = (phone?: string): string | null => {
	if (!phone) {return null;}
	const cleaned = phone.replaceAll(/\D/g, '');
	if (cleaned.length === 10) {
		return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
	}
	return phone;
};

/**
 * Loan Officer Card Component
 *
 * Displays loan officer profile information with configurable size, detail level, and audience.
 *
 * @param profile - Loan officer profile data
 * @param size - Card size variant (small, medium, large)
 * @param audience - Target audience (internal, external)
 * @param detailLevel - Amount of detail to show (minimal, standard, full)
 * @param showContactButtons - Whether to show contact action buttons
 * @param onContactClick - Callback when contact button is clicked
 */
export const LoanOfficerCard = React.forwardRef<HTMLDivElement, LoanOfficerCardProps>(
	(
		{
			audience = 'external',
			className,
			detailLevel = 'standard',
			onContactClick,
			profile,
			showContactButtons = true,
			size = 'medium',
			...props
		},
		ref
	) => {
		const phone = profile.mobile_number || profile.phone_number;
		const formattedPhone = formatPhone(phone);

		// Social media links
		const socialLinks = [
			{ icon: Linkedin, platform: 'linkedin', url: profile.linkedin_url },
			{ icon: Facebook, platform: 'facebook', url: profile.facebook_url },
			{ icon: Instagram, platform: 'instagram', url: profile.instagram_url },
			{ icon: Twitter, platform: 'twitter', url: profile.twitter_url },
		].filter(link => link.url);

		return (
			<Card
				className={cn(cardVariants({ audience, size }), className)}
				ref={ref}
				{...props}
			>
				<CardHeader className={cn(
					size === 'small' ? 'p-4' : size === 'medium' ? 'p-6' : 'p-8'
				)}>
					<div className={cn(
						'flex gap-4',
						size === 'large' ? 'flex-row items-start' : 'flex-col items-center text-center'
					)}>
						{/* Avatar */}
						<Avatar className={cn(
							size === 'small' ? 'size-16' : size === 'medium' ? 'size-20' : 'size-24'
						)}>
							<AvatarImage
								alt={profile.full_name}
								src={profile.headshot_url}
							/>
							<AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-lg font-semibold text-white">
								{getInitials(profile.first_name, profile.last_name)}
							</AvatarFallback>
						</Avatar>

						{/* Name and Title */}
						<div className={cn('flex-1', size === 'large' && 'text-left')}>
							<CardTitle className={cn(
								size === 'small' ? 'text-lg' : size === 'medium' ? 'text-xl' : 'text-2xl'
							)}>
								{profile.full_name}
							</CardTitle>
							{profile.job_title && (
								<CardDescription className={cn(
									'mt-1',
									size === 'small' ? 'text-xs' : 'text-sm'
								)}>
									{profile.job_title}
								</CardDescription>
							)}
							{profile.nmls_number && detailLevel !== 'minimal' && (
								<Badge className="mt-2 text-xs" variant="outline">
									NMLS# {profile.nmls_number}
								</Badge>
							)}
						</div>
					</div>
				</CardHeader>

				{/* Content - only show for standard and full detail levels */}
				{detailLevel !== 'minimal' && (
					<CardContent className={cn(
						size === 'small' ? 'p-4 pt-0' : size === 'medium' ? 'p-6 pt-0' : 'p-8 pt-0'
					)}>
						{/* Biography - full detail only */}
						{detailLevel === 'full' && profile.biography && (
							<p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
								{profile.biography}
							</p>
						)}

						{/* Contact Information */}
						<div className="space-y-2">
							{profile.city_state && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<MapPin className="size-4 shrink-0" />
									<span>{profile.city_state}</span>
								</div>
							)}
							{profile.email && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Mail className="size-4 shrink-0" />
									<a className="transition-colors hover:text-foreground" href={`mailto:${profile.email}`}>
										{profile.email}
									</a>
								</div>
							)}
							{formattedPhone && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Phone className="size-4 shrink-0" />
									<a className="transition-colors hover:text-foreground" href={`tel:${phone}`}>
										{formattedPhone}
									</a>
								</div>
							)}
						</div>

						{/* Specialties - standard and full detail */}
						{profile.specialties_lo && profile.specialties_lo.length > 0 && (
							<div className="mt-4">
								<p className="mb-2 text-xs font-semibold text-muted-foreground">Specialties</p>
								<div className="flex flex-wrap gap-1">
									{profile.specialties_lo.slice(0, size === 'small' ? 2 : size === 'medium' ? 4 : 6).map((specialty, idx) => (
										<Badge className="text-xs" key={idx} variant="secondary">
											{specialty}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Languages - full detail only */}
						{detailLevel === 'full' && profile.languages && profile.languages.length > 0 && (
							<div className="mt-4">
								<p className="mb-2 text-xs font-semibold text-muted-foreground">Languages</p>
								<div className="flex flex-wrap gap-1">
									{profile.languages.map((language, idx) => (
										<Badge className="text-xs" key={idx} variant="outline">
											{language}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Awards - full detail only */}
						{detailLevel === 'full' && profile.awards && profile.awards.length > 0 && (
							<div className="mt-4">
								<div className="mb-2 flex items-center gap-2">
									<Award className="size-4 text-muted-foreground" />
									<p className="text-xs font-semibold text-muted-foreground">Awards & Recognition</p>
								</div>
								<ul className="space-y-1 text-xs text-muted-foreground">
									{profile.awards.slice(0, 3).map((award, idx) => (
										<li key={idx}>• {award}</li>
									))}
								</ul>
							</div>
						)}

						{/* Social Links - standard and full */}
						{socialLinks.length > 0 && (
							<div className="mt-4 flex gap-2">
								{socialLinks.map(({ icon: Icon, platform, url }) => (
									<a
										aria-label={platform}
										className="text-muted-foreground transition-colors hover:text-foreground"
										href={url}
										key={platform}
										rel="noopener noreferrer"
										target="_blank"
									>
										<Icon className="size-5" />
									</a>
								))}
							</div>
						)}
					</CardContent>
				)}

				{/* Contact Buttons */}
				{showContactButtons && (
					<CardFooter className={cn(
						'gap-2',
						size === 'small' ? 'p-4 pt-0' : size === 'medium' ? 'p-6 pt-0' : 'p-8 pt-0',
						size === 'large' ? 'flex-row' : 'flex-col'
					)}>
						{formattedPhone && (
							<Button
								asChild
								className="w-full"
								onClick={() => onContactClick?.(profile, 'phone')}
								size={size === 'small' ? 'sm' : 'default'}
								variant={size === 'large' ? 'default' : 'outline'}
							>
								<a href={`tel:${phone}`}>
									<Phone className="mr-2 size-4" />
									Call Now
								</a>
							</Button>
						)}
						{profile.email && (
							<Button
								asChild
								className="w-full"
								onClick={() => onContactClick?.(profile, 'email')}
								size={size === 'small' ? 'sm' : 'default'}
								variant={size === 'large' ? 'default' : 'outline'}
							>
								<a href={`mailto:${profile.email}`}>
									<Mail className="mr-2 size-4" />
									Send Email
								</a>
							</Button>
						)}
					</CardFooter>
				)}
			</Card>
		);
	}
);

LoanOfficerCard.displayName = 'LoanOfficerCard';

export default LoanOfficerCard;
