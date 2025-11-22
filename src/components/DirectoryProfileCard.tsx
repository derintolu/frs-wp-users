import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCodeStyling from 'qr-code-styling';

interface DirectoryProfileCardProps {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  mobile_number?: string;
  job_title?: string;
  headshot_url?: string;
  city_state?: string;
  zip?: string;
  profile_slug?: string;
  nmls_number?: string;
  nmls?: string;
  select_person_type?: 'loan_officer' | 'agent' | 'staff' | 'leadership' | 'assistant';
  directory_button_type?: 'schedule' | 'call' | 'contact';
}

export function DirectoryProfileCard({
  id,
  first_name,
  last_name,
  job_title = 'Digital Director',
  nmls_number,
  nmls,
  email,
  phone_number,
  mobile_number,
  city_state = 'San Francisco, CA',
  headshot_url,
  profile_slug,
  select_person_type = 'loan_officer',
  directory_button_type = 'schedule',
}: DirectoryProfileCardProps) {
  const [showQRCode, setShowQRCode] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const fullName = `${first_name} ${last_name}`;
  const phoneNumber = phone_number || mobile_number || '';
  const nmlsDisplay = nmls_number || nmls;
  const location = city_state || 'City, St';
  const gradientUrl = (window as any).frsPortalConfig?.gradientUrl || '';
  const contentUrl = (window as any).frsPortalConfig?.contentUrl || '/wp-content';
  const iconPath = `${contentUrl}/plugins/frs-wp-users/assets/images`;

  // Get random placeholder image if no headshot
  const getPlaceholderImage = () => {
    const maleNames = ['james', 'john', 'robert', 'michael', 'william', 'david', 'richard', 'joseph', 'thomas', 'charles', 'christopher', 'daniel', 'matthew', 'anthony', 'mark', 'donald', 'steven', 'paul', 'andrew', 'joshua', 'kenneth', 'kevin', 'brian', 'george', 'edward', 'ronald', 'timothy', 'jason', 'jeffrey', 'ryan', 'jacob', 'gary', 'nicholas', 'eric', 'jonathan', 'stephen', 'larry', 'justin', 'scott', 'brandon', 'benjamin', 'samuel', 'frank', 'gregory', 'raymond', 'alexander', 'patrick', 'jack', 'dennis', 'jerry', 'tyler', 'aaron', 'jose', 'adam', 'henry', 'nathan', 'douglas', 'zachary', 'peter', 'kyle', 'walter', 'ethan', 'jeremy', 'harold', 'keith', 'christian', 'roger', 'noah', 'gerald', 'carl', 'terry', 'sean', 'austin', 'arthur', 'lawrence', 'jesse', 'dylan', 'bryan', 'joe', 'jordan', 'billy', 'bruce', 'albert', 'willie', 'gabriel', 'logan', 'alan', 'juan', 'wayne', 'roy', 'ralph', 'randy', 'eugene', 'vincent', 'russell', 'elijah', 'louis', 'bobby', 'philip', 'johnny'];

    const femaleNames = ['mary', 'patricia', 'jennifer', 'linda', 'barbara', 'elizabeth', 'susan', 'jessica', 'sarah', 'karen', 'nancy', 'lisa', 'betty', 'margaret', 'sandra', 'ashley', 'kimberly', 'emily', 'donna', 'michelle', 'dorothy', 'carol', 'amanda', 'melissa', 'deborah', 'stephanie', 'rebecca', 'sharon', 'laura', 'cynthia', 'kathleen', 'amy', 'angela', 'shirley', 'anna', 'brenda', 'pamela', 'emma', 'nicole', 'helen', 'samantha', 'katherine', 'christine', 'debra', 'rachel', 'carolyn', 'janet', 'catherine', 'maria', 'heather', 'diane', 'ruth', 'julie', 'olivia', 'joyce', 'virginia', 'victoria', 'kelly', 'lauren', 'christina', 'joan', 'evelyn', 'judith', 'megan', 'andrea', 'cheryl', 'hannah', 'jacqueline', 'martha', 'gloria', 'teresa', 'ann', 'sara', 'madison', 'frances', 'kathryn', 'janice', 'jean', 'abigail', 'alice', 'judy', 'sophia', 'grace', 'denise', 'amber', 'doris', 'marilyn', 'danielle', 'beverly', 'isabella', 'theresa', 'diana', 'natalie', 'brittany', 'charlotte', 'marie', 'kayla', 'alexis', 'lori'];

    const firstName = first_name.toLowerCase();
    const isMale = maleNames.includes(firstName);
    const isFemale = femaleNames.includes(firstName);

    let placeholders;
    if (isMale) {
      placeholders = [
        `${iconPath}/Man 1.jpg`,
        `${iconPath}/Man 2.jpg`,
        `${iconPath}/Man 3.jpg`,
        `${iconPath}/Man 4.jpg`,
      ];
    } else if (isFemale) {
      placeholders = [
        `${iconPath}/Woman 1.jpg`,
        `${iconPath}/Woman 2.jpg`,
        `${iconPath}/Woman 3.jpg`,
        `${iconPath}/Woman 4.jpg`,
      ];
    } else {
      // If name not recognized, use all placeholders
      placeholders = [
        `${iconPath}/Man 1.jpg`,
        `${iconPath}/Man 2.jpg`,
        `${iconPath}/Man 3.jpg`,
        `${iconPath}/Man 4.jpg`,
        `${iconPath}/Woman 1.jpg`,
        `${iconPath}/Woman 2.jpg`,
        `${iconPath}/Woman 3.jpg`,
        `${iconPath}/Woman 4.jpg`,
      ];
    }

    const index = id ? id % placeholders.length : Math.floor(Math.random() * placeholders.length);
    return placeholders[index];
  };

  // Determine the directory path based on person type
  const getDirectoryPath = () => {
    const slug = profile_slug || `${first_name.toLowerCase()}-${last_name.toLowerCase()}`;
    switch (select_person_type) {
      case 'loan_officer':
        return `/lo/${slug}`;
      case 'agent':
        return `/agent/${slug}`;
      case 'staff':
        return `/staff/${slug}`;
      case 'leadership':
        return `/leadership/${slug}`;
      case 'assistant':
        return `/assistant/${slug}`;
      default:
        return `/lo/${slug}`;
    }
  };

  const directoryPath = getDirectoryPath();
  const siteUrl = window.location.origin;
  const qrProfileUrl = `${siteUrl}/directory#${directoryPath}`;

  // Determine right button text and action based on directory_button_type
  const getRightButtonConfig = () => {
    switch (directory_button_type) {
      case 'call':
        return {
          text: 'Call Me',
          action: () => window.location.href = `tel:${phoneNumber.replace(/[^0-9+]/g, '')}`
        };
      case 'contact':
        return {
          text: 'Contact Me',
          action: () => window.location.href = `mailto:${email}`
        };
      case 'schedule':
      default:
        return {
          text: 'Schedule a Meeting',
          action: () => {} // TODO: Add scheduling logic
        };
    }
  };

  const rightButton = getRightButtonConfig();

  // Generate QR Code
  useEffect(() => {
    if (qrCodeRef.current && showQRCode) {
      qrCodeRef.current.innerHTML = '';

      const qrCode = new QRCodeStyling({
        type: 'canvas',
        shape: 'square',
        width: 90,
        height: 90,
        data: qrProfileUrl,
        margin: 0,
        qrOptions: {
          typeNumber: 0,
          mode: 'Byte',
          errorCorrectionLevel: 'L'
        },
        dotsOptions: {
          type: 'extra-rounded',
          roundSize: true,
          gradient: {
            type: 'linear',
            rotation: 0,
            colorStops: [
              { offset: 0, color: '#2563eb' },
              { offset: 1, color: '#2dd4da' }
            ]
          }
        },
        backgroundOptions: {
          color: '#ffffff'
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          gradient: {
            type: 'linear',
            rotation: 0,
            colorStops: [
              { offset: 0, color: '#2563ea' },
              { offset: 1, color: '#2dd4da' }
            ]
          }
        },
        cornersDotOptions: {
          type: '',
          gradient: {
            type: 'linear',
            rotation: 0,
            colorStops: [
              { offset: 0, color: '#2dd4da' },
              { offset: 1, color: '#2563e9' }
            ]
          }
        }
      });

      qrCode.append(qrCodeRef.current);
    }
  }, [showQRCode, qrProfileUrl]);

  return (
    <div className="w-full bg-white border border-blue-600 rounded overflow-hidden">
      {/* Video Gradient Background Header */}
      <div className="h-[115px] overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={gradientUrl} type="video/mp4" />
        </video>
      </div>

      {/* Avatar with QR Code Flip */}
      <div className="-mt-[74px] mx-auto w-[148px]">
        <div className="relative w-[148px] h-[148px]" style={{ perspective: '1000px' }}>
          <div
            className="relative w-full h-full transition-transform duration-700"
            style={{
              transformStyle: 'preserve-3d',
              transform: showQRCode ? 'rotateY(180deg)' : 'rotateY(0deg)'
            }}
          >
            {/* Front - Avatar */}
            <div
              className="absolute inset-0 rounded-full overflow-visible"
              style={{
                backfaceVisibility: 'hidden'
              }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden"
                style={{
                  border: '4px solid transparent',
                  backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}
              >
                <img
                  alt={fullName}
                  className="w-full h-full object-cover"
                  src={headshot_url || getPlaceholderImage()}
                />
              </div>

              {/* QR Flip Button - flips with avatar */}
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="absolute top-2 right-2 w-[35px] h-[35px] flex items-center justify-center z-20"
              >
                <img
                  alt="Toggle QR"
                  className="w-[35px] h-[35px]"
                  src={`${iconPath}/qr-flip.svg`}
                />
              </button>
            </div>

            {/* Back - QR Code */}
            <div
              className="absolute inset-0 rounded-full overflow-visible"
              style={{
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-white border border-gray-800 flex items-center justify-center p-[26px]">
                <div ref={qrCodeRef} className="w-[90px] h-[90px]" />
              </div>

              {/* Profile Flip Button - flips with QR, scaleX to make readable */}
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="absolute top-2 right-2 w-[35px] h-[35px] flex items-center justify-center z-20"
                style={{ transform: 'scaleX(-1)' }}
              >
                <img
                  alt="Show Profile"
                  className="w-[35px] h-[35px]"
                  src={`${iconPath}/profile flip.svg`}
                  style={{ transform: 'scaleX(-1)' }}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content - Name, Title, Contact Info */}
      <div className="text-center px-4 mt-4 space-y-2">
        {/* Name */}
        <h3
          className="text-[30px] font-bold text-[#020817] text-center m-0"
          style={{ fontFamily: 'Mona Sans, sans-serif', lineHeight: '36px' }}
        >
          {fullName}
        </h3>

        {/* Title and NMLS - Gradient Text */}
        <div
          className="text-center text-base w-full"
          style={{
            fontFamily: 'Roboto, sans-serif',
            background: 'linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            lineHeight: '24px',
            letterSpacing: '-0.32px'
          }}
        >
          {job_title}{nmlsDisplay && ` | NMLS ${nmlsDisplay}`}
        </div>

        {/* Email */}
        <div className="flex items-center justify-center gap-2">
          <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0.385714" y="0.385714" width="24.2286" height="24.2286" rx="12.1143" fill="#F3F3F3"/>
            <rect x="0.385714" y="0.385714" width="24.2286" height="24.2286" rx="12.1143" stroke="url(#paint0_linear_email)" strokeWidth="0.771429"/>
            <path d="M19.4834 6.2925C19.342 6.16683 19.1654 6.07696 18.9718 6.03214C18.7783 5.98731 18.5748 5.98917 18.3823 6.0375H18.3718L4.87602 9.6775C4.65633 9.73366 4.4611 9.84797 4.31633 10.0052C4.17156 10.1625 4.08411 10.3552 4.06563 10.5577C4.04715 10.7602 4.09852 10.963 4.2129 11.1389C4.32727 11.3148 4.49923 11.4556 4.70586 11.5425L10.726 14.0769L13.5772 19.4281C13.6672 19.5995 13.8105 19.7444 13.9902 19.8457C14.1698 19.9471 14.3783 20.0006 14.5911 20C14.6234 20 14.6558 19.9987 14.6881 19.9962C14.9152 19.9799 15.1312 19.9022 15.3071 19.7736C15.4831 19.6451 15.6106 19.4717 15.6725 19.2769L19.7647 7.28062C19.7647 7.2775 19.7647 7.27437 19.7647 7.27125C19.8198 7.1006 19.8228 6.91999 19.7733 6.74799C19.7239 6.57598 19.6238 6.41876 19.4834 6.2925ZM14.5974 18.9906L14.5939 18.9994L11.8264 13.8062L15.148 10.8531C15.249 10.7586 15.3045 10.6327 15.3026 10.5023C15.3007 10.372 15.2416 10.2474 15.1379 10.1552C15.0342 10.063 14.8941 10.0104 14.7474 10.0088C14.6007 10.0071 14.4591 10.0564 14.3527 10.1462L11.0305 13.0987L5.1875 10.6387H5.19735L18.6875 7L14.5974 18.9906Z" fill="url(#paint1_linear_email)"/>
            <defs>
              <linearGradient id="paint0_linear_email" x1="0" y1="12.5" x2="25" y2="12.5" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2DD4DA"/>
                <stop offset="1" stopColor="#2563EB"/>
              </linearGradient>
              <linearGradient id="paint1_linear_email" x1="4.06195" y1="12.9999" x2="19.8083" y2="12.9999" gradientUnits="userSpaceOnUse">
                <stop stopColor="#2DD4DA"/>
                <stop offset="1" stopColor="#2563EB"/>
              </linearGradient>
            </defs>
          </svg>
          <a
            href={`mailto:${email}`}
            className="text-base text-[#4678eb] hover:underline"
            style={{ fontFamily: 'Mona Sans, sans-serif' }}
          >
            {email}
          </a>
        </div>

        {/* Phone and Location */}
        <div className="flex items-center justify-center gap-8">
          {/* Phone */}
          <div className="flex items-center gap-2">
            <svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.385714" y="0.385714" width="24.2286" height="24.2286" rx="12.1143" fill="#F3F3F3"/>
              <rect x="0.385714" y="0.385714" width="24.2286" height="24.2286" rx="12.1143" stroke="url(#paint0_linear_phone)" strokeWidth="0.771429"/>
              <path d="M8.65798 4.72092C8.90529 4.68954 9.15635 4.74333 9.37282 4.87229C9.58919 5.00123 9.75963 5.20005 9.85915 5.43869L9.86013 5.43967L11.4509 9.12717V9.13693L11.4539 9.14572C11.5291 9.32847 11.5604 9.52763 11.5437 9.7258C11.527 9.92374 11.4635 10.1144 11.3591 10.2805C11.3468 10.2998 11.3335 10.3185 11.3191 10.3371L9.75368 12.2727L9.73415 12.2961L9.8611 12.55C10.4666 13.6793 11.5961 14.8087 12.6941 15.3635L12.7234 15.3781L12.7478 15.3567L14.5818 13.7307C14.5983 13.7163 14.6156 13.703 14.6336 13.6906C14.7935 13.5797 14.9776 13.5118 15.1687 13.4934C15.3598 13.475 15.5527 13.5067 15.7293 13.5852V13.5842L15.7381 13.5891H15.739L19.2879 15.2434C19.5165 15.3466 19.7076 15.5245 19.8318 15.7502C19.9406 15.9479 19.9932 16.1732 19.9841 16.3996L19.9763 16.4963C19.8433 17.5467 19.3477 18.5109 18.5818 19.2082C17.816 19.9054 16.8323 20.2882 15.8152 20.2863C9.86213 20.2863 5.01461 15.2488 5.01442 9.05295C5.0126 7.99335 5.3818 6.96889 6.05251 6.17209C6.7232 5.37533 7.65027 4.85994 8.65895 4.72189L8.65798 4.72092ZM8.79177 5.87131C8.05073 5.97452 7.37142 6.35422 6.88063 6.93967C6.38977 7.52527 6.12092 8.27669 6.1238 9.05295C6.12668 11.7239 7.1481 14.2849 8.96462 16.174C10.7813 18.0634 13.2452 19.1262 15.8152 19.1291V19.1281C16.5637 19.1306 17.2872 18.8508 17.8504 18.3391C18.4137 17.8272 18.778 17.1194 18.8758 16.3488L18.8826 16.2951H18.8318L15.2996 14.6496L15.2713 14.6369L15.2468 14.6574L13.4158 16.2824C13.3996 16.2967 13.3826 16.3101 13.365 16.3225C13.1985 16.438 13.0057 16.5067 12.8064 16.5217C12.6072 16.5367 12.4078 16.4976 12.2273 16.4084C10.8261 15.7043 9.42682 14.2608 8.7488 12.8186C8.66197 12.6316 8.62286 12.4244 8.63552 12.217C8.64823 12.0095 8.71301 11.809 8.82204 11.635V11.634L8.8611 11.5793L10.4187 9.64084L10.4363 9.61838L10.4256 9.59104L8.84645 5.91721L8.85231 5.86252L8.79177 5.87131Z" fill="url(#paint1_linear_phone)" stroke="url(#paint2_linear_phone)" strokeWidth="0.0964286"/>
              <defs>
                <linearGradient id="paint0_linear_phone" x1="0" y1="12.5" x2="25" y2="12.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2DD4DA"/>
                  <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
                <linearGradient id="paint1_linear_phone" x1="4.96657" y1="12.5" x2="20.0334" y2="12.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2DD4DA"/>
                  <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
                <linearGradient id="paint2_linear_phone" x1="4.96657" y1="12.5" x2="20.0334" y2="12.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2DD4DA"/>
                  <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
              </defs>
            </svg>
            <a
              href={`tel:${phoneNumber.replace(/[^0-9+]/g, '')}`}
              className="text-base text-[#4678eb] hover:underline"
              style={{ fontFamily: 'Mona Sans, sans-serif' }}
            >
              {phoneNumber}
            </a>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2">
            <svg width="29" height="29" viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="rotate-[283deg]">
              <rect x="2.2451" y="2.2451" width="24.2286" height="24.2286" rx="12.1143" fill="#F3F3F3"/>
              <rect x="2.2451" y="2.2451" width="24.2286" height="24.2286" rx="12.1143" stroke="url(#paint0_linear_location)" strokeWidth="0.771429"/>
              <path d="M11.1636 9.28574L16.8962 12.7615L17.5552 19.433L11.8226 15.9573L11.1636 9.28574Z" stroke="url(#paint1_linear_location)" strokeLinecap="round" strokeLinejoin="round"/>
              <defs>
                <linearGradient id="paint0_linear_location" x1="1.85939" y1="14.3594" x2="26.8594" y2="14.3594" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2DD4DA"/>
                  <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
                <linearGradient id="paint1_linear_location" x1="13.4205" y1="18.4941" x2="15.2983" y2="10.2246" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2DD4DA"/>
                  <stop offset="1" stopColor="#2563EB"/>
                </linearGradient>
              </defs>
            </svg>
            <span
              className="text-base text-[#1d4fc4]"
              style={{ fontFamily: 'Mona Sans, sans-serif' }}
            >
              {location}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-8 pb-5 mt-[10px] flex gap-2">
        {/* View Profile Button */}
        <Link
          to={directoryPath}
          className="flex-1 h-10 flex items-center justify-center bg-white no-underline"
          style={{
            border: '2px solid transparent',
            borderRadius: '0.25rem',
            backgroundImage: 'linear-gradient(white, white), linear-gradient(90deg, #2dd4da 0%, #2563eb 100%)',
            backgroundOrigin: 'padding-box, border-box',
            backgroundClip: 'padding-box, border-box'
          }}
        >
          <span
            className="text-sm text-[#4678eb]"
            style={{ fontFamily: 'Mona Sans, sans-serif', letterSpacing: '-0.32px' }}
          >
            View Profile
          </span>
        </Link>

        {/* Dynamic Action Button */}
        <button
          onClick={rightButton.action}
          className="flex-1 h-10 bg-gradient-to-r from-[#2dd4da] to-[#2563eb] rounded flex items-center justify-center"
        >
          <span
            className="text-sm text-white font-bold"
            style={{ fontFamily: 'Mona Sans, sans-serif', letterSpacing: '-0.32px' }}
          >
            {rightButton.text}
          </span>
        </button>
      </div>
    </div>
  );
}
