/**
 * Mortgage calculation utilities
 */

export interface ConventionalInputs {
  downPayment: number;
  hoa?: number;
  homePrice: number;
  insurance?: number;
  interestRate: number;
  loanTerm: number;
  propertyTax?: number;
}

export interface VAInputs {
  downPayment: number;
  homePrice: number;
  insurance?: number;
  interestRate: number;
  loanTerm: number;
  propertyTax?: number;
  vaFundingFeePercent?: number;
}

export interface FHAInputs {
  annualMIP?: number;
  downPayment: number;
  homePrice: number;
  insurance?: number;
  interestRate: number;
  loanTerm: number;
  propertyTax?: number;
  upfrontMIP?: number;
}

export interface RefinanceInputs {
  closingCosts: number;
  currentInterestRate: number;
  currentLoanBalance: number;
  currentPayment: number;
  newInterestRate: number;
  newLoanTerm: number;
}

export interface AffordabilityInputs {
  downPayment: number;
  insurance?: number;
  interestRate: number;
  loanTerm: number;
  monthlyDebts: number;
  monthlyIncome: number;
  propertyTax?: number;
}

export interface CalculationResults {
  downPaymentPercent?: number;
  loanAmount?: number;
  monthlyHOA?: number;
  monthlyInsurance?: number;
  monthlyPMI?: number;
  monthlyPayment: number;
  monthlyTax?: number;
  principalAndInterest: number;
  totalInterest: number;
  totalPayment: number;
}

/**
 * Calculate conventional mortgage
 */
export function calculateConventional(inputs: ConventionalInputs): CalculationResults {
  const { downPayment, hoa = 0, homePrice, insurance = 0, interestRate, loanTerm, propertyTax = 0 } = inputs;

  const principal = homePrice - downPayment;
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  const monthlyPI = monthlyRate === 0 ? principal / numberOfPayments : (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalInterest = (monthlyPI * numberOfPayments) - principal;
  const totalPayment = monthlyPI * numberOfPayments;

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;

  // Calculate PMI if down payment < 20%
  const downPaymentPercent = (downPayment / homePrice) * 100;
  const monthlyPMI = downPaymentPercent < 20 ? (principal * 0.005 / 12) : 0;

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance + hoa + monthlyPMI;

  return {
    downPaymentPercent,
    loanAmount: principal,
    monthlyHOA: hoa,
    monthlyInsurance,
    monthlyPMI,
    monthlyPayment: totalMonthly,
    monthlyTax,
    principalAndInterest: monthlyPI,
    totalInterest,
    totalPayment
  };
}

/**
 * Calculate VA mortgage
 */
export function calculateVA(inputs: VAInputs): CalculationResults {
  const {
    downPayment = 0,
    homePrice,
    insurance = 0,
    interestRate,
    loanTerm,
    propertyTax = 0,
    vaFundingFeePercent = 2.3
  } = inputs;

  const principal = homePrice - downPayment;
  const fundingFee = principal * (vaFundingFeePercent / 100);
  const totalLoanAmount = principal + fundingFee;

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  const monthlyPI = monthlyRate === 0 ? totalLoanAmount / numberOfPayments : (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalInterest = (monthlyPI * numberOfPayments) - totalLoanAmount;
  const totalPayment = monthlyPI * numberOfPayments;

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;

  const totalMonthly = monthlyPI + monthlyTax + monthlyInsurance;

  return {
    // VA loans don't have PMI
downPaymentPercent: (downPayment / homePrice) * 100,
    
loanAmount: totalLoanAmount,
    
monthlyInsurance,
    
monthlyPMI: 0,
    
monthlyPayment: totalMonthly,
    
monthlyTax,
    
principalAndInterest: monthlyPI,
    
totalInterest, 
    totalPayment
  };
}

/**
 * Calculate FHA mortgage
 */
export function calculateFHA(inputs: FHAInputs): CalculationResults {
  const {
    annualMIP = 0.85,
    downPayment,
    homePrice,
    insurance = 0,
    interestRate,
    loanTerm,
    propertyTax = 0,
    upfrontMIP = 1.75
  } = inputs;

  const principal = homePrice - downPayment;
  const upfrontMIPAmount = principal * (upfrontMIP / 100);
  const totalLoanAmount = principal + upfrontMIPAmount;

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  const monthlyPI = monthlyRate === 0 ? totalLoanAmount / numberOfPayments : (totalLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const monthlyMIP = (principal * (annualMIP / 100)) / 12;

  const totalInterest = (monthlyPI * numberOfPayments) - totalLoanAmount;
  const totalPayment = monthlyPI * numberOfPayments;

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;

  const totalMonthly = monthlyPI + monthlyMIP + monthlyTax + monthlyInsurance;

  return {
    // FHA uses MIP instead of PMI
downPaymentPercent: (downPayment / homePrice) * 100,
    
loanAmount: totalLoanAmount,
    
monthlyInsurance,
    
monthlyPMI: monthlyMIP,
    
monthlyPayment: totalMonthly,
    
monthlyTax,
    
principalAndInterest: monthlyPI,
    
totalInterest, 
    totalPayment
  };
}

/**
 * Calculate refinance savings
 */
export function calculateRefinance(inputs: RefinanceInputs): CalculationResults & {
  breakEvenMonths: number;
  lifetimeSavings: number;
  monthlySavings: number;
} {
  const {
    closingCosts,
    currentInterestRate,
    currentLoanBalance,
    currentPayment,
    newInterestRate,
    newLoanTerm
  } = inputs;

  const monthlyRate = newInterestRate / 100 / 12;
  const numberOfPayments = newLoanTerm * 12;

  const newMonthlyPI = monthlyRate === 0 ? currentLoanBalance / numberOfPayments : (currentLoanBalance * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                   (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalInterest = (newMonthlyPI * numberOfPayments) - currentLoanBalance;
  const totalPayment = newMonthlyPI * numberOfPayments;

  const monthlySavings = currentPayment - newMonthlyPI;
  const breakEvenMonths = monthlySavings > 0 ? Math.ceil(closingCosts / monthlySavings) : 0;
  const lifetimeSavings = (monthlySavings * numberOfPayments) - closingCosts;

  return {
    breakEvenMonths,
    lifetimeSavings,
    loanAmount: currentLoanBalance,
    monthlyPayment: newMonthlyPI,
    monthlySavings,
    principalAndInterest: newMonthlyPI,
    totalInterest,
    totalPayment
  };
}

/**
 * Calculate affordability (max home price)
 */
export function calculateAffordability(inputs: AffordabilityInputs): CalculationResults & {
  maxHomePrice: number;
  maxLoanAmount: number;
} {
  const {
    downPayment,
    insurance = 0,
    interestRate,
    loanTerm,
    monthlyDebts,
    monthlyIncome,
    propertyTax = 0
  } = inputs;

  // Use 28% front-end ratio (housing) and 36% back-end ratio (total debt)
  const maxHousingPayment = monthlyIncome * 0.28;
  const maxTotalPayment = monthlyIncome * 0.36;
  const availableForHousing = Math.min(maxHousingPayment, maxTotalPayment - monthlyDebts);

  // Subtract property tax and insurance from available payment
  const monthlyTax = propertyTax / 12;
  const monthlyIns = insurance / 12;
  const availableForPI = availableForHousing - monthlyTax - monthlyIns;

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  // Calculate max loan amount
  const maxLoanAmount = monthlyRate === 0 ? availableForPI * numberOfPayments : availableForPI * (Math.pow(1 + monthlyRate, numberOfPayments) - 1) /
                    (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments));

  const maxHomePrice = maxLoanAmount + downPayment;

  const totalInterest = (availableForPI * numberOfPayments) - maxLoanAmount;
  const totalPayment = availableForPI * numberOfPayments;

  return {
    downPaymentPercent: (downPayment / maxHomePrice) * 100,
    loanAmount: maxLoanAmount,
    maxHomePrice,
    maxLoanAmount,
    monthlyInsurance: monthlyIns,
    monthlyPayment: availableForPI + monthlyTax + monthlyIns,
    monthlyTax,
    principalAndInterest: availableForPI,
    totalInterest,
    totalPayment
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {return '$0';}
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
    style: 'currency',
  }).format(amount);
}

/**
 * Format currency with cents
 */
export function formatCurrencyWithCents(amount: number): string {
  if (isNaN(amount) || !isFinite(amount)) {return '$0.00';}
  return new Intl.NumberFormat('en-US', {
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: 'currency',
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  if (isNaN(value) || !isFinite(value)) {return '0%';}
  return `${value.toFixed(decimals)}%`;
}
