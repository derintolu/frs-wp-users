import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TrendingDown, TrendingUp, Calendar, Info } from 'lucide-react';

interface MortgageRateData {
  frm_30: string;
  frm_15: string;
  week: string;
}

interface MortgageRate {
  week: string;
  data: MortgageRateData;
}

export function MortgageRatesWidget() {
  const [rates, setRates] = useState<MortgageRate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        setError(null);

        // API Ninjas endpoint
        const response = await fetch('https://api.api-ninjas.com/v1/mortgagerate', {
          method: 'GET',
          headers: {
            'X-Api-Key': 'TYgp30Q8LTuwp3KTbCku1Q==MFnAgH2amAue4QiZ',
          },
        });

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const data: MortgageRate[] = await response.json();

        console.log('Mortgage rates API response:', data);

        if (data && data.length > 0) {
          setRates(data[0]); // Most recent rates
          console.log('Set rates to:', data[0]);
        } else {
          throw new Error('No rate data available');
        }
      } catch (err) {
        console.error('Failed to fetch mortgage rates:', err);
        setError('Unable to load rates');

        // Fallback to sample data for demonstration
        const fallbackRates = {
          week: 'current',
          data: {
            frm_30: '6.85',
            frm_15: '6.10',
            week: new Date().toISOString().split('T')[0],
          }
        };
        console.log('Using fallback rates:', fallbackRates);
        setRates(fallbackRates);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, []);

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Current Mortgage Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!rates) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Current Mortgage Rates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
            <Info className="h-4 w-4 mr-2" />
            Rates unavailable
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Current Mortgage Rates
        </CardTitle>
        {error && (
          <p className="text-xs text-muted-foreground">
            <Info className="inline h-3 w-3 mr-1" />
            Using sample data
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 30-Year Fixed Rate */}
        <div className="relative overflow-hidden rounded-lg p-4" style={{
          background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
        }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white/90">30-Year Fixed</span>
              <TrendingUp className="h-4 w-4 text-white/70" />
            </div>
            <div className="text-3xl font-bold text-white">
              {rates.data?.frm_30 ? parseFloat(rates.data.frm_30).toFixed(2) : '—'}%
            </div>
            <div className="text-xs text-white/70 mt-1">
              As of {rates.data?.week ? formatDate(rates.data.week) : 'N/A'}
            </div>
          </div>
        </div>

        {/* 15-Year Fixed Rate */}
        <div className="relative overflow-hidden rounded-lg p-4" style={{
          background: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
        }}>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white/90">15-Year Fixed</span>
              <TrendingDown className="h-4 w-4 text-white/70" />
            </div>
            <div className="text-3xl font-bold text-white">
              {rates.data?.frm_15 ? parseFloat(rates.data.frm_15).toFixed(2) : '—'}%
            </div>
            <div className="text-xs text-white/70 mt-1">
              As of {rates.data?.week ? formatDate(rates.data.week) : 'N/A'}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Rates updated weekly from Freddie Mac
        </div>
      </CardContent>
    </Card>
  );
}
