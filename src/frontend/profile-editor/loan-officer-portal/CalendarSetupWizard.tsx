import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface CalendarSetupWizardProps {
  userId: string;
  onComplete: () => void;
}

export function CalendarSetupWizard({ userId, onComplete }: CalendarSetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calendarCreated, setCalendarCreated] = useState(false);

  const handleCreateCalendar = async () => {
    setIsCreating(true);
    setError(null);

    try {
      // Call WordPress REST API to trigger calendar creation
      const nonce = (window as any).frsPortalConfig?.restNonce;
      const response = await fetch('/wp-json/frs/v1/calendar/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to create calendar');
      }

      const data = await response.json();

      if (data.success) {
        setCalendarCreated(true);
        setCurrentStep(3);
      } else {
        throw new Error(data.message || 'Calendar creation failed');
      }
    } catch (err) {
      console.error('Calendar setup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to create calendar. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleComplete = async () => {
    try {
      // Mark setup as complete in user meta
      const nonce = (window as any).frsPortalConfig?.restNonce;
      await fetch('/wp-json/frs/v1/calendar/complete-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({ user_id: userId }),
      });

      onComplete();
    } catch (err) {
      console.error('Failed to mark setup complete:', err);
      // Still complete the wizard even if meta update fails
      onComplete();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[600px] p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex items-center justify-center">
              <Calendar className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl">Calendar Setup</CardTitle>
          <CardDescription>
            Let's get your booking calendar ready in just a few steps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 1 ? <CheckCircle2 className="h-5 w-5" /> : '1'}
              </div>
              <span className="text-sm font-medium max-md:hidden">Welcome</span>
            </div>
            <div className="h-px w-12 bg-gray-300" />
            <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
              </div>
              <span className="text-sm font-medium max-md:hidden">Create</span>
            </div>
            <div className="h-px w-12 bg-gray-300" />
            <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {currentStep > 3 ? <CheckCircle2 className="h-5 w-5" /> : '3'}
              </div>
              <span className="text-sm font-medium max-md:hidden">Done</span>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Welcome to Your Booking Calendar</h3>
                <p className="text-gray-600">
                  Your personal booking calendar helps you manage appointments with clients, schedule calls, and stay organized.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Manage Appointments</h4>
                        <p className="text-sm text-gray-600">Accept bookings from clients directly through your calendar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Set Your Availability</h4>
                        <p className="text-sm text-gray-600">Control when you're available for meetings</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => setCurrentStep(2)}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Create Your Calendar</h3>
                <p className="text-gray-600">
                  We'll create a personalized booking calendar just for you. This only takes a moment.
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!calendarCreated && (
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleCreateCalendar}
                    disabled={isCreating}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Creating Calendar...
                      </>
                    ) : (
                      <>
                        <Calendar className="mr-2 h-5 w-5" />
                        Create My Calendar
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold">All Set!</h3>
                <p className="text-gray-600">
                  Your booking calendar is ready to use. You can now start managing your appointments and setting your availability.
                </p>
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-6">
                  <h4 className="font-semibold mb-2">Next Steps:</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Set your working hours and availability</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Configure appointment types and durations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>Share your booking link with clients</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleComplete}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600"
                >
                  Go to My Calendar
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
