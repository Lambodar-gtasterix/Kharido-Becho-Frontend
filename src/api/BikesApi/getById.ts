import client from '../client';

export type BikeDetail = {
  bikeId?: number;
  prize: number;
  brand?: string;
  model?: string;
  variant?: string;
  manufactureYear?: number;
  engineCC?: number;
  kilometersDriven?: number;
  fuelType?: string;
  color?: string;
  registrationNumber?: string;
  description?: string;
  sellerId?: number;
  status?: string;
  images?: string[];
};

export async function getBikeById(bikeId: number): Promise<BikeDetail> {
  const { data } = await client.get<BikeDetail>(`/bikes/get/${bikeId}`);
  return data;
}
