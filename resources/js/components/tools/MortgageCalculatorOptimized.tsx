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

    // Removed current rates query as users should research their own rates

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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Loan Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loan Amount (£)
                    </label>
                    <input
                        type="number"
                        value={formData.loanAmount}
                        onChange={(e) => handleInputChange('loanAmount', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#17B7C7] text-gray-900 ${
                            errors.loanAmount ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 400,000"
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
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#17B7C7] text-gray-900 ${
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
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#17B7C7] text-gray-900 ${
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
                        Down Payment (£) - Optional
                    </label>
                    <input
                        type="number"
                        value={formData.downPayment}
                        onChange={(e) => handleInputChange('downPayment', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#17B7C7] text-gray-900 ${
                            errors.downPayment ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder="e.g., 80,000"
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
                                £{(results?.monthlyPayment || calculationResults?.monthlyPayment || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Total Interest</p>
                            <p className="text-2xl font-bold text-gray-900">
                                £{(results?.totalInterest || calculationResults?.totalInterest || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900">
                                £{(results?.totalAmount || calculationResults?.totalAmount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <p className="text-sm text-gray-600 mb-1">Property Price</p>
                            <p className="text-lg font-semibold text-gray-900">
                                £{(results?.propertyPrice || calculationResults?.propertyPrice || 0).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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

            {/* Important Disclaimer */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-amber-800 mb-2">⚠️ Important Disclaimer:</h5>
                <p className="text-sm text-amber-700 mb-3">
                    This calculator is for illustration purposes only and does not constitute financial advice. 
                    Mortgage calculations are estimates and actual terms may vary based on your individual 
                    circumstances, credit history, and lender requirements. You should always seek professional 
                    advice from a qualified mortgage advisor before making any financial decisions.
                </p>
                <p className="text-sm text-amber-700">
                    Interest rates, fees, and lending criteria can change frequently and vary between lenders.
                </p>
            </div>

            {/* Connect with Mortgage Advisors CTA */}
            <div className="bg-gradient-to-r from-[#17B7C7] to-[#1A237E] rounded-lg p-6 text-center">
                <h5 className="font-semibold text-white mb-2">Need Professional Mortgage Advice?</h5>
                <p className="text-white/90 text-sm mb-4">
                    Connect with qualified mortgage advisors in your area who can help you find the best deals 
                    and guide you through the entire mortgage process.
                </p>
                <button 
                    onClick={() => {
                        // This could be updated to navigate to a mortgage advisors section
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                        // TODO: Implement navigation to mortgage advisors section
                        alert('Mortgage advisors section coming soon! This will connect you with local mortgage professionals.');
                    }}
                    className="bg-white text-[#17B7C7] font-medium px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#17B7C7]"
                >
                    Find Mortgage Advisors Near Me
                </button>
            </div>
        </div>
    );
});

export default MortgageCalculator;