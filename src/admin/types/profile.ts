/**
 * Profile Types
 *
 * TypeScript interfaces for FRS User Profiles
 */

export interface Profile {
  // Tools & Platforms
  arrive: string | null;
  awards: string[] | null;
  biography: string | null;

  brand: string | null;
  canva_folder_link: string | null;
  // Location
  city_state: string | null;
  created_at: string;
  custom_links: Array<{ label: string; url: string }> | null;
  date_of_birth: string | null;
  display_name: string | null;

  dre_license: string | null;
  // Contact Information
  email: string; 
  // Social Media
  facebook_url: string | null;
  first_name: string;
  frs_agent_id: string | null;
  // Profile
  headshot_id: number | null;

  headshot_url?: string;
  id: number;
  instagram_url: string | null;
  // Metadata
  is_active: boolean;
  // Computed by API
  job_title: string | null;
  languages: string[] | null;
  last_name: string;
  license_number: string | null;
  linkedin_url: string | null;
  // Additional
  loan_officer_profile: number | null;
  loan_officer_user: number | null;
  mobile_number: string | null;

  namb_certifications: string[] | null;
  nar_designations: string[] | null;

  niche_bio_content: string | null;
  // Professional Details
  nmls: string | null;
  nmls_number: string | null;
  office: string | null;
  personal_branding_images: string[] | null;
  phone_number: string | null;

  profile_headline: string | null;
  // Public Profile Settings
  profile_slug: string | null;
  profile_theme: string | null;
  profile_visibility: Record<string, boolean> | null;

  region: string | null;
  select_person_type: PersonType | null;

  service_areas: string[] | null;
  specialties: string[] | null;
  specialties_lo: string[] | null;
  status: string | null;
  synced_to_fluentcrm_at: string | null;
  tiktok_url: string | null;

  twitter_url: string | null;
  updated_at: string | null;
  user_id: number | null;
  youtube_url: string | null;
}

export type PersonType = 'loan_officer' | 'realtor_partner' | 'staff' | 'leadership' | 'assistant';

export interface ProfilesApiResponse {
  data: Profile[];
  pages: number;
  success: boolean;
  total: number;
}

export interface SingleProfileApiResponse {
  data: Profile;
  success: boolean;
}

export interface BulkCreateUsersResponse {
  created: number;
  failed: number;
  message: string;
  success: boolean;
}
