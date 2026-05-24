export interface Worker {
  id: string;
  name: string;
  fullName?: string;
  category: string;
  trade?: string;
  rating: number;
  totalRatings: number;
  pricePerHour: number;
  priceRange: string;
  minCharge?: number;
  hourlyRate?: number;
  visitCharge?: number;
  image?: string;
  profilePhotoURL?: string;
  portfolioPhotos?: { url: string; caption?: string }[];
  portfolio?: string[];
  initials: string;
  bgColor: string;
  isVerified: boolean;
  location: string;
  city?: string;
  area?: string;
  description: string;
  about?: string;
  experience: string;
  completedJobs: number;
  phone?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}
