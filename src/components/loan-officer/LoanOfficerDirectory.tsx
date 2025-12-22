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
	search?: string;
	region?: string;
	specialty?: string;
	language?: string;
	personType?: string;
}

/**
 * Props for LoanOfficerDirectory component
 */
export interface LoanOfficerDirectoryProps extends React.HTMLAttributes<HTMLDivElement> {
	profiles: LoanOfficerProfile[];
	audience?: 'internal' | 'external';
	showFilters?: boolean;
	initialCardSize?: CardSize;
	initialLayout?: DirectoryLayout;
	detailLevel?: DetailLevel;
	onProfileClick?: (profile: LoanOfficerProfile) => void;
	onContactClick?: (profile: LoanOfficerProfile, method: 'phone' | 'email') => void;
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
	profiles: initialProfiles,
	audience = 'external',
	showFilters = true,
	initialCardSize = 'medium',
	initialLayout = 'grid',
	detailLevel = 'standard',
	onProfileClick,
	onContactClick,
	className,
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
					<Tabs value={cardSize} onValueChange={(v) => setCardSize(v as CardSize)}>
						<TabsList>
							<TabsTrigger value="small" className="px-3">
								<Grid3x3 className="h-4 w-4" />
							</TabsTrigger>
							<TabsTrigger value="medium" className="px-3">
								<LayoutGrid className="h-4 w-4" />
							</TabsTrigger>
							<TabsTrigger value="large" className="px-3">
								<LayoutList className="h-4 w-4" />
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* Filters */}
			{showFilters && (
				<div className="space-y-4 rounded-lg border p-4 bg-muted/30">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<h3 className="font-semibold">Filters</h3>
						</div>
						{hasActiveFilters && (
							<Button
								variant="ghost"
								size="sm"
								onClick={clearFilters}
								className="h-8 px-2"
							>
								<X className="mr-1 h-3 w-3" />
								Clear all
							</Button>
						)}
					</div>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
						{/* Search */}
						<div className="relative md:col-span-2">
							<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								placeholder="Search by name, email, NMLS..."
								value={filters.search || ''}
								onChange={e => updateFilter('search', e.target.value)}
								className="pl-9"
							/>
						</div>

						{/* Region Filter */}
						{regions.length > 0 && (
							<Select value={filters.region || ''} onValueChange={v => updateFilter('region', v)}>
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
							<Select value={filters.specialty || ''} onValueChange={v => updateFilter('specialty', v)}>
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
							<Select value={filters.language || ''} onValueChange={v => updateFilter('language', v)}>
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
							<Select value={filters.personType || ''} onValueChange={v => updateFilter('personType', v)}>
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
								<Badge variant="secondary" className="gap-1">
									Search: {filters.search}
									<X
										className="h-3 w-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('search', undefined)}
									/>
								</Badge>
							)}
							{filters.region && (
								<Badge variant="secondary" className="gap-1">
									Region: {filters.region}
									<X
										className="h-3 w-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('region', undefined)}
									/>
								</Badge>
							)}
							{filters.specialty && (
								<Badge variant="secondary" className="gap-1">
									Specialty: {filters.specialty}
									<X
										className="h-3 w-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('specialty', undefined)}
									/>
								</Badge>
							)}
							{filters.language && (
								<Badge variant="secondary" className="gap-1">
									Language: {filters.language}
									<X
										className="h-3 w-3 cursor-pointer hover:text-destructive"
										onClick={() => updateFilter('language', undefined)}
									/>
								</Badge>
							)}
							{filters.personType && (
								<Badge variant="secondary" className="gap-1">
									Type: {filters.personType}
									<X
										className="h-3 w-3 cursor-pointer hover:text-destructive"
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
								profile={profile}
								size={cardSize}
								audience={audience}
								detailLevel={detailLevel}
								onContactClick={onContactClick}
								className={onProfileClick ? 'cursor-pointer' : ''}
							/>
						</div>
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
					<Search className="h-12 w-12 text-muted-foreground/50 mb-4" />
					<h3 className="text-lg font-semibold mb-2">No loan officers found</h3>
					<p className="text-sm text-muted-foreground mb-4">
						Try adjusting your filters or search terms
					</p>
					{hasActiveFilters && (
						<Button onClick={clearFilters} variant="outline" size="sm">
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
