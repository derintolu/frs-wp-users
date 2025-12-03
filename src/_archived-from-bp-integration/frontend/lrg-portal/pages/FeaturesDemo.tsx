import { BookingCalendarCard, LandingPagesCard, BrandGuideCard, PrintSocialMediaCard } from '../components/features';

export function FeaturesDemo() {
  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Feature Cards Demo</h1>
        <p className="text-muted-foreground">
          Showcasing 4 feature cards from the FRS DXP Figma design system
        </p>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingCalendarCard />
        <LandingPagesCard />
        <BrandGuideCard />
        <PrintSocialMediaCard />
      </div>
    </div>
  );
}
