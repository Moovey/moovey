import { useState } from 'react';
import { router } from '@inertiajs/react';

interface SaveResultsButtonProps {
    toolType: 'mortgage' | 'affordability' | 'volume' | 'school-catchment';
    results: any;
    formData: any;
    onSaveComplete?: (success: boolean, message: string) => void;
    className?: string;
}

export default function SaveResultsButton({ 
    toolType, 
    results, 
    formData, 
    onSaveComplete,
    className = ""
}: SaveResultsButtonProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveName, setSaveName] = useState('');

    const handleSaveResults = async () => {
        if (!saveName.trim()) {
            alert('Please enter a name for your saved calculation');
            return;
        }

        setIsSaving(true);

        try {
            const saveData = {
                name: saveName.trim(),
                tool_type: toolType,
                form_data: formData,
                results: results,
                calculated_at: new Date().toISOString()
            };

            router.post('/saved-results', saveData, {
                preserveScroll: true,
                onSuccess: () => {
                    setShowSaveDialog(false);
                    setSaveName('');
                    onSaveComplete?.(true, 'Results saved successfully!');
                },
                onError: (errors) => {
                    console.error('Save failed:', errors);
                    onSaveComplete?.(false, 'Failed to save results. Please try again.');
                },
                onFinish: () => {
                    setIsSaving(false);
                }
            });
        } catch (error) {
            console.error('Save error:', error);
            setIsSaving(false);
            onSaveComplete?.(false, 'Failed to save results. Please try again.');
        }
    };

    if (!results) {
        return null;
    }

    return (
        <>
            <button
                onClick={() => setShowSaveDialog(true)}
                className={`flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm ${className}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save Results
            </button>

            {/* Save Dialog Modal */}
            {showSaveDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Save Calculation Results
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Name for this calculation
                            </label>
                            <input
                                type="text"
                                value={saveName}
                                onChange={(e) => setSaveName(e.target.value)}
                                placeholder="e.g., My Dream House Calculation"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#17B7C7] focus:border-[#17B7C7] outline-none text-gray-900 placeholder-gray-500 bg-white"
                                maxLength={100}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                {saveName.length}/100 characters
                            </p>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                            <p className="text-sm text-gray-600">
                                <strong>Tool:</strong> {toolType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} Calculator
                            </p>
                            <p className="text-sm text-gray-600">
                                <strong>Date:</strong> {new Date().toLocaleDateString()}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowSaveDialog(false);
                                    setSaveName('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveResults}
                                disabled={isSaving || !saveName.trim()}
                                className="flex-1 px-4 py-2 bg-[#17B7C7] text-white rounded-lg hover:bg-[#139AAA] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : (
                                    'Save'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}