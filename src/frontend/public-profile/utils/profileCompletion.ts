/**
 * Profile Completion Utility
 * Calculates profile completion percentage and identifies incomplete sections
 */

export interface ProfileSection {
  id: string;
  label: string;
  fields: ProfileField[];
  icon?: string;
}

export interface ProfileField {
  key: string;
  label: string;
  required: boolean;
  validator?: (value: any) => boolean;
}

export interface CompletionResult {
  percentage: number;
  completedFields: number;
  totalFields: number;
  incompleteSections: {
    section: ProfileSection;
    missingFields: ProfileField[];
  }[];
}

/**
 * Define profile sections and their required fields
 */
export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: 'basic_info',
    label: 'Basic Information',
    icon: 'User',
    fields: [
      { key: 'first_name', label: 'First Name', required: true },
      { key: 'last_name', label: 'Last Name', required: true },
      { key: 'email', label: 'Email', required: true },
      { key: 'phone', label: 'Phone Number', required: true },
    ],
  },
  {
    id: 'professional_info',
    label: 'Professional Details',
    icon: 'Briefcase',
    fields: [
      { key: 'job_title', label: 'Job Title', required: true },
      { key: 'company', label: 'Company Name', required: true },
      { key: 'nmls_id', label: 'NMLS ID', required: true },
    ],
  },
  {
    id: 'contact_preferences',
    label: 'Contact Preferences',
    icon: 'Mail',
    fields: [
      { key: 'preferred_contact_method', label: 'Preferred Contact Method', required: false },
      { key: 'office_phone', label: 'Office Phone', required: false },
    ],
  },
  {
    id: 'bio',
    label: 'Professional Bio',
    icon: 'FileText',
    fields: [
      {
        key: 'bio',
        label: 'Biography',
        required: true,
        validator: (value: string) => value && value.length >= 50 // At least 50 chars
      },
    ],
  },
  {
    id: 'social_links',
    label: 'Social Media',
    icon: 'Link',
    fields: [
      { key: 'linkedin_url', label: 'LinkedIn URL', required: false },
      { key: 'facebook_url', label: 'Facebook URL', required: false },
      { key: 'instagram_url', label: 'Instagram URL', required: false },
    ],
  },
];

/**
 * Check if a field value is considered "complete"
 */
function isFieldComplete(value: any, field: ProfileField): boolean {
  // Empty check
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return false;
  }

  // Custom validator
  if (field.validator) {
    return field.validator(value);
  }

  return true;
}

/**
 * Calculate profile completion for a user
 */
export function calculateProfileCompletion(userData: Record<string, any>): CompletionResult {
  let completedFields = 0;
  let totalRequiredFields = 0;
  const incompleteSections: CompletionResult['incompleteSections'] = [];

  PROFILE_SECTIONS.forEach((section) => {
    const missingFields: ProfileField[] = [];

    section.fields.forEach((field) => {
      if (field.required) {
        totalRequiredFields++;
        const fieldValue = userData[field.key];

        if (isFieldComplete(fieldValue, field)) {
          completedFields++;
        } else {
          missingFields.push(field);
        }
      }
    });

    // Add to incomplete sections if any required fields are missing
    if (missingFields.length > 0) {
      incompleteSections.push({
        section,
        missingFields,
      });
    }
  });

  const percentage = totalRequiredFields > 0
    ? Math.round((completedFields / totalRequiredFields) * 100)
    : 100;

  return {
    percentage,
    completedFields,
    totalFields: totalRequiredFields,
    incompleteSections,
  };
}

/**
 * Get completion status color
 */
export function getCompletionColor(percentage: number): string {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 50) return 'text-yellow-600';
  return 'text-red-600';
}

/**
 * Get completion status background color
 */
export function getCompletionBgColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-100';
  if (percentage >= 50) return 'bg-yellow-100';
  return 'bg-red-100';
}

/**
 * Get completion message
 */
export function getCompletionMessage(percentage: number): string {
  if (percentage === 100) return 'Your profile is complete!';
  if (percentage >= 80) return 'Almost there! Just a few more details.';
  if (percentage >= 50) return 'You\'re halfway there! Keep going.';
  return 'Let\'s complete your profile to get started.';
}
