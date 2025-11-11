import { FloatingInput } from '@/components/ui/floating-input';

interface ProfilePageProps {
  profileData: any;
  setProfileData: (data: any) => void;
}

export function ProfilePage({ profileData, setProfileData }: ProfilePageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <p className="text-sm text-gray-600 mt-1">Update your personal and professional details.</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            id="firstName"
            label="First Name"
            value={profileData.firstName}
            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
          />
          <FloatingInput
            id="lastName"
            label="Last Name"
            value={profileData.lastName}
            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
          />
        </div>

        <FloatingInput
          id="email"
          label="Email"
          type="email"
          value={profileData.email}
          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
        />

        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            id="phone"
            label="Phone"
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
          />
          <FloatingInput
            id="mobile"
            label="Mobile Number"
            type="tel"
            value={profileData.mobileNumber}
            onChange={(e) => setProfileData({...profileData, mobileNumber: e.target.value})}
          />
        </div>

        <FloatingInput
          id="title"
          label="Job Title"
          value={profileData.title}
          onChange={(e) => setProfileData({...profileData, title: e.target.value})}
        />

        <FloatingInput
          id="company"
          label="Company"
          value={profileData.company}
          onChange={(e) => setProfileData({...profileData, company: e.target.value})}
        />

        <FloatingInput
          id="location"
          label="Location"
          value={profileData.location}
          onChange={(e) => setProfileData({...profileData, location: e.target.value})}
          placeholder="City, State"
        />

        <div className="grid grid-cols-2 gap-4">
          <FloatingInput
            id="nmls"
            label="NMLS Number"
            value={profileData.nmls}
            onChange={(e) => setProfileData({...profileData, nmls: e.target.value})}
          />
          <FloatingInput
            id="license"
            label="License Number"
            value={profileData.license_number}
            onChange={(e) => setProfileData({...profileData, license_number: e.target.value})}
          />
        </div>
      </div>
    </div>
  );
}
