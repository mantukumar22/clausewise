// Formats a number to Indian Rupee notation (lakhs & crores)
export function formatIndianCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Not specified';
  }

  const rounded = Math.round(amount);
  const formattedStandard = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(rounded);

  // Add Lakh / Crore description if substantial
  if (rounded >= 10000000) {
    const crores = (rounded / 10000000).toFixed(2).replace(/\.00$/, '');
    return `${formattedStandard} (${crores} crore)`;
  } else if (rounded >= 100000) {
    const lakhs = (rounded / 100000).toFixed(2).replace(/\.00$/, '');
    return `${formattedStandard} (${lakhs} lakh)`;
  } else if (rounded >= 1000) {
    const thousands = (rounded / 1000).toFixed(1).replace(/\.0$/, '');
    return `${formattedStandard} (${thousands}k)`;
  }

  return formattedStandard;
}

export interface YearRentProjection {
  year: number;
  label: string;
  monthlyRent: number;
  annualRent: number;
  formattedMonthly: string;
  formattedAnnual: string;
}

export interface RentMathResult {
  monthlyRent: number;
  securityDeposit: number;
  escalationPercent: number;
  termMonths: number;
  depositMultipleMonths: number;
  yearProjections: YearRentProjection[];
  totalTermRent: number;
  totalOutgoIncludingDeposit: number;
  formattedTotalRent: string;
  formattedTotalOutgo: string;
  modelTenancyDepositBenchmarkNote: string;
}

// Deterministic Rent Math calculation - pure JS, no LLM hallucinations
export function calculateRentMath(params: {
  monthlyRent?: number | null;
  securityDeposit?: number | null;
  escalationPercent?: number | null;
  termMonths?: number | null;
  state?: string;
}): RentMathResult {
  const rent = params.monthlyRent && params.monthlyRent > 0 ? params.monthlyRent : 25000;
  const deposit =
    params.securityDeposit && params.securityDeposit > 0 ? params.securityDeposit : rent * 3;
  const escalation =
    params.escalationPercent !== null && params.escalationPercent !== undefined
      ? params.escalationPercent
      : 10;
  const termMonths = params.termMonths && params.termMonths > 0 ? params.termMonths : 11;
  const state = params.state || 'Maharashtra';

  const depositMonths = Math.round((deposit / rent) * 10) / 10;

  // Project up to 3 years or term span
  const projections: YearRentProjection[] = [];
  let currentMonthly = rent;

  const yearsToShow = Math.max(3, Math.ceil(termMonths / 12));
  for (let y = 1; y <= yearsToShow; y++) {
    if (y > 1) {
      currentMonthly = Math.round(currentMonthly * (1 + escalation / 100));
    }
    const annualRent = currentMonthly * 12;
    projections.push({
      year: y,
      label: y === 1 ? 'Year 1 (Initial Term)' : `Year 2 (+${escalation}%)`,
      monthlyRent: currentMonthly,
      annualRent,
      formattedMonthly: formatIndianCurrency(currentMonthly),
      formattedAnnual: formatIndianCurrency(annualRent),
    });
  }

  // Calculate actual total rent for the term duration
  let totalTermRent = 0;
  let runningMonthly = rent;
  for (let m = 1; m <= termMonths; m++) {
    totalTermRent += runningMonthly;
    if (m % 12 === 0) {
      runningMonthly = Math.round(runningMonthly * (1 + escalation / 100));
    }
  }

  const totalOutgo = totalTermRent + deposit;

  const modelTenancyDepositBenchmarkNote =
    depositMonths > 2
      ? `The extracted security deposit is ${depositMonths} months of rent (${formatIndianCurrency(deposit)}). Note: Under the Model Tenancy Act 2021 model norm, residential deposit is up to 2 months' rent. (State specific: check ${state} rules).`
      : `The extracted security deposit is ${depositMonths} months of rent, which is aligned with the 2-month residential benchmark under the Model Tenancy Act 2021.`;

  return {
    monthlyRent: rent,
    securityDeposit: deposit,
    escalationPercent: escalation,
    termMonths,
    depositMultipleMonths: depositMonths,
    yearProjections: projections,
    totalTermRent,
    totalOutgoIncludingDeposit: totalOutgo,
    formattedTotalRent: formatIndianCurrency(totalTermRent),
    formattedTotalOutgo: formatIndianCurrency(totalOutgo),
    modelTenancyDepositBenchmarkNote,
  };
}

export function formatDateIndian(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}
