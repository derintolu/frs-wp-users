import React from 'react';
import { Button } from "./ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Briefcase, MessageCircle, UserPlus, Phone, Linkedin, Facebook } from "lucide-react";

interface BiolinkCardProps {
  personData: {
    id: number;
    name: string;
    headshot?: string;
    job_title?: string;
    primary_business_email?: string;
    phone_number?: string;
    biography?: string;
    facebook_url?: string;
    linkedin_url?: string;
  };
}

export default function BiolinkCard({ personData }: BiolinkCardProps) {
  const {
    name = 'Blake Corkill',
    headshot,
    job_title = 'Director of Lending',
    primary_business_email = '',
    phone_number = '+1234567890',
    biography = 'Welcome! It was a pleasure meeting you at the Mike Ferry Event! I\'m excited to help you take the next step in your real estate career',
    facebook_url,
    linkedin_url
  } = personData || {};

  // Create action links based on available data
  const actionLinks = [
    {
      name: "JOIN OUR DAILY ROLEPLAY TRAINING",
      url: "#",
      icon: Briefcase,
      highlight: true
    },
    {
      name: "Message Me",
      url: primary_business_email ? `mailto:${primary_business_email}` : "#",
      icon: MessageCircle
    },
    {
      name: "Add to Contacts",
      url: "#",
      icon: UserPlus
    },
    {
      name: "Call Me",
      url: phone_number ? `tel:${phone_number}` : "tel:+1234567890",
      icon: Phone
    }
  ];

  // Add social links if available
  if (facebook_url) {
    actionLinks.push({
      name: "Connect on Facebook",
      url: facebook_url,
      icon: Facebook
    });
  }

  if (linkedin_url) {
    actionLinks.push({
      name: "Connect on LinkedIn", 
      url: linkedin_url,
      icon: Linkedin
    });
  }

  return (
    <div className="w-full max-w-[650px] text-center">
      {/* Main Card Container */}
      <div className="p-8 space-y-8">
        
        {/* Century 21 Logo */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            {/* Gold Circle with 21 */}
            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 rounded-full flex items-center justify-center">
              <span className="text-black text-xl font-black tracking-tight">21</span>
            </div>
            
            {/* Brand Text */}
            <div className="text-left">
              <div className="text-white text-xl tracking-[0.15em]">
                CENTURY
              </div>
              <div className="text-yellow-400 text-sm tracking-[0.2em] -mt-1">
                LENDING
              </div>
            </div>
          </div>
        </div>

        {/* Profile Photo */}
        <div className="flex justify-center">
          <Avatar className="w-32 h-32">
            <AvatarImage 
              src={headshot || "https://images.unsplash.com/photo-1568585105565-e372998a195d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBidXNpbmVzcyUyMG1hbiUyMHN1aXQlMjBoZWFkc2hvdCUyMGNvcnBvcmF0ZXxlbnwxfHx8fDE3NTY4NDIwMTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"} 
              alt={`${name}'s Profile Photo`}
              className="object-cover"
            />
            <AvatarFallback className="text-2xl bg-slate-700 text-white">
              {name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and Title */}
        <div className="space-y-2">
          <h1 className="text-white text-3xl">{name}</h1>
          <p className="text-white/90 text-lg">{job_title}</p>
        </div>

        {/* Welcome Message */}
        <div className="px-4">
          <div 
            className="text-white/95" 
            dangerouslySetInnerHTML={{ __html: biography }}
          />
        </div>

        {/* Action Buttons */}
        <div className="space-y-6 px-4">
          {actionLinks.map((link, index) => {
            const IconComponent = link.icon;
            return (
              <Button
                key={link.name}
                asChild
                className={`w-full ${
                  link.highlight
                    ? "bg-white text-black hover:bg-gray-100"
                    : "bg-white text-black hover:bg-gray-100"
                } rounded-lg py-6 text-lg`}
                size="lg"
              >
                <a href={link.url} className="flex items-center justify-center space-x-3">
                  <IconComponent className="w-5 h-5" />
                  <span>{link.name}</span>
                </a>
              </Button>
            );
          })}
        </div>

      </div>
    </div>
  );
}