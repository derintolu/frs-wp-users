import { Card, CardContent } from '../ui/card';
import brandGuideImg from '../../../../../assets/images/features/brand-guide.png';

export function BrandGuideCard() {
  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-4 flex flex-col gap-2 items-center h-full">
        {/* Text Content */}
        <div className="flex flex-col gap-1 items-start w-full">
          <h3 className="font-['Mona_Sans'] font-bold text-[24px] leading-[30px] text-gray-950">
            Brand Guide
          </h3>
          <p className="font-['Mona_Sans'] font-medium text-[14px] leading-[20px] text-gray-500">
            Looking to share your brand assets with a vendor or partner? This guide includes all the essentials they need — logos, color palettes, typography, and usage guidelines — all set for download.
          </p>
        </div>

        {/* Brand Guide Preview Image */}
        <div className="w-full max-w-[350px] mx-auto flex-1 relative overflow-hidden rounded min-h-[250px]">
          <img
            src={brandGuideImg}
            alt="Brand Guide Preview"
            className="absolute h-full w-full object-contain object-center"
          />
        </div>
      </CardContent>
    </Card>
  );
}
