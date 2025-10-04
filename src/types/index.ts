// User types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

// String art design types
export interface StringArtDesign {
  id: string;
  userId: string;
  title: string;
  description?: string;
  pattern: string;
  complexity: 'simple' | 'medium' | 'complex';
  boardSize: 'small' | 'medium' | 'large';
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'kit' | 'supplies' | 'custom';
  images: string[];
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
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
