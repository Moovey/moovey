import { useState, useEffect, useRef, useCallback } from 'react';

interface LocationSuggestion {
    display_name: string;
    value: string;
    type: string;
}

interface LocationAutocompleteProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    onHide?: () => void;
}

export default function LocationAutocomplete({
    value,
    onChange,
    placeholder = "📍 Add location (optional)",
    disabled = false,
    className = "",
    onHide
}: LocationAutocompleteProps) {
    const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    
    const inputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search function
    const debouncedSearch = useCallback(
        (searchQuery: string) => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }

            debounceTimeoutRef.current = setTimeout(async () => {
                if (searchQuery.trim().length < 2) {
                    setSuggestions([]);
                    setShowSuggestions(false);
                    return;
                }

                setIsLoading(true);
                try {
                    const response = await fetch(`/api/locations/search?q=${encodeURIComponent(searchQuery)}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'same-origin',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && Array.isArray(data.suggestions)) {
                            setSuggestions(data.suggestions);
                            setShowSuggestions(data.suggestions.length > 0);
                            setActiveSuggestionIndex(-1);
                        } else {
                            setSuggestions([]);
                            setShowSuggestions(false);
                        }
                    } else {
                        console.error('Location search failed:', response.status);
                        setSuggestions([]);
                        setShowSuggestions(false);
                    }
                } catch (error) {
                    console.error('Location search error:', error);
                    setSuggestions([]);
                    setShowSuggestions(false);
                } finally {
                    setIsLoading(false);
                }
            }, 300); // 300ms debounce
        },
        []
    );

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange(newValue);
        debouncedSearch(newValue);
    };

    // Handle suggestion selection
    const handleSuggestionClick = (suggestion: LocationSuggestion) => {
        onChange(suggestion.value);
        setShowSuggestions(false);
        setSuggestions([]);
        setActiveSuggestionIndex(-1);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveSuggestionIndex(prev => 
                    prev < suggestions.length - 1 ? prev + 1 : prev
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveSuggestionIndex(prev => 
                    prev > 0 ? prev - 1 : prev
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (activeSuggestionIndex >= 0 && activeSuggestionIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[activeSuggestionIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setActiveSuggestionIndex(-1);
                break;
        }
    };

    // Handle input focus
    const handleInputFocus = () => {
        if (value.trim().length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                inputRef.current &&
                suggestionsRef.current &&
                !inputRef.current.contains(event.target as Node) &&
                !suggestionsRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false);
                setActiveSuggestionIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) {
                clearTimeout(debounceTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="relative">
            <div className="flex items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleInputFocus}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 text-sm sm:text-base ${className}`}
                    autoComplete="off"
                />
                {onHide && (
                    <button
                        type="button"
                        onClick={onHide}
                        className="px-3 py-2 text-gray-500 hover:text-gray-700 text-sm"
                        title="Hide location"
                        aria-label="Hide location"
                    >
                        ×
                    </button>
                )}
            </div>
            
            {/* Loading indicator */}
            {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
            )}

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <button
                            key={`${suggestion.value}-${index}`}
                            type="button"
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors ${
                                index === activeSuggestionIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                            }`}
                            onClick={() => handleSuggestionClick(suggestion)}
                            onMouseEnter={() => setActiveSuggestionIndex(index)}
                        >
                            <div className="flex items-center space-x-2">
                                <svg 
                                    className="w-4 h-4 text-gray-400" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                >
                                    <path 
                                        fillRule="evenodd" 
                                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" 
                                        clipRule="evenodd" 
                                    />
                                </svg>
                                <span className="text-sm sm:text-base">{suggestion.display_name}</span>
                            </div>
                        </button>
                    ))}
                </div>
            )}
            
            {/* No results message */}
            {showSuggestions && suggestions.length === 0 && !isLoading && value.trim().length >= 2 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                >
                    <div className="px-4 py-3 text-gray-500 text-sm">
                        No locations found for "{value}"
                    </div>
                </div>
            )}
        </div>
    );
}