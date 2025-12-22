// Data service for managing partnership portal data
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  user_nicename?: string;
  phone?: string;
  mobile_number?: string;
  company?: string;
  office?: string;
  avatar?: string;
  headshot_id?: number;
  headshot_url?: string;
  role: 'loan_officer' | 'realtor';
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  location?: string;
  city_state?: string;
  region?: string;
  title?: string;
  job_title?: string;
  website?: string;
  linkedin?: string;
  // Professional details
  nmls?: string;
  nmls_number?: string;
  license_number?: string;
  dre_license?: string;
  brand?: string;
  biography?: string;
  date_of_birth?: string;
  select_person_type?: string;
  // Social media
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  youtube_url?: string;
  tiktok_url?: string;
  // Professional arrays
  specialties?: string[];
  specialties_lo?: string[];
  languages?: string[];
  awards?: string[];
  nar_designations?: string[];
  namb_certifications?: string[];
  // Tools & Platforms
  arrive?: string;
  canva_folder_link?: string;
  niche_bio_content?: string;
  personal_branding_images?: number[];
  // Additional
  frs_agent_id?: string;
  user_id?: number;
  profile_id?: number;
  is_guest?: boolean;
}

export interface LandingPage {
  id: string;
  title: string;
  type: string;
  status: string;
  views: number;
  conversions: number;
  thumbnail: string;
  isCoBranded: boolean;
  ownerId: string; // LO ID for co-branded pages, Realtor ID for individual pages
  createdAt: string;
  lastModified: string;
  url?: string;
  featured_image?: string;
  updated?: string;
  created?: string;
}

export interface Partnership {
  id: string;
  loanOfficerId: string;
  realtorId: string;
  status: 'active' | 'pending' | 'inactive';
  createdAt: string;
  lastActivity?: string;
  sharedResources: number;
  totalLeads: number;
  notifications: {
    email: boolean;
    sms: boolean;
  };
  leadsReceived: number;
  inviteMessage?: string;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost' | 'test';
  source: string;
  loanAmount: number;
  propertyType: string;
  timeframe: string;
  createdAt: string;
  lastActivity: string;
  assignedTo: string; // Loan Officer or Realtor ID
  partnershipId?: string; // If from a partnership
  landingPageId?: string; // Which landing page generated this lead
  notes?: string;
}

export interface DashboardStats {
  activePartnerships: number;
  pendingInvitations: number;
  totalLeads: number;
  conversionRate: number;
  coBrandedPages: number;
  newLeadsThisMonth: number;
  topPerformingPages: Array<{id: string; title: string; leads: number}>;
}

declare global {
  interface Window {
    frsPortalConfig: {
      apiUrl: string;
      restNonce: string;
      userId: number;
      userName: string;
      userEmail: string;
      userAvatar: string;
      userRole: string;
      siteLogo?: string;
      siteName?: string;
      testRole?: string;
      currentUser: {
        id: number;
        name: string;
        email: string;
        roles: string[];
      };
    };
  }
}

class DataService {
  private static getBaseUrl(): string {
    return (window as any).frsPortalConfig?.apiUrl || '/wp-json/frs/v1/';
  }

  // Get WordPress localized data
  private static getWpData() {
    return window.frsPortalConfig || {
      apiUrl: '/wp-json/frs/v1/',
      restNonce: '',
      userId: 0,
      userName: '',
      userEmail: '',
      userAvatar: '',
      userRole: '',
      currentUser: {
        id: 0,
        name: '',
        email: '',
        roles: []
      }
    };
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    // Remove leading slash from endpoint if base URL ends with slash
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${baseUrl}${cleanEndpoint}`;
    const wpData = this.getWpData();

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': wpData.restNonce,
        ...options.headers,
      },
      credentials: 'same-origin',
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Helper to map profile data to User interface
  private static mapProfileToUser(profile: any, wpUser: any): User {
    const userRoles = wpUser?.roles || [];
    let role: 'loan_officer' | 'realtor' = 'loan_officer';

    // Determine role from profile or WordPress roles
    if (profile.select_person_type === 'realtor_partner' || userRoles.includes('realtor') || userRoles.includes('realtor_partner')) {
      role = 'realtor';
    }

    return {
      id: wpUser.id.toString(),
      profile_id: profile.id,
      user_id: wpUser.id,
      name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || wpUser.name || 'User',
      email: profile.email || wpUser.email || '',
      phone: profile.phone_number || '',
      mobile_number: profile.mobile_number || '',
      company: profile.office || (role === 'realtor' ? 'Real Estate Agency' : '21st Century Lending'),
      office: profile.office || '',
      avatar: profile.headshot_url || wpUser.avatar || '',
      headshot_id: profile.headshot_id,
      headshot_url: profile.headshot_url,
      role: role,
      status: profile.is_active ? 'active' : 'inactive',
      createdAt: profile.created_at || new Date().toISOString(),
      location: profile.city_state || profile.region || '',
      city_state: profile.city_state,
      region: profile.region,
      title: profile.job_title || '',
      job_title: profile.job_title,
      website: '',
      linkedin: profile.linkedin_url || '',
      // Professional details
      nmls: profile.nmls || profile.nmls_number || '',
      nmls_number: profile.nmls_number,
      license_number: profile.license_number,
      dre_license: profile.dre_license,
      brand: profile.brand,
      biography: profile.biography,
      date_of_birth: profile.date_of_birth,
      select_person_type: profile.select_person_type,
      // Social media
      facebook_url: profile.facebook_url,
      instagram_url: profile.instagram_url,
      linkedin_url: profile.linkedin_url,
      twitter_url: profile.twitter_url,
      youtube_url: profile.youtube_url,
      tiktok_url: profile.tiktok_url,
      // Professional arrays
      specialties: profile.specialties || [],
      specialties_lo: profile.specialties_lo || [],
      languages: profile.languages || [],
      awards: profile.awards || [],
      nar_designations: profile.nar_designations || [],
      namb_certifications: profile.namb_certifications || [],
      // Tools & Platforms
      arrive: profile.arrive,
      canva_folder_link: profile.canva_folder_link,
      niche_bio_content: profile.niche_bio_content,
      personal_branding_images: profile.personal_branding_images || [],
      // Additional
      frs_agent_id: profile.frs_agent_id,
      is_guest: profile.is_guest || false,
    };
  }

  // Current user management - WordPress integration
  static async getCurrentUser(): Promise<User> {
    const wpData = this.getWpData();

    // Check if we have basic WordPress user data first
    if (!wpData.currentUser || !wpData.currentUser.id || wpData.currentUser.id === 0) {
      // Use basic WordPress data from config
      if (wpData.userId && wpData.userId !== 0) {
        const userRoles = wpData.currentUser?.roles || [];
        let role: 'loan_officer' | 'realtor' = 'loan_officer';

        if (userRoles.includes('realtor') || userRoles.includes('realtor_partner')) {
          role = 'realtor';
        }

        return {
          id: wpData.userId.toString(),
          name: wpData.userName || 'User',
          email: wpData.userEmail || '',
          avatar: wpData.userAvatar || '',
          role: role,
          status: 'active',
          createdAt: new Date().toISOString(),
          company: role === 'realtor' ? 'Real Estate Agency' : '21st Century Lending',
          location: 'Denver, Colorado'
        };
      }
      throw new Error('No user data available');
    }

    try {
      // First, try to get profile from frs-users API
      const profileUrl = `/wp-json/frs-users/v1/profiles/user/me`;
      const profileResponse = await fetch(profileUrl, {
        headers: {
          'X-WP-Nonce': wpData.restNonce,
        },
        credentials: 'same-origin',
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success && profileData.data) {
          // Map profile to User format
          return this.mapProfileToUser(profileData.data, wpData.currentUser);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch profile from frs-users API:', error);
    }

    // Fallback to original API
    try {
      const response = await this.request('/users/me');
      return response;
    } catch (error) {
      // Final fallback to WordPress localized data
      if (wpData.currentUser && wpData.currentUser.id) {
        const userRoles = wpData.currentUser.roles || [];
        let role: 'loan_officer' | 'realtor' = 'loan_officer';

        if (userRoles.includes('realtor') || userRoles.includes('realtor_partner')) {
          role = 'realtor';
        }

        return {
          id: wpData.currentUser.id.toString(),
          name: wpData.currentUser.name || 'User',
          email: wpData.currentUser.email || '',
          avatar: wpData.currentUser.avatar || '',
          role: role,
          status: 'active',
          createdAt: new Date().toISOString(),
          company: role === 'realtor' ? 'Real Estate Agency' : '21st Century Lending',
          location: 'Denver, Colorado'
        };
      }

      throw new Error('No user data available');
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    const wpData = this.getWpData();

    try {
      // First, try to get profile from frs-users API
      const profileUrl = `/wp-json/frs-users/v1/profiles/user/${userId}`;
      const profileResponse = await fetch(profileUrl, {
        headers: {
          'X-WP-Nonce': wpData.restNonce,
        },
        credentials: 'same-origin',
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success && profileData.data) {
          // Create minimal wp user object for mapping
          const wpUser = {
            id: parseInt(userId),
            name: `${profileData.data.first_name} ${profileData.data.last_name}`,
            email: profileData.data.email,
            roles: []
          };
          return this.mapProfileToUser(profileData.data, wpUser);
        }
      }
    } catch (error) {
      console.warn('Failed to fetch profile from frs-users API:', error);
    }

    // Fallback to original API
    try {
      const response = await this.request(`/users/${userId}`);
      return response;
    } catch (error) {
      console.warn('Failed to fetch user, user not found');
      return null;
    }
  }

  // Dashboard stats - Real WordPress data
  static async getDashboardStatsForLO(userId: string): Promise<DashboardStats> {
    try {
      const response = await this.request(`/dashboard/stats/lo/${userId}`);
      return {
        activePartnerships: response.activePartnerships || 0,
        pendingInvitations: response.pendingInvitations || 0,
        totalLeads: response.totalLeads || 0,
        conversionRate: response.conversionRate || 0,
        coBrandedPages: response.coBrandedPages || 0,
        newLeadsThisMonth: response.newLeadsThisMonth || 0,
        topPerformingPages: response.topPerformingPages || []
      };
    } catch (error) {
      // Return empty state for presentation
      return {
        activePartnerships: 0,
        pendingInvitations: 0,
        totalLeads: 0,
        conversionRate: 0,
        coBrandedPages: 0,
        newLeadsThisMonth: 0,
        topPerformingPages: []
      };
    }
  }

  static async getDashboardStatsForRealtor(userId: string): Promise<DashboardStats> {
    try {
      const response = await this.request(`/dashboard/stats/realtor/${userId}`);
      return {
        activePartnerships: response.activePartnerships || 0,
        pendingInvitations: response.pendingInvitations || 0,
        totalLeads: response.totalLeads || 0,
        conversionRate: response.conversionRate || 0,
        coBrandedPages: response.coBrandedPages || 0,
        newLeadsThisMonth: 0,
        topPerformingPages: []
      };
    } catch (error) {
      console.warn('Dashboard stats API not available, showing empty state');
      // Return empty state instead of fake data
      return {
        activePartnerships: 0,
        pendingInvitations: 0,
        totalLeads: 0,
        conversionRate: 0,
        coBrandedPages: 0,
        newLeadsThisMonth: 0,
        topPerformingPages: []
      };
    }
  }

  // Partnership management
  static async getPartnersForLO(userId: string): Promise<User[]> {
    try {
      const response = await this.request(`/partners/lo/${userId}`);
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn('Failed to fetch partners, showing empty state');
      return [];
    }
  }

  static async getPartnershipsForLO(userId: string): Promise<Partnership[]> {
    try {
      const response = await this.request(`/partnerships/lo/${userId}`);
      if (response && response.success && Array.isArray(response.data)) {
        return response.data;
      }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.warn('Failed to fetch partnerships, showing empty state');
      return [];
    }
  }

  static async getPartnershipForRealtor(userId: string): Promise<Partnership | null> {
    try {
      const response = await this.request(`/partnerships/realtor/${userId}`);
      return response;
    } catch (error) {
      console.warn('Failed to fetch partnership, showing empty state');
      return null;
    }
  }

  // Landing pages
  static async getLandingPagesForLO(userId: string): Promise<LandingPage[]> {
    try {
      const response = await this.request(`/landing-pages/lo/${userId}`);
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch landing pages, showing empty state');
      return [];
    }
  }

  static async getCoBrandedPagesForRealtor(userId: string): Promise<LandingPage[]> {
    try {
      const response = await this.request(`/landing-pages/realtor/${userId}`);
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch co-branded pages, showing empty state');
      return [];
    }
  }

  // Leads management
  static async getLeadsForLO(userId: string): Promise<Lead[]> {
    try {
      const response = await this.request(`/leads/lo/${userId}`);
      if (response && response.success && Array.isArray(response.data)) {
        // Map API response (snake_case) to Lead interface (camelCase)
        return response.data.map((lead: any) => ({
          id: lead.id?.toString() || '',
          firstName: lead.first_name || '',
          lastName: lead.last_name || '',
          email: lead.email || '',
          phone: lead.phone || '',
          status: lead.status || 'new',
          source: lead.lead_source || 'Unknown',
          loanAmount: lead.loan_amount ? parseFloat(lead.loan_amount) : 0,
          propertyValue: lead.property_value ? parseFloat(lead.property_value) : 0,
          propertyAddress: lead.property_address || '',
          message: lead.message || '',
          notes: lead.notes || '',
          createdAt: lead.created_date || new Date().toISOString(),
          lastContact: lead.updated_date || null
        }));
      }
      return [];
    } catch (error) {
      console.warn('Failed to fetch leads, showing empty state');
      return [];
    }
  }

  static async createLead(leadData: any): Promise<any> {
    try {
      const response = await this.request('/leads', {
        method: 'POST',
        body: JSON.stringify(leadData)
      });
      return response;
    } catch (error) {
      console.error('Failed to create lead:', error);
      throw error;
    }
  }

  // Invitations
  static async invitePartner(loId: string, email: string, name: string, message: string): Promise<boolean> {
    try {
      await this.request('/partnerships/invite', {
        method: 'POST',
        body: JSON.stringify({
          loan_officer_id: loId,
          email,
          name,
          message
        })
      });
      return true;
    } catch (error) {
      console.error('Failed to send invitation:', error);
      return false;
    }
  }

  // Notification settings
  static async updateNotificationSettings(partnershipId: string, notifications: {email: boolean, sms: boolean}): Promise<boolean> {
    try {
      await this.request(`/partnerships/${partnershipId}/notifications`, {
        method: 'PUT',
        body: JSON.stringify({ notifications })
      });
      return true;
    } catch (error) {
      console.error('Failed to update notification settings:', error);
      return false;
    }
  }

  // Profile management
  static async updateUserProfile(userId: string, profileData: any): Promise<boolean> {
    const wpData = this.getWpData();

    try {
      // Get the user's profile ID first
      const profileUrl = userId === wpData.currentUser.id.toString()
        ? `/wp-json/frs-users/v1/profiles/user/me`
        : `/wp-json/frs-users/v1/profiles/user/${userId}`;

      console.log('Fetching profile from:', profileUrl);
      const profileResponse = await fetch(profileUrl, {
        headers: {
          'X-WP-Nonce': wpData.restNonce,
        },
        credentials: 'same-origin',
      });

      if (!profileResponse.ok) {
        throw new Error(`Failed to fetch profile: ${profileResponse.status} ${profileResponse.statusText}`);
      }

      const profileData_response = await profileResponse.json();
      console.log('Profile response:', profileData_response);

      // Handle both response formats: {success: true, data: {...}} or direct {...}
      const profile = profileData_response.data || profileData_response;

      if (!profile || !profile.id) {
        throw new Error('Profile ID not found in response');
      }

      // Map the profile data to the API format
      // Only include fields with actual non-empty values to avoid overwriting with blanks
      const updateData: any = {};

      // Helper to check if value is non-empty (not undefined, null, empty string, or whitespace-only)
      const hasValue = (val: any) => {
        if (val === undefined || val === null) return false;
        if (typeof val === 'string') return val.trim().length > 0;
        if (Array.isArray(val)) return val.length > 0;
        return true;
      };

      if (hasValue(profileData.firstName)) updateData.first_name = profileData.firstName;
      if (hasValue(profileData.lastName)) updateData.last_name = profileData.lastName;
      if (hasValue(profileData.email)) updateData.email = profileData.email;
      if (hasValue(profileData.phone)) updateData.phone_number = profileData.phone;
      if (hasValue(profileData.mobileNumber)) updateData.mobile_number = profileData.mobileNumber;
      if (hasValue(profileData.title)) updateData.job_title = profileData.title;
      if (hasValue(profileData.bio)) updateData.biography = profileData.bio;
      if (hasValue(profileData.location)) updateData.city_state = profileData.location;
      if (hasValue(profileData.nmls)) updateData.nmls = profileData.nmls;
      if (hasValue(profileData.nmls_number)) updateData.nmls_number = profileData.nmls_number;
      if (hasValue(profileData.license_number)) updateData.license_number = profileData.license_number;
      if (hasValue(profileData.dre_license)) updateData.dre_license = profileData.dre_license;
      if (hasValue(profileData.company)) updateData.office = profileData.company;
      if (hasValue(profileData.linkedin)) updateData.linkedin_url = profileData.linkedin;
      if (hasValue(profileData.facebook)) updateData.facebook_url = profileData.facebook;
      if (hasValue(profileData.instagram)) updateData.instagram_url = profileData.instagram;
      if (hasValue(profileData.twitter)) updateData.twitter_url = profileData.twitter;
      if (hasValue(profileData.youtube)) updateData.youtube_url = profileData.youtube;
      if (hasValue(profileData.tiktok)) updateData.tiktok_url = profileData.tiktok;
      if (hasValue(profileData.specialtiesLo)) updateData.specialties_lo = profileData.specialtiesLo;
      if (hasValue(profileData.specialties)) updateData.specialties = profileData.specialties;
      if (hasValue(profileData.languages)) updateData.languages = profileData.languages;
      if (hasValue(profileData.awards)) updateData.awards = profileData.awards;
      if (hasValue(profileData.nambCertifications)) updateData.namb_certifications = profileData.nambCertifications;
      if (hasValue(profileData.narDesignations)) updateData.nar_designations = profileData.narDesignations;
      if (hasValue(profileData.serviceAreas)) updateData.service_areas = profileData.serviceAreas;
      if (hasValue(profileData.brand)) updateData.brand = profileData.brand;
      if (hasValue(profileData.arrive)) updateData.arrive = profileData.arrive;
      if (hasValue(profileData.canvaFolderLink)) updateData.canva_folder_link = profileData.canvaFolderLink;
      if (hasValue(profileData.nicheBioContent)) updateData.niche_bio_content = profileData.nicheBioContent;

      // Update the profile
      const updateUrl = `/wp-json/frs-users/v1/profiles/${profile.id}`;
      console.log('Sending PUT request to:', updateUrl);
      console.log('Update data:', updateData);

      const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpData.restNonce,
        },
        credentials: 'same-origin',
        body: JSON.stringify(updateData),
      });

      console.log('Update response status:', updateResponse.status);

      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Update failed with response:', errorText);
        throw new Error(`Failed to update profile: ${updateResponse.status} ${updateResponse.statusText}`);
      }

      const result = await updateResponse.json();
      console.log('Update result:', result);

      if (!result.success) {
        throw new Error('Update API returned success: false');
      }

      return true;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error; // Re-throw so the UI can show the actual error
    }
  }

  static async uploadAvatar(userId: string, file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('user_id', userId);

      const wpData = this.getWpData();
      const response = await fetch('/wp-json/frs-users/v1/profiles/upload-avatar', {
        method: 'POST',
        body: formData,
        headers: {
          'X-WP-Nonce': wpData.restNonce,
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.success ? result.data.url : null;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      return null;
    }
  }

  static async getMarketingMaterials(userId: string): Promise<any[]> {
    try {
      const response = await this.request(`/marketing-materials/${userId}`);
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch marketing materials, showing empty state');
      return [];
    }
  }

  // Announcements
  static async getAnnouncements(): Promise<any[]> {
    try {
      const response = await this.request('/announcements');
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch announcements, showing empty state');
      return [];
    }
  }

  // Custom Links
  static async getCustomLinks(): Promise<any[]> {
    try {
      const response = await this.request('/custom-links');
      return response || [];
    } catch (error) {
      console.warn('Failed to fetch custom links, showing empty state');
      return [];
    }
  }

  // Person CPT
  static async getPersonCPT(personId: string): Promise<any> {
    try {
      const response = await this.request(`/person/${personId}`);
      return response;
    } catch (error) {
      console.warn('Failed to fetch person CPT data');
      return null;
    }
  }
}

export { DataService };
