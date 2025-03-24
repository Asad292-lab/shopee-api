export interface ShopeeProductRequest {
  storeId: string;
  dealId: string;
}

export interface ShopeeApiResponse {
  data: any;
  error: number;
  message: string;
}

export interface ScraperConfig {
  timeout: number;
  retries: number;
  retryDelay: number;
  proxy?: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
  status: number;
} 