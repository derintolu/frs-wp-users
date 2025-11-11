import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MortgageInput } from '../ui/mortgage-input';
import { MortgageSelect } from '../ui/mortgage-select';
import { Calculator, Home } from 'lucide-react';
import {
  formatCurrency,
  formatCurrencyWithCents
} from '../../utils/mortgageCalculations';

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming', 'District of Columbia'
];

const CREDIT_SCORES = [
  { value: '620-639', label: '620-639' },
  { value: '640-659', label: '640-659' },
  { value: '660-679', label: '660-679' },
  { value: '680-699', label: '680-699' },
  { value: '700-719', label: '700-719' },
  { value: '720-739', label: '720-739' },
  { value: '740-759', label: '740-759' },
  { value: '760+', label: '760+' }
];

// DSCR Calculator
export function DSCRCalculator() {
  const [inputs, setInputs] = useState({
    numberOfUnits: 1,
    propertyValue: 300000,
    averageRentPerUnit: 2500,
    annualPropertyTaxes: 5000,
    annualInsurance: 5000,
    monthlyHOA: 0,
    vacancyRate: 5,
    annualRepairsAndMaintenance: 5000,
    loanToValue: 75,
    interestRate: 8,
    loanTerm: 30,
    originationFee: 2,
    closingCosts: 6500
  });

  const [propertyState, setPropertyState] = useState('California');
  const [creditScore, setCreditScore] = useState('740-759');

  // Calculations
  const grossMonthlyIncome = inputs.numberOfUnits * inputs.averageRentPerUnit;
  const annualGrossIncome = grossMonthlyIncome * 12;
  const vacancyCost = (annualGrossIncome * inputs.vacancyRate) / 100;
  const netOperatingIncome = annualGrossIncome - vacancyCost - inputs.annualPropertyTaxes - inputs.annualInsurance - (inputs.monthlyHOA * 12) - inputs.annualRepairsAndMaintenance;

  const loanAmount = (inputs.propertyValue * inputs.loanToValue) / 100;
  const monthlyRate = inputs.interestRate / 100 / 12;
  const numberOfPayments = inputs.loanTerm * 12;
  const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  const annualDebtService = monthlyPayment * 12;

  const dscr = annualDebtService > 0 ? netOperatingIncome / annualDebtService : 0;
  const dscrPercentage = (dscr * 100).toFixed(2);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            DSCR Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MortgageSelect
            label="Number of Units"
            value={String(inputs.numberOfUnits)}
            onChange={(val) => setInputs({...inputs, numberOfUnits: parseInt(val)})}
            options={[
              { value: '1', label: '1' },
              { value: '2', label: '2' },
              { value: '3', label: '3' },
              { value: '4', label: '4' }
            ]}
          />

          <MortgageInput
            label="Property Value or Purchase Price"
            type="currency"
            value={inputs.propertyValue}
            onChange={(val) => setInputs({...inputs, propertyValue: val})}
            defaultValue={300000}
          />

          <MortgageInput
            label="Average Rent/Unit"
            type="currency"
            value={inputs.averageRentPerUnit}
            onChange={(val) => setInputs({...inputs, averageRentPerUnit: val})}
            defaultValue={2500}
          />

          <MortgageInput
            label="Annual Property Taxes"
            type="currency"
            value={inputs.annualPropertyTaxes}
            onChange={(val) => setInputs({...inputs, annualPropertyTaxes: val})}
            defaultValue={5000}
          />

          <MortgageInput
            label="Annual Insurance"
            type="currency"
            value={inputs.annualInsurance}
            onChange={(val) => setInputs({...inputs, annualInsurance: val})}
            defaultValue={5000}
          />

          <MortgageInput
            label="Monthly HOA Fee"
            type="currency"
            value={inputs.monthlyHOA}
            onChange={(val) => setInputs({...inputs, monthlyHOA: val})}
            defaultValue={0}
          />

          <MortgageInput
            label="Vacancy Rate"
            type="percent"
            value={inputs.vacancyRate}
            onChange={(val) => setInputs({...inputs, vacancyRate: val})}
            defaultValue={5}
          />

          <MortgageInput
            label="Annual Repairs and Maintenance"
            type="currency"
            value={inputs.annualRepairsAndMaintenance}
            onChange={(val) => setInputs({...inputs, annualRepairsAndMaintenance: val})}
            defaultValue={5000}
          />

          <MortgageInput
            label="Loan to Value"
            type="percent"
            value={inputs.loanToValue}
            onChange={(val) => setInputs({...inputs, loanToValue: val})}
            defaultValue={75}
          />

          <MortgageInput
            label="Interest Rate"
            type="percent"
            value={inputs.interestRate}
            onChange={(val) => setInputs({...inputs, interestRate: val})}
            step="0.1"
            defaultValue={8}
          />

          <MortgageSelect
            label="Loan Term"
            value={String(inputs.loanTerm)}
            onChange={(val) => setInputs({...inputs, loanTerm: parseInt(val)})}
            options={[
              { value: '30', label: '30 years' },
              { value: '20', label: '20 years' },
              { value: '15', label: '15 years' }
            ]}
          />

          <MortgageInput
            label="Origination Fee"
            type="percent"
            value={inputs.originationFee}
            onChange={(val) => setInputs({...inputs, originationFee: val})}
            defaultValue={2}
          />

          <MortgageInput
            label="Closing Costs"
            type="currency"
            value={inputs.closingCosts}
            onChange={(val) => setInputs({...inputs, closingCosts: val})}
            defaultValue={6500}
          />
        </CardContent>
      </Card>

      {/* DSCR Results Card */}
      <Card className="h-fit" style={{
        background: 'linear-gradient(135deg, var(--brand-primary-blue) 0%, var(--brand-rich-teal) 100%)'
      }}>
        <CardHeader className="bg-black/20">
          <CardTitle className="text-white">Return Metrics</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-white">
          <div className="text-center pb-4 border-b border-white/20">
            <p className="text-sm opacity-90 mb-1">Debt-Service Coverage</p>
            <p className="text-4xl font-bold">{dscr.toFixed(2)}</p>
            <p className="text-sm opacity-75 mt-1">{dscrPercentage}%</p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Annual Net Income</span>
              <span className="font-semibold">{formatCurrency(netOperatingIncome)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">Annual Debt Service</span>
              <span className="font-semibold">{formatCurrency(annualDebtService)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="opacity-90">DSCR Ratio</span>
              <span className="font-semibold">{dscr.toFixed(2)}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-xs opacity-75 leading-relaxed">
              Great! Your DSCR of {dscr.toFixed(2)} indicates you qualify for this Conventional Loan. Your Debt-to-Income Ratio is {dscrPercentage}%, which means you're in excellent shape for most DSCR loan programs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Buydown Calculator
export function BuydownCalculator() {
  const [inputs, setInputs] = useState({
    buydownType: '2-1',
    loanAmount: 400000,
    rate: 6.75,
    loanTerm: 30
  });

  const [propertyState, setPropertyState] = useState('California');
  const [creditScore, setCreditScore] = useState('740-759');

  // Calculate monthly payments for each year
  const calculatePayment = (principal: number, rate: number, term: number) => {
    const monthlyRate = rate / 100 / 12;
    const numberOfPayments = term * 12;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  };

  const basePayment = calculatePayment(inputs.loanAmount, inputs.rate, inputs.loanTerm);

  let year1Rate = inputs.rate;
  let year2Rate = inputs.rate;
  let year3Rate = inputs.rate;

  if (inputs.buydownType === '2-1') {
    year1Rate = inputs.rate - 2;
    year2Rate = inputs.rate - 1;
  } else if (inputs.buydownType === '1-1') {
    year1Rate = inputs.rate - 1;
    year2Rate = inputs.rate - 1;
  } else if (inputs.buydownType === '3-1') {
    year1Rate = inputs.rate - 3;
    year2Rate = inputs.rate - 2;
    year3Rate = inputs.rate - 1;
  } else if (inputs.buydownType === '1-0') {
    year1Rate = inputs.rate - 1;
  }

  const year1Payment = calculatePayment(inputs.loanAmount, year1Rate, inputs.loanTerm);
  const year2Payment = calculatePayment(inputs.loanAmount, year2Rate, inputs.loanTerm);
  const year3Payment = inputs.buydownType === '3-1' ? calculatePayment(inputs.loanAmount, year3Rate, inputs.loanTerm) : basePayment;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Buydown Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-2">Temporary Buydown Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['2-1', '1-1', '3-1', '1-0'].map((type) => (
                <button
                  key={type}
                  onClick={() => setInputs({...inputs, buydownType: type})}
                  className={`px-4 py-2 rounded-lg border-2 transition ${
                    inputs.buydownType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <MortgageInput
            label="Loan Amount"
            type="currency"
            value={inputs.loanAmount}
            onChange={(val) => setInputs({...inputs, loanAmount: val})}
            defaultValue={400000}
          />

          <MortgageInput
            label="Rate"
            type="percent"
            value={inputs.rate}
            onChange={(val) => setInputs({...inputs, rate: val})}
            step="0.1"
            defaultValue={6.75}
          />

          <MortgageSelect
            label="Loan Term"
            value={String(inputs.loanTerm)}
            onChange={(val) => setInputs({...inputs, loanTerm: parseInt(val)})}
            options={[
              { value: '30', label: '30 years' },
              { value: '20', label: '20 years' },
              { value: '15', label: '15 years' }
            ]}
          />
        </CardContent>
      </Card>

      <Card className="h-fit" style={{
        background: 'linear-gradient(135deg, var(--brand-primary-blue) 0%, var(--brand-rich-teal) 100%)'
      }}>
        <CardHeader className="bg-black/20">
          <CardTitle className="text-white">{formatCurrencyWithCents(basePayment)}</CardTitle>
          <p className="text-sm text-white/80">Please contact your loan officer to see if this program works for you.</p>
        </CardHeader>
        <CardContent className="pt-6 space-y-4 text-white">
          <div className="text-center pb-4">
            <p className="text-sm opacity-90 mb-4">Estimated monthly payments for Buydown Period</p>

            {/* Payment bars visualization */}
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Year 1</span>
                  <span>{formatCurrency(year1Payment)}</span>
                </div>
                <div className="h-12 bg-green-500 rounded flex items-center justify-center">
                  <span className="font-semibold">{formatCurrency(year1Payment)}</span>
                </div>
              </div>

              {(inputs.buydownType === '2-1' || inputs.buydownType === '1-1') && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Year 2</span>
                    <span>{formatCurrency(year2Payment)}</span>
                  </div>
                  <div className="h-12 bg-green-400 rounded flex items-center justify-center">
                    <span className="font-semibold">{formatCurrency(year2Payment)}</span>
                  </div>
                </div>
              )}

              {inputs.buydownType === '3-1' && (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Year 2</span>
                      <span>{formatCurrency(year2Payment)}</span>
                    </div>
                    <div className="h-12 bg-green-400 rounded flex items-center justify-center">
                      <span className="font-semibold">{formatCurrency(year2Payment)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Year 3</span>
                      <span>{formatCurrency(year3Payment)}</span>
                    </div>
                    <div className="h-12 bg-yellow-500 rounded flex items-center justify-center">
                      <span className="font-semibold">{formatCurrency(year3Payment)}</span>
                    </div>
                  </div>
                </>
              )}

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>After</span>
                  <span>{formatCurrency(basePayment)}</span>
                </div>
                <div className="h-12 bg-gray-700 rounded flex items-center justify-center">
                  <span className="font-semibold">{formatCurrency(basePayment)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/20">
            <p className="text-xs opacity-75 leading-relaxed">
              This Buydown calculator has been made available for educational and research purposes only and calculations are based on borrower input information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Net Proceeds and Rent vs Buy calculators truncated for brevity - will add in next step
