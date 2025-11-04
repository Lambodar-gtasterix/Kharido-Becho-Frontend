import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AddCarDetailsScreen from '../screens/CarScreens/AddCarDetailsScreen';
import SelectCarPhotoScreen from '../screens/CarScreens/SelectCarPhotoScreen';
import ConfirmDetailsScreen from '../screens/CarScreens/ConfirmDetailsScreen';

export type SellCarStackParamList = {
  AddCarDetails: undefined;
  SelectPhoto: { carId: number };
  ConfirmDetails: { carId: number; images?: string[] };
};

const Stack = createNativeStackNavigator<SellCarStackParamList>();

export default function SellCarStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddCarDetails" component={AddCarDetailsScreen} />
      <Stack.Screen name="SelectPhoto" component={SelectCarPhotoScreen} />
      <Stack.Screen name="ConfirmDetails" component={ConfirmDetailsScreen} />
    </Stack.Navigator>
  );
}
