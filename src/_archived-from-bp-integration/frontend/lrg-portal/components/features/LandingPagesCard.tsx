import { Card, CardContent } from '../ui/card';
import landingPagesImg from '../../../../../assets/images/features/landing-pages.png';

export function LandingPagesCard() {
  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-4 flex flex-col gap-2 h-full">
        {/* Text Content */}
        <div className="flex flex-col gap-2 items-center w-full">
          <h3 className="font-['Mona_Sans'] font-bold text-[24px] leading-[30px] text-gray-950 w-full">
            Landing Pages
          </h3>
          <p className="font-['Mona_Sans'] font-medium text-[14px] leading-[20px] text-gray-500 w-full">
            Quickly edit your profile pages and design landing pages tailored for your audience with just a click.
          </p>

          {/* Landing Pages Preview Image */}
          <div className="w-full max-w-[350px] mx-auto flex-1 relative overflow-hidden rounded min-h-[250px]">
            <img
              src={landingPagesImg}
              alt="Landing Pages Preview"
              className="absolute h-full w-full object-contain object-center"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
