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
	profile: Profile;
	onChange: (updates: Partial<Profile>) => void;
}

export default function ServiceAreasSection({
	profile,
	onChange,
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
				<h2 className="text-2xl font-bold mb-2">Service Areas</h2>
				<p className="text-gray-600">
					Add the cities and regions where you provide services. This helps
					potential clients find you when searching by location.
				</p>
			</div>

			{/* Add New Area */}
			<Card className="p-4">
				<Label htmlFor="new-area">Add Service Area</Label>
				<div className="flex gap-2 mt-2">
					<Input
						id="new-area"
						value={newArea}
						onChange={(e) => setNewArea(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="e.g., Los Angeles, Orange County, San Diego"
					/>
					<Button onClick={addArea} disabled={!newArea.trim()}>
						<Plus className="w-4 h-4 mr-2" />
						Add
					</Button>
				</div>
				<p className="text-sm text-gray-500 mt-2">
					Press Enter or click Add to add a service area
				</p>
			</Card>

			{/* Current Service Areas */}
			<div>
				<h3 className="text-lg font-semibold mb-3">Your Service Areas</h3>
				{areas.length === 0 ? (
					<Card className="p-8 text-center border-dashed">
						<MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
						<p className="text-gray-600">
							No service areas added yet. Add the cities and regions where you
							serve clients.
						</p>
					</Card>
				) : (
					<div className="flex flex-wrap gap-2">
						{areas.map((area, index) => (
							<Badge
								key={index}
								variant="secondary"
								className="px-3 py-2 text-sm flex items-center gap-2"
							>
								<MapPin className="w-3 h-3" />
								<span>{area}</span>
								<button
									onClick={() => removeArea(area)}
									className="ml-1 hover:text-red-600"
									title="Remove"
								>
									<X className="w-3 h-3" />
								</button>
							</Badge>
						))}
					</div>
				)}
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h4 className="font-semibold text-blue-900 mb-2">
					Tips for Service Areas
				</h4>
				<ul className="text-sm text-blue-800 space-y-1">
					<li>• Include both cities and broader regions (e.g., "Orange County")</li>
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
