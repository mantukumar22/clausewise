import { IndiaDocType } from './knowledge';

export interface StateOption {
  code: string;
  name: string;
  isUT?: boolean;
}

export const INDIAN_STATES_AND_UTS: StateOption[] = [
  // 28 States
  { code: 'MH', name: 'Maharashtra' }, // default
  { code: 'KA', name: 'Karnataka' },
  { code: 'DL', name: 'Delhi NCR', isUT: true },
  { code: 'TN', name: 'Tamil Nadu' },
  { code: 'TS', name: 'Telangana' },
  { code: 'UP', name: 'Uttar Pradesh' },
  { code: 'HR', name: 'Haryana' },
  { code: 'GJ', name: 'Gujarat' },
  { code: 'WB', name: 'West Bengal' },
  { code: 'RJ', name: 'Rajasthan' },
  { code: 'KL', name: 'Kerala' },
  { code: 'AP', name: 'Andhra Pradesh' },
  { code: 'MP', name: 'Madhya Pradesh' },
  { code: 'PB', name: 'Punjab' },
  { code: 'BR', name: 'Bihar' },
  { code: 'OD', name: 'Odisha' },
  { code: 'AS', name: 'Assam' },
  { code: 'JH', name: 'Jharkhand' },
  { code: 'CG', name: 'Chhattisgarh' },
  { code: 'UK', name: 'Uttarakhand' },
  { code: 'HP', name: 'Himachal Pradesh' },
  { code: 'GA', name: 'Goa' },
  { code: 'TR', name: 'Tripura' },
  { code: 'MN', name: 'Manipur' },
  { code: 'ML', name: 'Meghalaya' },
  { code: 'NL', name: 'Nagaland' },
  { code: 'MZ', name: 'Mizoram' },
  { code: 'SK', name: 'Sikkim' },
  { code: 'AR', name: 'Arunachal Pradesh' },
  // UTs
  { code: 'CH', name: 'Chandigarh', isUT: true },
  { code: 'JK', name: 'Jammu and Kashmir', isUT: true },
  { code: 'LA', name: 'Ladakh', isUT: true },
  { code: 'PY', name: 'Puducherry', isUT: true },
  { code: 'AN', name: 'Andaman and Nicobar Islands', isUT: true },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', isUT: true },
  { code: 'LD', name: 'Lakshadweep', isUT: true },
];

export interface DocTypeOption {
  id: IndiaDocType;
  label: string;
  description: string;
  defaultState: string;
}

export const DOCUMENT_TYPES: DocTypeOption[] = [
  {
    id: 'leave_and_license',
    label: 'Leave & License / Rent Agreement',
    description: 'Residential or commercial rental agreements, leases, tenancy deeds',
    defaultState: 'Maharashtra',
  },
  {
    id: 'employment_offer',
    label: 'Employment Offer / Contract',
    description: 'Job offers, service agreements, appointment letters, training bonds',
    defaultState: 'Karnataka',
  },
  {
    id: 'loan_agreement',
    label: 'Loan Agreement / KFS',
    description: 'Personal loans, vehicle loans, consumer credit, credit card agreements',
    defaultState: 'Maharashtra',
  },
  {
    id: 'general_agreement',
    label: 'Other / Commercial Contract',
    description: 'Service contracts, NDAs, vendor terms, partnership deeds',
    defaultState: 'Maharashtra',
  },
];

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish (Hindi-English)' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
];
