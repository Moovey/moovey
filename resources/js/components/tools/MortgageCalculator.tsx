import { useState } from 'react';
import SaveResultsButton from '@/components/SaveResultsButton';

interface MortgageCalculatorProps {
    // Props can be added if needed for external state management
}

interface FormData {
    loanAmount: string;
    interestRate: string;
    loanTerm: string;
    downPayment: string;
}

interface CalculationResults {
    monthlyPayment: number;
    totalInterest: number;
    totalAmount: number;
    propertyPrice: number;
    loanToValue: number;
}

export default function MortgageCalculator({}: MortgageCalculatorProps) {
    const [formData, setFormData] = useState<FormData>({
        loanAmount: '',
        interestRate: '',
        loanTerm: '',
        downPayment: ''
    });
    const [results, setResults] = useState<CalculationResults | null>(null);
    const [errors, setErrors] = useState<{[key: string]: string}>({});
    const [saveMessage, setSaveMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const handleInputChange = (field: keyof FormData, value: string) => {
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

        if (!formData.loanAmount || parseFloat(formData.loanAmount) <= 0) {
            newErrors.loanAmount = 'Please enter a valid loan amount';
        }

        if (!formData.interestRate || parseFloat(formData.interestRate) < 0) {
            newErrors.interestRate = 'Please enter a valid interest rate';
        }

        if (!formData.loanTerm || parseFloat(formData.loanTerm) <= 0) {
            newErrors.loanTerm = 'Please enter a valid loan term';
        }

        const downPayment = parseFloat(formData.downPayment || '0');
        const loanAmount = parseFloat(formData.loanAmount || '0');
        
        if (downPayment >= loanAmount) {
            newErrors.downPayment = 'Down payment must be less than loan amount';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculateMortgage = () => {
        if (!validateForm()) {
            return;
        }

        const loanAmount = parseFloat(formData.loanAmount);
        const downPayment = parseFloat(formData.downPayment || '0');
        const principal = loanAmount - downPayment;
        const monthlyRate = parseFloat(formData.interestRate) / 100 / 12;
        const numberOfPayments = parseFloat(formData.loanTerm) * 12;

        if (principal > 0 && monthlyRate > 0 && numberOfPayments > 0) {
            const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                                 (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
            
            const totalAmount = monthlyPayment * numberOfPayments;
            const totalInterest = totalAmount - principal;
            const propertyPrice = loanAmount;
            const loanToValue = (principal / propertyPrice) * 100;

            setResults({
                monthlyPayment,
                totalInterest,
                totalAmount,
                propertyPrice,
                loanToValue
            });
        }
    };

    const resetForm = () => {
        setFormData({
            loanAmount: '',
            interestRate: '',
            loanTerm: '',
            downPayment: ''
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
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Left Column - Input Fields */}
                <div className="p-8 space-y-6 bg-gray-50">
                    {/* Loan Amount */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Loan Amount
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">£</span>
                            <input
                                type="number"
                                placeholder="250,000"
                                value={formData.loanAmount}
                                onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                                className={`w-full pl-8 pr-4 py-4 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm ${
                                    errors.loanAmount ? 'ring-2 ring-red-400' : ''
                                }`}
                            />
                        </div>
                        {errors.loanAmount && (
                            <p className="text-red-500 text-xs mt-2 ml-2">{errors.loanAmount}</p>
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

                    {/* Down Payment */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Down Payment
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">£</span>
                            <input
                                type="number"
                                placeholder="50,000"
                                value={formData.downPayment}
                                onChange={(e) => handleInputChange('downPayment', e.target.value)}
                                className={`w-full pl-8 pr-4 py-4 bg-gray-200 border-0 rounded-full text-gray-900 placeholder-gray-500 font-medium focus:bg-white focus:ring-2 focus:ring-[#17B7C7] focus:outline-none transition-all duration-200 shadow-sm ${
                                    errors.downPayment ? 'ring-2 ring-red-400' : ''
                                }`}
                            />
                        </div>
                        {errors.downPayment && (
                            <p className="text-red-500 text-xs mt-2 ml-2">{errors.downPayment}</p>
                        )}
                    </div>
                </div>

                {/* Right Column - Results */}
                <div className="p-8 bg-white flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-2xl font-bold text-gray-700">Results</h3>
                        <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>

                    {results ? (
                        <div className="space-y-6">
                            {/* Monthly Payment - Main Result */}
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Monthly Payment</p>
                                <p className="text-4xl font-bold text-gray-900">
                                    £{results.monthlyPayment.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>

                            {/* Total Interest */}
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Total Interest</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    £{results.totalInterest.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>

                            {/* Total Payment */}
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Total Payment</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    £{results.totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                </p>
                            </div>

                            {/* Explanatory text */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <span className="font-medium">Planning your home purchase?</span> You might also want to check out our{' '}
                                    <a href="/tools/affordability-calculator" className="text-[#17B7C7] hover:underline font-medium">
                                        affordability calculator
                                    </a>.
                                </p>
                                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                                    It can help you determine the maximum loan amount based on your income, monthly expenses, and financial obligations to ensure you stay within your budget.
                                </p>
                            </div>

                            {/* Save Results Button */}
                            {results && (
                                <div className="mt-6">
                                    <SaveResultsButton
                                        toolType="mortgage"
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
                                <p className="text-sm font-semibold text-gray-600 mb-2">Monthly Payment</p>
                                <p className="text-4xl font-bold text-gray-300">£0</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Total Interest</p>
                                <p className="text-2xl font-bold text-gray-300">£0</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 mb-2">Total Payment</p>
                                <p className="text-2xl font-bold text-gray-300">£0</p>
                            </div>
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    <span className="font-medium">Planning your home purchase?</span> You might also want to check out our{' '}
                                    <a href="/tools/affordability-calculator" className="text-[#17B7C7] hover:underline font-medium">
                                        affordability calculator
                                    </a>.
                                </p>
                                <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                                    Enter your loan details above to calculate your monthly mortgage payment and see the total cost breakdown.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Full-width Calculate Button */}
            <div className="p-6 bg-gray-50 border-t border-gray-200">
                <button
                    onClick={calculateMortgage}
                    className="w-full bg-[#17B7C7] text-white py-4 rounded-full font-bold text-lg hover:bg-[#139AAA] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                >
                    Calculate
                </button>

                {/* Save Message */}
                {saveMessage && (
                    <div className={`mt-4 p-3 rounded-lg text-sm text-center ${
                        saveMessage.type === 'success' 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                    }`}>
                        {saveMessage.text}
                    </div>
                )}
            </div>
        </div>
    );
}