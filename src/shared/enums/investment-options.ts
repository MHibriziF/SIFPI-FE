import type { SelectOption } from '@/shared/components/form-fields';

// Short-label sector options used in investor checkbox UI.
// These intentionally differ from SECTOR_LABELS in sector.ts which use full names.
export const INVESTOR_SECTOR_OPTIONS = [
  { value: 'PUBLIC_TRANSPORTATION', label: 'Public Transportation' },
  { value: 'LAND_BASED_TRANSPORT', label: 'Land Based Transport' },
  { value: 'WASTE_MANAGEMENT', label: 'Waste Management' },
  { value: 'TOLL_ROAD', label: 'Toll Road' },
  { value: 'AFFORDABLE_HOUSING_AND_TRANSIT_ORIENTED_DEVELOPMENT', label: 'Affordable Housing' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'WATER_RESOURCE_DRINKING_WATER_AND_IRRIGATION', label: 'Water Resource' },
  { value: 'MARITIME', label: 'Maritime' },
  { value: 'OIL_GAS_AND_ENERGY', label: 'Oil & Gas, Energy' },
  { value: 'AVIATION', label: 'Aviation' },
  { value: 'DIGITAL_AND_TELECOMMUNICATIONS', label: 'Digital & Telecom' },
  { value: 'EDUCATION_RESEARCH_AND_DEVELOPMENT', label: 'Education, R&D' },
  { value: 'URBAN_ECONOMICS_INFRASTRUCTURE_FACILITIES', label: 'Urban Economics' },
] as const;

export const BUDGET_OPTIONS: SelectOption[] = [
  { value: '<1', label: '< 1 Miliar' },
  { value: '1-5', label: '1-5 Miliar' },
  { value: '5-10', label: '5-10 Miliar' },
  { value: '>10', label: '> 10 Miliar' },
];

export const STAGE_OPTIONS: SelectOption[] = [
  { value: 'Greenfield', label: 'Greenfield' },
  { value: 'Brownfield', label: 'Brownfield' },
  { value: 'Both', label: 'Both' },
];

export const RISK_OPTIONS: SelectOption[] = [
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
];
