import { Card, CardContent } from '../ui/card';
import bookingCalendarImg from '../../../../../assets/images/features/booking-calendar.png';

export function BookingCalendarCard() {
  return (
    <Card className="overflow-hidden h-full">
      <CardContent className="p-4 flex gap-2 items-start relative h-full">
        {/* Text Content */}
        <div className="flex flex-col gap-1 flex-1 z-10">
          <h3 className="font-['Mona_Sans'] font-bold text-[24px] leading-[30px] text-gray-950">
            Booking Calendar
          </h3>
          <p className="font-['Mona_Sans'] font-medium text-[14px] leading-[20px] text-gray-500">
            Enable clients and prospects to schedule appointments at mutually convenient times.
          </p>
        </div>

        {/* Calendar Preview Image */}
        <div className="absolute left-1/2 -translate-x-1/2 top-[80px] max-w-[350px] w-full aspect-[504/375] border-[1.556px] border-gray-100 rounded overflow-hidden">
          <img
            src={bookingCalendarImg}
            alt="Booking Calendar Preview"
            className="w-full h-full object-contain object-center"
          />
        </div>
      </CardContent>
    </Card>
  );
}
