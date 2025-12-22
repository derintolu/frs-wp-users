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
	license_number?: string;
	city_state?: string;
	region?: string;
	specialties_lo?: string[];
	languages?: string[];
	awards?: string[];
	facebook_url?: string;
	instagram_url?: string;
	linkedin_url?: string;
	twitter_url?: string;
	select_person_type?: string;
}

/**
 * Card size variants
 */
const cardVariants = cva(
	'transition-all duration-300 hover:shadow-lg',
	{
		variants: {
			size: {
				small: 'max-w-xs',
				medium: 'max-w-md',
				large: 'max-w-2xl',
			},
			audience: {
				internal: 'border-blue-200 bg-blue-50/50',
				external: 'border-gray-200 bg-white',
			},
		},
		defaultVariants: {
			size: 'medium',
			audience: 'external',
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
	profile: LoanOfficerProfile;
	detailLevel?: DetailLevel;
	showContactButtons?: boolean;
	onContactClick?: (profile: LoanOfficerProfile, method: 'phone' | 'email') => void;
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
	if (!phone) return null;
	const cleaned = phone.replace(/\D/g, '');
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
			profile,
			size = 'medium',
			audience = 'external',
			detailLevel = 'standard',
			showContactButtons = true,
			onContactClick,
			className,
			...props
		},
		ref
	) => {
		const phone = profile.mobile_number || profile.phone_number;
		const formattedPhone = formatPhone(phone);

		// Social media links
		const socialLinks = [
			{ platform: 'linkedin', url: profile.linkedin_url, icon: Linkedin },
			{ platform: 'facebook', url: profile.facebook_url, icon: Facebook },
			{ platform: 'instagram', url: profile.instagram_url, icon: Instagram },
			{ platform: 'twitter', url: profile.twitter_url, icon: Twitter },
		].filter(link => link.url);

		return (
			<Card
				ref={ref}
				className={cn(cardVariants({ size, audience }), className)}
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
							size === 'small' ? 'h-16 w-16' : size === 'medium' ? 'h-20 w-20' : 'h-24 w-24'
						)}>
							<AvatarImage
								src={profile.headshot_url}
								alt={profile.full_name}
							/>
							<AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-lg font-semibold">
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
								<Badge variant="outline" className="mt-2 text-xs">
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
							<p className="text-sm text-muted-foreground mb-4 line-clamp-3">
								{profile.biography}
							</p>
						)}

						{/* Contact Information */}
						<div className="space-y-2">
							{profile.city_state && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<MapPin className="h-4 w-4 flex-shrink-0" />
									<span>{profile.city_state}</span>
								</div>
							)}
							{profile.email && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Mail className="h-4 w-4 flex-shrink-0" />
									<a href={`mailto:${profile.email}`} className="hover:text-foreground transition-colors">
										{profile.email}
									</a>
								</div>
							)}
							{formattedPhone && (
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<Phone className="h-4 w-4 flex-shrink-0" />
									<a href={`tel:${phone}`} className="hover:text-foreground transition-colors">
										{formattedPhone}
									</a>
								</div>
							)}
						</div>

						{/* Specialties - standard and full detail */}
						{profile.specialties_lo && profile.specialties_lo.length > 0 && (
							<div className="mt-4">
								<p className="text-xs font-semibold text-muted-foreground mb-2">Specialties</p>
								<div className="flex flex-wrap gap-1">
									{profile.specialties_lo.slice(0, size === 'small' ? 2 : size === 'medium' ? 4 : 6).map((specialty, idx) => (
										<Badge key={idx} variant="secondary" className="text-xs">
											{specialty}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Languages - full detail only */}
						{detailLevel === 'full' && profile.languages && profile.languages.length > 0 && (
							<div className="mt-4">
								<p className="text-xs font-semibold text-muted-foreground mb-2">Languages</p>
								<div className="flex flex-wrap gap-1">
									{profile.languages.map((language, idx) => (
										<Badge key={idx} variant="outline" className="text-xs">
											{language}
										</Badge>
									))}
								</div>
							</div>
						)}

						{/* Awards - full detail only */}
						{detailLevel === 'full' && profile.awards && profile.awards.length > 0 && (
							<div className="mt-4">
								<div className="flex items-center gap-2 mb-2">
									<Award className="h-4 w-4 text-muted-foreground" />
									<p className="text-xs font-semibold text-muted-foreground">Awards & Recognition</p>
								</div>
								<ul className="text-xs text-muted-foreground space-y-1">
									{profile.awards.slice(0, 3).map((award, idx) => (
										<li key={idx}>• {award}</li>
									))}
								</ul>
							</div>
						)}

						{/* Social Links - standard and full */}
						{socialLinks.length > 0 && (
							<div className="mt-4 flex gap-2">
								{socialLinks.map(({ platform, url, icon: Icon }) => (
									<a
										key={platform}
										href={url}
										target="_blank"
										rel="noopener noreferrer"
										className="text-muted-foreground hover:text-foreground transition-colors"
										aria-label={platform}
									>
										<Icon className="h-5 w-5" />
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
								variant={size === 'large' ? 'default' : 'outline'}
								size={size === 'small' ? 'sm' : 'default'}
								className="w-full"
								onClick={() => onContactClick?.(profile, 'phone')}
								asChild
							>
								<a href={`tel:${phone}`}>
									<Phone className="mr-2 h-4 w-4" />
									Call Now
								</a>
							</Button>
						)}
						{profile.email && (
							<Button
								variant={size === 'large' ? 'default' : 'outline'}
								size={size === 'small' ? 'sm' : 'default'}
								className="w-full"
								onClick={() => onContactClick?.(profile, 'email')}
								asChild
							>
								<a href={`mailto:${profile.email}`}>
									<Mail className="mr-2 h-4 w-4" />
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
