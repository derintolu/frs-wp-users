import * as React from 'react';
import { cn } from '@/lib/utils';
import { LoanOfficerCard, type LoanOfficerProfile, type DetailLevel } from './LoanOfficerCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, X, Filter, Grid3x3, LayoutGrid, LayoutList } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

/**
 * Card size type for directory
 */
export type CardSize = 'small' | 'medium' | 'large';

/**
 * Directory layout type
 */
export type DirectoryLayout = 'grid' | 'list';

/**
 * Filter options
 */
export interface DirectoryFilters {
	language?: string;
	personType?: string;
	region?: string;
	search?: string;
	specialty?: string;
}

/**
 * Props for LoanOfficerDirectory component
 */
export interface LoanOfficerDirectoryProps extends React.HTMLAttributes<HTMLDivElement> {
	audience?: 'internal' | 'external';
	detailLevel?: DetailLevel;
	initialCardSize?: CardSize;
	initialLayout?: DirectoryLayout;
	onContactClick?: (profile: LoanOfficerProfile, method: 'phone' | 'email') => void;
	onProfileClick?: (profile: LoanOfficerProfile) => void;
	profiles: LoanOfficerProfile[];
	showFilters?: boolean;
}

/**
 * Loan Officer Directory Component
 *
 * Displays a filterable directory of loan officers with configurable views.
 *
 * @param profiles - Array of loan officer profiles to display
 * @param audience - Target audience (internal shows additional filters/info, external is public-facing)
 * @param showFilters - Whether to show filter controls
 * @param initialCardSize - Initial card size
 * @param initialLayout - Initial layout (grid or list)
 * @param detailLevel - Amount of detail to show in cards
 * @param onProfileClick - Callback when profile card is clicked
 * @param onContactClick - Callback when contact button is clicked
 */
export const LoanOfficerDirectory: React.FC<LoanOfficerDirectoryProps> = ({
	audience = 'external',
	className,
	detailLevel = 'standard',
	initialCardSize = 'medium',
	initialLayout = 'grid',
	onContactClick,
	onProfileClick,
	profiles: initialProfiles,
	showFilters = true,
	...props
}) => {
	const [cardSize, setCardSize] = React.useState<CardSize>(initialCardSize);
	const [layout, setLayout] = React.useState<DirectoryLayout>(initialLayout);
	const [filters, setFilters] = React.useState<DirectoryFilters>({});
	const [profiles, setProfiles] = React.useState<LoanOfficerProfile[]>(initialProfiles);

	// Extract unique values for filter options
	const regions = React.useMemo(
		() => [...new Set(initialProfiles.map(p => p.region).filter(Boolean))].sort(),
		[initialProfiles]
	);

	const specialties = React.useMemo(
		() => [
			...new Set(
				initialProfiles.flatMap(p => p.specialties_lo || []).filter(Boolean)
			),
		].sort(),
		[initialProfiles]
	);

	const languages = React.useMemo(
		() => [
			...new Set(
				initialProfiles.flatMap(p => p.languages || []).filter(Boolean)
			),
		].sort(),
		[initialProfiles]
	);

	const personTypes = React.useMemo(
		() => [...new Set(initialProfiles.map(p => p.select_person_type).filter(Boolean))].sort(),
		[initialProfiles]
	);

	// Filter profiles based on current filters
	React.useEffect(() => {
		let filtered = [...initialProfiles];

		// Search filter
		if (filters.search) {
			const searchLower = filters.search.toLowerCase();
			filtered = filtered.filter(
				p =>
					p.full_name.toLowerCase().includes(searchLower) ||
					p.email?.toLowerCase().includes(searchLower) ||
					p.city_state?.toLowerCase().includes(searchLower) ||
					p.job_title?.toLowerCase().includes(searchLower) ||
					p.nmls_number?.includes(searchLower)
			);
		}

		// Region filter
		if (filters.region) {
			filtered = filtered.filter(p => p.region === filters.region);
		}

		// Specialty filter
		if (filters.specialty) {
			filtered = filtered.filter(p =>
				p.specialties_lo?.includes(filters.specialty!)
			);
		}

		// Language filter
		if (filters.language) {
			filtered = filtered.filter(p =>
				p.languages?.includes(filters.language!)
			);
		}

		// Person type filter (internal only)
		if (audience === 'internal' && filters.personType) {
			filtered = filtered.filter(p => p.select_person_type === filters.personType);
		}

		setProfiles(filtered);
	}, [filters, initialProfiles, audience]);

	// Update filter
	const updateFilter = (key: keyof DirectoryFilters, value: string | undefined) => {
		setFilters(prev => ({
			...prev,
			[key]: value || undefined,
		}));
	};

	// Clear all filters
	const clearFilters = () => {
		setFilters({});
	};

	// Check if any filters are active
	const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

	return (
		<div className={cn('space-y-6', className)} {...props}>
			{/* Header */}
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<div>
					<h2 className="text-2xl font-bold tracking-tight">Loan Officer Directory</h2>
					<p className="text-muted-foreground">
						{profiles.length} {profiles.length === 1 ? 'officer' : 'officers'} found
					</p>
				</div>

				{/* View Controls */}
				<div className="flex items-center gap-2">
					{/* Card Size Toggle */}
					<Tabs onValueChange={(v) => setCardSize(v as CardSize)} value={cardSize}>
						<TabsList>
							<TabsTrigger className="px-3" value="small">
								<Grid3x3 className="size-4" />
							</TabsTrigger>
							<TabsTrigger className="px-3" value="medium">
								<LayoutGrid className="size-4" />
							</TabsTrigger>
							<TabsTrigger className="px-3" value="large">
								<LayoutList className="size-4" />
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* Filters */}
			{showFilters && (
				<div className="space-y-4 rounded-lg border bg-muted/30 p-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Filter className="size-4 text-muted-foreground" />
							<h3 className="font-semibold">Filters</h3>
						</div>
						{hasActiveFilters && (
							<Button
								className="h-8 px-2"
								onClick={clearFilters}
								size="sm"
								variant="ghost"
							>
								<X className="mr-1 size-3" />
								Clear all
							</Button>
						)}
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{/* Search */}
						<div className="relative md:col-span-2">
							<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								className="pl-9"
								onChange={e => updateFilter('search', e.target.value)}
								placeholder="Search by name, email, NMLS..."
								value={filters.search || ''}
							/>
						</div>

						{/* Region Filter */}
						{regions.length > 0 && (
							<Select onValueChange={v => updateFilter('region', v)} value={filters.region || ''}>
								<SelectTrigger>
									<SelectValue placeholder="Region" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Regions</SelectItem>
									{regions.map(region => (
										<SelectItem key={region} value={region!}>
											{region}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						{/* Specialty Filter */}
						{specialties.length > 0 && (
							<Select onValueChange={v => updateFilter('specialty', v)} value={filters.specialty || ''}>
								<SelectTrigger>
									<SelectValue placeholder="Specialty" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Specialties</SelectItem>
									{specialties.map(specialty => (
										<SelectItem key={specialty} value={specialty}>
											{specialty}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						{/* Language Filter */}
						{languages.length > 0 && (
							<Select onValueChange={v => updateFilter('language', v)} value={filters.language || ''}>
								<SelectTrigger>
									<SelectValue placeholder="Language" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Languages</SelectItem>
									{languages.map(language => (
										<SelectItem key={language} value={language}>
											{language}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}

						{/* Person Type Filter (Internal Only) */}
						{audience === 'internal' && personTypes.length > 0 && (
							<Select onValueChange={v => updateFilter('personType', v)} value={filters.personType || ''}>
								<SelectTrigger>
									<SelectValue placeholder="Type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="">All Types</SelectItem>
									{personTypes.map(type => (
										<SelectItem key={type} value={type!}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						)}
					</div>

					{/* Active Filters */}
					{hasActiveFilters && (
						<div className="flex flex-wrap gap-2">
							{filters.search && (
								<Badge className="gap-1" variant="secondary">
									Search: {filters.search}
									<X
										className="size-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('search', undefined)}
									/>
								</Badge>
							)}
							{filters.region && (
								<Badge className="gap-1" variant="secondary">
									Region: {filters.region}
									<X
										className="size-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('region', undefined)}
									/>
								</Badge>
							)}
							{filters.specialty && (
								<Badge className="gap-1" variant="secondary">
									Specialty: {filters.specialty}
									<X
										className="size-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('specialty', undefined)}
									/>
								</Badge>
							)}
							{filters.language && (
								<Badge className="gap-1" variant="secondary">
									Language: {filters.language}
									<X
										className="size-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('language', undefined)}
									/>
								</Badge>
							)}
							{filters.personType && (
								<Badge className="gap-1" variant="secondary">
									Type: {filters.personType}
									<X
										className="size-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('personType', undefined)}
									/>
								</Badge>
							)}
						</div>
					)}
				</div>
			)}

			{/* Directory Grid/List */}
			{profiles.length > 0 ? (
				<div
					className={cn(
						'grid gap-6',
						cardSize === 'small'
							? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
							: cardSize === 'medium'
								? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
								: 'grid-cols-1 lg:grid-cols-2'
					)}
				>
					{profiles.map(profile => (
						<div key={profile.id} onClick={() => onProfileClick?.(profile)}>
							<LoanOfficerCard
								audience={audience}
								className={onProfileClick ? 'cursor-pointer' : ''}
								detailLevel={detailLevel}
								onContactClick={onContactClick}
								profile={profile}
								size={cardSize}
							/>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<Search className="mb-4 size-12 text-muted-foreground/50" />
					<h3 className="mb-2 text-lg font-semibold">No loan officers found</h3>
					<p className="mb-4 text-sm text-muted-foreground">
						Try adjusting your filters or search terms
					</p>
					{hasActiveFilters && (
						<Button onClick={clearFilters} size="sm" variant="outline">
							Clear Filters
						</Button>
					)}
				</div>
			)}
		</div>
	);
};

LoanOfficerDirectory.displayName = 'LoanOfficerDirectory';

export default LoanOfficerDirectory;
