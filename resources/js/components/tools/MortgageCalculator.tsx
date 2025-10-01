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
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 md:p-8 border border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Amount (£)
                    </label>
                    <input
                        type="number"
                        placeholder="250000"
                        value={formData.loanAmount}
                        onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white ${
                            errors.loanAmount ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.loanAmount && (
                        <p className="text-red-500 text-xs mt-1">{errors.loanAmount}</p>
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
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Down Payment (£) <span className="text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="number"
                        placeholder="50000"
                        value={formData.downPayment}
                        onChange={(e) => handleInputChange('downPayment', e.target.value)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none transition-colors text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-white ${
                            errors.downPayment ? 'border-red-500' : 'border-gray-300'
                        }`}
                    />
                    {errors.downPayment && (
                        <p className="text-red-500 text-xs mt-1">{errors.downPayment}</p>
                    )}
                </div>
            </div>

            <div className="text-center">
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={calculateMortgage}
                        className="bg-[#17B7C7] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-[#139AAA] transition-colors text-sm sm:text-base"
                    >
                        Calculate
                    </button>
                    
                    <button
                        onClick={resetForm}
                        className="border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-sm sm:text-base"
                    >
                        Reset
                    </button>

                    {results && (
                        <SaveResultsButton
                            toolType="mortgage"
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

                {results && (
                    <div className="mt-6 sm:mt-8 space-y-4">
                        {/* Main monthly payment result */}
                        <div className="p-4 sm:p-6 bg-white rounded-lg border-2 border-[#17B7C7] shadow-md">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Monthly Payment</h3>
                            <p className="text-2xl sm:text-3xl font-bold text-[#17B7C7]">
                                £{results.monthlyPayment.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>

                        {/* Additional calculation details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Property Price</h4>
                                <p className="text-lg font-bold text-gray-900">
                                    £{results.propertyPrice.toLocaleString('en-GB')}
                                </p>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Total Interest</h4>
                                <p className="text-lg font-bold text-orange-600">
                                    £{results.totalInterest.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                            
                            <div className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="text-sm font-semibold text-gray-700 mb-1">Total Amount</h4>
                                <p className="text-lg font-bold text-gray-900">
                                    £{results.totalAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                            </div>
                        </div>

                        {/* Loan to Value ratio */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="text-sm font-semibold text-gray-700">Loan-to-Value Ratio</h4>
                                <span className="text-lg font-bold text-blue-600">
                                    {results.loanToValue.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                                    style={{ width: `${Math.min(results.loanToValue, 100)}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                                {results.loanToValue > 80 ? 'High LTV - PMI may be required' : 'Good LTV ratio'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}