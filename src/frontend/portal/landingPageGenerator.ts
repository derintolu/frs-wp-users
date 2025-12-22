import { type User } from './dataService';

interface LandingPageTemplate {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  blocks: Block[];
  type: 'biolink' | 'lead-capture' | 'pre-approval' | 'rate-quote' | 'about' | 'testimonials';
  description: string;
}

interface Block {
  id: string;
  type: 'hero' | 'features' | 'testimonial' | 'cta' | 'form' | 'contact-buttons' | 'social-links';
  content: any;
  locked?: boolean;
}

export class LandingPageGenerator {

  /**
   * Auto-generate all default landing pages for a user
   */
  static generateAllPagesForUser(user: User, userRole: 'loan-officer' | 'realtor'): LandingPageTemplate[] {
    const pages: LandingPageTemplate[] = [];

    // Generate different page types based on user role
    if (userRole === 'loan-officer') {
      pages.push(
        this.generateBiolinkPage(user),
        this.generatePreApprovalPage(user),
        this.generateRateQuotePage(user),
        this.generateAboutPage(user),
        this.generateTestimonialsPage(user)
      );
    } else {
      // Realtors get co-branded pages with their loan officer partner
      pages.push(
        this.generateRealtorBiolinkPage(user),
        this.generateJointMarketingPage(user),
        this.generateReferralPage(user)
      );
    }

    return pages;
  }

  /**
   * Generate biolink page (like the HTML you showed me)
   */
  static generateBiolinkPage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Loan Officer';
    const fullName = user.name || 'Professional Loan Officer';
    const company = user.company || '21st Century Lending';

    return {
      id: `biolink-${user.id}`,
      title: `${firstName}'s Professional Links`,
      slug: `${firstName.toLowerCase()}-biolink`,
      status: 'published',
      type: 'biolink',
      description: 'Personal biolink page with contact options and social links',
      blocks: [
        // Logo/Header Section
        {
          id: 'header-logo',
          type: 'hero',
          locked: true,
          content: {
            title: fullName,
            subtitle: `${user.title || 'Senior Loan Officer'} at ${company}`,
            showButton: false,
            backgroundImage: '',
            textColor: '#ffffff',
            backgroundColor: 'linear-gradient(135deg, #000000 43%, #180a62 154%)',
            centerAlign: true,
            showLogo: true,
            logoUrl: user.avatar || '',
            companyLogo: '/assets/company-logo.png'
          }
        },

        // Social Media Links
        {
          id: 'social-links',
          type: 'social-links',
          content: {
            links: [
              { platform: 'email', url: `mailto:${user.email}`, icon: 'mail' },
              { platform: 'facebook', url: user.facebook || '#', icon: 'facebook' },
              { platform: 'instagram', url: user.instagram || '#', icon: 'instagram' },
              { platform: 'twitter', url: user.twitter || '#', icon: 'twitter' },
              { platform: 'linkedin', url: user.linkedin || '#', icon: 'linkedin' }
            ].filter(link => link.url && link.url !== '#'),
            style: 'horizontal',
            backgroundColor: 'transparent'
          }
        },

        // Contact Action Buttons
        {
          id: 'contact-buttons',
          type: 'contact-buttons',
          content: {
            buttons: [
              {
                text: 'Call Me Now',
                icon: 'phone',
                url: `tel:${user.phone || ''}`,
                backgroundColor: '#ffffff',
                textColor: '#000000',
                primary: true
              },
              {
                text: 'Schedule Appointment',
                icon: 'calendar',
                url: '/schedule-appointment',
                backgroundColor: '#ffffff',
                textColor: '#000000'
              },
              {
                text: 'Get Pre-Approved',
                icon: 'check-circle',
                url: '/pre-approval',
                backgroundColor: '#ffffff',
                textColor: '#000000'
              },
              {
                text: 'Free Rate Quote',
                icon: 'calculator',
                url: '/rate-quote',
                backgroundColor: '#ffffff',
                textColor: '#000000'
              },
              {
                text: 'Leave a Message',
                icon: 'message-square',
                url: '/contact',
                backgroundColor: '#ffffff',
                textColor: '#000000'
              }
            ],
            layout: 'vertical',
            spacing: 'normal'
          }
        }
      ]
    };
  }

  /**
   * Generate pre-approval landing page
   */
  static generatePreApprovalPage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Your Loan Officer';

    return {
      id: `pre-approval-${user.id}`,
      title: 'Get Pre-Approved for Your Home Loan',
      slug: `${firstName.toLowerCase()}-pre-approval`,
      status: 'published',
      type: 'pre-approval',
      description: 'Pre-approval application landing page',
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          locked: true,
          content: {
            title: 'Get Pre-Approved Today',
            subtitle: `Start your homebuying journey with confidence. ${firstName} will help you secure pre-approval in as little as 24 hours.`,
            buttonText: 'Start Pre-Approval',
            buttonUrl: '#pre-approval-form',
            backgroundImage: '/assets/home-buying-hero.jpg',
            textColor: '#ffffff'
          }
        },
        {
          id: 'features-1',
          type: 'features',
          content: {
            title: 'Why Get Pre-Approved?',
            features: [
              {
                title: 'Know Your Budget',
                description: 'Understand exactly how much home you can afford',
                icon: '🏠'
              },
              {
                title: 'Stronger Offers',
                description: 'Stand out to sellers with pre-approval letter',
                icon: '💪'
              },
              {
                title: 'Faster Closing',
                description: 'Streamlined process once you find your home',
                icon: '⚡'
              }
            ]
          }
        },
        {
          id: 'form-1',
          type: 'form',
          content: {
            title: 'Start Your Pre-Approval Application',
            subtitle: 'Fill out this quick form and I\'ll get back to you within 24 hours',
            fields: [
              { name: 'name', label: 'Full Name', type: 'text', required: true },
              { name: 'email', label: 'Email Address', type: 'email', required: true },
              { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
              { name: 'income', label: 'Annual Income', type: 'number', required: true },
              { name: 'down_payment', label: 'Down Payment Amount', type: 'number', required: false },
              { name: 'property_type', label: 'Property Type', type: 'select', options: ['Single Family', 'Condo', 'Townhome', 'Multi-Family'], required: true },
              { name: 'timeline', label: 'When do you plan to buy?', type: 'select', options: ['Within 30 days', '1-3 months', '3-6 months', '6+ months'], required: true }
            ],
            submitText: 'Get Pre-Approved',
            successMessage: 'Thank you! I\'ll review your application and contact you within 24 hours.',
            fluentFormId: 'pre-approval-form'
          }
        }
      ]
    };
  }

  /**
   * Generate rate quote landing page
   */
  static generateRateQuotePage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Your Loan Officer';

    return {
      id: `rate-quote-${user.id}`,
      title: 'Get Your Personalized Rate Quote',
      slug: `${firstName.toLowerCase()}-rate-quote`,
      status: 'published',
      type: 'rate-quote',
      description: 'Mortgage rate quote calculator and application',
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          locked: true,
          content: {
            title: 'See Today\'s Rates',
            subtitle: `Get a personalized rate quote from ${firstName}. No commitment required - see what you qualify for in minutes.`,
            buttonText: 'Get My Rate',
            buttonUrl: '#rate-form',
            backgroundImage: '/assets/calculator-hero.jpg',
            textColor: '#ffffff'
          }
        },
        {
          id: 'features-1',
          type: 'features',
          content: {
            title: 'Current Market Advantages',
            features: [
              {
                title: 'Competitive Rates',
                description: 'Access to multiple lenders for best pricing',
                icon: '📈'
              },
              {
                title: 'No Obligation',
                description: 'Get quotes with no commitment or fees',
                icon: '✅'
              },
              {
                title: 'Expert Guidance',
                description: 'Personal consultation on loan options',
                icon: '🎯'
              }
            ]
          }
        },
        {
          id: 'form-1',
          type: 'form',
          content: {
            title: 'Get Your Personal Rate Quote',
            subtitle: 'Tell us a bit about your situation for accurate rates',
            fields: [
              { name: 'name', label: 'Full Name', type: 'text', required: true },
              { name: 'email', label: 'Email Address', type: 'email', required: true },
              { name: 'phone', label: 'Phone Number', type: 'tel', required: true },
              { name: 'loan_amount', label: 'Loan Amount', type: 'number', required: true },
              { name: 'credit_score', label: 'Credit Score Range', type: 'select', options: ['800+', '740-799', '680-739', '620-679', '580-619', 'Below 580'], required: true },
              { name: 'loan_type', label: 'Loan Type', type: 'select', options: ['Purchase', 'Refinance', 'Cash-Out Refinance'], required: true },
              { name: 'property_value', label: 'Property Value', type: 'number', required: true }
            ],
            submitText: 'Get My Rates',
            successMessage: 'Thank you! I\'ll prepare your personalized rate quote and send it within 2 hours.',
            fluentFormId: 'rate-quote-form'
          }
        }
      ]
    };
  }

  /**
   * Generate about/bio page
   */
  static generateAboutPage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Loan Officer';
    const fullName = user.name || 'Professional Loan Officer';

    return {
      id: `about-${user.id}`,
      title: `About ${firstName}`,
      slug: `about-${firstName.toLowerCase()}`,
      status: 'published',
      type: 'about',
      description: 'Professional biography and credentials page',
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: `Meet ${fullName}`,
            subtitle: user.bio || `${firstName} is dedicated to helping clients achieve their homeownership dreams with personalized mortgage solutions.`,
            buttonText: 'Contact Me Today',
            buttonUrl: '/contact',
            backgroundImage: user.avatar || '/assets/professional-photo.jpg',
            textColor: '#ffffff',
            layout: 'side-by-side'
          }
        },
        {
          id: 'features-1',
          type: 'features',
          content: {
            title: 'Why Choose Me?',
            features: [
              {
                title: 'Experience',
                description: '8+ years helping families secure home financing',
                icon: '🏆'
              },
              {
                title: 'Personal Service',
                description: 'Direct access to me throughout the entire process',
                icon: '🤝'
              },
              {
                title: 'Local Expert',
                description: `Deep knowledge of ${user.location || 'local'} market conditions`,
                icon: '🏘️'
              }
            ]
          }
        },
        {
          id: 'cta-1',
          type: 'cta',
          content: {
            title: 'Ready to Get Started?',
            subtitle: 'Let\'s discuss your homebuying goals and find the perfect loan solution.',
            buttonText: 'Schedule Consultation',
            buttonUrl: '/schedule',
            backgroundColor: 'var(--brand-electric-blue)'
          }
        }
      ]
    };
  }

  /**
   * Generate testimonials/reviews page
   */
  static generateTestimonialsPage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Loan Officer';

    return {
      id: `testimonials-${user.id}`,
      title: 'Client Success Stories',
      slug: `${firstName.toLowerCase()}-reviews`,
      status: 'published',
      type: 'testimonials',
      description: 'Client testimonials and success stories',
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Happy Homeowners',
            subtitle: `See what clients say about working with ${firstName}`,
            buttonText: 'Get Started',
            buttonUrl: '/contact',
            backgroundImage: '/assets/happy-family-home.jpg',
            textColor: '#ffffff'
          }
        },
        {
          id: 'testimonial-1',
          type: 'testimonial',
          content: {
            quote: `${firstName} made our home buying process so smooth and stress-free. We couldn't be happier with the service and expertise provided.`,
            author: 'Sarah & Mike Johnson',
            title: 'First-Time Homebuyers',
            avatar: '/assets/testimonial-1.jpg',
            rating: 5
          }
        },
        {
          id: 'testimonial-2',
          type: 'testimonial',
          content: {
            quote: `Professional, knowledgeable, and always available to answer our questions. ${firstName} got us the best rate and closed on time.`,
            author: 'David Chen',
            title: 'Refinance Client',
            avatar: '/assets/testimonial-2.jpg',
            rating: 5
          }
        },
        {
          id: 'cta-1',
          type: 'cta',
          content: {
            title: 'Join Our Happy Clients',
            subtitle: 'Experience the same level of service and expertise',
            buttonText: 'Start Your Journey',
            buttonUrl: '/pre-approval',
            backgroundColor: 'var(--brand-electric-blue)'
          }
        }
      ]
    };
  }

  /**
   * Generate realtor biolink (co-branded with loan officer)
   */
  static generateRealtorBiolinkPage(user: User): LandingPageTemplate {
    // This would be co-branded with their loan officer partner
    // Similar to loan officer biolink but with realtor-specific actions
    return this.generateBiolinkPage(user); // Simplified for now
  }

  /**
   * Generate joint marketing page for realtor-loan officer partnership
   */
  static generateJointMarketingPage(user: User): LandingPageTemplate {
    return {
      id: `partnership-${user.id}`,
      title: 'Your Real Estate & Lending Team',
      slug: `${user.name?.toLowerCase().replace(/\s+/g, '-')}-team`,
      status: 'published',
      type: 'lead-capture',
      description: 'Joint marketing page showcasing realtor-lender partnership',
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Your Complete Home Team',
            subtitle: 'Expert real estate and lending services working together for you',
            buttonText: 'Get Started',
            buttonUrl: '#contact-form',
            backgroundImage: '/assets/partnership-hero.jpg',
            textColor: '#ffffff'
          }
        }
        // More blocks would be added here for the partnership page
      ]
    };
  }

  /**
   * Generate referral page for realtors
   */
  static generateReferralPage(user: User): LandingPageTemplate {
    return {
      id: `referrals-${user.id}`,
      title: 'Refer Your Clients',
      slug: `${user.name?.toLowerCase().replace(/\s+/g, '-')}-referrals`,
      status: 'draft',
      type: 'lead-capture',
      description: 'Referral system for realtors to send clients',
      blocks: [
        {
          id: 'hero-1',
          type: 'hero',
          content: {
            title: 'Refer with Confidence',
            subtitle: 'Send your clients to a trusted lending partner',
            buttonText: 'Send Referral',
            buttonUrl: '#referral-form',
            backgroundImage: '/assets/referral-hero.jpg',
            textColor: '#ffffff'
          }
        }
      ]
    };
  }

  /**
   * Update existing page with fresh user data
   */
  static updatePageWithUserData(existingPage: LandingPageTemplate, user: User): LandingPageTemplate {
    // Update dynamic content in existing pages when user profile changes
    const updatedPage = { ...existingPage };

    updatedPage.blocks = existingPage.blocks.map(block => {
      if (block.type === 'hero' && block.content.title?.includes('{{name}}')) {
        return {
          ...block,
          content: {
            ...block.content,
            title: block.content.title.replace('{{name}}', user.name || 'Professional'),
            subtitle: block.content.subtitle?.replace('{{name}}', user.name?.split(' ')[0] || 'Professional')
          }
        };
      }

      // Update contact buttons with real user data
      if (block.type === 'contact-buttons') {
        return {
          ...block,
          content: {
            ...block.content,
            buttons: block.content.buttons.map((btn: any) => {
              if (btn.text === 'Call Me Now' && btn.url.startsWith('tel:')) {
                return { ...btn, url: `tel:${user.phone || ''}` };
              }
              return btn;
            })
          }
        };
      }

      return block;
    });

    return updatedPage;
  }
}