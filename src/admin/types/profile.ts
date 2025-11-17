/**
 * Profile Types
 *
 * TypeScript interfaces for FRS User Profiles
 */

export interface Profile {
  id: number;
  user_id: number | null;
  frs_agent_id: string | null;

  // Contact Information
  email: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  phone_number: string | null;
  mobile_number: string | null;
  office: string | null;

  // Profile
  headshot_id: number | null;
  headshot_url?: string; // Computed by API
  job_title: string | null;
  biography: string | null;
  date_of_birth: string | null;
  select_person_type: PersonType | null;

  // Professional Details
  nmls: string | null;
  nmls_number: string | null;
  license_number: string | null;
  dre_license: string | null;
  specialties_lo: string[] | null;
  specialties: string[] | null;
  languages: string[] | null;
  awards: string[] | null;
  nar_designations: string[] | null;
  namb_certifications: string[] | null;
  brand: string | null;
  status: string | null;

  // Location
  city_state: string | null;
  region: string | null;

  // Social Media
  facebook_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  twitter_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;

  // Tools & Platforms
  arrive: string | null;
  canva_folder_link: string | null;
  niche_bio_content: string | null;
  personal_branding_images: string[] | null;

  // Additional
  loan_officer_profile: number | null;
  loan_officer_user: number | null;

  // Public Profile Settings
  profile_slug: string | null;
  profile_headline: string | null;
  profile_visibility: Record<string, boolean> | null;
  profile_theme: string | null;
  custom_links: Array<{ label: string; url: string }> | null;
  service_areas: string[] | null;

  // Metadata
  is_active: boolean;
  created_at: string;
  updated_at: string | null;
  synced_to_fluentcrm_at: string | null;
}

export type PersonType = 'loan_officer' | 'realtor_partner' | 'staff' | 'leadership' | 'assistant';

export interface ProfilesApiResponse {
  success: boolean;
  data: Profile[];
  pages: number;
  total: number;
}

export interface SingleProfileApiResponse {
  success: boolean;
  data: Profile;
}

export interface BulkCreateUsersResponse {
  success: boolean;
  message: string;
  created: number;
  failed: number;
}
