import client from '../client';

export type BikeStatus = 'ACTIVE' | 'DRAFT' | 'SOLD' | string;

export type BikeItem = {
  bikeId: number;
  title: string;
  description?: string;
  price: number;
  negotiable?: boolean;
  condition?: string;
  brand?: string;
  model?: string;
  variant?: string;
  color?: string;
  manufactureYear?: number;
  status?: BikeStatus;
  createdAt?: string;
  updatedAt?: string | null;
  sellerId?: number;
  images?: string[];
};

export type PageResponse<T> = {
  content: T[];
  pageable?: unknown;
  totalPages?: number;
  totalElements?: number;
  size?: number;
  number?: number; // current page
  last?: boolean;
  first?: boolean;
  numberOfElements?: number;
  empty?: boolean;
};

export async function getAllBikes(params?: { page?: number; size?: number; sort?: string }) {
  const { page = 0, size = 20, sort = 'createdAt,DESC' } = params || {};
  const res = await client.get<PageResponse<BikeItem>>(
    `/api/v1/bikes/getAllBikes`,
    { params: { page, size, sort } }
  );
  return res.data;
}
