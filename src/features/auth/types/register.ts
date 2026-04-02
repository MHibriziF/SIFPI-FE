export interface CreateOwnerRequest {
  nama: string;
  email: string;
  organisasi: string;
  jabatan: string;
  phone: string;
  password: string;
  confirmPassword: string;
  turnstileToken?: string;
}

export interface CreateInvestorRequest {
  // Data Diri dan Organisasi
  nama: string;
  email: string;
  jabatan: string;
  phone: string;
  password: string;
  confirmPassword: string;
  organisasi: string;

  // Preferensi Investasi & Komunikasi
  budgetInvestasi: string;
  sectorInterest: string[]; // min 3 items

  // Additional Investor Profile (optional)
  preferredInvestmentInstrument?: string;
  engagementModel?: string;
  stagePreference?: string;
  riskAppetite?: string;
  esgStandards?: string;
  localPresence?: string;
  aumSize?: string;

  // Komunikasi & Persetujuan
  optInEmail?: boolean;
  agreePrivacy: boolean;
  turnstileToken?: string;
}

export interface OwnerDTO {
  id: string;
  nama: string;
  email: string;
  organisasi: string;
  jabatan: string;
  phone: string;
  role: string;
  permissions: Record<string, string[]>;
}

export interface InvestorDTO {
  id: string;
  nama: string;
  email: string;
  organisasi: string;
  jabatan: string;
  phone: string;
  budgetInvestasi: string;
  sectorInterest: string[];
  role: string;
  permissions: Record<string, string[]>;
}
