import { Card, CardContent } from '../ui/card';
import printSocialMediaImg from '../../../../../assets/images/features/print-social.png';

export function PrintSocialMediaCard() {
  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-4 flex flex-col gap-2 items-start h-full">
        {/* Text Content */}
        <div className="flex flex-col gap-1 items-start w-full">
          <h3 className="font-['Mona_Sans'] font-bold text-[24px] leading-[30px] text-gray-950 whitespace-nowrap">
            Print & Social Media Marketing
          </h3>
          <p className="font-['Mona_Sans'] font-medium text-[14px] leading-[20px] text-gray-500">
            Submit your marketing requests for any materials you need from our in-house team, Studio21.
          </p>
        </div>

        {/* Print & Social Media Preview Image */}
        <div className="w-full max-w-[350px] mx-auto flex-1 relative overflow-hidden rounded min-h-[250px]">
          <img
            src={printSocialMediaImg}
            alt="Print & Social Media Marketing Preview"
            className="absolute h-full w-full object-contain object-center"
          />
        </div>
      </CardContent>
    </Card>
  );
}
