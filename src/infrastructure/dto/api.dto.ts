export interface AuthResultDto {
  accessToken: string;
  expiresAt: string;
  username: string;
  role: 'admin' | 'seller';
}

export interface CategoryDto {
  id: string;
  name: string;
}

export interface ProductViewDto {
  id: string;
  name: string;
  price: number;
  currency: string;
  stock: number;
  categoryId: string;
  categoryName: string;
  imageUrl: string | null;
}

export interface PagedResultDto<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export interface SaleItemViewDto {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleViewDto {
  id: string;
  soldAt: string;
  soldBy: string;
  total: number;
  currency: string;
  items: SaleItemViewDto[];
}

export interface SalesReportRowDto {
  productId: string;
  productName: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
}

export interface SalesReportDto {
  from: string;
  to: string;
  salesCount: number;
  grandTotal: number;
  currency: string;
  rows: SalesReportRowDto[];
}

export interface ProblemDetailsDto {
  title?: string;
  status?: number;
  detail?: string;
  errors?: Record<string, string[]>;
}
