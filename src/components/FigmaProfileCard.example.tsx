import { useState, useEffect } from 'react';
import { FigmaProfileCard } from './FigmaProfileCard';

/**
 * Example usage of FigmaProfileCard with REST API
 *
 * This demonstrates how to:
 * 1. Fetch profile data from the REST API
 * 2. Pass the data to FigmaProfileCard component
 * 3. Handle user interactions (Schedule, Apply, Menu)
 */
export function FigmaProfileCardExample() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch profile data from REST API
    fetch('/wp-json/frs-users/v1/profiles/1')
      .then(res => res.json())
      .then(data => {
        setProfile(data.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to load profile:', error);
        setLoading(false);
      });
  }, []);

  const handleScheduleMeeting = () => {
    console.log('Schedule a meeting clicked');
    // Integrate with scheduling system (Calendly, etc.)
    // window.open('https://calendly.com/your-link', '_blank');
  };

  const handleApplyNow = () => {
    console.log('Apply now clicked');
    // Redirect to application page
    // window.location.href = '/apply';
  };

  const handleMenuClick = () => {
    console.log('Menu clicked');
    // Show dropdown menu or modal
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found</div>;
  }

  return (
    <div className="flex items-center justify-center p-8">
      <FigmaProfileCard
        city_state={profile.city_state}
        email={profile.email}
        first_name={profile.first_name}
        headshot_url={profile.headshot_url}
        id={profile.id}
        job_title={profile.job_title}
        last_name={profile.last_name}
        mobile_number={profile.mobile_number}
        nmls_number={profile.nmls_number}
        onApplyNow={handleApplyNow}
        onMenuClick={handleMenuClick}
        onScheduleMeeting={handleScheduleMeeting}
        phone_number={profile.phone_number}
        profile_slug={profile.profile_slug}
      />
    </div>
  );
}

/**
 * Example: Display multiple profile cards in a grid
 */
export function FigmaProfileCardGrid() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    fetch('/wp-json/frs-users/v1/profiles')
      .then(res => res.json())
      .then(data => setProfiles(data.data))
      .catch(error => console.error('Failed to load profiles:', error));
  }, []);

  return (
    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map(profile => (
        <FigmaProfileCard
          city_state={profile.city_state}
          email={profile.email}
          first_name={profile.first_name}
          headshot_url={profile.headshot_url}
          id={profile.id}
          job_title={profile.job_title}
          key={profile.id}
          last_name={profile.last_name}
          mobile_number={profile.mobile_number}
          nmls_number={profile.nmls_number}
          onApplyNow={() => console.log('Apply:', profile.id)}
          onMenuClick={() => console.log('Menu:', profile.id)}
          onScheduleMeeting={() => console.log('Schedule:', profile.id)}
          phone_number={profile.phone_number}
          profile_slug={profile.profile_slug}
        />
      ))}
    </div>
  );
}
