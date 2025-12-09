import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Plus, X, Award, Star } from 'lucide-react';

interface Profile {
	namb_certifications?: string[];
	nar_designations?: string[];
	specialties?: string[];
	specialties_lo?: string[];
}

interface SpecialtiesSectionProps {
	onChange: (updates: Partial<Profile>) => void;
	profile: Profile;
}

interface SpecialtyCategory {
	description: string;
	examples: string[];
	key: keyof Profile;
	placeholder: string;
	title: string;
}

const categories: SpecialtyCategory[] = [
	{
		description: 'Types of loans and mortgage programs you specialize in',
		examples: ['FHA Loans', 'VA Loans', 'Conventional', 'Jumbo Loans', 'First-Time Homebuyers'],
		key: 'specialties_lo',
		placeholder: 'e.g., FHA, VA, Conventional, Jumbo',
		title: 'Loan Officer Specialties',
	},
	{
		description: 'Types of properties and client specialties',
		examples: ['Luxury Homes', 'First-Time Buyers', 'Investment Properties', 'Residential', 'Commercial'],
		key: 'specialties',
		placeholder: 'e.g., Luxury Homes, First-Time Buyers, Investment Properties',
		title: 'Real Estate Specialties',
	},
	{
		description: 'National Association of Realtors certifications',
		examples: ['ABR', 'GRI', 'CRS', 'SRES', 'e-PRO'],
		key: 'nar_designations',
		placeholder: 'e.g., ABR, GRI, CRS',
		title: 'NAR Designations',
	},
	{
		description: 'National Association of Mortgage Brokers certifications',
		examples: ['CMC', 'CRMS', 'CMA'],
		key: 'namb_certifications',
		placeholder: 'e.g., CMC, CRMS',
		title: 'NAMB Certifications',
	},
];

export default function SpecialtiesSection({
	onChange,
	profile,
}: SpecialtiesSectionProps) {
	const [inputs, setInputs] = useState<Record<string, string>>({});

	const addItem = (categoryKey: keyof Profile) => {
		const value = inputs[categoryKey]?.trim();
		if (!value) {return;}

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
			<Card className="p-6" key={category.key}>
				<div className="mb-4">
					<h3 className="mb-1 flex items-center gap-2 text-lg font-semibold">
						<Award className="size-5 text-blue-600" />
						{category.title}
					</h3>
					<p className="text-sm text-gray-600">{category.description}</p>
				</div>

				{/* Add New Item */}
				<div className="mb-4">
					<Label htmlFor={`input-${category.key}`}>
						Add {category.title.replace(/s$/, '')}
					</Label>
					<div className="mt-2 flex gap-2">
						<Input
							id={`input-${category.key}`}
							onChange={(e) =>
								setInputs({ ...inputs, [category.key]: e.target.value })
							}
							onKeyPress={(e) => handleKeyPress(e, category.key)}
							placeholder={category.placeholder}
							value={inputValue}
						/>
						<Button
							disabled={!inputValue.trim()}
							onClick={() => addItem(category.key)}
							size="sm"
						>
							<Plus className="mr-2 size-4" />
							Add
						</Button>
					</div>
				</div>

				{/* Current Items */}
				{items.length > 0 && (
					<div className="mb-4 flex flex-wrap gap-2">
						{items.map((item, index) => (
							<Badge
								className="flex items-center gap-2 px-3 py-2 text-sm"
								key={index}
								variant="secondary"
							>
								<Star className="size-3" />
								<span>{item}</span>
								<button
									className="ml-1 hover:text-red-600"
									onClick={() => removeItem(category.key, item)}
									title="Remove"
								>
									<X className="size-3" />
								</button>
							</Badge>
						))}
					</div>
				)}

				{/* Examples */}
				{items.length === 0 && (
					<div className="rounded border border-gray-200 bg-gray-50 p-3">
						<p className="mb-2 text-xs font-medium text-gray-700">Examples:</p>
						<div className="flex flex-wrap gap-1">
							{category.examples.map((example, index) => (
								<Badge
									className="cursor-pointer text-xs hover:bg-gray-100"
									key={index}
									onClick={() => {
										const currentItems = (profile[category.key] as string[]) || [];
										if (!currentItems.includes(example)) {
											onChange({
												[category.key]: [...currentItems, example],
											});
										}
									}}
									variant="outline"
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
				<h2 className="mb-2 text-2xl font-bold">Specialties & Certifications</h2>
				<p className="text-gray-600">
					Highlight your areas of expertise, professional designations, and
					certifications. These help potential clients understand your qualifications.
				</p>
			</div>

			<div className="space-y-4">
				{categories.map((category) => renderCategory(category))}
			</div>

			<div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
				<h4 className="mb-2 font-semibold text-blue-900">
					Why Add Specialties?
				</h4>
				<ul className="space-y-1 text-sm text-blue-800">
					<li>• Helps clients find professionals with specific expertise</li>
					<li>• Demonstrates your qualifications and experience</li>
					<li>• Improves search visibility for specialized services</li>
					<li>• Builds trust through professional credentials</li>
				</ul>
			</div>
		</div>
	);
}
