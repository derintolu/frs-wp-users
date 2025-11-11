import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, X, Award, Star } from 'lucide-react';

interface Profile {
	specialties?: string[];
	specialties_lo?: string[];
	nar_designations?: string[];
	namb_certifications?: string[];
}

interface SpecialtiesSectionProps {
	profile: Profile;
	onChange: (updates: Partial<Profile>) => void;
}

interface SpecialtyCategory {
	key: keyof Profile;
	title: string;
	description: string;
	placeholder: string;
	examples: string[];
}

const categories: SpecialtyCategory[] = [
	{
		key: 'specialties_lo',
		title: 'Loan Officer Specialties',
		description: 'Types of loans and mortgage programs you specialize in',
		placeholder: 'e.g., FHA, VA, Conventional, Jumbo',
		examples: ['FHA Loans', 'VA Loans', 'Conventional', 'Jumbo Loans', 'First-Time Homebuyers'],
	},
	{
		key: 'specialties',
		title: 'Real Estate Specialties',
		description: 'Types of properties and client specialties',
		placeholder: 'e.g., Luxury Homes, First-Time Buyers, Investment Properties',
		examples: ['Luxury Homes', 'First-Time Buyers', 'Investment Properties', 'Residential', 'Commercial'],
	},
	{
		key: 'nar_designations',
		title: 'NAR Designations',
		description: 'National Association of Realtors certifications',
		placeholder: 'e.g., ABR, GRI, CRS',
		examples: ['ABR', 'GRI', 'CRS', 'SRES', 'e-PRO'],
	},
	{
		key: 'namb_certifications',
		title: 'NAMB Certifications',
		description: 'National Association of Mortgage Brokers certifications',
		placeholder: 'e.g., CMC, CRMS',
		examples: ['CMC', 'CRMS', 'CMA'],
	},
];

export default function SpecialtiesSection({
	profile,
	onChange,
}: SpecialtiesSectionProps) {
	const [inputs, setInputs] = useState<Record<string, string>>({});

	const addItem = (categoryKey: keyof Profile) => {
		const value = inputs[categoryKey]?.trim();
		if (!value) return;

		const currentItems = (profile[categoryKey] as string[]) || [];
		if (!currentItems.includes(value)) {
			onChange({
				[categoryKey]: [...currentItems, value],
			});
			setInputs({ ...inputs, [categoryKey]: '' });
		}
	};

	const removeItem = (categoryKey: keyof Profile, itemToRemove: string) => {
		const currentItems = (profile[categoryKey] as string[]) || [];
		onChange({
			[categoryKey]: currentItems.filter((item) => item !== itemToRemove),
		});
	};

	const handleKeyPress = (e: React.KeyboardEvent, categoryKey: keyof Profile) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			addItem(categoryKey);
		}
	};

	const renderCategory = (category: SpecialtyCategory) => {
		const items = (profile[category.key] as string[]) || [];
		const inputValue = inputs[category.key] || '';

		return (
			<Card key={category.key} className="p-6">
				<div className="mb-4">
					<h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
						<Award className="w-5 h-5 text-blue-600" />
						{category.title}
					</h3>
					<p className="text-sm text-gray-600">{category.description}</p>
				</div>

				{/* Add New Item */}
				<div className="mb-4">
					<Label htmlFor={`input-${category.key}`}>
						Add {category.title.replace(/s$/, '')}
					</Label>
					<div className="flex gap-2 mt-2">
						<Input
							id={`input-${category.key}`}
							value={inputValue}
							onChange={(e) =>
								setInputs({ ...inputs, [category.key]: e.target.value })
							}
							onKeyPress={(e) => handleKeyPress(e, category.key)}
							placeholder={category.placeholder}
						/>
						<Button
							onClick={() => addItem(category.key)}
							disabled={!inputValue.trim()}
							size="sm"
						>
							<Plus className="w-4 h-4 mr-2" />
							Add
						</Button>
					</div>
				</div>

				{/* Current Items */}
				{items.length > 0 && (
					<div className="flex flex-wrap gap-2 mb-4">
						{items.map((item, index) => (
							<Badge
								key={index}
								variant="secondary"
								className="px-3 py-2 text-sm flex items-center gap-2"
							>
								<Star className="w-3 h-3" />
								<span>{item}</span>
								<button
									onClick={() => removeItem(category.key, item)}
									className="ml-1 hover:text-red-600"
									title="Remove"
								>
									<X className="w-3 h-3" />
								</button>
							</Badge>
						))}
					</div>
				)}

				{/* Examples */}
				{items.length === 0 && (
					<div className="bg-gray-50 border border-gray-200 rounded p-3">
						<p className="text-xs font-medium text-gray-700 mb-2">Examples:</p>
						<div className="flex flex-wrap gap-1">
							{category.examples.map((example, index) => (
								<Badge
									key={index}
									variant="outline"
									className="text-xs cursor-pointer hover:bg-gray-100"
									onClick={() => {
										const currentItems = (profile[category.key] as string[]) || [];
										if (!currentItems.includes(example)) {
											onChange({
												[category.key]: [...currentItems, example],
											});
										}
									}}
								>
									+ {example}
								</Badge>
							))}
						</div>
					</div>
				)}
			</Card>
		);
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Specialties & Certifications</h2>
				<p className="text-gray-600">
					Highlight your areas of expertise, professional designations, and
					certifications. These help potential clients understand your qualifications.
				</p>
			</div>

			<div className="space-y-4">
				{categories.map((category) => renderCategory(category))}
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h4 className="font-semibold text-blue-900 mb-2">
					Why Add Specialties?
				</h4>
				<ul className="text-sm text-blue-800 space-y-1">
					<li>• Helps clients find professionals with specific expertise</li>
					<li>• Demonstrates your qualifications and experience</li>
					<li>• Improves search visibility for specialized services</li>
					<li>• Builds trust through professional credentials</li>
				</ul>
			</div>
		</div>
	);
}
