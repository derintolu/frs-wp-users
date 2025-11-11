import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, X, GripVertical, ExternalLink } from 'lucide-react';

interface CustomLink {
	title: string;
	url: string;
}

interface Profile {
	custom_links?: CustomLink[];
}

interface LinksSectionProps {
	profile: Profile;
	onChange: (updates: Partial<Profile>) => void;
}

export default function LinksSection({ profile, onChange }: LinksSectionProps) {
	const links = profile.custom_links || [];

	const addLink = () => {
		onChange({
			custom_links: [...links, { title: '', url: '' }],
		});
	};

	const updateLink = (index: number, field: keyof CustomLink, value: string) => {
		const updatedLinks = [...links];
		updatedLinks[index] = { ...updatedLinks[index], [field]: value };
		onChange({ custom_links: updatedLinks });
	};

	const removeLink = (index: number) => {
		const updatedLinks = links.filter((_, i) => i !== index);
		onChange({ custom_links: updatedLinks });
	};

	const moveLink = (index: number, direction: 'up' | 'down') => {
		if (
			(direction === 'up' && index === 0) ||
			(direction === 'down' && index === links.length - 1)
		) {
			return;
		}

		const updatedLinks = [...links];
		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		[updatedLinks[index], updatedLinks[targetIndex]] = [
			updatedLinks[targetIndex],
			updatedLinks[index],
		];

		onChange({ custom_links: updatedLinks });
	};

	return (
		<div className="space-y-6">
			<div>
				<h2 className="text-2xl font-bold mb-2">Custom Links</h2>
				<p className="text-gray-600">
					Add custom links to important resources, tools, or pages. These will
					appear on your profile and biolink page.
				</p>
			</div>

			<div className="space-y-3">
				{links.length === 0 ? (
					<Card className="p-8 text-center border-dashed">
						<ExternalLink className="w-12 h-12 text-gray-400 mx-auto mb-3" />
						<p className="text-gray-600 mb-4">
							No custom links yet. Add links to your resources, tools, or important
							pages.
						</p>
						<Button onClick={addLink} variant="outline">
							<Plus className="w-4 h-4 mr-2" />
							Add Your First Link
						</Button>
					</Card>
				) : (
					<>
						{links.map((link, index) => (
							<Card key={index} className="p-4">
								<div className="flex items-start gap-3">
									<div className="flex flex-col gap-1 mt-2">
										<button
											onClick={() => moveLink(index, 'up')}
											disabled={index === 0}
											className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
											title="Move up"
										>
											<GripVertical className="w-4 h-4" />
										</button>
									</div>

									<div className="flex-1 space-y-3">
										<div>
											<Label htmlFor={`link-title-${index}`}>Link Title</Label>
											<Input
												id={`link-title-${index}`}
												value={link.title}
												onChange={(e) =>
													updateLink(index, 'title', e.target.value)
												}
												placeholder="e.g., Mortgage Calculator, Apply Now, Resources"
											/>
										</div>
										<div>
											<Label htmlFor={`link-url-${index}`}>URL</Label>
											<Input
												id={`link-url-${index}`}
												type="url"
												value={link.url}
												onChange={(e) => updateLink(index, 'url', e.target.value)}
												placeholder="https://example.com"
											/>
										</div>
									</div>

									<button
										onClick={() => removeLink(index)}
										className="text-red-500 hover:text-red-700 p-2 mt-2"
										title="Remove link"
									>
										<X className="w-5 h-5" />
									</button>
								</div>
							</Card>
						))}

						<Button onClick={addLink} variant="outline" className="w-full">
							<Plus className="w-4 h-4 mr-2" />
							Add Another Link
						</Button>
					</>
				)}
			</div>

			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h4 className="font-semibold text-blue-900 mb-2">
					Examples of Custom Links
				</h4>
				<ul className="text-sm text-blue-800 space-y-1">
					<li>• Mortgage calculator or rate sheets</li>
					<li>• Online application portal</li>
					<li>• Client resources or guides</li>
					<li>• Calendar booking link</li>
					<li>• Portfolio or case studies</li>
					<li>• Newsletter signup page</li>
				</ul>
			</div>
		</div>
	);
}
