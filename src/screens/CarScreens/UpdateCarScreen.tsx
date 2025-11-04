import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { MyCarAdsStackParamList } from '../../navigation/MyCarAdsStack';
import { getCarById, updateCar, UpdateCarDTO, CarDetail } from '../../api/CarsApi';
import ListingUpdateLayout from '../../components/details/ListingUpdateLayout';
import ListingUpdateLoader from '../../components/details/ListingUpdateLoader';
import ListingFormInput from '../../components/form/ListingFormInput';
import ListingFormDropdown from '../../components/form/ListingFormDropdown';
import ListingFormTextArea from '../../components/form/ListingFormTextArea';
import ListingYearPickerField from '../../components/form/ListingYearPickerField';
import {
  listingUpdateStyles,
  LISTING_UPDATE_COLORS as COLORS,
  LISTING_UPDATE_SPACING as SPACING,
} from '../../theme/listingUpdate';
import useListingDetails from '../../hooks/useListingDetails';
import getFriendlyApiError from '../../utils/getFriendlyApiError';
import { useAuth } from '../../context/AuthContext';

type UpdateRouteProp = RouteProp<MyCarAdsStackParamList, 'UpdateCar'>;
type UpdateNavProp = NativeStackNavigationProp<MyCarAdsStackParamList, 'UpdateCar'>;

type FormErrors = {
  title?: string;
  description?: string;
  price?: string;
  brand?: string;
  model?: string;
  variant?: string;
  color?: string;
  yearOfPurchase?: string;
  condition?: string;
  negotiable?: string;
  fuelType?: string;
  transmission?: string;
  kmDriven?: string;
  numberOfOwners?: string;
  carInsurance?: string;
  carInsuranceDate?: string;
  carInsuranceType?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

const conditionOptions = [
  { label: 'NEW', value: 'NEW' },
  { label: 'USED', value: 'USED' },
  { label: 'REFURBISHED', value: 'REFURBISHED' },
];

const negotiableOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

const fuelTypeOptions = [
  { label: 'PETROL', value: 'PETROL' },
  { label: 'DIESEL', value: 'DIESEL' },
  { label: 'CNG', value: 'CNG' },
  { label: 'ELECTRIC', value: 'ELECTRIC' },
  { label: 'HYBRID', value: 'HYBRID' },
];

const transmissionOptions = [
  { label: 'MANUAL', value: 'MANUAL' },
  { label: 'AUTOMATIC', value: 'AUTOMATIC' },
];

const booleanOptions = [
  { label: 'Yes', value: true },
  { label: 'No', value: false },
];

const styles = listingUpdateStyles;

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1990;

const UpdateCarScreen: React.FC = () => {
  const navigation = useNavigation<UpdateNavProp>();
  const { params } = useRoute<UpdateRouteProp>();
  const { carId } = params;
  const { sellerId: authSellerId } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    negotiable: null as boolean | null,
    condition: null as string | null,
    brand: '',
    model: '',
    variant: '',
    color: '',
    yearOfPurchase: '',
    fuelType: null as string | null,
    transmission: null as string | null,
    kmDriven: '',
    numberOfOwners: '',
    carInsurance: null as boolean | null,
    carInsuranceDate: '',
    carInsuranceType: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    airbag: false,
    abs: false,
    buttonStart: false,
    sunroof: false,
    childSafetyLocks: false,
    acFeature: false,
    musicFeature: false,
    powerWindowFeature: false,
    rearParkingCameraFeature: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [ownerSellerId, setOwnerSellerId] = useState<number | null>(null);
  const [initialFormData, setInitialFormData] = useState<typeof formData | null>(null);

  const yearOptions = useMemo(() => {
    const years: string[] = [];
    for (let year = CURRENT_YEAR; year >= MIN_YEAR; year--) {
      years.push(year.toString());
    }
    return years;
  }, []);

  const fetchCar = useCallback(() => getCarById(carId), [carId]);

  const { data, loading, error } = useListingDetails<CarDetail>(fetchCar, {
    defaultErrorMessage: 'Failed to load car details',
  });

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  useEffect(() => {
    if (!data) return;
    const nextFormData = {
      title: data.title ?? '',
      description: data.description ?? '',
      price: data.price != null ? String(data.price) : '',
      negotiable: typeof data.negotiable === 'boolean' ? data.negotiable : null,
      condition: (data.condition as string) ?? null,
      brand: data.brand ?? '',
      model: data.model ?? '',
      variant: data.variant ?? '',
      color: data.color ?? '',
      yearOfPurchase: data.yearOfPurchase ? String(data.yearOfPurchase) : '',
      fuelType: data.fuelType ?? null,
      transmission: data.transmission ?? null,
      kmDriven: data.kmDriven != null ? String(data.kmDriven) : '',
      numberOfOwners: data.numberOfOwners != null ? String(data.numberOfOwners) : '',
      carInsurance: typeof data.carInsurance === 'boolean' ? data.carInsurance : null,
      carInsuranceDate: data.carInsuranceDate ?? '',
      carInsuranceType: data.carInsuranceType ?? '',
      address: data.address ?? '',
      city: data.city ?? '',
      state: data.state ?? '',
      pincode: data.pincode ?? '',
      airbag: data.airbag ?? false,
      abs: data.abs ?? false,
      buttonStart: data.buttonStart ?? false,
      sunroof: data.sunroof ?? false,
      childSafetyLocks: data.childSafetyLocks ?? false,
      acFeature: data.acFeature ?? false,
      musicFeature: data.musicFeature ?? false,
      powerWindowFeature: data.powerWindowFeature ?? false,
      rearParkingCameraFeature: data.rearParkingCameraFeature ?? false,
    };
    setFormData(nextFormData);
    setInitialFormData({ ...nextFormData });
    setOwnerSellerId(
      typeof data.sellerId === 'number' && Number.isFinite(data.sellerId)
        ? data.sellerId
        : null,
    );
    setTouched({});
    setErrors({});
  }, [data]);

  const validateField = useCallback((field: string, value: any): string | undefined => {
    switch (field) {
      case 'title':
        if (!value || value.trim().length < 10) return 'Title must be at least 10 characters';
        if (value.length > 100) return 'Title must not exceed 100 characters';
        break;
      case 'description':
        if (!value || value.trim().length < 30) return 'Description must be at least 30 characters';
        if (value.length > 500) return 'Description must not exceed 500 characters';
        break;
      case 'price': {
        const price = parseFloat(value);
        if (!value || Number.isNaN(price)) return 'Please enter a valid price';
        if (price <= 0) return 'Price must be greater than 0';
        if (price > 100000000) return 'Price seems too high';
        break;
      }
      case 'brand':
      case 'model':
      case 'color':
        if (!value || value.trim().length === 0) return 'This field is required';
        break;
      case 'yearOfPurchase': {
        if (!value) return 'Please select year of purchase';
        const year = parseInt(value, 10);
        if (Number.isNaN(year) || year < MIN_YEAR || year > CURRENT_YEAR) {
          return `Year must be between ${MIN_YEAR} and ${CURRENT_YEAR}`;
        }
        break;
      }
      case 'condition':
        if (!value) return 'Please select condition';
        break;
      case 'negotiable':
        if (value === null || value === undefined) return 'Please select negotiable';
        break;
      case 'fuelType':
        if (!value) return 'Please select fuel type';
        break;
      case 'transmission':
        if (!value) return 'Please select transmission';
        break;
      case 'kmDriven': {
        const km = parseInt(value, 10);
        if (value && (Number.isNaN(km) || km < 0)) return 'Please enter valid kilometers';
        break;
      }
      case 'numberOfOwners': {
        const owners = parseInt(value, 10);
        if (value && (Number.isNaN(owners) || owners < 1 || owners > 10)) {
          return 'Number of owners must be between 1 and 10';
        }
        break;
      }
      case 'pincode': {
        if (value && !/^\d{6}$/.test(value)) return 'Pincode must be 6 digits';
        break;
      }
      default:
        break;
    }
    return undefined;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    const requiredFields: Array<keyof typeof formData> = [
      'title',
      'description',
      'price',
      'brand',
      'model',
      'color',
      'yearOfPurchase',
      'condition',
      'negotiable',
      'fuelType',
      'transmission',
    ];

    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched((prev) => {
      const updated: Record<string, boolean> = { ...prev };
      requiredFields.forEach((field) => {
        updated[field] = true;
      });
      return updated;
    });
    return isValid;
  }, [formData, validateField]);

  const handleInputChange = useCallback(
    (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      if (touched[field]) {
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
      }
    },
    [touched, validateField],
  );

  const handleBlur = useCallback(
    (field: string, value?: any) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      const valueToValidate = value !== undefined ? value : formData[field];
      const error = validateField(field, valueToValidate);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [formData, validateField],
  );

  const handleUpdate = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert('Please review the form', 'Correct highlighted fields before saving.');
      return;
    }

    const changedFields = initialFormData
      ? (Object.keys(formData) as Array<keyof typeof formData>).filter((field) => {
          const current = formData[field];
          const initial = initialFormData[field];
          const normalize = (value: any) => {
            if (typeof value === 'string') {
              return value.trim();
            }
            return value;
          };
          return normalize(current) !== normalize(initial);
        })
      : (Object.keys(formData) as Array<keyof typeof formData>);

    if (changedFields.length === 0) {
      Alert.alert('No changes detected', 'Please update at least one field before saving.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    const yearNum = parseInt(formData.yearOfPurchase, 10);
    const kmDrivenNum = formData.kmDriven ? parseInt(formData.kmDriven, 10) : undefined;
    const ownersNum = formData.numberOfOwners ? parseInt(formData.numberOfOwners, 10) : undefined;

    try {
      setSaving(true);

      const payload: UpdateCarDTO = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: priceNum,
        negotiable: formData.negotiable === true,
        condition: formData.condition,
        brand: formData.brand.trim(),
        model: formData.model.trim(),
        variant: formData.variant.trim() || undefined,
        color: formData.color.trim(),
        yearOfPurchase: yearNum,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        kmDriven: kmDrivenNum,
        numberOfOwners: ownersNum,
        carInsurance: formData.carInsurance ?? false,
        carInsuranceDate: formData.carInsuranceDate.trim() || undefined,
        carInsuranceType: formData.carInsuranceType.trim() || undefined,
        address: formData.address.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        pincode: formData.pincode.trim() || undefined,
        airbag: formData.airbag,
        abs: formData.abs,
        buttonStart: formData.buttonStart,
        sunroof: formData.sunroof,
        childSafetyLocks: formData.childSafetyLocks,
        acFeature: formData.acFeature,
        musicFeature: formData.musicFeature,
        powerWindowFeature: formData.powerWindowFeature,
        rearParkingCameraFeature: formData.rearParkingCameraFeature,
      };

      const resolvedSellerId =
        (typeof ownerSellerId === 'number' && Number.isFinite(ownerSellerId) && ownerSellerId) ||
        (typeof authSellerId === 'number' && Number.isFinite(authSellerId) && authSellerId) ||
        undefined;

      if (resolvedSellerId !== undefined) {
        Object.assign(payload, { sellerId: resolvedSellerId });
      }

      await updateCar(carId, payload);
      Alert.alert('Success', 'Car updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', getFriendlyApiError(err, 'Failed to update car'));
    } finally {
      setSaving(false);
    }
  }, [authSellerId, formData, initialFormData, carId, navigation, ownerSellerId, validateForm]);

  if (loading) {
    return <ListingUpdateLoader message="Loading car details..." />;
  }

  return (
    <>
      <ListingUpdateLayout
        title="Edit Car Details"
        onBack={() => navigation.goBack()}
        footer={
          <TouchableOpacity
            style={[styles.nextButton, saving && styles.nextButtonDisabled]}
            onPress={handleUpdate}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.nextButtonText}>Update</Text>
            )}
          </TouchableOpacity>
        }
        scrollProps={{ showsVerticalScrollIndicator: false }}
      >
        {/* Basic Information */}
        <Text style={styles.sectionTitle}>Basic Information</Text>

        <ListingFormInput
          label="Title"
          placeholder="e.g., 2020 Maruti Grand Vitara - Excellent Condition"
          value={formData.title}
          onChangeText={(v) => handleInputChange('title', v)}
          onBlur={() => handleBlur('title')}
          error={touched.title ? errors.title : undefined}
          autoCapitalize="sentences"
          maxLength={100}
          required
        />

        <ListingFormTextArea
          label="Description"
          value={formData.description}
          onChangeText={(v) => handleInputChange('description', v)}
          onBlur={() => handleBlur('description')}
          error={touched.description ? errors.description : undefined}
          autoCapitalize="sentences"
          maxLength={500}
          required
          placeholder="Describe your car's condition, features, service history..."
        />

        <ListingFormInput
          label="Price"
          placeholder="Enter price"
          value={formData.price}
          onChangeText={(v) => handleInputChange('price', v.replace(/[^0-9]/g, ''))}
          onBlur={() => handleBlur('price')}
          error={touched.price ? errors.price : undefined}
          keyboardType="numeric"
          maxLength={10}
          required
        />

        <ListingFormDropdown
          label="Negotiable"
          data={negotiableOptions}
          value={formData.negotiable}
          onChange={(item) => {
            handleInputChange('negotiable', item.value);
            handleBlur('negotiable', item.value);
          }}
          error={touched.negotiable ? errors.negotiable : undefined}
          required
        />

        <ListingFormDropdown
          label="Condition"
          data={conditionOptions}
          value={formData.condition}
          onChange={(item) => {
            handleInputChange('condition', item.value);
            handleBlur('condition', item.value);
          }}
          error={touched.condition ? errors.condition : undefined}
          required
        />

        {/* Car Specifications */}
        <Text style={styles.sectionTitle}>Car Specifications</Text>

        <ListingFormInput
          label="Brand"
          placeholder="e.g., Maruti Suzuki, Hyundai, Honda"
          value={formData.brand}
          onChangeText={(v) => handleInputChange('brand', v)}
          onBlur={() => handleBlur('brand')}
          error={touched.brand ? errors.brand : undefined}
          autoCapitalize="words"
          maxLength={50}
          required
        />

        <ListingFormInput
          label="Model"
          placeholder="e.g., Grand Vitara, Creta, City"
          value={formData.model}
          onChangeText={(v) => handleInputChange('model', v)}
          onBlur={() => handleBlur('model')}
          error={touched.model ? errors.model : undefined}
          autoCapitalize="words"
          maxLength={50}
          required
        />

        <ListingFormInput
          label="Variant"
          placeholder="e.g., Alpha Plus Hybrid, SX, VX"
          value={formData.variant}
          onChangeText={(v) => handleInputChange('variant', v)}
          onBlur={() => handleBlur('variant')}
          error={touched.variant ? errors.variant : undefined}
          autoCapitalize="words"
          maxLength={50}
        />

        <ListingFormInput
          label="Color"
          placeholder="e.g., Pearl Arctic White, Red"
          value={formData.color}
          onChangeText={(v) => handleInputChange('color', v)}
          onBlur={() => handleBlur('color')}
          error={touched.color ? errors.color : undefined}
          autoCapitalize="words"
          maxLength={40}
          required
        />

        <ListingYearPickerField
          label="Year of Purchase"
          value={formData.yearOfPurchase}
          years={yearOptions}
          onChange={(year) => {
            handleInputChange('yearOfPurchase', year);
            handleBlur('yearOfPurchase', year);
          }}
          required
          error={touched.yearOfPurchase ? errors.yearOfPurchase : undefined}
        />

        <ListingFormDropdown
          label="Fuel Type"
          data={fuelTypeOptions}
          value={formData.fuelType}
          onChange={(item) => {
            handleInputChange('fuelType', item.value);
            handleBlur('fuelType', item.value);
          }}
          error={touched.fuelType ? errors.fuelType : undefined}
          required
        />

        <ListingFormDropdown
          label="Transmission"
          data={transmissionOptions}
          value={formData.transmission}
          onChange={(item) => {
            handleInputChange('transmission', item.value);
            handleBlur('transmission', item.value);
          }}
          error={touched.transmission ? errors.transmission : undefined}
          required
        />

        <ListingFormInput
          label="KM Driven"
          placeholder="e.g., 35000"
          value={formData.kmDriven}
          onChangeText={(v) => handleInputChange('kmDriven', v.replace(/[^0-9]/g, ''))}
          onBlur={() => handleBlur('kmDriven')}
          error={touched.kmDriven ? errors.kmDriven : undefined}
          keyboardType="numeric"
          maxLength={8}
        />

        <ListingFormInput
          label="Number of Owners"
          placeholder="e.g., 1, 2, 3"
          value={formData.numberOfOwners}
          onChangeText={(v) => handleInputChange('numberOfOwners', v.replace(/[^0-9]/g, ''))}
          onBlur={() => handleBlur('numberOfOwners')}
          error={touched.numberOfOwners ? errors.numberOfOwners : undefined}
          keyboardType="numeric"
          maxLength={2}
        />

        {/* Insurance Details */}
        <Text style={styles.sectionTitle}>Insurance Details</Text>

        <ListingFormDropdown
          label="Car Insurance"
          data={booleanOptions}
          value={formData.carInsurance}
          onChange={(item) => {
            handleInputChange('carInsurance', item.value);
            handleBlur('carInsurance', item.value);
          }}
          error={touched.carInsurance ? errors.carInsurance : undefined}
        />

        {formData.carInsurance && (
          <>
            <ListingFormInput
              label="Insurance Type"
              placeholder="e.g., Comprehensive, Third Party"
              value={formData.carInsuranceType}
              onChangeText={(v) => handleInputChange('carInsuranceType', v)}
              onBlur={() => handleBlur('carInsuranceType')}
              error={touched.carInsuranceType ? errors.carInsuranceType : undefined}
              autoCapitalize="words"
              maxLength={50}
            />

            <ListingFormInput
              label="Insurance Valid Till"
              placeholder="e.g., 2026-03-15"
              value={formData.carInsuranceDate}
              onChangeText={(v) => handleInputChange('carInsuranceDate', v)}
              onBlur={() => handleBlur('carInsuranceDate')}
              error={touched.carInsuranceDate ? errors.carInsuranceDate : undefined}
              maxLength={10}
            />
          </>
        )}

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>

        <ListingFormInput
          label="Address"
          placeholder="e.g., Baner Road, near Symbiosis College"
          value={formData.address}
          onChangeText={(v) => handleInputChange('address', v)}
          onBlur={() => handleBlur('address')}
          error={touched.address ? errors.address : undefined}
          autoCapitalize="words"
          maxLength={100}
        />

        <ListingFormInput
          label="City"
          placeholder="e.g., Pune"
          value={formData.city}
          onChangeText={(v) => handleInputChange('city', v)}
          onBlur={() => handleBlur('city')}
          error={touched.city ? errors.city : undefined}
          autoCapitalize="words"
          maxLength={50}
        />

        <ListingFormInput
          label="State"
          placeholder="e.g., Maharashtra"
          value={formData.state}
          onChangeText={(v) => handleInputChange('state', v)}
          onBlur={() => handleBlur('state')}
          error={touched.state ? errors.state : undefined}
          autoCapitalize="words"
          maxLength={50}
        />

        <ListingFormInput
          label="Pincode"
          placeholder="e.g., 411045"
          value={formData.pincode}
          onChangeText={(v) => handleInputChange('pincode', v.replace(/[^0-9]/g, ''))}
          onBlur={() => handleBlur('pincode')}
          error={touched.pincode ? errors.pincode : undefined}
          keyboardType="numeric"
          maxLength={6}
        />

        {/* Features */}
        <Text style={styles.sectionTitle}>Features</Text>

        <ListingFormDropdown
          label="Airbag"
          data={booleanOptions}
          value={formData.airbag}
          onChange={(item) => handleInputChange('airbag', item.value)}
        />

        <ListingFormDropdown
          label="ABS"
          data={booleanOptions}
          value={formData.abs}
          onChange={(item) => handleInputChange('abs', item.value)}
        />

        <ListingFormDropdown
          label="Button Start"
          data={booleanOptions}
          value={formData.buttonStart}
          onChange={(item) => handleInputChange('buttonStart', item.value)}
        />

        <ListingFormDropdown
          label="Sunroof"
          data={booleanOptions}
          value={formData.sunroof}
          onChange={(item) => handleInputChange('sunroof', item.value)}
        />

        <ListingFormDropdown
          label="Child Safety Locks"
          data={booleanOptions}
          value={formData.childSafetyLocks}
          onChange={(item) => handleInputChange('childSafetyLocks', item.value)}
        />

        <ListingFormDropdown
          label="AC Feature"
          data={booleanOptions}
          value={formData.acFeature}
          onChange={(item) => handleInputChange('acFeature', item.value)}
        />

        <ListingFormDropdown
          label="Music System"
          data={booleanOptions}
          value={formData.musicFeature}
          onChange={(item) => handleInputChange('musicFeature', item.value)}
        />

        <ListingFormDropdown
          label="Power Windows"
          data={booleanOptions}
          value={formData.powerWindowFeature}
          onChange={(item) => handleInputChange('powerWindowFeature', item.value)}
        />

        <ListingFormDropdown
          label="Rear Parking Camera"
          data={booleanOptions}
          value={formData.rearParkingCameraFeature}
          onChange={(item) => handleInputChange('rearParkingCameraFeature', item.value)}
        />

        <View style={{ height: SPACING.xxxl }} />
      </ListingUpdateLayout>
    </>
  );
};

export default UpdateCarScreen;
