/**
 * Profile Service
 *
 * Handles API calls to frs_profiles table via REST API
 * Replaces Person CPT API calls from frs-lrg
 */

export interface ProfileData {
  arrive?: string;
  awards?: string[];
  biography?: string;
  brand?: string;
  canva_folder_link?: string;
  city_state?: string;
  created_at?: string;
  date_of_birth?: string;
  dre_license?: string;
  email: string;
  facebook_url?: string;
  first_name: string;
  headshot_id?: number;
  id?: number;
  instagram_url?: string;
  is_active?: boolean;
  job_title?: string;
  languages?: string[];
  last_name: string;
  license_number?: string;
  linkedin_url?: string;
  loan_officer_profile?: number;
  loan_officer_user?: number;
  mobile_number?: string;
  namb_certifications?: string[];
  nar_designations?: string[];
  niche_bio_content?: string;
  nmls?: string;
  nmls_number?: string;
  office?: string;
  personal_branding_images?: string[];
  phone_number?: string;
  region?: string;
  select_person_type?: 'loan_officer' | 'agent' | 'staff' | 'leadership' | 'assistant';
  specialties?: string[];
  specialties_lo?: string[];
  status?: string;
  tiktok_url?: string;
  twitter_url?: string;
  updated_at?: string;
  user_id?: number;
  youtube_url?: string;
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
        body: JSON.stringify(this.mapProfileToApi(profileData)),
        headers: this.getHeaders(),
        method: 'PUT',
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
        body: formData,
        headers: {
          'X-WP-Nonce': this.nonce,
        },
        method: 'POST',
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
      arrive: apiData.arrive,
      awards: this.parseJsonField(apiData.awards),
      biography: apiData.biography,
      brand: apiData.brand,
      canva_folder_link: apiData.canva_folder_link,
      city_state: apiData.city_state,
      created_at: apiData.created_at,
      date_of_birth: apiData.date_of_birth,
      dre_license: apiData.dre_license,
      email: apiData.email,
      facebook_url: apiData.facebook_url,
      first_name: apiData.first_name,
      headshot_id: apiData.headshot_id,
      id: apiData.id,
      instagram_url: apiData.instagram_url,
      is_active: apiData.is_active,
      job_title: apiData.job_title,
      languages: this.parseJsonField(apiData.languages),
      last_name: apiData.last_name,
      license_number: apiData.license_number,
      linkedin_url: apiData.linkedin_url,
      loan_officer_profile: apiData.loan_officer_profile,
      loan_officer_user: apiData.loan_officer_user,
      mobile_number: apiData.mobile_number,
      namb_certifications: this.parseJsonField(apiData.namb_certifications),
      nar_designations: this.parseJsonField(apiData.nar_designations),
      niche_bio_content: apiData.niche_bio_content,
      nmls: apiData.nmls,
      nmls_number: apiData.nmls_number,
      office: apiData.office,
      personal_branding_images: this.parseJsonField(apiData.personal_branding_images),
      phone_number: apiData.phone_number,
      region: apiData.region,
      select_person_type: apiData.select_person_type,
      specialties: this.parseJsonField(apiData.specialties),
      specialties_lo: this.parseJsonField(apiData.specialties_lo),
      status: apiData.status,
      tiktok_url: apiData.tiktok_url,
      twitter_url: apiData.twitter_url,
      updated_at: apiData.updated_at,
      user_id: apiData.user_id,
      youtube_url: apiData.youtube_url,
    };
  }

  /**
   * Map ProfileData to API format
   */
  private mapProfileToApi(profileData: Partial<ProfileData>): any {
    const apiData: any = {};

    // Only include fields that are provided
    if (profileData.email !== undefined) {apiData.email = profileData.email;}
    if (profileData.first_name !== undefined) {apiData.first_name = profileData.first_name;}
    if (profileData.last_name !== undefined) {apiData.last_name = profileData.last_name;}
    if (profileData.phone_number !== undefined) {apiData.phone_number = profileData.phone_number;}
    if (profileData.mobile_number !== undefined) {apiData.mobile_number = profileData.mobile_number;}
    if (profileData.office !== undefined) {apiData.office = profileData.office;}
    if (profileData.headshot_id !== undefined) {apiData.headshot_id = profileData.headshot_id;}
    if (profileData.job_title !== undefined) {apiData.job_title = profileData.job_title;}
    if (profileData.biography !== undefined) {apiData.biography = profileData.biography;}
    if (profileData.date_of_birth !== undefined) {apiData.date_of_birth = profileData.date_of_birth;}
    if (profileData.select_person_type !== undefined) {apiData.select_person_type = profileData.select_person_type;}
    if (profileData.nmls !== undefined) {apiData.nmls = profileData.nmls;}
    if (profileData.nmls_number !== undefined) {apiData.nmls_number = profileData.nmls_number;}
    if (profileData.license_number !== undefined) {apiData.license_number = profileData.license_number;}
    if (profileData.dre_license !== undefined) {apiData.dre_license = profileData.dre_license;}

    // JSON fields - stringify arrays
    if (profileData.specialties_lo !== undefined) {apiData.specialties_lo = JSON.stringify(profileData.specialties_lo);}
    if (profileData.specialties !== undefined) {apiData.specialties = JSON.stringify(profileData.specialties);}
    if (profileData.languages !== undefined) {apiData.languages = JSON.stringify(profileData.languages);}
    if (profileData.awards !== undefined) {apiData.awards = JSON.stringify(profileData.awards);}
    if (profileData.nar_designations !== undefined) {apiData.nar_designations = JSON.stringify(profileData.nar_designations);}
    if (profileData.namb_certifications !== undefined) {apiData.namb_certifications = JSON.stringify(profileData.namb_certifications);}
    if (profileData.personal_branding_images !== undefined) {apiData.personal_branding_images = JSON.stringify(profileData.personal_branding_images);}

    if (profileData.brand !== undefined) {apiData.brand = profileData.brand;}
    if (profileData.status !== undefined) {apiData.status = profileData.status;}
    if (profileData.city_state !== undefined) {apiData.city_state = profileData.city_state;}
    if (profileData.region !== undefined) {apiData.region = profileData.region;}
    if (profileData.facebook_url !== undefined) {apiData.facebook_url = profileData.facebook_url;}
    if (profileData.instagram_url !== undefined) {apiData.instagram_url = profileData.instagram_url;}
    if (profileData.linkedin_url !== undefined) {apiData.linkedin_url = profileData.linkedin_url;}
    if (profileData.twitter_url !== undefined) {apiData.twitter_url = profileData.twitter_url;}
    if (profileData.youtube_url !== undefined) {apiData.youtube_url = profileData.youtube_url;}
    if (profileData.tiktok_url !== undefined) {apiData.tiktok_url = profileData.tiktok_url;}
    if (profileData.arrive !== undefined) {apiData.arrive = profileData.arrive;}
    if (profileData.canva_folder_link !== undefined) {apiData.canva_folder_link = profileData.canva_folder_link;}
    if (profileData.niche_bio_content !== undefined) {apiData.niche_bio_content = profileData.niche_bio_content;}
    if (profileData.is_active !== undefined) {apiData.is_active = profileData.is_active;}

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
