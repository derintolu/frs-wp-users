import { type User } from './dataService';

interface LandingPageTemplate {
  blocks: Block[];
  description: string;
  id: string;
  slug: string;
  status: 'draft' | 'published';
  title: string;
  type: 'biolink' | 'lead-capture' | 'pre-approval' | 'rate-quote' | 'about' | 'testimonials';
}

interface Block {
  content: any;
  id: string;
  locked?: boolean;
  type: 'hero' | 'features' | 'testimonial' | 'cta' | 'form' | 'contact-buttons' | 'social-links';
}

// Static utility class for landing page generation - intentionally uses only static methods
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
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
      blocks: [
        // Logo/Header Section
        {
          content: {
            backgroundColor: 'linear-gradient(135deg, #000000 43%, #180a62 154%)',
            backgroundImage: '',
            centerAlign: true,
            companyLogo: '/assets/company-logo.png',
            logoUrl: user.avatar || '',
            showButton: false,
            showLogo: true,
            subtitle: `${user.title || 'Senior Loan Officer'} at ${company}`,
            textColor: '#ffffff',
            title: fullName
          },
          id: 'header-logo',
          locked: true,
          type: 'hero'
        },

        // Social Media Links
        {
          content: {
            backgroundColor: 'transparent',
            links: [
              { icon: 'mail', platform: 'email', url: `mailto:${user.email}` },
              { icon: 'facebook', platform: 'facebook', url: user.facebook || '#' },
              { icon: 'instagram', platform: 'instagram', url: user.instagram || '#' },
              { icon: 'twitter', platform: 'twitter', url: user.twitter || '#' },
              { icon: 'linkedin', platform: 'linkedin', url: user.linkedin || '#' }
            ].filter(link => link.url && link.url !== '#'),
            style: 'horizontal'
          },
          id: 'social-links',
          type: 'social-links'
        },

        // Contact Action Buttons
        {
          content: {
            buttons: [
              {
                backgroundColor: '#ffffff',
                icon: 'phone',
                primary: true,
                text: 'Call Me Now',
                textColor: '#000000',
                url: `tel:${user.phone || ''}`
              },
              {
                backgroundColor: '#ffffff',
                icon: 'calendar',
                text: 'Schedule Appointment',
                textColor: '#000000',
                url: '/schedule-appointment'
              },
              {
                backgroundColor: '#ffffff',
                icon: 'check-circle',
                text: 'Get Pre-Approved',
                textColor: '#000000',
                url: '/pre-approval'
              },
              {
                backgroundColor: '#ffffff',
                icon: 'calculator',
                text: 'Free Rate Quote',
                textColor: '#000000',
                url: '/rate-quote'
              },
              {
                backgroundColor: '#ffffff',
                icon: 'message-square',
                text: 'Leave a Message',
                textColor: '#000000',
                url: '/contact'
              }
            ],
            layout: 'vertical',
            spacing: 'normal'
          },
          id: 'contact-buttons',
          type: 'contact-buttons'
        }
      ],
      description: 'Personal biolink page with contact options and social links',
      id: `biolink-${user.id}`,
      slug: `${firstName.toLowerCase()}-biolink`,
      status: 'published',
      title: `${firstName}'s Professional Links`,
      type: 'biolink'
    };
  }

  /**
   * Generate pre-approval landing page
   */
  static generatePreApprovalPage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Your Loan Officer';

    return {
      blocks: [
        {
          content: {
            backgroundImage: '/assets/home-buying-hero.jpg',
            buttonText: 'Start Pre-Approval',
            buttonUrl: '#pre-approval-form',
            subtitle: `Start your homebuying journey with confidence. ${firstName} will help you secure pre-approval in as little as 24 hours.`,
            textColor: '#ffffff',
            title: 'Get Pre-Approved Today'
          },
          id: 'hero-1',
          locked: true,
          type: 'hero'
        },
        {
          content: {
            features: [
              {
                description: 'Understand exactly how much home you can afford',
                icon: '🏠',
                title: 'Know Your Budget'
              },
              {
                description: 'Stand out to sellers with pre-approval letter',
                icon: '💪',
                title: 'Stronger Offers'
              },
              {
                description: 'Streamlined process once you find your home',
                icon: '⚡',
                title: 'Faster Closing'
              }
            ],
            title: 'Why Get Pre-Approved?'
          },
          id: 'features-1',
          type: 'features'
        },
        {
          content: {
            fields: [
              { label: 'Full Name', name: 'name', required: true, type: 'text' },
              { label: 'Email Address', name: 'email', required: true, type: 'email' },
              { label: 'Phone Number', name: 'phone', required: true, type: 'tel' },
              { label: 'Annual Income', name: 'income', required: true, type: 'number' },
              { label: 'Down Payment Amount', name: 'down_payment', required: false, type: 'number' },
              { label: 'Property Type', name: 'property_type', options: ['Single Family', 'Condo', 'Townhome', 'Multi-Family'], required: true, type: 'select' },
              { label: 'When do you plan to buy?', name: 'timeline', options: ['Within 30 days', '1-3 months', '3-6 months', '6+ months'], required: true, type: 'select' }
            ],
            fluentFormId: 'pre-approval-form',
            submitText: 'Get Pre-Approved',
            subtitle: 'Fill out this quick form and I\'ll get back to you within 24 hours',
            successMessage: 'Thank you! I\'ll review your application and contact you within 24 hours.',
            title: 'Start Your Pre-Approval Application'
          },
          id: 'form-1',
          type: 'form'
        }
      ],
      description: 'Pre-approval application landing page',
      id: `pre-approval-${user.id}`,
      slug: `${firstName.toLowerCase()}-pre-approval`,
      status: 'published',
      title: 'Get Pre-Approved for Your Home Loan',
      type: 'pre-approval'
    };
  }

  /**
   * Generate rate quote landing page
   */
  static generateRateQuotePage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Your Loan Officer';

    return {
      blocks: [
        {
          content: {
            backgroundImage: '/assets/calculator-hero.jpg',
            buttonText: 'Get My Rate',
            buttonUrl: '#rate-form',
            subtitle: `Get a personalized rate quote from ${firstName}. No commitment required - see what you qualify for in minutes.`,
            textColor: '#ffffff',
            title: 'See Today\'s Rates'
          },
          id: 'hero-1',
          locked: true,
          type: 'hero'
        },
        {
          content: {
            features: [
              {
                description: 'Access to multiple lenders for best pricing',
                icon: '📈',
                title: 'Competitive Rates'
              },
              {
                description: 'Get quotes with no commitment or fees',
                icon: '✅',
                title: 'No Obligation'
              },
              {
                description: 'Personal consultation on loan options',
                icon: '🎯',
                title: 'Expert Guidance'
              }
            ],
            title: 'Current Market Advantages'
          },
          id: 'features-1',
          type: 'features'
        },
        {
          content: {
            fields: [
              { label: 'Full Name', name: 'name', required: true, type: 'text' },
              { label: 'Email Address', name: 'email', required: true, type: 'email' },
              { label: 'Phone Number', name: 'phone', required: true, type: 'tel' },
              { label: 'Loan Amount', name: 'loan_amount', required: true, type: 'number' },
              { label: 'Credit Score Range', name: 'credit_score', options: ['800+', '740-799', '680-739', '620-679', '580-619', 'Below 580'], required: true, type: 'select' },
              { label: 'Loan Type', name: 'loan_type', options: ['Purchase', 'Refinance', 'Cash-Out Refinance'], required: true, type: 'select' },
              { label: 'Property Value', name: 'property_value', required: true, type: 'number' }
            ],
            fluentFormId: 'rate-quote-form',
            submitText: 'Get My Rates',
            subtitle: 'Tell us a bit about your situation for accurate rates',
            successMessage: 'Thank you! I\'ll prepare your personalized rate quote and send it within 2 hours.',
            title: 'Get Your Personal Rate Quote'
          },
          id: 'form-1',
          type: 'form'
        }
      ],
      description: 'Mortgage rate quote calculator and application',
      id: `rate-quote-${user.id}`,
      slug: `${firstName.toLowerCase()}-rate-quote`,
      status: 'published',
      title: 'Get Your Personalized Rate Quote',
      type: 'rate-quote'
    };
  }

  /**
   * Generate about/bio page
   */
  static generateAboutPage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Loan Officer';
    const fullName = user.name || 'Professional Loan Officer';

    return {
      blocks: [
        {
          content: {
            backgroundImage: user.avatar || '/assets/professional-photo.jpg',
            buttonText: 'Contact Me Today',
            buttonUrl: '/contact',
            layout: 'side-by-side',
            subtitle: user.bio || `${firstName} is dedicated to helping clients achieve their homeownership dreams with personalized mortgage solutions.`,
            textColor: '#ffffff',
            title: `Meet ${fullName}`
          },
          id: 'hero-1',
          type: 'hero'
        },
        {
          content: {
            features: [
              {
                description: '8+ years helping families secure home financing',
                icon: '🏆',
                title: 'Experience'
              },
              {
                description: 'Direct access to me throughout the entire process',
                icon: '🤝',
                title: 'Personal Service'
              },
              {
                description: `Deep knowledge of ${user.location || 'local'} market conditions`,
                icon: '🏘️',
                title: 'Local Expert'
              }
            ],
            title: 'Why Choose Me?'
          },
          id: 'features-1',
          type: 'features'
        },
        {
          content: {
            backgroundColor: 'var(--brand-electric-blue)',
            buttonText: 'Schedule Consultation',
            buttonUrl: '/schedule',
            subtitle: 'Let\'s discuss your homebuying goals and find the perfect loan solution.',
            title: 'Ready to Get Started?'
          },
          id: 'cta-1',
          type: 'cta'
        }
      ],
      description: 'Professional biography and credentials page',
      id: `about-${user.id}`,
      slug: `about-${firstName.toLowerCase()}`,
      status: 'published',
      title: `About ${firstName}`,
      type: 'about'
    };
  }

  /**
   * Generate testimonials/reviews page
   */
  static generateTestimonialsPage(user: User): LandingPageTemplate {
    const firstName = user.name?.split(' ')[0] || 'Loan Officer';

    return {
      blocks: [
        {
          content: {
            backgroundImage: '/assets/happy-family-home.jpg',
            buttonText: 'Get Started',
            buttonUrl: '/contact',
            subtitle: `See what clients say about working with ${firstName}`,
            textColor: '#ffffff',
            title: 'Happy Homeowners'
          },
          id: 'hero-1',
          type: 'hero'
        },
        {
          content: {
            author: 'Sarah & Mike Johnson',
            avatar: '/assets/testimonial-1.jpg',
            quote: `${firstName} made our home buying process so smooth and stress-free. We couldn't be happier with the service and expertise provided.`,
            rating: 5,
            title: 'First-Time Homebuyers'
          },
          id: 'testimonial-1',
          type: 'testimonial'
        },
        {
          content: {
            author: 'David Chen',
            avatar: '/assets/testimonial-2.jpg',
            quote: `Professional, knowledgeable, and always available to answer our questions. ${firstName} got us the best rate and closed on time.`,
            rating: 5,
            title: 'Refinance Client'
          },
          id: 'testimonial-2',
          type: 'testimonial'
        },
        {
          content: {
            backgroundColor: 'var(--brand-electric-blue)',
            buttonText: 'Start Your Journey',
            buttonUrl: '/pre-approval',
            subtitle: 'Experience the same level of service and expertise',
            title: 'Join Our Happy Clients'
          },
          id: 'cta-1',
          type: 'cta'
        }
      ],
      description: 'Client testimonials and success stories',
      id: `testimonials-${user.id}`,
      slug: `${firstName.toLowerCase()}-reviews`,
      status: 'published',
      title: 'Client Success Stories',
      type: 'testimonials'
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
      blocks: [
        {
          content: {
            backgroundImage: '/assets/partnership-hero.jpg',
            buttonText: 'Get Started',
            buttonUrl: '#contact-form',
            subtitle: 'Expert real estate and lending services working together for you',
            textColor: '#ffffff',
            title: 'Your Complete Home Team'
          },
          id: 'hero-1',
          type: 'hero'
        }
        // More blocks would be added here for the partnership page
      ],
      description: 'Joint marketing page showcasing realtor-lender partnership',
      id: `partnership-${user.id}`,
      slug: `${user.name?.toLowerCase().replaceAll(/\s+/g, '-')}-team`,
      status: 'published',
      title: 'Your Real Estate & Lending Team',
      type: 'lead-capture'
    };
  }

  /**
   * Generate referral page for realtors
   */
  static generateReferralPage(user: User): LandingPageTemplate {
    return {
      blocks: [
        {
          content: {
            backgroundImage: '/assets/referral-hero.jpg',
            buttonText: 'Send Referral',
            buttonUrl: '#referral-form',
            subtitle: 'Send your clients to a trusted lending partner',
            textColor: '#ffffff',
            title: 'Refer with Confidence'
          },
          id: 'hero-1',
          type: 'hero'
        }
      ],
      description: 'Referral system for realtors to send clients',
      id: `referrals-${user.id}`,
      slug: `${user.name?.toLowerCase().replaceAll(/\s+/g, '-')}-referrals`,
      status: 'draft',
      title: 'Refer Your Clients',
      type: 'lead-capture'
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
            subtitle: block.content.subtitle?.replace('{{name}}', user.name?.split(' ')[0] || 'Professional'),
            title: block.content.title.replace('{{name}}', user.name || 'Professional')
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