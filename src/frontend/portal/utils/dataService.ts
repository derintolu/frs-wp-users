// Data service for managing partnership portal data
export interface User {
  // Tools & Platforms
  arrive?: string;
  avatar?: string;
  awards?: string[];
  biography?: string;
  brand?: string;
  canva_folder_link?: string;
  city_state?: string;
  company?: string;
  createdAt: string;
  date_of_birth?: string;
  dre_license?: string;
  email: string;
  // Social media
  facebook_url?: string;
  // Additional
  frs_agent_id?: string;
  headshot_id?: number;
  headshot_url?: string;
  id: string;
  instagram_url?: string;
  is_guest?: boolean;
  job_title?: string;
  languages?: string[];
  license_number?: string;
  linkedin?: string;
  linkedin_url?: string;
  location?: string;
  mobile_number?: string;
  namb_certifications?: string[];
  name: string;
  nar_designations?: string[];
  niche_bio_content?: string;
  // Professional details
  nmls?: string;
  nmls_number?: string;
  office?: string;
  personal_branding_images?: number[];
  phone?: string;
  profile_id?: number;
  region?: string;
  role: 'loan_officer' | 'realtor';
  select_person_type?: string;
  // Professional arrays
  specialties?: string[];
  specialties_lo?: string[];
  status: 'active' | 'pending' | 'inactive';
  tiktok_url?: string;
  title?: string;
  twitter_url?: string;
  user_id?: number;
  user_nicename?: string;
  username?: string;
  website?: string;
  youtube_url?: string;
}

export interface LandingPage {
  conversions: number;
  created?: string;
  // LO ID for co-branded pages, Realtor ID for individual pages
  createdAt: string;
  featured_image?: string;
  id: string;
  isCoBranded: boolean;
  lastModified: string;
  ownerId: string;
  status: string; 
  thumbnail: string;
  title: string;
  type: string;
  updated?: string;
  url?: string;
  views: number;
}

export interface Partnership {
  createdAt: string;
  id: string;
  inviteMessage?: string;
  lastActivity?: string;
  leadsReceived: number;
  loanOfficerId: string;
  notifications: {
    email: boolean;
    sms: boolean;
  };
  realtorId: string;
  sharedResources: number;
  status: 'active' | 'pending' | 'inactive';
  totalLeads: number;
}

export interface Lead {
  assignedTo: string;
  createdAt: string;
  email: string;
  firstName: string;
  id: string;
  // If from a partnership
  landingPageId?: string;
  lastActivity: string;
  lastName: string;
  loanAmount: number;
  // Which landing page generated this lead
  notes?: string;
  // Loan Officer or Realtor ID
  partnershipId?: string;
  phone: string;
  propertyType: string; 
  source: string; 
  status: 'new' | 'contacted' | 'qualified' | 'closed' | 'lost' | 'test'; 
  timeframe: string;
}

export interface DashboardStats {
  activePartnerships: number;
  coBrandedPages: number;
  conversionRate: number;
  newLeadsThisMonth: number;
  pendingInvitations: number;
  topPerformingPages: Array<{id: string; leads: number, title: string;}>;
  totalLeads: number;
}

declare global {
  interface Window {
    frsPortalConfig: {
      apiUrl: string;
      currentUser: {
        email: string;
        id: number;
        name: string;
        roles: string[];
      };
      restNonce: string;
      siteLogo?: string;
      siteName?: string;
      testRole?: string;
      userAvatar: string;
      userEmail: string;
      userId: number;
      userName: string;
      userRole: string;
    };
  }
}

// Static utility class for API requests - intentionally uses only static methods
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class DataService {
  private static getBaseUrl(): string {
    return (window as any).frsPortalConfig?.apiUrl || '/wp-json/frs/v1/';
  }

  // Get WordPress localized data
  private static getWpData() {
    return window.frsPortalConfig || {
      apiUrl: '/wp-json/frs/v1/',
      currentUser: {
        email: '',
        id: 0,
        name: '',
        roles: []
      },
      restNonce: '',
      userAvatar: '',
      userEmail: '',
      userId: 0,
      userName: '',
      userRole: ''
    };
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    // Remove leading slash from endpoint if base URL ends with slash
    const baseUrl = this.getBaseUrl();
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = `${baseUrl}${cleanEndpoint}`;
    const wpData = this.getWpData();

    const defaultOptions: RequestInit = {
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        'X-WP-Nonce': wpData.restNonce,
        ...options.headers,
      },
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
      avatar: profile.headshot_url || wpUser.avatar || '',
      biography: profile.biography,
      brand: profile.brand,
      city_state: profile.city_state,
      company: profile.office || (role === 'realtor' ? 'Real Estate Agency' : '21st Century Lending'),
      createdAt: profile.created_at || new Date().toISOString(),
      date_of_birth: profile.date_of_birth,
      awards: profile.awards || [],
      dre_license: profile.dre_license,
      
email: profile.email || wpUser.email || '',
      
// Social media
facebook_url: profile.facebook_url,
      
// Tools & Platforms
arrive: profile.arrive,
      

headshot_id: profile.headshot_id,
      


canva_folder_link: profile.canva_folder_link,
      



headshot_url: profile.headshot_url,
      



// Additional
frs_agent_id: profile.frs_agent_id,
      




id: wpUser.id.toString(),
      




instagram_url: profile.instagram_url,
      




is_guest: profile.is_guest || false,
      




job_title: profile.job_title,
      




languages: profile.languages || [],
      




license_number: profile.license_number,
      
      



linkedin: profile.linkedin_url || '',
      



linkedin_url: profile.linkedin_url,
      



location: profile.city_state || profile.region || '',
      



mobile_number: profile.mobile_number || '',
      



namb_certifications: profile.namb_certifications || [],
      



name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || wpUser.name || 'User',
      



nar_designations: profile.nar_designations || [],
      



niche_bio_content: profile.niche_bio_content,
      
      

// Professional details
nmls: profile.nmls || profile.nmls_number || '',
      

nmls_number: profile.nmls_number,
      

office: profile.office || '',
      


personal_branding_images: profile.personal_branding_images || [],
      



phone: profile.phone_number || '',
      



profile_id: profile.id,
      
      


region: profile.region,
      


role,
      


select_person_type: profile.select_person_type,
      


// Professional arrays
specialties: profile.specialties || [],
      



specialties_lo: profile.specialties_lo || [],
      



status: profile.is_active ? 'active' : 'inactive',
      
      


user_id: wpUser.id,
      

tiktok_url: profile.tiktok_url,
      
title: profile.job_title || '',
      
twitter_url: profile.twitter_url,
      
      website: '',
      youtube_url: profile.youtube_url,
    };
  }

  // Current user management - WordPress integration
  static async getCurrentUser(): Promise<User> {
    const wpData = this.getWpData();

    try {
      // First, try to get profile from frs-users API
      const profileUrl = `/wp-json/frs-users/v1/profiles/user/me`;
      const profileResponse = await fetch(profileUrl, {
        credentials: 'same-origin',
        headers: {
          'X-WP-Nonce': wpData.restNonce,
        },
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
    } catch {
      // Final fallback to WordPress localized data
      if (wpData.currentUser && wpData.currentUser.id) {
        const userRoles = wpData.currentUser.roles || [];
        let role: 'loan_officer' | 'realtor' = 'loan_officer';

        if (userRoles.includes('realtor') || userRoles.includes('realtor_partner')) {
          role = 'realtor';
        }

        return {
          avatar: wpData.currentUser.avatar || '',
          company: role === 'realtor' ? 'Real Estate Agency' : '21st Century Lending',
          createdAt: new Date().toISOString(),
          email: wpData.currentUser.email || '',
          id: wpData.currentUser.id.toString(),
          location: 'Denver, Colorado',
          name: wpData.currentUser.name || 'User',
          role,
          status: 'active'
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
        credentials: 'same-origin',
        headers: {
          'X-WP-Nonce': wpData.restNonce,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.success && profileData.data) {
          // Create minimal wp user object for mapping
          const wpUser = {
            email: profileData.data.email,
            id: Number.parseInt(userId),
            name: `${profileData.data.first_name} ${profileData.data.last_name}`,
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
    } catch {
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
        coBrandedPages: response.coBrandedPages || 0,
        conversionRate: response.conversionRate || 0,
        newLeadsThisMonth: response.newLeadsThisMonth || 0,
        pendingInvitations: response.pendingInvitations || 0,
        topPerformingPages: response.topPerformingPages || [],
        totalLeads: response.totalLeads || 0
      };
    } catch {
      // Return empty state for presentation
      return {
        activePartnerships: 0,
        coBrandedPages: 0,
        conversionRate: 0,
        newLeadsThisMonth: 0,
        pendingInvitations: 0,
        topPerformingPages: [],
        totalLeads: 0
      };
    }
  }

  static async getDashboardStatsForRealtor(userId: string): Promise<DashboardStats> {
    try {
      const response = await this.request(`/dashboard/stats/realtor/${userId}`);
      return {
        activePartnerships: response.activePartnerships || 0,
        coBrandedPages: response.coBrandedPages || 0,
        conversionRate: response.conversionRate || 0,
        newLeadsThisMonth: 0,
        pendingInvitations: response.pendingInvitations || 0,
        topPerformingPages: [],
        totalLeads: response.totalLeads || 0
      };
    } catch {
      console.warn('Dashboard stats API not available, showing empty state');
      // Return empty state instead of fake data
      return {
        activePartnerships: 0,
        coBrandedPages: 0,
        conversionRate: 0,
        newLeadsThisMonth: 0,
        pendingInvitations: 0,
        topPerformingPages: [],
        totalLeads: 0
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
    } catch {
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
    } catch {
      console.warn('Failed to fetch partnerships, showing empty state');
      return [];
    }
  }

  static async getPartnershipForRealtor(userId: string): Promise<Partnership | null> {
    try {
      const response = await this.request(`/partnerships/realtor/${userId}`);
      return response;
    } catch {
      console.warn('Failed to fetch partnership, showing empty state');
      return null;
    }
  }

  // Landing pages
  static async getLandingPagesForLO(userId: string): Promise<LandingPage[]> {
    try {
      const response = await this.request(`/landing-pages/lo/${userId}`);
      return response || [];
    } catch {
      console.warn('Failed to fetch landing pages, showing empty state');
      return [];
    }
  }

  static async getCoBrandedPagesForRealtor(userId: string): Promise<LandingPage[]> {
    try {
      const response = await this.request(`/landing-pages/realtor/${userId}`);
      return response || [];
    } catch {
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
          createdAt: lead.created_date || new Date().toISOString(),
          email: lead.email || '',
          firstName: lead.first_name || '',
          id: lead.id?.toString() || '',
          lastContact: lead.updated_date || null,
          lastName: lead.last_name || '',
          loanAmount: lead.loan_amount ? Number.parseFloat(lead.loan_amount) : 0,
          message: lead.message || '',
          notes: lead.notes || '',
          phone: lead.phone || '',
          propertyAddress: lead.property_address || '',
          propertyValue: lead.property_value ? Number.parseFloat(lead.property_value) : 0,
          source: lead.lead_source || 'Unknown',
          status: lead.status || 'new'
        }));
      }
      return [];
    } catch {
      console.warn('Failed to fetch leads, showing empty state');
      return [];
    }
  }

  static async createLead(leadData: any): Promise<any> {
    try {
      const response = await this.request('/leads', {
        body: JSON.stringify(leadData),
        method: 'POST'
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
        body: JSON.stringify({
          email,
          loan_officer_id: loId,
          message,
          name
        }),
        method: 'POST'
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
        body: JSON.stringify({ notifications }),
        method: 'PUT'
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
        credentials: 'same-origin',
        headers: {
          'X-WP-Nonce': wpData.restNonce,
        },
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
        if (val === undefined || val === null) {return false;}
        if (typeof val === 'string') {return val.trim().length > 0;}
        if (Array.isArray(val)) {return val.length > 0;}
        return true;
      };

      if (hasValue(profileData.firstName)) {updateData.first_name = profileData.firstName;}
      if (hasValue(profileData.lastName)) {updateData.last_name = profileData.lastName;}
      if (hasValue(profileData.email)) {updateData.email = profileData.email;}
      if (hasValue(profileData.phone)) {updateData.phone_number = profileData.phone;}
      if (hasValue(profileData.mobileNumber)) {updateData.mobile_number = profileData.mobileNumber;}
      if (hasValue(profileData.title)) {updateData.job_title = profileData.title;}
      if (hasValue(profileData.bio)) {updateData.biography = profileData.bio;}
      if (hasValue(profileData.location)) {updateData.city_state = profileData.location;}
      if (hasValue(profileData.nmls)) {updateData.nmls = profileData.nmls;}
      if (hasValue(profileData.nmls_number)) {updateData.nmls_number = profileData.nmls_number;}
      if (hasValue(profileData.license_number)) {updateData.license_number = profileData.license_number;}
      if (hasValue(profileData.dre_license)) {updateData.dre_license = profileData.dre_license;}
      if (hasValue(profileData.company)) {updateData.office = profileData.company;}
      if (hasValue(profileData.linkedin)) {updateData.linkedin_url = profileData.linkedin;}
      if (hasValue(profileData.facebook)) {updateData.facebook_url = profileData.facebook;}
      if (hasValue(profileData.instagram)) {updateData.instagram_url = profileData.instagram;}
      if (hasValue(profileData.twitter)) {updateData.twitter_url = profileData.twitter;}
      if (hasValue(profileData.youtube)) {updateData.youtube_url = profileData.youtube;}
      if (hasValue(profileData.tiktok)) {updateData.tiktok_url = profileData.tiktok;}
      if (hasValue(profileData.specialtiesLo)) {updateData.specialties_lo = profileData.specialtiesLo;}
      if (hasValue(profileData.specialties)) {updateData.specialties = profileData.specialties;}
      if (hasValue(profileData.languages)) {updateData.languages = profileData.languages;}
      if (hasValue(profileData.awards)) {updateData.awards = profileData.awards;}
      if (hasValue(profileData.nambCertifications)) {updateData.namb_certifications = profileData.nambCertifications;}
      if (hasValue(profileData.narDesignations)) {updateData.nar_designations = profileData.narDesignations;}
      if (hasValue(profileData.serviceAreas)) {updateData.service_areas = profileData.serviceAreas;}
      if (hasValue(profileData.brand)) {updateData.brand = profileData.brand;}
      if (hasValue(profileData.arrive)) {updateData.arrive = profileData.arrive;}
      if (hasValue(profileData.canvaFolderLink)) {updateData.canva_folder_link = profileData.canvaFolderLink;}
      if (hasValue(profileData.nicheBioContent)) {updateData.niche_bio_content = profileData.nicheBioContent;}

      // Update the profile
      const updateUrl = `/wp-json/frs-users/v1/profiles/${profile.id}`;
      console.log('Sending PUT request to:', updateUrl);
      console.log('Update data:', updateData);

      const updateResponse = await fetch(updateUrl, {
        body: JSON.stringify(updateData),
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': wpData.restNonce,
        },
        method: 'PUT',
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
        body: formData,
        credentials: 'same-origin',
        headers: {
          'X-WP-Nonce': wpData.restNonce,
        },
        method: 'POST'
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
    } catch {
      console.warn('Failed to fetch marketing materials, showing empty state');
      return [];
    }
  }

  // Announcements
  static async getAnnouncements(): Promise<any[]> {
    try {
      const response = await this.request('/announcements');
      return response || [];
    } catch {
      console.warn('Failed to fetch announcements, showing empty state');
      return [];
    }
  }

  // Custom Links
  static async getCustomLinks(): Promise<any[]> {
    try {
      const response = await this.request('/custom-links');
      return response || [];
    } catch {
      console.warn('Failed to fetch custom links, showing empty state');
      return [];
    }
  }

  // Person CPT
  static async getPersonCPT(personId: string): Promise<any> {
    try {
      const response = await this.request(`/person/${personId}`);
      return response;
    } catch {
      console.warn('Failed to fetch person CPT data');
      return null;
    }
  }
}

export { DataService };
