/**
 * Shared Indian jurisdictions and supported languages constants
 */

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
}

export const INDIAN_STATES: string[] = [
  'Maharashtra',
  'Karnataka',
  'Delhi NCR',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Haryana',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Kerala',
  'Andhra Pradesh',
  'Madhya Pradesh',
  'Punjab',
  'Bihar',
  'Odisha',
  'Assam',
  'Jharkhand',
  'Goa',
  'Uttarakhand',
  'Chandigarh',
];

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
];
