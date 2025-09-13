// src/app/types.ts
export interface User {
  id: string;
  clerkId: string;
  email: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Store {
  id: string;
  name: string;
  userId: string;
  description?: string;
  shortIntro?: string;
  rating: number;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: Image[];
  categories?: Category[];
  services?: Service[];
}

export interface Image {
  id: string;
  storeId: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  storeId: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  services?: Service[];
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  categoryId: string;
  parentServiceId?: string;
  price?: number;
  durationMinutes?: number;
  isPopular: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: Category;
  parentService?: Service;
  subServices?: Service[];
}

export interface Saloon {
  id: string;
  name: string;
  userId: string;
  storeId: string;
  description?: string;
  shortIntro?: string;
  rating: number;
  address?: string;
  createdAt?: string;
  updatedAt?: string;
  images?: SaloonImage[];
  saloonServices?: SaloonService[];
}

export interface SaloonImage {
  id: string;
  saloonId: string;
  url: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaloonService {
  saloonId: string;
  serviceId: string;
  price: number;
  durationMinutes: number;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
  saloon?: Saloon;
  service?: Service;
}

export interface Booking {
  id: string;
  userId: string;
  saloonId: string;
  serviceId: string;
  storeId: string;
  bookingTime: string; // ISO string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  saloon?: {
    id: string;
    name: string;
    address?: string;
    rating?: number;
  };
  service?: {
    id: string;
    name: string;
    description?: string;
    durationMinutes?: number;
  };
  user?: {
    name: string;
    email: string;
  };
}

// Default export to fix the warning
export default {};