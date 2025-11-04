import client from '../client';
import { ConfirmContactFormValues } from '../../components/sell/ConfirmContactForm';
import { BikeDetail } from './getById';

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

export type ConfirmDetailsDTO = ConfirmContactFormValues;

/**
 * Fetches prize from /bikes/get/{bikeId} and
 * name/phone from /api/v1/sellers/{userId}, then returns a merged DTO for the Confirm screen.
 */
export async function getConfirmDetailsCombined(args: {
  bikeId: number;
  userId: number;
}): Promise<ConfirmDetailsDTO> {
  const { bikeId, userId } = args;

  const [bikeRes, sellerRes] = await Promise.all([
    client.get<BikeDetail>(`/bikes/get/${bikeId}`),
    client.get<SellerByUser>(`/api/v1/sellers/${userId}`),
  ]);

  const bike = bikeRes.data;
  const seller = sellerRes.data;

  // Backend uses 'prize' field for bikes
  const price =
    bike?.prize != null && Number.isFinite(Number(bike.prize)) ? String(bike.prize) : '';

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
