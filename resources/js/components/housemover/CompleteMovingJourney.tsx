import React from 'react';

export interface MoveSection {
    id: number;
    name: string;
    shortName: string;
    description: string;
    icon: string;
}

interface CompleteMovingJourneyProps {
    title?: string;
    subtitle?: string;
    overallProgress: number;
    moveSections: MoveSection[];
    activeSection: number;
    onSectionClick: (id: number) => void;
    getSectionProgress: (id: number) => number;
    /**
     * Returns a tailwind background color class based on progress. Provided by parent
     * so logic stays with existing page implementation.
     */
    getProgressColor: (progress: number) => string;
    className?: string;
}

/**
 * Reusable progress timeline for the 9-stage moving journey.
 * Visual only – all logic (progress calculation, active section state) lives in parent.
 */
const CompleteMovingJourney: React.FC<CompleteMovingJourneyProps> = ({
    title = 'My House Move Progress',
    subtitle = 'Track your progress through every stage of your move',
    overallProgress,
    moveSections,
    activeSection,
    onSectionClick,
    getSectionProgress,
    getProgressColor,
    className = ''
}) => {
    return (
        <div className={`bg-white rounded-xl shadow-lg p-8 mb-8 ${className}`}>            
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-[#1A237E] mb-2">{title}</h1>
                    {subtitle && <p className="text-gray-600">{subtitle}</p>}
                </div>
                <div className="text-right bg-[#E0F7FA] rounded-xl p-4 shadow-sm">
                    <div className="text-3xl font-bold text-[#1A237E]">{overallProgress}%</div>
                    <div className="text-sm font-medium text-gray-600">Overall Progress</div>
                </div>
            </div>

            <div className="relative mb-8">
                <div className="absolute top-8 left-0 right-0 h-3 bg-gray-200 rounded-full">
                    <div className="h-full bg-[#00BCD4] rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
                </div>
                <div className="flex justify-between items-start relative z-10">
                    {moveSections.map(section => (
                        <div
                            key={section.id}
                            className="flex flex-col items-center cursor-pointer group"
                            onClick={() => onSectionClick(section.id)}
                        >
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transition-all duration-300 group-hover:scale-110 ${
                                    activeSection === section.id
                                        ? 'bg-[#00BCD4] ring-4 ring-[#E0F7FA]'
                                        : getProgressColor(getSectionProgress(section.id))
                                }`}
                            >
                                {section.icon}
                            </div>
                            <div className="mt-3 text-center max-w-20">
                                <div className="text-xs text-gray-600 font-medium mb-1">{section.shortName}</div>
                                <div className="text-xs text-gray-500">{getSectionProgress(section.id)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CompleteMovingJourney;
