/**
 * Profile Service
 *
 * Handles API calls to frs_profiles table via REST API
 * Replaces Person CPT API calls from frs-lrg
 */

export interface ProfileData {
  id?: number;
  user_id?: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  mobile_number?: string;
  office?: string;
  headshot_id?: number;
  job_title?: string;
  biography?: string;
  date_of_birth?: string;
  select_person_type?: 'loan_officer' | 'agent' | 'staff' | 'leadership' | 'assistant';
  nmls?: string;
  nmls_number?: string;
  license_number?: string;
  dre_license?: string;
  specialties_lo?: string[];
  specialties?: string[];
  languages?: string[];
  awards?: string[];
  nar_designations?: string[];
  namb_certifications?: string[];
  brand?: string;
  status?: string;
  city_state?: string;
  region?: string;
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  arrive?: string;
  canva_folder_link?: string;
  niche_bio_content?: string;
  personal_branding_images?: string[];
  loan_officer_profile?: number;
  loan_officer_user?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

class ProfileService {
  private baseUrl = '/wp-json/frs-users/v1';
  private nonce: string;

  constructor() {
    // Get nonce from window object (set by PHP)
    this.nonce = (window as any).frsUsersData?.nonce || '';
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'X-WP-Nonce': this.nonce,
    };
  }

  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(): Promise<ProfileData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/user/me`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return this.mapApiToProfile(data.data);
      }

      return null;
    } catch (error) {
      console.error('Failed to load current user profile:', error);
      throw error;
    }
  }

  /**
   * Get profile by ID
   */
  async getProfileById(id: number): Promise<ProfileData | null> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${id}`, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return this.mapApiToProfile(data.data);
      }

      return null;
    } catch (error) {
      console.error(`Failed to load profile ${id}:`, error);
      throw error;
    }
  }

  /**
   * Update current user's profile
   */
  async updateCurrentUserProfile(profileData: Partial<ProfileData>): Promise<ProfileData> {
    try {
      // Get current profile to get ID
      const currentProfile = await this.getCurrentUserProfile();

      if (!currentProfile || !currentProfile.id) {
        throw new Error('No profile found for current user');
      }

      const response = await fetch(`${this.baseUrl}/profiles/${currentProfile.id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(this.mapProfileToApi(profileData)),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return this.mapApiToProfile(data.data);
      }

      throw new Error('Update failed');
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file: File): Promise<{ id: number; url: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/wp-json/wp/v2/media', {
        method: 'POST',
        headers: {
          'X-WP-Nonce': this.nonce,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        id: data.id,
        url: data.source_url,
      };
    } catch (error) {
      console.error('Failed to upload profile image:', error);
      throw error;
    }
  }

  /**
   * Map API response to ProfileData
   */
  private mapApiToProfile(apiData: any): ProfileData {
    return {
      id: apiData.id,
      user_id: apiData.user_id,
      email: apiData.email,
      first_name: apiData.first_name,
      last_name: apiData.last_name,
      phone_number: apiData.phone_number,
      mobile_number: apiData.mobile_number,
      office: apiData.office,
      headshot_id: apiData.headshot_id,
      job_title: apiData.job_title,
      biography: apiData.biography,
      date_of_birth: apiData.date_of_birth,
      select_person_type: apiData.select_person_type,
      nmls: apiData.nmls,
      nmls_number: apiData.nmls_number,
      license_number: apiData.license_number,
      dre_license: apiData.dre_license,
      specialties_lo: this.parseJsonField(apiData.specialties_lo),
      specialties: this.parseJsonField(apiData.specialties),
      languages: this.parseJsonField(apiData.languages),
      awards: this.parseJsonField(apiData.awards),
      nar_designations: this.parseJsonField(apiData.nar_designations),
      namb_certifications: this.parseJsonField(apiData.namb_certifications),
      brand: apiData.brand,
      status: apiData.status,
      city_state: apiData.city_state,
      region: apiData.region,
      facebook_url: apiData.facebook_url,
      instagram_url: apiData.instagram_url,
      linkedin_url: apiData.linkedin_url,
      twitter_url: apiData.twitter_url,
      youtube_url: apiData.youtube_url,
      tiktok_url: apiData.tiktok_url,
      arrive: apiData.arrive,
      canva_folder_link: apiData.canva_folder_link,
      niche_bio_content: apiData.niche_bio_content,
      personal_branding_images: this.parseJsonField(apiData.personal_branding_images),
      loan_officer_profile: apiData.loan_officer_profile,
      loan_officer_user: apiData.loan_officer_user,
      is_active: apiData.is_active,
      created_at: apiData.created_at,
      updated_at: apiData.updated_at,
    };
  }

  /**
   * Map ProfileData to API format
   */
  private mapProfileToApi(profileData: Partial<ProfileData>): any {
    const apiData: any = {};

    // Only include fields that are provided
    if (profileData.email !== undefined) apiData.email = profileData.email;
    if (profileData.first_name !== undefined) apiData.first_name = profileData.first_name;
    if (profileData.last_name !== undefined) apiData.last_name = profileData.last_name;
    if (profileData.phone_number !== undefined) apiData.phone_number = profileData.phone_number;
    if (profileData.mobile_number !== undefined) apiData.mobile_number = profileData.mobile_number;
    if (profileData.office !== undefined) apiData.office = profileData.office;
    if (profileData.headshot_id !== undefined) apiData.headshot_id = profileData.headshot_id;
    if (profileData.job_title !== undefined) apiData.job_title = profileData.job_title;
    if (profileData.biography !== undefined) apiData.biography = profileData.biography;
    if (profileData.date_of_birth !== undefined) apiData.date_of_birth = profileData.date_of_birth;
    if (profileData.select_person_type !== undefined) apiData.select_person_type = profileData.select_person_type;
    if (profileData.nmls !== undefined) apiData.nmls = profileData.nmls;
    if (profileData.nmls_number !== undefined) apiData.nmls_number = profileData.nmls_number;
    if (profileData.license_number !== undefined) apiData.license_number = profileData.license_number;
    if (profileData.dre_license !== undefined) apiData.dre_license = profileData.dre_license;

    // JSON fields - stringify arrays
    if (profileData.specialties_lo !== undefined) apiData.specialties_lo = JSON.stringify(profileData.specialties_lo);
    if (profileData.specialties !== undefined) apiData.specialties = JSON.stringify(profileData.specialties);
    if (profileData.languages !== undefined) apiData.languages = JSON.stringify(profileData.languages);
    if (profileData.awards !== undefined) apiData.awards = JSON.stringify(profileData.awards);
    if (profileData.nar_designations !== undefined) apiData.nar_designations = JSON.stringify(profileData.nar_designations);
    if (profileData.namb_certifications !== undefined) apiData.namb_certifications = JSON.stringify(profileData.namb_certifications);
    if (profileData.personal_branding_images !== undefined) apiData.personal_branding_images = JSON.stringify(profileData.personal_branding_images);

    if (profileData.brand !== undefined) apiData.brand = profileData.brand;
    if (profileData.status !== undefined) apiData.status = profileData.status;
    if (profileData.city_state !== undefined) apiData.city_state = profileData.city_state;
    if (profileData.region !== undefined) apiData.region = profileData.region;
    if (profileData.facebook_url !== undefined) apiData.facebook_url = profileData.facebook_url;
    if (profileData.instagram_url !== undefined) apiData.instagram_url = profileData.instagram_url;
    if (profileData.linkedin_url !== undefined) apiData.linkedin_url = profileData.linkedin_url;
    if (profileData.twitter_url !== undefined) apiData.twitter_url = profileData.twitter_url;
    if (profileData.youtube_url !== undefined) apiData.youtube_url = profileData.youtube_url;
    if (profileData.tiktok_url !== undefined) apiData.tiktok_url = profileData.tiktok_url;
    if (profileData.arrive !== undefined) apiData.arrive = profileData.arrive;
    if (profileData.canva_folder_link !== undefined) apiData.canva_folder_link = profileData.canva_folder_link;
    if (profileData.niche_bio_content !== undefined) apiData.niche_bio_content = profileData.niche_bio_content;
    if (profileData.is_active !== undefined) apiData.is_active = profileData.is_active;

    return apiData;
  }

  /**
   * Parse JSON field (handles both string and array)
   */
  private parseJsonField(value: any): any[] {
    if (Array.isArray(value)) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }
}

// Export singleton instance
export const profileService = new ProfileService();
