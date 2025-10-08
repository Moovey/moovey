import { memo, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToolStatePersistence } from '@/hooks/use-tool-state-persistence';
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

interface MortgageState {
    formData: FormData;
    results: CalculationResults | null;
    errors: {[key: string]: string};
    saveMessage: {type: 'success' | 'error', text: string} | null;
}

const initialState: MortgageState = {
    formData: {
        loanAmount: '',
        interestRate: '',
        loanTerm: '',
        downPayment: ''
    },
    results: null,
    errors: {},
    saveMessage: null
};

// Memoized calculation function
const calculateMortgagePayment = (formData: FormData): CalculationResults | null => {
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

        return {
            monthlyPayment,
            totalInterest,
            totalAmount,
            propertyPrice,
            loanToValue
        };
    }

    return null;
};

const MortgageCalculator = memo(function MortgageCalculator({}: MortgageCalculatorProps) {
    // Persistent state management
    const [state, setState, clearSavedState] = useToolStatePersistence<MortgageState>({
        key: 'mortgage-calculator',
        initialState,
        debounceMs: 300 // Save state after 300ms of inactivity
    });

    const { formData, results, errors, saveMessage } = state;

    // Query for real-time mortgage rates (cached for 5 minutes)
    const { data: currentRates } = useQuery({
        queryKey: ['mortgage-rates'],
        queryFn: async () => {
            // Simulate API call for current mortgage rates
            await new Promise(resolve => setTimeout(resolve, 1000));
            return {
                conventional30: 7.2,
                conventional15: 6.8,
                fha30: 6.9,
                va30: 6.7
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    // Memoized validation function
    const validateForm = useCallback((): {[key: string]: string} => {
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

        return newErrors;
    }, [formData]);

    // Optimized input change handler
    const handleInputChange = useCallback((field: keyof FormData, value: string) => {
        setState(prevState => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                [field]: value
            },
            errors: {
                ...prevState.errors,
                [field]: '' // Clear error for this field
            }
        }));
    }, [setState]);

    // Memoized calculation results
    const calculationResults = useMemo(() => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            return null;
        }
        return calculateMortgagePayment(formData);
    }, [formData, validateForm]);

    // Calculate mortgage mutation
    const calculateMutation = useMutation({
        mutationFn: async () => {
            const validationErrors = validateForm();
            if (Object.keys(validationErrors).length > 0) {
                setState(prevState => ({
                    ...prevState,
                    errors: validationErrors
                }));
                throw new Error('Validation failed');
            }

            const results = calculateMortgagePayment(formData);
            if (!results) {
                throw new Error('Calculation failed');
            }

            return results;
        },
        onSuccess: (results) => {
            setState(prevState => ({
                ...prevState,
                results,
                errors: {}
            }));
        },
        onError: () => {
            setState(prevState => ({
                ...prevState,
                results: null
            }));
        }
    });

    const handleCalculate = useCallback(() => {
        calculateMutation.mutate();
    }, [calculateMutation]);

    const clearForm = useCallback(() => {
        clearSavedState();
    }, [clearSavedState]);

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Mortgage Payment Calculator
                </h3>
                <p className="text-gray-600">
                    Calculate your monthly mortgage payments based on loan amount, interest rate, and term.
                </p>
                
                {/* Current rates display */}
                {currentRates && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm text-blue-800 mb-2">Current Average Rates:</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                            <div>30-yr Fixed: {currentRates.conventional30}%</div>
                            <div>15-yr Fixed: {currentRates.conventional15}%</div>
                            <div>FHA 30-yr: {currentRates.fha30}%</div>
                            <div>VA 30-yr: {currentRates.va30}%</div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Amount ($)
                    </label>
                    <input
                        type="number"
                        value={formData.loanAmount}
                        onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#17B7C7] ${
                            errors.loanAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 400000"
                    />
                    {errors.loanAmount && (
                        <p className="mt-1 text-sm text-red-600">{errors.loanAmount}</p>
                    )}
                </div>

                {/* Interest Rate */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interest Rate (% per year)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.interestRate}
                        onChange={(e) => handleInputChange('interestRate', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#17B7C7] ${
                            errors.interestRate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 6.5"
                    />
                    {errors.interestRate && (
                        <p className="mt-1 text-sm text-red-600">{errors.interestRate}</p>
                    )}
                </div>

                {/* Loan Term */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Term (years)
                    </label>
                    <select
                        value={formData.loanTerm}
                        onChange={(e) => handleInputChange('loanTerm', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#17B7C7] ${
                            errors.loanTerm ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                    >
                        <option value="">Select term</option>
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="25">25 years</option>
                        <option value="30">30 years</option>
                    </select>
                    {errors.loanTerm && (
                        <p className="mt-1 text-sm text-red-600">{errors.loanTerm}</p>
                    )}
                </div>

                {/* Down Payment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Down Payment ($) - Optional
                    </label>
                    <input
                        type="number"
                        value={formData.downPayment}
                        onChange={(e) => handleInputChange('downPayment', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#17B7C7] ${
                            errors.downPayment ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 80000"
                    />
                    {errors.downPayment && (
                        <p className="mt-1 text-sm text-red-600">{errors.downPayment}</p>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
                <button
                    onClick={handleCalculate}
                    disabled={calculateMutation.isPending}
                    className="px-6 py-3 bg-[#17B7C7] text-white font-medium rounded-lg shadow-sm hover:bg-[#149AA6] focus:outline-none focus:ring-2 focus:ring-[#17B7C7] focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {calculateMutation.isPending ? 'Calculating...' : 'Calculate Payment'}
                </button>
                
                <button
                    onClick={clearForm}
                    className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                    Clear Form
                </button>
            </div>

            {/* Results */}
            {(results || calculationResults) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h4 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Your Mortgage Calculation Results
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Monthly Payment</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${(results?.monthlyPayment || calculationResults?.monthlyPayment || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${(results?.totalInterest || calculationResults?.totalInterest || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                                ${(results?.totalAmount || calculationResults?.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Property Price</p>
                            <p className="text-lg font-semibold text-gray-900">
                                ${(results?.propertyPrice || calculationResults?.propertyPrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Loan-to-Value Ratio</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {(results?.loanToValue || calculationResults?.loanToValue || 0).toFixed(1)}%
                            </p>
                        </div>
                    </div>

                    {/* Save Results Button */}
                    <div className="mt-6">
                        <SaveResultsButton 
                            toolType="mortgage"
                            results={results || calculationResults}
                            formData={formData}
                            onSaveComplete={(success: boolean, message: string) => {
                                setState(prev => ({ 
                                    ...prev, 
                                    saveMessage: { 
                                        type: success ? 'success' : 'error', 
                                        text: message 
                                    } 
                                }));
                            }}
                        />
                        
                        {saveMessage && (
                            <div className={`mt-3 p-3 rounded-lg ${
                                saveMessage.type === 'success' 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                                {saveMessage.text}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-2">💡 Tips for Better Mortgage Planning:</h5>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• A 20% down payment helps you avoid PMI (Private Mortgage Insurance)</li>
                    <li>• Shorter loan terms mean less interest paid over time</li>
                    <li>• Consider your debt-to-income ratio when determining affordability</li>
                    <li>• Factor in property taxes, insurance, and maintenance costs</li>
                </ul>
            </div>
        </div>
    );
});

export default MortgageCalculator;