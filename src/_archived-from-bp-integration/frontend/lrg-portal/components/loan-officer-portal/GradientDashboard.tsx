import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Download, Users, DollarSign, Target, Zap, Star, Rocket, Heart, Trophy } from 'lucide-react';

// Sample data for charts
const performanceData = [
  { month: 'Jan', leads: 120, conversions: 85, revenue: 15000 },
  { month: 'Feb', leads: 150, conversions: 110, revenue: 22000 },
  { month: 'Mar', leads: 180, conversions: 135, revenue: 28000 },
  { month: 'Apr', leads: 220, conversions: 165, revenue: 35000 },
  { month: 'May', leads: 280, conversions: 210, revenue: 42000 },
  { month: 'Jun', leads: 320, conversions: 240, revenue: 48000 },
];

const marketingChannels = [
  { name: 'Social Media', value: 35, color: 'var(--brand-primary-blue)' },
  { name: 'Email', value: 25, color: 'var(--brand-rich-teal)' },
  { name: 'Referrals', value: 20, color: 'var(--brand-navy)' },
  { name: 'Direct', value: 20, color: 'var(--brand-light-blue)' },
];

const campaignData = [
  { name: 'Q1', performance: 78, target: 85 },
  { name: 'Q2', performance: 92, target: 90 },
  { name: 'Q3', performance: 88, target: 95 },
  { name: 'Q4', performance: 96, target: 100 },
];

// Custom gradient definitions for charts
const gradientId = (color: string) => `gradient-${color.replace(/[^a-zA-Z0-9]/g, '')}`;

export function GradientDashboard() {
  return (
    <div className="space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl" style={{ color: 'var(--brand-navy)' }}>Bright Gradient Dashboard</h1>
        <p className="text-muted-foreground">Vibrant buttons and gradient-enhanced charts</p>
      </div>

      {/* Brand Gradient Buttons */}
      <Card>
        <CardHeader>
          <CardTitle style={{ color: 'var(--brand-navy)' }}>Brand Gradient Action Buttons</CardTitle>
          <CardDescription>Professional buttons using your brand gradient system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Primary Actions */}
            <div className="space-y-3">
              <h4 className="font-medium" style={{ color: 'var(--brand-navy)' }}>Primary Actions</h4>
              <div className="space-y-3">
                <Button
                  className="w-full text-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: 'var(--gradient-brand-blue)' }}
                >
                  <Rocket className="size-4 mr-2" />
                  Launch Campaign
                </Button>

                <Button
                  className="w-full text-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: 'var(--gradient-brand-teal)' }}
                >
                  <TrendingUp className="size-4 mr-2" />
                  Boost Performance
                </Button>

                <Button
                  className="w-full text-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: 'var(--gradient-brand-navy)' }}
                >
                  <Zap className="size-4 mr-2" />
                  Quick Actions
                </Button>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="space-y-3">
              <h4 className="font-medium" style={{ color: 'var(--brand-navy)' }}>Brand Actions</h4>
              <div className="space-y-3">
                <Button
                  className="w-full text-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: 'var(--gradient-hero)' }}
                >
                  <Heart className="size-4 mr-2" />
                  Engage Audience
                </Button>

                <Button
                  className="w-full text-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: 'var(--gradient-primary)' }}
                >
                  <Download className="size-4 mr-2" />
                  Download Report
                </Button>

                <Button
                  className="w-full text-white border-0 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  style={{ background: 'var(--gradient-brand-accent)' }}
                >
                  <Star className="size-4 mr-2" />
                  Premium Feature
                </Button>
              </div>
            </div>

            {/* Interactive Elements */}
            <div className="space-y-3">
              <h4 className="font-medium" style={{ color: 'var(--brand-navy)' }}>Interactive Elements</h4>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Badge
                    className="text-white transition-all duration-300 hover:scale-110"
                    style={{ background: 'var(--gradient-brand-blue)' }}
                  >
                    New
                  </Badge>
                  <Badge
                    className="text-white transition-all duration-300 hover:scale-110"
                    style={{ background: 'var(--gradient-brand-teal)' }}
                  >
                    Popular
                  </Badge>
                </div>

                <div className="flex space-x-2">
                  <Badge
                    className="text-white transition-all duration-300 hover:scale-110"
                    style={{ background: 'var(--gradient-brand-navy)' }}
                  >
                    Premium
                  </Badge>
                  <Badge
                    className="text-white transition-all duration-300 hover:scale-110"
                    style={{ background: 'var(--gradient-hero)' }}
                  >
                    Featured
                  </Badge>
                </div>

                <Button
                  size="sm"
                  className="w-full text-white border-0 transition-all duration-500 hover:scale-105 hover:shadow-xl animate-pulse"
                  style={{ background: 'var(--gradient-brand-accent)' }}
                >
                  <Trophy className="size-4 mr-2" />
                  Special Offer
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Charts with Gradients */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: 'var(--brand-navy)' }}>Lead Performance Trends</CardTitle>
            <CardDescription>Monthly lead generation with gradient line visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <defs>
                  <linearGradient id="gradientLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary-blue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--brand-rich-teal)" stopOpacity={0.2}/>
                  </linearGradient>
                  <linearGradient id="gradientConversions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-rich-teal)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--brand-light-blue)" stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--card-foreground)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="leads"
                  stroke="var(--brand-primary-blue)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--brand-primary-blue)', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: 'var(--brand-primary-blue)', strokeWidth: 2, fill: 'white' }}
                />
                <Line
                  type="monotone"
                  dataKey="conversions"
                  stroke="var(--brand-rich-teal)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--brand-rich-teal)', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8, stroke: 'var(--brand-rich-teal)', strokeWidth: 2, fill: 'white' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: 'var(--brand-navy)' }}>Revenue Growth Area</CardTitle>
            <CardDescription>Revenue trends with gradient area fill</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary-blue)" stopOpacity={0.6}/>
                    <stop offset="50%" stopColor="var(--brand-rich-teal)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--brand-light-blue)" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--card-foreground)'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--brand-primary-blue)"
                  strokeWidth={3}
                  fill="url(#gradientRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Additional Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle style={{ color: 'var(--brand-navy)' }}>Campaign Performance</CardTitle>
            <CardDescription>Quarterly performance vs targets with gradient bars</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={campaignData}>
                <defs>
                  <linearGradient id="gradientPerformance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-primary-blue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--brand-rich-teal)" stopOpacity={0.6}/>
                  </linearGradient>
                  <linearGradient id="gradientTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--brand-light-blue)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--brand-off-white)" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--card-foreground)'
                  }}
                />
                <Bar dataKey="performance" fill="url(#gradientPerformance)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="target" fill="url(#gradientTarget)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle style={{ color: 'var(--brand-navy)' }}>Marketing Channel Distribution</CardTitle>
            <CardDescription>Lead sources with brand color gradients</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <defs>
                  <linearGradient id="gradientSocial" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--brand-primary-blue)" />
                    <stop offset="100%" stopColor="var(--brand-rich-teal)" />
                  </linearGradient>
                  <linearGradient id="gradientEmail" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--brand-rich-teal)" />
                    <stop offset="100%" stopColor="var(--brand-light-blue)" />
                  </linearGradient>
                  <linearGradient id="gradientReferrals" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--brand-navy)" />
                    <stop offset="100%" stopColor="var(--brand-primary-blue)" />
                  </linearGradient>
                  <linearGradient id="gradientDirect" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--brand-light-blue)" />
                    <stop offset="100%" stopColor="var(--brand-off-white)" />
                  </linearGradient>
                </defs>
                <Pie
                  data={marketingChannels}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="white"
                  strokeWidth={2}
                >
                  {marketingChannels.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#gradient${entry.name.replace(/\s+/g, '')})`}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                    color: 'var(--card-foreground)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards with Brand Gradient Backgrounds */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-0 text-white" style={{ background: 'var(--gradient-brand-blue)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Total Leads</CardTitle>
            <Users className="size-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">1,270</div>
            <p className="text-xs text-white/70">+12% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 text-white" style={{ background: 'var(--gradient-brand-teal)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Conversion Rate</CardTitle>
            <Target className="size-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">75%</div>
            <p className="text-xs text-white/70">+5% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 text-white" style={{ background: 'var(--gradient-brand-navy)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Revenue</CardTitle>
            <DollarSign className="size-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">$48,000</div>
            <p className="text-xs text-white/70">+18% from last month</p>
          </CardContent>
        </Card>

        <Card className="border-0 text-white" style={{ background: 'var(--gradient-hero)' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/90">Active Campaigns</CardTitle>
            <Rocket className="size-4 text-white/70" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">12</div>
            <p className="text-xs text-white/70">3 launching this week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
