import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, X, MapPin } from 'lucide-react';

interface Profile {
	service_areas?: string[];
}

interface ServiceAreasSectionProps {
	onChange: (updates: Partial<Profile>) => void;
	profile: Profile;
}

export default function ServiceAreasSection({
	onChange,
	profile,
}: ServiceAreasSectionProps) {
	const [newArea, setNewArea] = useState('');
	const areas = profile.service_areas || [];

	const addArea = () => {
		if (newArea.trim() && !areas.includes(newArea.trim())) {
			onChange({
				service_areas: [...areas, newArea.trim()],
			});
			setNewArea('');
		}
	};

	const removeArea = (areaToRemove: string) => {
		onChange({
			service_areas: areas.filter((area) => area !== areaToRemove),
		});
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addArea();
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="mb-2 text-2xl font-bold">Service Areas</h2>
				<p className="text-gray-600">
					Add the cities and regions where you provide services. This helps
					potential clients find you when searching by location.
				</p>
			</div>

			{/* Add New Area */}
			<Card className="p-4">
				<Label htmlFor="new-area">Add Service Area</Label>
				<div className="mt-2 flex gap-2">
					<Input
						id="new-area"
						onChange={(e) => setNewArea(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="e.g., Los Angeles, Orange County, San Diego"
						value={newArea}
					/>
					<Button disabled={!newArea.trim()} onClick={addArea}>
						<Plus className="mr-2 size-4" />
						Add
					</Button>
				</div>
				<p className="mt-2 text-sm text-gray-500">
					Press Enter or click Add to add a service area
				</p>
			</Card>

			{/* Current Service Areas */}
			<div>
				<h3 className="mb-3 text-lg font-semibold">Your Service Areas</h3>
				{areas.length === 0 ? (
					<Card className="border-dashed p-8 text-center">
						<MapPin className="mx-auto mb-3 size-12 text-gray-400" />
						<p className="text-gray-600">
							No service areas added yet. Add the cities and regions where you
							serve clients.
						</p>
					</Card>
				) : (
					<div className="flex flex-wrap gap-2">
						{areas.map((area, index) => (
							<Badge
								className="flex items-center gap-2 px-3 py-2 text-sm"
								key={index}
								variant="secondary"
							>
								<MapPin className="size-3" />
								<span>{area}</span>
								<button
									className="ml-1 hover:text-red-600"
									onClick={() => removeArea(area)}
									title="Remove"
								>
									<X className="size-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
			</div>

			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
				<h4 className="mb-2 font-semibold text-blue-900">
					Tips for Service Areas
				</h4>
				<ul className="space-y-1 text-sm text-blue-800">
					<li>• Include both cities and broader regions (e.g., &quot;Orange County&quot;)</li>
					<li>• Use well-known location names that clients would search for</li>
					<li>
						• Service areas appear in your profile and help with local search
						visibility
					</li>
					<li>• You can add as many service areas as needed</li>
				</ul>
			</div>
		</div>
	);
}
