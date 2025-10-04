// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

// Address types
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// String Art Generation types
export interface StringArtPattern {
  id: string;
  name: string;
  description: string;
  pattern: string; // JSON string of the pattern data
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number; // in minutes
  materials: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserGeneration {
  id: string;
  userId: string;
  patternId: string;
  customizations: Record<string, any>;
  status: 'draft' | 'completed' | 'shared';
  createdAt: Date;
  updatedAt: Date;
}

// Navigation types
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
