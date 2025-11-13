import apiClient from './client';

export interface SavingsTimeline {
  monthsToSave: number;
  daysToSave: number;
  estimatedCompletionDate: string;
  monthlySavingsAmount: number;
  goldToSavePerMonth: number;
}

export interface Product {
  _id: string;
  userId: string;
  name: string;
  price: number;
  goldEquivalent: number;
  goldPriceAtCreation: number;
  isWishlisted: boolean;
  savedGoldAmount: number;
  timeline?: SavingsTimeline | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  price: number;
  isWishlisted?: boolean;
  savedGoldAmount?: number;
}

export interface UpdateProductData {
  name?: string;
  price?: number;
  isWishlisted?: boolean;
  savedGoldAmount?: number;
}

export const productsApi = {
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get<{ products: Product[] }>('/products');
    return response.data.products;
  },

  getWishlisted: async (): Promise<Product[]> => {
    const response = await apiClient.get<{ products: Product[] }>('/products/wishlisted');
    return response.data.products;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get<{ product: Product }>(`/products/${id}`);
    return response.data.product;
  },

  create: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post<{ product: Product }>('/products', data);
    return response.data.product;
  },

  update: async (id: string, data: UpdateProductData): Promise<Product> => {
    const response = await apiClient.put<{ product: Product }>(`/products/${id}`, data);
    return response.data.product;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  toggleWishlist: async (id: string): Promise<Product> => {
    const response = await apiClient.patch<{ product: Product }>(`/products/${id}/wishlist`);
    return response.data.product;
  },
};
