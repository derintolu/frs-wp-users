the import React, { useState } from 'react';
import { Home, Calculator, Shield, Star, Users, TrendingDown, Clock, CheckCircle, ArrowRight, Phone, Mail } from 'lucide-react';

const MortgageLandingPages = () => {
  const [activePage, setActivePage] = useState('solo-loan-app');
  const [formStep, setFormStep] = useState(1);
  const [formData, setFormData] = useState({});

  // Navigation between pages
  const pages = [
    { id: 'solo-loan-app', name: 'Solo: Loan Application', type: 'solo' },
    { id: 'solo-rate-quote', name: 'Solo: Rate Quote', type: 'solo' },
    { id: 'cobranded-loan-app', name: 'Co-branded: Loan Application', type: 'cobranded' },
    { id: 'cobranded-rate-quote', name: 'Co-branded: Rate Quote', type: 'cobranded' }
  ];

  // Loan Officer Data (would come from API)
  const loanOfficer = {
    name: "Sarah Martinez",
    nmls: "123456",
    phone: "(555) 234-5678",
    email: "sarah@21stcenturylending.com",
    photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop",
    closedLoans: 450,
    avgClosingDays: 21
  };

  // Realtor Partner Data (for co-branded pages)
  const realtorPartner = {
    name: "Michael Chen",
    company: "Bay Area Realty Group",
    phone: "(555) 876-5432",
    email: "michael@bayarearealty.com",
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
    yearsExp: 12
  };

  // Hero Section Component
  const HeroSection = ({ title, subtitle, isCoBranded }) => (
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">{title}</h1>
            <p className="text-xl mb-8 text-blue-100">{subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition flex items-center gap-2">
                Get Started Now <ArrowRight size={20} />
              </button>
              <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition">
                Call Me Back
              </button>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
            {isCoBranded ? (
              <div className="flex items-center justify-center gap-8">
                <div className="text-center">
                  <img src={loanOfficer.photo} alt={loanOfficer.name} className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white" />
                  <h3 className="font-semibold">{loanOfficer.name}</h3>
                  <p className="text-sm text-blue-100">Loan Officer</p>
                  <p className="text-xs text-blue-200">NMLS #{loanOfficer.nmls}</p>
                </div>
                <div className="text-4xl">+</div>
                <div className="text-center">
                  <img src={realtorPartner.photo} alt={realtorPartner.name} className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white" />
                  <h3 className="font-semibold">{realtorPartner.name}</h3>
                  <p className="text-sm text-blue-100">Realtor Partner</p>
                  <p className="text-xs text-blue-200">{realtorPartner.company}</p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <img src={loanOfficer.photo} alt={loanOfficer.name} className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-white" />
                <h3 className="text-2xl font-semibold mb-2">{loanOfficer.name}</h3>
                <p className="text-blue-100 mb-1">Senior Loan Officer</p>
                <p className="text-sm text-blue-200">NMLS #{loanOfficer.nmls}</p>
                <div className="flex gap-4 justify-center mt-4">
                  <a href={`tel:${loanOfficer.phone}`} className="flex items-center gap-2 text-sm hover:text-blue-200">
                    <Phone size={16} /> {loanOfficer.phone}
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Social Proof Bar Component
  const SocialProofBar = () => (
    <div className="bg-gray-50 py-6 px-6 border-b border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="text-yellow-400 fill-yellow-400" size={24} />
              <span className="text-3xl font-bold text-gray-800">4.9</span>
            </div>
            <p className="text-sm text-gray-600">Average Rating</p>
            <p className="text-xs text-gray-500">200+ Reviews</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{loanOfficer.closedLoans}+</div>
            <p className="text-sm text-gray-600">Loans Funded</p>
            <p className="text-xs text-gray-500">Since 2018</p>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{loanOfficer.avgClosingDays}</div>
            <p className="text-sm text-gray-600">Days to Close</p>
            <p className="text-xs text-gray-500">20% Faster</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Shield className="text-green-600" size={32} />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">NMLS Licensed</p>
              <p className="text-xs text-gray-500">Secure & Trusted</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Value Proposition Section
  const ValuePropSection = () => (
    <div className="py-16 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
          <p className="text-xl text-gray-600">We make home financing simple, fast, and stress-free</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-blue-50 rounded-xl p-8 text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Approval</h3>
            <p className="text-gray-600">Get pre-approved in as little as 24 hours with our streamlined process</p>
          </div>
          <div className="bg-green-50 rounded-xl p-8 text-center">
            <div className="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingDown className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Competitive Rates</h3>
            <p className="text-gray-600">Save thousands with our low rates and flexible loan options</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-8 text-center">
            <div className="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Personal Support</h3>
            <p className="text-gray-600">Work directly with your dedicated loan officer from start to finish</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Simple Mortgage Calculator
  const MortgageCalculator = () => {
    const [price, setPrice] = useState(350000);
    const [down, setDown] = useState(70000);
    const [rate, setRate] = useState(6.5);

    const loanAmount = price - down;
    const monthlyRate = rate / 100 / 12;
    const numPayments = 360; // 30 years
    const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
                          (Math.pow(1 + monthlyRate, numPayments) - 1);

    return (
      <div className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Calculate Your Monthly Payment</h2>
            <p className="text-gray-600">Get an instant estimate of your mortgage payment</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Home Price</label>
                <input
                  type="range"
                  min="100000"
                  max="1000000"
                  step="10000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-2xl font-bold text-blue-600 mt-2">${price.toLocaleString()}</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Down Payment</label>
                <input
                  type="range"
                  min="0"
                  max={price * 0.5}
                  step="5000"
                  value={down}
                  onChange={(e) => setDown(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-2xl font-bold text-blue-600 mt-2">${down.toLocaleString()} ({((down/price)*100).toFixed(0)}%)</div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Interest Rate</label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="0.125"
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="w-full"
                />
                <div className="text-2xl font-bold text-blue-600 mt-2">{rate.toFixed(3)}%</div>
              </div>
              <div className="border-t-2 pt-6 mt-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-2">Estimated Monthly Payment</p>
                  <div className="text-5xl font-bold text-green-600">${Math.round(monthlyPayment).toLocaleString()}</div>
                  <p className="text-sm text-gray-500 mt-2">Principal & Interest only (30-year fixed)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Multi-Step Form Component
  const MultiStepForm = ({ formType }) => {
    const isRateQuote = formType.includes('rate-quote');

    const renderStep = () => {
      switch(formStep) {
        case 1:
          return (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                {isRateQuote ? "Let's Find Your Best Rate" : "Let's Get Started"}
              </h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">What's your primary goal?</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isRateQuote ? (
                    <>
                      <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg p-4 text-left hover:bg-blue-50 transition">
                        <div className="font-semibold text-gray-900">Purchase a Home</div>
                        <div className="text-sm text-gray-600">I'm buying a new property</div>
                      </button>
                      <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg p-4 text-left hover:bg-blue-50 transition">
                        <div className="font-semibold text-gray-900">Refinance</div>
                        <div className="text-sm text-gray-600">Lower my current rate</div>
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg p-4 text-left hover:bg-blue-50 transition">
                        <div className="font-semibold text-gray-900">First-Time Buyer</div>
                        <div className="text-sm text-gray-600">Buying my first home</div>
                      </button>
                      <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg p-4 text-left hover:bg-blue-50 transition">
                        <div className="font-semibold text-gray-900">Move-Up Buyer</div>
                        <div className="text-sm text-gray-600">Upgrading to a new home</div>
                      </button>
                      <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg p-4 text-left hover:bg-blue-50 transition">
                        <div className="font-semibold text-gray-900">Investment Property</div>
                        <div className="text-sm text-gray-600">Buying to rent or flip</div>
                      </button>
                      <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg p-4 text-left hover:bg-blue-50 transition">
                        <div className="font-semibold text-gray-900">Refinance</div>
                        <div className="text-sm text-gray-600">Improve my current loan</div>
                      </button>
                    </>
                  )}
                </div>
              </div>
              <button
                onClick={() => setFormStep(2)}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition"
              >
                Continue
              </button>
            </div>
          );
        case 2:
          return (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Property Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Location (ZIP Code)</label>
                  <input type="text" placeholder="94102" className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Home Price</label>
                  <input type="text" placeholder="$500,000" className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Down Payment Amount</label>
                  <input type="text" placeholder="$100,000" className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Property Type</label>
                  <select className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none">
                    <option>Single Family Home</option>
                    <option>Condo/Townhouse</option>
                    <option>Multi-Family (2-4 units)</option>
                    <option>Investment Property</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setFormStep(3)}
                  className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Continue
                </button>
              </div>
            </div>
          );
        case 3:
          return (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Your Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">First Name *</label>
                  <input type="text" placeholder="John" className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name *</label>
                  <input type="text" placeholder="Doe" className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                  <input type="email" placeholder="john@example.com" className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" placeholder="(555) 123-4567" className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-600 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Best Time to Contact</label>
                <div className="grid grid-cols-3 gap-4">
                  <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg py-3 hover:bg-blue-50 transition">
                    Morning
                  </button>
                  <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg py-3 hover:bg-blue-50 transition">
                    Afternoon
                  </button>
                  <button className="border-2 border-gray-300 hover:border-blue-600 rounded-lg py-3 hover:bg-blue-50 transition">
                    Evening
                  </button>
                </div>
              </div>
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="text-blue-600 mt-1" size={20} />
                  <div className="text-sm text-gray-700">
                    By submitting, you agree to receive calls and texts about your mortgage inquiry.
                    Your information is secure and will never be sold.
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => setFormStep(2)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-4 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  {isRateQuote ? "Get My Personalized Rate Quote" : "Submit My Application"}
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div className="py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-2xl p-8 md:p-12">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-semibold text-gray-600">Step {formStep} of 3</span>
                <span className="text-sm font-semibold text-blue-600">{Math.round((formStep/3)*100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{width: `${(formStep/3)*100}%`}}
                ></div>
              </div>
            </div>

            {renderStep()}
          </div>
        </div>
      </div>
    );
  };

  // Testimonials Section
  const TestimonialsSection = () => (
    <div className="py-16 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h2>
          <p className="text-xl text-gray-600">Real stories from real homeowners</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Jennifer & Tom Rodriguez",
              photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
              text: "Sarah made our first home purchase so easy! She explained everything clearly and got us a fantastic rate. We closed in just 3 weeks!",
              stars: 5
            },
            {
              name: "David Park",
              photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
              text: "After shopping around, Sarah's rates were the best by far. The refinance process was smooth and I'm saving $400 per month now.",
              stars: 5
            },
            {
              name: "Lisa Thompson",
              photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
              text: "I was worried about my credit, but Sarah worked with me to find a solution. Professional, patient, and caring. Highly recommend!",
              stars: 5
            }
          ].map((testimonial, i) => (
            <div key={i} className="bg-white rounded-xl p-8 shadow-lg">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.stars)].map((_, i) => (
                  <Star key={i} className="text-yellow-400 fill-yellow-400" size={20} />
                ))}
              </div>
              <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-3">
                <img src={testimonial.photo} alt={testimonial.name} className="w-12 h-12 rounded-full" />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">Verified Client</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Footer Component
  const Footer = ({ isCoBranded }) => (
    <div className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Contact {loanOfficer.name}</h3>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center gap-2"><Phone size={16} /> {loanOfficer.phone}</p>
              <p className="flex items-center gap-2"><Mail size={16} /> {loanOfficer.email}</p>
              <p className="text-sm">NMLS #{loanOfficer.nmls}</p>
            </div>
          </div>
          {isCoBranded && (
            <div>
              <h3 className="text-xl font-bold mb-4">Contact {realtorPartner.name}</h3>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center gap-2"><Phone size={16} /> {realtorPartner.phone}</p>
                <p className="flex items-center gap-2"><Mail size={16} /> {realtorPartner.email}</p>
                <p className="text-sm">{realtorPartner.company}</p>
              </div>
            </div>
          )}
          <div>
            <h3 className="text-xl font-bold mb-4">21st Century Lending</h3>
            <p className="text-gray-300 text-sm mb-4">Your trusted mortgage partner since 2005</p>
            <div className="flex gap-4">
              <Shield className="text-green-400" size={24} />
              <div className="text-xs text-gray-400">
                <p className="font-semibold text-white">Equal Housing Lender</p>
                <p>NMLS #000000</p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 pt-8 text-sm text-gray-400">
          <p className="mb-4">
            © 2025 21st Century Lending. All rights reserved. Licensed by the Department of Financial Protection
            and Innovation under the California Residential Mortgage Lending Act. NMLS Consumer Access.
          </p>
          <p className="text-xs">
            This is not a commitment to lend. All loans subject to credit approval. Rates, program terms and
            conditions are subject to change without notice. Not all products are available in all states or for
            all amounts. Other restrictions and limitations apply.
          </p>
        </div>
      </div>
    </div>
  );

  // Main Render - Page Content Based on Selection
  const renderPageContent = () => {
    const currentPage = pages.find(p => p.id === activePage);
    const isCoBranded = currentPage?.type === 'cobranded';
    const isRateQuote = activePage.includes('rate-quote');

    const heroContent = {
      'solo-loan-app': {
        title: "Make Your Dream Home a Reality",
        subtitle: "Experience a smooth, simple approval process with competitive rates and dedicated personal support. Apply in minutes and get pre-approved in 24 hours."
      },
      'solo-rate-quote': {
        title: "Discover Your Best Mortgage Rate Today",
        subtitle: "Get instant rate comparisons and unlock your perfect deal. Check rates with confidence—no credit score impact."
      },
      'cobranded-loan-app': {
        title: "Your Winning Team for Home Success",
        subtitle: "Enjoy seamless guidance from your trusted realtor and dedicated loan officer working together. We'll help you get approved and celebrate in your new home sooner."
      },
      'cobranded-rate-quote': {
        title: "Unlock Your Personalized Best Rate",
        subtitle: "Experience the power of teamwork finding you the perfect mortgage rate. Benefit from combined expertise from your realtor and loan officer partnership."
      }
    };

    return (
      <>
        <HeroSection
          title={heroContent[activePage].title}
          subtitle={heroContent[activePage].subtitle}
          isCoBranded={isCoBranded}
        />
        <SocialProofBar />
        <ValuePropSection />
        {isRateQuote && <MortgageCalculator />}
        <MultiStepForm formType={activePage} />
        <TestimonialsSection />
        <Footer isCoBranded={isCoBranded} />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Navigation */}
      <div className="bg-gray-800 text-white py-4 px-6 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Landing Page Mockups - 21st Century Lending</h1>
            <button
              onClick={() => setFormStep(1)}
              className="bg-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              Reset Form
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {pages.map(page => (
              <button
                key={page.id}
                onClick={() => {
                  setActivePage(page.id);
                  setFormStep(1);
                }}
                className={`px-4 py-2 rounded font-medium transition ${
                  activePage === page.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {page.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Content */}
      <div className="pb-12">
        {renderPageContent()}
      </div>
    </div>
  );
};

export default MortgageLandingPages;
