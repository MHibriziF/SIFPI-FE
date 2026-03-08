export enum Sector {
  PUBLIC_TRANSPORTATION = 'PUBLIC_TRANSPORTATION',
  LAND_BASED_TRANSPORT = 'LAND_BASED_TRANSPORT',
  WASTE_MANAGEMENT = 'WASTE_MANAGEMENT',
  TOLL_ROAD = 'TOLL_ROAD',
  AFFORDABLE_HOUSING_AND_TRANSIT_ORIENTED_DEVELOPMENT = 'AFFORDABLE_HOUSING_AND_TRANSIT_ORIENTED_DEVELOPMENT',
  HEALTH = 'HEALTH',
  WATER_RESOURCE_DRINKING_WATER_AND_IRRIGATION = 'WATER_RESOURCE_DRINKING_WATER_AND_IRRIGATION',
  MARITIME = 'MARITIME',
  OIL_GAS_AND_ENERGY = 'OIL_GAS_AND_ENERGY',
  AVIATION = 'AVIATION',
  DIGITAL_AND_TELECOMMUNICATIONS = 'DIGITAL_AND_TELECOMMUNICATIONS',
  EDUCATION_RESEARCH_AND_DEVELOPMENT = 'EDUCATION_RESEARCH_AND_DEVELOPMENT',
  URBAN_ECONOMICS_INFRASTRUCTURE_FACILITIES = 'URBAN_ECONOMICS_INFRASTRUCTURE_FACILITIES',
}

export const SECTOR_LABELS: Record<Sector, string> = {
  [Sector.PUBLIC_TRANSPORTATION]: 'Public Transportation',
  [Sector.LAND_BASED_TRANSPORT]: 'Land Based Transport (Rails and Road Transport)',
  [Sector.WASTE_MANAGEMENT]: 'Waste Management',
  [Sector.TOLL_ROAD]: 'Toll Road',
  [Sector.AFFORDABLE_HOUSING_AND_TRANSIT_ORIENTED_DEVELOPMENT]:
    'Affordable Housing and Transit-oriented Development',
  [Sector.HEALTH]: 'Health',
  [Sector.WATER_RESOURCE_DRINKING_WATER_AND_IRRIGATION]:
    'Water Resource, Drinking Water, and Irrigation',
  [Sector.MARITIME]: 'Maritime',
  [Sector.OIL_GAS_AND_ENERGY]: 'Oil & Gas, and Energy',
  [Sector.AVIATION]: 'Aviation',
  [Sector.DIGITAL_AND_TELECOMMUNICATIONS]: 'Digital & Telecommunications',
  [Sector.EDUCATION_RESEARCH_AND_DEVELOPMENT]: 'Education, Research, and Development',
  [Sector.URBAN_ECONOMICS_INFRASTRUCTURE_FACILITIES]: 'Urban Economics Infrastructure Facilities',
};

export const SECTOR_OPTIONS = Object.values(Sector).map(value => ({
  value,
  label: SECTOR_LABELS[value],
}));

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ');
}

export function parseSector(value: unknown): Sector | null {
  if (typeof value !== 'string' || value.trim().length === 0) return null;
  const normalized = value.trim().toUpperCase().replaceAll('-', '_').replaceAll(' ', '_');
  const matched = Object.values(Sector).find(sector => sector === normalized);
  return matched ?? null;
}

export function sectorLabel(value: unknown): string {
  const parsed = parseSector(value);
  if (parsed) return SECTOR_LABELS[parsed];
  if (typeof value !== 'string' || value.trim().length === 0) return '-';
  return titleCase(value.trim().toUpperCase().replaceAll('-', '_').replaceAll(' ', '_'));
}
