// src/screens/CarScreens/AddCarDetailsScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import SellFlowLayout from '../Sell/common/SellFlowLayout';
import PrimaryButton from '../../components/common/PrimaryButton';
import TextField from '../../components/form/TextField';
import Textarea from '../../components/form/Textarea';
import DropdownField, { DropdownOption } from '../../components/form/DropdownField';
import ReadonlyPickerInput from '../../components/form/ReadonlyPickerInput';
import BottomSheetPicker, {
  BottomSheetPickerOption,
} from '../../components/common/BottomSheetPicker';
import { StepConfig } from '../../components/common/ProgressStepper';
import { colors, spacing } from '../../theme/tokens';
import { useFormState } from '../../form/hooks/useFormState';
import {
  CarDetailsFormValues,
  CURRENT_YEAR,
  MIN_CAR_YEAR,
  carDetailsSchema,
  getDefaultCarDetailsValues,
} from '../../form/schemas/carDetailsSchema';
import { FormFieldConfig } from '../../form/config/types';
import { getCarDetailsFieldConfig } from '../../form/config/carDetailsFields';
import { useAuth } from '../../context/AuthContext';
import { toCarCreateDTO } from '../../mappers/listingMappers';
import { addCar } from '../../api/CarsApi';
import { normalizeCreateResponse } from '../../utils/normalizeCreateResponse';
import getFriendlyApiError from '../../utils/getFriendlyApiError';
import { SellCarStackParamList } from '../../navigation/SellCarStack';

type AddCarDetailsScreenNavigationProp = NativeStackNavigationProp<
  SellCarStackParamList,
  'AddCarDetails'
>;

const SELL_FLOW_STEPS: StepConfig[] = [
  { label: 'Details', status: 'current' },
  { label: 'Photos', status: 'upcoming' },
  { label: 'Confirm', status: 'upcoming' },
];

const AddCarDetailsScreen: React.FC = () => {
  const navigation = useNavigation<AddCarDetailsScreenNavigationProp>();
  const { sellerId } = useAuth();

  const {
    values,
    errors,
    touched,
    setFieldValue,
    handleBlur,
    touchField,
    validateForm,
  } = useFormState<CarDetailsFormValues>({
    initialValues: getDefaultCarDetailsValues(),
    schema: carDetailsSchema,
  });

  const [loading, setLoading] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);

  useEffect(() => {
    if (values.carInsurance === false) {
      if (values.carInsuranceDate !== '') {
        setFieldValue('carInsuranceDate', '' as CarDetailsFormValues['carInsuranceDate'], {
          validate: false,
        });
      }
      if (values.carInsuranceType !== '') {
        setFieldValue('carInsuranceType', '' as CarDetailsFormValues['carInsuranceType'], {
          validate: false,
        });
      }
    }
  }, [setFieldValue, values.carInsurance, values.carInsuranceDate, values.carInsuranceType]);

  const yearOptions = useMemo<BottomSheetPickerOption<string>[]>(() => {
    const years: BottomSheetPickerOption<string>[] = [];
    for (let year = CURRENT_YEAR; year >= MIN_CAR_YEAR; year -= 1) {
      const value = year.toString();
      years.push({ label: value, value });
    }
    return years;
  }, []);

  const fieldConfig = useMemo(
    () =>
      getCarDetailsFieldConfig({
        onOpenYearPicker: () => setYearPickerVisible(true),
      }),
    [],
  );

  const renderField = (config: FormFieldConfig<CarDetailsFormValues>) => {
    const field = config.field;
    const value = values[field];
    const error = touched[field] ? errors[field] : undefined;
    const labelAccessory = config.getLabelAccessory?.({ values });

    switch (config.component) {
      case 'text': {
        const formattedValue = value == null ? '' : String(value);
        const extraProps =
          field === 'carInsuranceDate' || field === 'carInsuranceType'
            ? { editable: values.carInsurance === true }
            : null;

        return (
          <TextField
            key={String(field)}
            label={config.label}
            value={formattedValue}
            onChangeText={(text) => {
              const nextValue = config.transform?.(text, { values }) ?? text;
              setFieldValue(field, nextValue as CarDetailsFormValues[typeof field], {
                validate: Boolean(touched[field]),
              });
            }}
            onBlur={() => handleBlur(field)}
            required={config.required}
            error={error}
            labelAccessory={labelAccessory}
            {...config.props}
            {...extraProps}
          />
        );
      }
      case 'textarea': {
        const formattedValue = value == null ? '' : String(value);
        return (
          <Textarea
            key={String(field)}
            label={config.label}
            value={formattedValue}
            onChangeText={(text) => {
              const nextValue = config.transform?.(text, { values }) ?? text;
              setFieldValue(field, nextValue as CarDetailsFormValues[typeof field], {
                validate: Boolean(touched[field]),
              });
            }}
            onBlur={() => handleBlur(field)}
            required={config.required}
            error={error}
            labelAccessory={labelAccessory}
            {...config.props}
          />
        );
      }
      case 'dropdown': {
        const props = config.props ?? {};
        const data: DropdownOption<any>[] = props.data ?? [];
        const { placeholder, ...restProps } = props;
        return (
          <DropdownField
            key={String(field)}
            label={config.label}
            data={data}
            value={value as any}
            onChange={(item) => {
              touchField(field);
              setFieldValue(field, item.value, { validate: true });
            }}
            required={config.required}
            error={error}
            placeholder={placeholder}
            {...restProps}
          />
        );
      }
      case 'readonlyPicker': {
        const props = config.props ?? {};
        const { onPress, ...restProps } = props;
        return (
          <ReadonlyPickerInput
            key={String(field)}
            label={config.label}
            value={value as string | number | null | undefined}
            required={config.required}
            error={error}
            onPress={onPress ?? (() => {})}
            {...restProps}
          />
        );
      }
      default:
        return null;
    }
  };

  const handleSubmit = async () => {
    if (sellerId == null) {
      Alert.alert('Error', 'Seller account not found');
      return;
    }

    const valid = validateForm();
    if (!valid) {
      return;
    }

    try {
      setLoading(true);
      const payload = toCarCreateDTO(values, Number(sellerId));
      const response = await addCar(payload);
      const normalized = normalizeCreateResponse(response, 'car');

      if (!normalized.success || normalized.id === null) {
        Alert.alert('Failed', normalized.rawMessage || 'Unable to create car listing');
        return;
      }

      Alert.alert('Success', normalized.message || 'Car created successfully');
      navigation.navigate('SelectPhoto', { carId: normalized.id });
    } catch (error: any) {
      Alert.alert('Error', getFriendlyApiError(error, 'Failed to add car'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SellFlowLayout
        title="Car Details"
        onBack={() => navigation.goBack()}
        steps={SELL_FLOW_STEPS}
        footer={
          <PrimaryButton
            label="Next"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            icon={<Icon name="arrow-right" size={20} color={colors.white} />}
          />
        }
        contentContainerStyle={{ paddingBottom: spacing.xxxl }}
      >
        {fieldConfig.map((config) => renderField(config))}
        <View style={{ height: spacing.xxxl }} />
      </SellFlowLayout>

      <BottomSheetPicker
        visible={yearPickerVisible}
        title="Select Year"
        options={yearOptions}
        selectedValue={values.yearOfPurchase}
        onSelect={(year) => {
          touchField('yearOfPurchase');
          setFieldValue('yearOfPurchase', year, { validate: true });
          setYearPickerVisible(false);
        }}
        onClose={() => setYearPickerVisible(false)}
      />
    </>
  );
};

export default AddCarDetailsScreen;
