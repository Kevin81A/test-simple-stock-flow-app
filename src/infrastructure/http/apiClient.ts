import {
  AuthResultDto,
  CategoryDto,
  PagedResultDto,
  ProblemDetailsDto,
  ProductViewDto,
  SalesReportDto,
  SaleViewDto,
} from '../dto/api.dto';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    if (this.token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return {} as T;
    }

    if (!response.ok) {
      let errorMessage = 'An unexpected error occurred.';
      let errors: Record<string, string[]> | undefined;

      if (response.status === 401) {
        errorMessage = 'Session expired or credentials are invalid.';
        this.setToken(null);
      } else if (response.status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (response.status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else {
        try {
          const problem: ProblemDetailsDto = await response.json();
          if (problem.detail) {
            errorMessage = problem.detail;
          }
          if (problem.errors) {
            errors = problem.errors;
          }
        } catch {
          // ignore non-json error body
        }
      }

      throw new ApiError(response.status, errorMessage, errors);
    }

    return (await response.json()) as T;
  }

  // Auth
  public async login(username: string, password: string): Promise<AuthResultDto> {
    const res = await this.request<AuthResultDto>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(res.accessToken);
    return res;
  }

  public async registerSeller(
    username: string,
    password: string,
    role: string = 'seller'
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, role }),
    });
  }

  // Categories
  public async getCategories(): Promise<CategoryDto[]> {
    return this.request<CategoryDto[]>('/api/categories');
  }

  // Products
  public async getProducts(
    search?: string,
    categoryId?: string,
    page: number = 1,
    size: number = 20
  ): Promise<PagedResultDto<ProductViewDto>> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (categoryId) params.append('categoryId', categoryId);
    params.append('page', page.toString());
    params.append('size', size.toString());

    return this.request<PagedResultDto<ProductViewDto>>(`/api/products?${params.toString()}`);
  }

  public async getProduct(id: string): Promise<ProductViewDto> {
    return this.request<ProductViewDto>(`/api/products/${id}`);
  }

  public async createProduct(data: {
    name: string;
    price: number;
    stock: number;
    categoryId: string;
  }): Promise<{ id: string }> {
    return this.request<{ id: string }>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async updateProduct(
    id: string,
    data: {
      name: string;
      price: number;
      stock: number;
      categoryId: string;
    }
  ): Promise<void> {
    await this.request<void>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  public async deleteProduct(id: string): Promise<void> {
    await this.request<void>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  public async uploadProductImage(id: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{ url: string }>(`/api/products/${id}/image`, {
      method: 'POST',
      body: formData,
    });
  }

  // Sales
  public async createSale(
    lines: Array<{ productId: string; quantity: number }>
  ): Promise<{ id: string }> {
    return this.request<{ id: string }>('/api/sales', {
      method: 'POST',
      body: JSON.stringify({ lines }),
    });
  }

  public async getSales(
    from: string,
    to: string,
    page: number = 1,
    size: number = 20
  ): Promise<PagedResultDto<SaleViewDto>> {
    const params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);
    params.append('page', page.toString());
    params.append('size', size.toString());

    return this.request<PagedResultDto<SaleViewDto>>(`/api/sales?${params.toString()}`);
  }

  public async getSale(id: string): Promise<SaleViewDto> {
    return this.request<SaleViewDto>(`/api/sales/${id}`);
  }

  // Reports
  public async getSalesReport(from: string, to: string): Promise<SalesReportDto> {
    const params = new URLSearchParams();
    params.append('from', from);
    params.append('to', to);

    return this.request<SalesReportDto>(`/api/reports/sales?${params.toString()}`);
  }
}

export const apiClient = new ApiClient();