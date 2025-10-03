import { useState } from 'react';
import SaveResultsButton from '@/components/SaveResultsButton';

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

export default function AffordabilityCalculator() {
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
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

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
        setSaveMessage(null);
    };

    const handleSaveComplete = (success: boolean, message: string) => {
        setSaveMessage({
            type: success ? 'success' : 'error',
            text: message
        });
        
        // Clear message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
    };

    return (
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
            {/* Income & Debt Information */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Income & Debt Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Gross Annual Income (£)
                        </label>
                        <input
                            type="number"
                            placeholder="60000"
                            value={formData.grossAnnualIncome}
                            onChange={(e) => handleInputChange('grossAnnualIncome', e.target.value)}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white ${
                                errors.grossAnnualIncome ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.grossAnnualIncome && (
                            <p className="text-red-500 text-xs mt-1">{errors.grossAnnualIncome}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monthly Debt Payments (£) <span className="text-gray-500 font-normal">(Credit cards, loans, etc.)</span>
                        </label>
                        <input
                            type="number"
                            placeholder="500"
                            value={formData.monthlyDebtPayments}
                            onChange={(e) => handleInputChange('monthlyDebtPayments', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Mortgage Information */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Mortgage Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Deposit (£)
                        </label>
                        <input
                            type="number"
                            placeholder="50000"
                            value={formData.deposit}
                            onChange={(e) => handleInputChange('deposit', e.target.value)}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white ${
                                errors.deposit ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.deposit && (
                            <p className="text-red-500 text-xs mt-1">{errors.deposit}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interest Rate (%)
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            placeholder="4.25"
                            value={formData.interestRate}
                            onChange={(e) => handleInputChange('interestRate', e.target.value)}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white ${
                                errors.interestRate ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.interestRate && (
                            <p className="text-red-500 text-xs mt-1">{errors.interestRate}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Loan Term (Years)
                        </label>
                        <input
                            type="number"
                            placeholder="25"
                            value={formData.loanTerm}
                            onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                            className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white ${
                                errors.loanTerm ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.loanTerm && (
                            <p className="text-red-500 text-xs mt-1">{errors.loanTerm}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Additional Costs (UK-specific) */}
            <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Housing Costs <span className="text-gray-500 font-normal text-sm">(Optional)</span></h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Council Tax (Monthly) (£)
                        </label>
                        <input
                            type="number"
                            placeholder="150"
                            value={formData.councilTaxMonthly}
                            onChange={(e) => handleInputChange('councilTaxMonthly', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Buildings Insurance (Annual) (£)
                        </label>
                        <input
                            type="number"
                            placeholder="200"
                            value={formData.buildingsInsuranceAnnual}
                            onChange={(e) => handleInputChange('buildingsInsuranceAnnual', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Other Monthly Expenses (£)
                        </label>
                        <input
                            type="number"
                            placeholder="200"
                            value={formData.otherMonthlyExpenses}
                            onChange={(e) => handleInputChange('otherMonthlyExpenses', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white"
                        />
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center mb-6">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={calculateAffordability}
                        className="bg-[#17B7C7] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors text-sm sm:text-base"
                    >
                        Calculate Affordability
                    </button>
                    
                    <button
                        onClick={resetForm}
                        className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                        Reset
                    </button>

                    {results && (
                        <SaveResultsButton
                            toolType="affordability"
                            results={results}
                            formData={formData}
                            onSaveComplete={handleSaveComplete}
                        />
                    )}
                </div>

                {/* Save Message */}
                {saveMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${
                        saveMessage.type === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                        {saveMessage.text}
                    </div>
                )}
            </div>

            {/* Results */}
            {results && (
                <div className="space-y-6">
                    {/* Main affordability result */}
                    <div className="p-4 sm:p-6 bg-white rounded-lg border-2 border-[#17B7C7] shadow-md">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Maximum House Price</h3>
                        <p className="text-2xl sm:text-3xl font-bold text-[#17B7C7] mb-2">
                            £{results.maxHousePrice.toLocaleString('en-GB')}
                        </p>
                        <p className="text-sm text-gray-600">
                            Based on {Math.round(results.housingToIncomeRatio)}% housing-to-income ratio
                        </p>
                    </div>

                    {/* Financial breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Maximum Loan Amount</h4>
                            <p className="text-lg font-bold text-gray-900">
                                £{results.maxLoanAmount.toLocaleString('en-GB')}
                            </p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Max Monthly Payment</h4>
                            <p className="text-lg font-bold text-gray-900">
                                £{results.maxMonthlyPayment.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="text-sm font-semibold text-gray-700 mb-1">Total Housing Costs</h4>
                            <p className="text-lg font-bold text-gray-900">
                                £{results.totalMonthlyHousing.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Financial ratios */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Housing-to-Income Ratio</h4>
                                <span className={`text-lg font-bold ${results.housingToIncomeRatio <= 28 ? 'text-green-600' : 'text-orange-600'}`}>
                                    {results.housingToIncomeRatio.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${results.housingToIncomeRatio <= 28 ? 'bg-green-600' : 'bg-orange-600'}`}
                                    style={{ width: `${Math.min(results.housingToIncomeRatio, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                {results.housingToIncomeRatio <= 28 ? 'Good ratio' : 'Recommended: ≤28%'}
                            </p>
                        </div>

                        <div className="p-4 bg-purple-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Debt-to-Income Ratio</h4>
                                <span className={`text-lg font-bold ${results.debtToIncomeRatio <= 36 ? 'text-green-600' : 'text-red-600'}`}>
                                    {results.debtToIncomeRatio.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-500 ${results.debtToIncomeRatio <= 36 ? 'bg-green-600' : 'bg-red-600'}`}
                                    style={{ width: `${Math.min(results.debtToIncomeRatio, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                {results.debtToIncomeRatio <= 36 ? 'Good ratio' : 'Recommended: ≤36%'}
                            </p>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="p-4 sm:p-6 bg-amber-50 rounded-lg border border-amber-200">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">💡 Recommendations</h4>
                        <ul className="space-y-2">
                            {results.recommendations.map((recommendation, index) => (
                                <li key={index} className="flex items-start">
                                    <span className="text-amber-600 mr-2">•</span>
                                    <span className="text-gray-700">{recommendation}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}