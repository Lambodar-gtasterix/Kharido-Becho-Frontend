// src/api/CarsApi/confirmDetails.ts
import client from '../client';
import { ConfirmContactFormValues } from '../../components/sell/ConfirmContactForm';

type CarDetail = {
  carId?: number;
  price?: number;
  sellerId?: number;
};

type SellerByUser = {
  sellerId: number;
  user: {
    id: number;
    email: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    mobileNumber?: number | string;
    emailVerified?: boolean;
  };
};

const toStringOrEmpty = (value: unknown): string => {
  if (value == null) {
    return '';
  }
  const text = String(value).trim();
  return text.length > 0 ? text : '';
};

export type CarConfirmDetailsDTO = ConfirmContactFormValues;

export async function getConfirmDetailsCombined(args: {
  carId: number;
  userId: number;
}): Promise<CarConfirmDetailsDTO> {
  const { carId, userId } = args;

  const [carRes, sellerRes] = await Promise.all([
    client.get<CarDetail>(`/api/v1/cars/${carId}`),
    client.get<SellerByUser>(`/api/v1/sellers/${userId}`),
  ]);

  const car = carRes.data;
  const seller = sellerRes.data;

  const price =
    car?.price != null && Number.isFinite(Number(car.price)) ? String(car.price) : '';

  const first = toStringOrEmpty(seller?.user?.firstName);
  const last = toStringOrEmpty(seller?.user?.lastName);
  const name = `${first} ${last}`.trim();

  const phoneNumber = toStringOrEmpty(seller?.user?.mobileNumber);

  return {
    price,
    name,
    phoneNumber,
  };
}
