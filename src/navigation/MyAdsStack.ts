// src/navigation/MyAdsStack.ts
import { MyMobileAdsStackParamList } from './MyMobileAdsStack';
import { MyLaptopAdsStackParamList } from './MyLaptopAdsStack';
import { MyCarAdsStackParamList } from './MyCarAdsStack';

export type MyAdsStackParamList = MyMobileAdsStackParamList &
  MyLaptopAdsStackParamList &
  MyCarAdsStackParamList;
