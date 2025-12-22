import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Sparkles } from 'lucide-react';

interface OnboardingSectionProps {
  userId: string;
}

export function OnboardingSection({ userId }: OnboardingSectionProps) {
  return (
    <Card className="shadow-xl border-0 overflow-hidden">
      <CardHeader
        className="pb-4"
        style={{
          background: 'var(--gradient-hero)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-white text-xl mb-1">
              Welcome Onboarding
            </CardTitle>
            <p className="text-white/90 text-sm">
              Get started with your profile setup
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <p className="text-gray-600 text-center py-8">
          Onboarding content coming soon...
        </p>
      </CardContent>
    </Card>
  );
}
