import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyCarAdsStackParamList } from '../../navigation/MyCarAdsStack';
import { deleteCar, getAllCars } from '../../api/CarsApi';

import CarCard from '../../components/cars/CarCard';
import CarCardMenu from '../../components/cars/CarCardMenu';
import MyAdsListLayout from '../MyAds/common/MyAdsListLayout';
import { useMyAdsStatusFilter } from '../../hooks/useMyAdsStatusFilter';
import { formatINR } from '../../utils/formatCurrency';

type NavigationProp = NativeStackNavigationProp<MyCarAdsStackParamList>;

type ApiCar = {
  carId: number;
  title: string;
  description?: string;
  price: number;
  negotiable?: boolean;
  condition?: string;
  brand?: string;
  model?: string;
  variant?: string;
  color?: string;
  yearOfPurchase?: number;
  fuelType?: string;
  transmission?: string;
  carInsurance?: boolean;
  carInsuranceDate?: string;
  carInsuranceType?: string;
  kmDriven?: number;
  numberOfOwners?: number;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status?: 'ACTIVE' | 'DRAFT' | 'SOLD' | string;
  sellerId?: number;
  createdAt?: string;
  updatedAt?: string | null;
  images?: string[];
  airbag?: boolean;
  buttonStart?: boolean;
  sunroof?: boolean;
  childSafetyLocks?: boolean;
  acFeature?: boolean;
  musicFeature?: boolean;
  powerWindowFeature?: boolean;
  rearParkingCameraFeature?: boolean;
  abs?: boolean;
};

const MyCarAdsListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [cars, setCars] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<ApiCar | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { selectedTab, setSelectedTab, filtered } = useMyAdsStatusFilter({
    items: cars,
    getStatus: (item) => item.status,
  });

  const fetchData = async (reset = false) => {
    if (loading && !reset) return;
    try {
      if (reset) {
        setPage(0);
        setHasMore(true);
      }
      setLoading(true);
      const res = await getAllCars({
        page: reset ? 0 : page,
        size: 20,
        sort: 'createdAt,DESC',
      });
      setHasMore(res?.last === false);
      setPage((prev) => (reset ? 1 : prev + 1));
      setCars((prev) => (reset ? res.content : [...prev, ...res.content]));
    } catch (e) {
      console.warn('getAllCars error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData(true);
    setRefreshing(false);
  };

  const openMenuFor = (car: ApiCar) => {
    setSelectedCar(car);
    setMenuOpen(true);
  };

  const closeMenu = () => {
    setMenuOpen(false);
    setSelectedCar(null);
  };

  const handleEdit = () => {
    if (!selectedCar) return;
    navigation.navigate('UpdateCar', { carId: selectedCar.carId });
    closeMenu();
  };

  const handleDelete = () => {
    if (!selectedCar || deleting) return;

    Alert.alert(
      'Delete car',
      'Are you sure you want to delete this car?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeleting(true);
              await deleteCar(selectedCar.carId);
              await fetchData(true);
              Alert.alert('Deleted', 'Car soft-deleted');
            } catch (e: any) {
              Alert.alert('Failed', e?.response?.data?.message ?? 'Please try again');
            } finally {
              setDeleting(false);
              closeMenu();
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderAdCard = ({ item }: { item: ApiCar }) => {
    const primaryImage = item.images?.[0]
      ? { uri: item.images[0] }
      : require('../../assets/icons/mobile.png');

    const titleText = item.title || 'Untitled Car';
    const subtitleText = [item.brand, item.model].filter(Boolean).join(' | ');

    return (
      <CarCard
        image={primaryImage}
        priceText={formatINR(item.price)}
        title={titleText}
        subtitle={subtitleText}
        location="Pune"
        badgeText={item.status === 'ACTIVE' ? 'Live' : (item.status ?? 'Info')}
        onPress={() => navigation.navigate('ProductDetails', { carId: item.carId })}
        onMenuPress={() => openMenuFor(item)}
      />
    );
  };

  const listFooter =
    hasMore && loading ? <ActivityIndicator style={{ paddingVertical: 16 }} /> : null;

  return (
    <MyAdsListLayout
      title="My Car Ads"
      tabLabelSuffix="Cars"
      selectedTab={selectedTab}
      onTabChange={setSelectedTab}
      data={filtered}
      loading={loading}
      refreshing={refreshing}
      onRefresh={onRefresh}
      renderItem={renderAdCard}
      keyExtractor={(item) => String(item.carId)}
      emptyMessage="No cars found."
      onBack={() => navigation.goBack()}
      menuVisible={menuOpen}
      onCloseMenu={closeMenu}
      menuContent={
        <CarCardMenu
          title={selectedCar?.title}
          statusLabel={selectedCar?.status}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isDeleting={deleting}
          disabled={deleting}
        />
      }
      isInitialLoading={loading && cars.length === 0}
      listProps={{
        onEndReachedThreshold: 0.3,
        onEndReached: () => {
          if (hasMore && !loading) {
            fetchData(false);
          }
        },
        ListFooterComponent: listFooter,
      }}
    />
  );
};

export default MyCarAdsListScreen;
