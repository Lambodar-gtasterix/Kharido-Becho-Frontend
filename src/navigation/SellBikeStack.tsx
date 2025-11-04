import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import AddBikeDetailsScreen from '../screens/BikeScreens/AddBikeDetailsScreen';
import SelectBikePhotoScreen from '../screens/BikeScreens/SelectBikePhotoScreen';
import ConfirmDetailsScreen from '../screens/BikeScreens/ConfirmDetailsScreen';

export type SellBikeStackParamList = {
  AddBikeDetails: undefined;
  SelectPhoto: { bikeId: number };
  ConfirmDetails: { bikeId: number; images?: string[] };
};

const Stack = createNativeStackNavigator<SellBikeStackParamList>();

const SellBikeStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AddBikeDetails"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="AddBikeDetails" component={AddBikeDetailsScreen} />
      <Stack.Screen name="SelectPhoto" component={SelectBikePhotoScreen} />
      <Stack.Screen name="ConfirmDetails" component={ConfirmDetailsScreen} />
    </Stack.Navigator>
  );
};

export default SellBikeStack;
