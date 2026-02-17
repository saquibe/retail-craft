import { Country, State, City } from "country-state-city";

export interface LocationOption {
  value: string;
  label: string;
}

export const getCountries = (): LocationOption[] => {
  return Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));
};

export const getStatesByCountry = (countryCode: string): LocationOption[] => {
  if (!countryCode) return [];
  return State.getStatesOfCountry(countryCode).map((state) => ({
    value: state.isoCode,
    label: state.name,
  }));
};

export const getCitiesByState = (
  countryCode: string,
  stateCode: string,
): LocationOption[] => {
  if (!countryCode || !stateCode) return [];
  return City.getCitiesOfState(countryCode, stateCode).map((city) => ({
    value: city.name,
    label: city.name,
  }));
};

export const getCountryName = (countryCode: string): string => {
  const country = Country.getCountryByCode(countryCode);
  return country?.name || countryCode;
};

export const getStateName = (
  countryCode: string,
  stateCode: string,
): string => {
  const state = State.getStateByCodeAndCountry(stateCode, countryCode);
  return state?.name || stateCode;
};
