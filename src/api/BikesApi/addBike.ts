import api from '../client';

export type AddBikeBody = {
  prize: number;
  brand: string;
  model: string;
  variant: string;
  manufactureYear: number;
  engineCC?: number;
  kilometersDriven?: number;
  fuelType: string;
  color: string;
  registrationNumber: string;
  description: string;
  sellerId: number;
  status: string;
};

type BackendBikeResponse = {
  status: string;
  message: string;
  data: string; // "BikeId:117"
  timestamp: string;
};

export type AddBikeResponse = {
  code: string;
  message: string;
  bikeId?: number;
};

export async function addBike(body: AddBikeBody): Promise<AddBikeResponse> {
  const res = await api.post<BackendBikeResponse>('/bikes/post', body);
  const backendData = res.data;

  // Parse bikeId from "BikeId:117" format
  let bikeId: number | undefined;
  if (backendData.data && typeof backendData.data === 'string') {
    const match = backendData.data.match(/BikeId:(\d+)/i);
    if (match && match[1]) {
      bikeId = parseInt(match[1], 10);
    }
  }

  // Return normalized response format
  return {
    code: backendData.status || '200',
    message: backendData.message || 'Bike created successfully',
    bikeId,
  };
}
