import { useState } from 'react';
import { toast } from 'react-toastify';
import SaveResultsButton from '@/components/SaveResultsButton';
import SavedResultsSidebar from '@/components/tools/SavedResultsSidebar';

interface AffordabilityCalculatorProps {
    initialSavedResults?: any[];
}

interface AffordabilityFormData {
    grossAnnualIncome: string;
    monthlyDebtPayments: string;
    deposit: string;
    interestRate: string;
    loanTerm: string;
    councilTaxMonthly: string;
    buildingsInsuranceAnnual: string;
    otherMonthlyExpenses: string;
}

interface AffordabilityResults {
    maxHousePrice: number;
    maxLoanAmount: number;
    maxMonthlyPayment: number;
    totalMonthlyHousing: number;
    debtToIncomeRatio: number;
    housingToIncomeRatio: number;
    recommendations: string[];
}

export default function AffordabilityCalculator({ initialSavedResults }: AffordabilityCalculatorProps) {
    const [formData, setFormData] = useState<AffordabilityFormData>({
        grossAnnualIncome: '',
        monthlyDebtPayments: '',
        deposit: '',
        interestRate: '',
        loanTerm: '',
        councilTaxMonthly: '',
        buildingsInsuranceAnnual: '',
        otherMonthlyExpenses: ''
    });
    
    const [results, setResults] = useState<AffordabilityResults | null>(null);
    const [errors, setErrors] = useState<{[key: string]: string}>({});

    const handleInputChange = (field: keyof AffordabilityFormData, value: string) => {
        // Clear any existing errors for this field
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: {[key: string]: string} = {};

        if (!formData.grossAnnualIncome || parseFloat(formData.grossAnnualIncome) <= 0) {
            newErrors.grossAnnualIncome = 'Please enter a valid annual income';
        }

        if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
            newErrors.interestRate = 'Please enter a valid interest rate';
        }

        if (!formData.loanTerm || parseFloat(formData.loanTerm) <= 0) {
            newErrors.loanTerm = 'Please enter a valid loan term';
        }

        if (!formData.deposit || parseFloat(formData.deposit) < 0) {
            newErrors.deposit = 'Please enter a valid deposit amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateAffordability = () => {
        if (!validateForm()) {
            return;
        }

        const grossMonthlyIncome = parseFloat(formData.grossAnnualIncome) / 12;
        const monthlyDebts = parseFloat(formData.monthlyDebtPayments || '0');
    const deposit = parseFloat(formData.deposit);
        const interestRate = parseFloat(formData.interestRate) / 100 / 12;
        const numberOfPayments = parseFloat(formData.loanTerm) * 12;
    const monthlyCouncilTax = parseFloat(formData.councilTaxMonthly || '0');
    const monthlyInsurance = parseFloat(formData.buildingsInsuranceAnnual || '0') / 12;
        const otherExpenses = parseFloat(formData.otherMonthlyExpenses || '0');

        // Industry standard: 28% of gross income for housing, 36% for total debt
        const maxHousingPayment = grossMonthlyIncome * 0.28;
        const maxTotalDebtPayment = grossMonthlyIncome * 0.36;
        
        // Calculate available payment for mortgage after existing debts
        const availableForMortgage = Math.min(
            maxHousingPayment - monthlyCouncilTax - monthlyInsurance - otherExpenses,
            maxTotalDebtPayment - monthlyDebts - monthlyCouncilTax - monthlyInsurance - otherExpenses
        );

        // Calculate maximum loan amount based on available payment
        let maxLoanAmount = 0;
        if (availableForMortgage > 0 && interestRate > 0) {
            maxLoanAmount = availableForMortgage * (Math.pow(1 + interestRate, numberOfPayments) - 1) / 
                           (interestRate * Math.pow(1 + interestRate, numberOfPayments));
        }

    const maxHousePrice = maxLoanAmount + deposit;
    const totalMonthlyHousing = availableForMortgage + monthlyCouncilTax + monthlyInsurance + otherExpenses;
        const debtToIncomeRatio = ((monthlyDebts + totalMonthlyHousing) / grossMonthlyIncome) * 100;
        const housingToIncomeRatio = (totalMonthlyHousing / grossMonthlyIncome) * 100;

        // Generate recommendations
        const recommendations: string[] = [];
        
        if (debtToIncomeRatio > 36) {
            recommendations.push('Your debt-to-income ratio is high. Consider paying down existing debts.');
        }
        
        if (housingToIncomeRatio > 28) {
            recommendations.push('Housing costs exceed 28% of income. Consider a lower price range.');
        }
        
        if (deposit < maxHousePrice * 0.1) {
            recommendations.push('Consider increasing your deposit (e.g., 10%+ or 20%+) to reduce LTV and improve rates.');
        }
        
        if (recommendations.length === 0) {
            recommendations.push('Your finances look good for home buying!');
        }

        setResults({
            maxHousePrice,
            maxLoanAmount,
            maxMonthlyPayment: availableForMortgage,
            totalMonthlyHousing,
            debtToIncomeRatio,
            housingToIncomeRatio,
            recommendations
        });
    };

    const resetForm = () => {
        setFormData({
            grossAnnualIncome: '',
            monthlyDebtPayments: '',
            deposit: '',
            interestRate: '',
            loanTerm: '',
            councilTaxMonthly: '',
            buildingsInsuranceAnnual: '',
            otherMonthlyExpenses: ''
        });
        setResults(null);
        setErrors({});
    };

    const handleSaveComplete = (success: boolean, message: string) => {
        if (success) {
            toast.success(message);
        } else {
            toast.error(message);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                {/* Saved Results Sidebar */}
                <div className="xl:col-span-1">
                    <SavedResultsSidebar toolType="affordability" initialSavedResults={initialSavedResults} />
                </div>
                
                {/* Main Calculator */}
                <div className="xl:col-span-3">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden font-sans">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                            {/* Left Column - Input Fields */}
                            <div className="p-8 space-y-6 bg-gray-50">
                    {/* Annual Income */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Annual Income
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">£</span>
                            <input
                                type="number"
                                placeholder="60,000"
                                value={formData.grossAnnualIncome}
                                onChange={(e) => handleInputChange('grossAnnualIncome', e.target.value)}
                                className={`w-full pl-8 pr-4 py-4 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm ${
                                    errors.grossAnnualIncome ? 'ring-2 ring-red-400' : ''
                                }`}
                            />
                        </div>
                        {errors.grossAnnualIncome && (
                            <p className="text-red-500 text-xs mt-2 ml-2">{errors.grossAnnualIncome}</p>
                        )}
                    </div>

                    {/* Monthly Debts */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Monthly Debt Payments
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">£</span>
                            <input
                                type="number"
                                placeholder="500"
                                value={formData.monthlyDebtPayments}
                                onChange={(e) => handleInputChange('monthlyDebtPayments', e.target.value)}
                                className="w-full pl-8 pr-4 py-4 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Deposit */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Available Deposit
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">£</span>
                            <input
                                type="number"
                                placeholder="50,000"
                                value={formData.deposit}
                                onChange={(e) => handleInputChange('deposit', e.target.value)}
                                className={`w-full pl-8 pr-4 py-4 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm ${
                                    errors.deposit ? 'ring-2 ring-red-400' : ''
                                }`}
                            />
                        </div>
                        {errors.deposit && (
                            <p className="text-red-500 text-xs mt-2 ml-2">{errors.deposit}</p>
                        )}
                    </div>

                    {/* Interest Rate */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Interest Rate
                        </label>
                        <div className="relative">
                            <input
                                type="number"
                                step="0.01"
                                placeholder="4.25"
                                value={formData.interestRate}
                                onChange={(e) => handleInputChange('interestRate', e.target.value)}
                                className={`w-full px-4 py-4 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm ${
                                    errors.interestRate ? 'ring-2 ring-red-400' : ''
                                }`}
                            />
                            <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">%</span>
                        </div>
                        {errors.interestRate && (
                            <p className="text-red-500 text-xs mt-2 ml-2">{errors.interestRate}</p>
                        )}
                    </div>

                    {/* Loan Term */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Loan Term (years)
                        </label>
                        <input
                            type="number"
                            placeholder="25"
                            value={formData.loanTerm}
                            onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                            className={`w-full px-4 py-4 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm ${
                                errors.loanTerm ? 'ring-2 ring-red-400' : ''
                            }`}
                        />
                        {errors.loanTerm && (
                            <p className="text-red-500 text-xs mt-2 ml-2">{errors.loanTerm}</p>
                        )}
                    </div>

                    {/* Additional Costs - Simplified */}
                    <div className="pt-4 border-t border-gray-300">
                        <p className="text-xs text-gray-500 mb-4 font-medium">Optional: Additional Monthly Costs</p>
                        
                        {/* Council Tax */}
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                Council Tax (monthly)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">£</span>
                                <input
                                    type="number"
                                    placeholder="150"
                                    value={formData.councilTaxMonthly}
                                    onChange={(e) => handleInputChange('councilTaxMonthly', e.target.value)}
                                    className="w-full pl-6 pr-3 py-2 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-400 text-sm focus:bg-white focus:ring-1 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200"
                                />
                            </div>
                        </div>

                        {/* Other Expenses */}
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-2">
                                Other monthly costs
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">£</span>
                                <input
                                    type="number"
                                    placeholder="200"
                                    value={formData.otherMonthlyExpenses}
                                    onChange={(e) => handleInputChange('otherMonthlyExpenses', e.target.value)}
                                    className="w-full pl-6 pr-3 py-2 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-400 text-sm focus:bg-white focus:ring-1 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Current Results */}
                <div className="p-8 bg-white flex flex-col">
                    {/* Current Results */}
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-2xl font-bold text-gray-700">Current Results</h3>
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {results ? (
                        <div className="space-y-6">
                            {/* Maximum House Price - Main Result */}
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Maximum House Price</p>
                                <p className="text-4xl font-bold text-gray-900">
                                    £{results.maxHousePrice.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>

                            {/* Maximum Loan Amount */}
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Maximum Loan Amount</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    £{results.maxLoanAmount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>

                            {/* Monthly Payment */}
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Monthly Payment</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    £{results.maxMonthlyPayment.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>

                            {/* Financial Ratios */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Housing Ratio</span>
                                    <span className={`font-bold ${results.housingToIncomeRatio <= 28 ? 'text-green-600' : 'text-orange-600'}`}>
                                        {results.housingToIncomeRatio.toFixed(1)}%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Debt Ratio</span>
                                    <span className={`font-bold ${results.debtToIncomeRatio <= 36 ? 'text-green-600' : 'text-red-600'}`}>
                                        {results.debtToIncomeRatio.toFixed(1)}%
                                    </span>
                                </div>
                            </div>

                            {/* Explanatory text */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <span className="font-medium">Ready to calculate payments?</span> Use our{' '}
                                    <a href="/tools/mortgage-calculator" className="text-[#17B7C7] hover:underline font-medium">
                                        mortgage calculator
                                    </a> next.
                                </p>
                                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                                    Based on industry standards: 28% housing ratio and 36% total debt ratio for responsible lending.
                                </p>
                            </div>

                            {/* Save Results Button */}
                            {results && (
                                <div className="mt-6">
                                    <SaveResultsButton
                                        toolType="affordability"
                                        results={results}
                                        formData={formData}
                                        onSaveComplete={handleSaveComplete}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Maximum House Price</p>
                                <p className="text-4xl font-bold text-gray-300">£0</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Maximum Loan Amount</p>
                                <p className="text-2xl font-bold text-gray-300">£0</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Monthly Payment</p>
                                <p className="text-2xl font-bold text-gray-300">£0</p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <span className="font-medium">Ready to calculate payments?</span> Use our{' '}
                                    <a href="/tools/mortgage-calculator" className="text-[#17B7C7] hover:underline font-medium">
                                        mortgage calculator
                                    </a> next.
                                </p>
                                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                                    Enter your financial details above to discover how much house you can afford based on your income and expenses.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full-width Calculate Button */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
                <button
                    onClick={calculateAffordability}
                    className="w-full bg-[#17B7C7] text-white py-4 rounded-full font-bold text-lg hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                    Calculate
                </button>
            </div>
                    </div>
                </div>
            </div>
        </div>
    );
}