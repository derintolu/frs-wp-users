import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calculator, User, Mail, Phone } from 'lucide-react';
import { PageHeader } from './PageHeader';
import {
  ConventionalCalculator,
  AffordabilityCalculator,
  BuydownCalculator,
  DSCRCalculator,
  RefinanceCalculator,
  NetProceedsCalculator,
  RentVsBuyCalculator
} from '../calculators';

// Loan Officer Profile Component
function LoanOfficerProfile() {
  const [nmls, setNmls] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const userName = (window as any).frsPortalConfig?.userName || '';
  const userEmail = (window as any).frsPortalConfig?.userEmail || '';
  const userAvatar = (window as any).frsPortalConfig?.userAvatar || '';
  const userId = (window as any).frsPortalConfig?.userId || '';

  useEffect(() => {
    // Fetch NMLS, phone, and job title from frs-users profile
    if (userId) {
      fetch(`/wp-json/frs-users/v1/profiles/user/${userId}`, {
        credentials: 'same-origin',
        headers: {
          'X-WP-Nonce': (window as any).frsPortalConfig?.restNonce || ''
        }
      })
        .then(res => res.json())
        .then(response => {
          if (response.success && response.data) {
            const data = response.data;
            // Set NMLS
            if (data.nmls || data.nmls_number) {
              setNmls(data.nmls || data.nmls_number);
            }
            // Set phone (prefer mobile, fallback to phone_number)
            if (data.mobile_number) {
              setPhoneNumber(data.mobile_number);
            } else if (data.phone_number) {
              setPhoneNumber(data.phone_number);
            }
            // Set job title
            if (data.job_title) {
              setJobTitle(data.job_title);
            }
          }
        })
        .catch(err => console.error('Failed to fetch profile:', err));
    }
  }, [userId]);

  return (
    <Card className="mb-6">
      <CardContent className="flex items-center gap-4 p-6">
        <div
          className="relative p-1 rounded-full"
          style={{
            background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)'
          }}
        >
          {userAvatar ? (
            <img
              src={userAvatar}
              alt={userName}
              className="w-24 h-24 rounded-full object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3
            className="text-2xl font-bold"
            style={{
              backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {userName}
          </h3>
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mt-1">
            {jobTitle && (
              <span className="text-base font-semibold text-muted-foreground">{jobTitle}</span>
            )}
            {nmls && (
              <span
                className="text-base font-semibold"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                NMLS# {nmls}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {phoneNumber && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>{phoneNumber}</span>
              </div>
            )}
            {userEmail && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="w-3 h-3" />
                <span>{userEmail}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function MortgageCalculator() {
  const [activeTab, setActiveTab] = useState('conventional');

  return (
    <div className="w-full max-w-7xl mx-auto p-6">
      {/* Page Header */}
      <PageHeader
        icon={Calculator}
        title="Mortgage Calculator"
        iconBgColor="linear-gradient(135deg, #3b82f6 0%, #2DD4DA 100%)"
      />
      <p className="text-muted-foreground mt-2 mb-6">
        Calculate payments for different mortgage types
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Mobile: Dropdown selector */}
        <div className="md:hidden mb-6">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select calculator type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conventional">Payment Calculator</SelectItem>
              <SelectItem value="affordability">Affordability Calculator</SelectItem>
              <SelectItem value="buydown">Buydown Calculator</SelectItem>
              <SelectItem value="dscr">DSCR Calculator</SelectItem>
              <SelectItem value="refinance">Refinance Calculator</SelectItem>
              <SelectItem value="netproceeds">Net Proceeds Calculator</SelectItem>
              <SelectItem value="rentvsbuy">Rent vs Buy Calculator</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop: Tabs */}
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 mb-6 gap-1">
          <TabsTrigger value="conventional">Payment</TabsTrigger>
          <TabsTrigger value="affordability">Affordability</TabsTrigger>
          <TabsTrigger value="buydown">Buydown</TabsTrigger>
          <TabsTrigger value="dscr">DSCR</TabsTrigger>
          <TabsTrigger value="refinance">Refinance</TabsTrigger>
          <TabsTrigger value="netproceeds">Net Proceeds</TabsTrigger>
          <TabsTrigger value="rentvsbuy">Rent vs Buy</TabsTrigger>
        </TabsList>

        <TabsContent value="conventional">
          <ConventionalCalculator />
        </TabsContent>

        <TabsContent value="affordability">
          <AffordabilityCalculator />
        </TabsContent>

        <TabsContent value="buydown">
          <BuydownCalculator />
        </TabsContent>

        <TabsContent value="dscr">
          <DSCRCalculator />
        </TabsContent>

        <TabsContent value="refinance">
          <RefinanceCalculator />
        </TabsContent>

        <TabsContent value="netproceeds">
          <NetProceedsCalculator />
        </TabsContent>

        <TabsContent value="rentvsbuy">
          <RentVsBuyCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
