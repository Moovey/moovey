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
    getSectionIcon: (iconName: string, iconSize?: string) => React.ReactElement | null;
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
    getSectionIcon,
    className = ''
}) => {

    return (
        <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6 lg:mb-8 ${className}`}>            
            {/* Mobile Layout */}
            <div className="block sm:hidden">
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold text-[#1A237E] mb-2">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-600 mb-4">{subtitle}</p>}
                    <div className="inline-block bg-[#E0F7FA] rounded-xl p-3 shadow-sm">
                        <div className="text-2xl font-bold text-[#1A237E]">{overallProgress}%</div>
                        <div className="text-xs font-medium text-gray-600">Overall Progress</div>
                    </div>
                </div>

                {/* Mobile Progress Bar */}
                <div className="relative mb-6">
                    <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-full bg-[#00BCD4] rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
                    </div>
                </div>

                {/* Mobile Sections - 3x3 Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {moveSections.map(section => (
                        <div
                            key={section.id}
                            className="flex flex-col items-center cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                            onClick={() => onSectionClick(section.id)}
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md transition-all duration-300 group-hover:scale-105 ${
                                    getSectionProgress(section.id) > 0
                                        ? (activeSection === section.id
                                            ? 'bg-[#00BCD4] ring-2 ring-[#E0F7FA]'
                                            : getProgressColor(getSectionProgress(section.id)))
                                        : 'bg-gray-400'
                                }`}
                            >
                                {getSectionIcon(section.icon, "w-3 h-3")}
                            </div>
                            <div className="mt-2 text-center">
                                <div className="text-xs text-gray-600 font-medium mb-1 leading-tight">{section.shortName}</div>
                                <div className="text-xs text-gray-500 font-semibold">{getSectionProgress(section.id)}%</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tablet Layout */}
            <div className="hidden sm:block lg:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                    <div className="text-center sm:text-left">
                        <h1 className="text-2xl font-bold text-[#1A237E] mb-2">{title}</h1>
                        {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                    </div>
                    <div className="text-center bg-[#E0F7FA] rounded-xl p-3 shadow-sm">
                        <div className="text-2xl font-bold text-[#1A237E]">{overallProgress}%</div>
                        <div className="text-xs font-medium text-gray-600">Overall Progress</div>
                    </div>
                </div>

                {/* Tablet Progress Timeline */}
                <div className="relative mb-6">
                    <div className="absolute top-6 left-0 right-0 h-2 bg-gray-200 rounded-full">
                        <div className="h-full bg-[#00BCD4] rounded-full transition-all duration-1000" style={{ width: `${overallProgress}%` }} />
                    </div>
                    <div className="flex justify-between items-start relative z-10 overflow-x-auto pb-2">
                        {moveSections.map(section => (
                            <div
                                key={section.id}
                                className="flex flex-col items-center cursor-pointer group min-w-0 flex-shrink-0"
                                onClick={() => onSectionClick(section.id)}
                            >
                                <div
                                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-base shadow-lg transition-all duration-300 group-hover:scale-110 ${
                                        getSectionProgress(section.id) > 0
                                            ? (activeSection === section.id
                                                ? 'bg-[#00BCD4] ring-3 ring-[#E0F7FA]'
                                                : getProgressColor(getSectionProgress(section.id)))
                                            : 'bg-gray-400'
                                    }`}
                                >
                                    {getSectionIcon(section.icon, "w-4 h-4")}
                                </div>
                                <div className="mt-2 text-center max-w-16">
                                    <div className="text-xs text-gray-600 font-medium mb-1 leading-tight">{section.shortName}</div>
                                    <div className="text-xs text-gray-500 font-semibold">{getSectionProgress(section.id)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Desktop & Large Screen Layout */}
            <div className="hidden lg:block">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl xl:text-4xl font-bold text-[#1A237E] mb-2">{title}</h1>
                        {subtitle && <p className="text-base xl:text-lg text-gray-600">{subtitle}</p>}
                    </div>
                    <div className="text-right bg-[#E0F7FA] rounded-xl p-4 xl:p-5 shadow-sm">
                        <div className="text-3xl xl:text-4xl font-bold text-[#1A237E]">{overallProgress}%</div>
                        <div className="text-sm xl:text-base font-medium text-gray-600">Overall Progress</div>
                    </div>
                </div>

                {/* Desktop Progress Timeline */}
                <div className="relative mb-8">
                    <div className="absolute top-8 xl:top-10 left-0 right-0 h-3 xl:h-4 bg-gray-200 rounded-full">
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
                                    className={`w-16 h-16 xl:w-20 xl:h-20 rounded-full flex items-center justify-center text-white font-bold text-lg xl:text-xl shadow-lg transition-all duration-300 group-hover:scale-110 ${
                                        getSectionProgress(section.id) > 0
                                            ? (activeSection === section.id
                                                ? 'bg-[#00BCD4] ring-4 ring-[#E0F7FA]'
                                                : getProgressColor(getSectionProgress(section.id)))
                                            : 'bg-gray-400'
                                    }`}
                                >
                                    {getSectionIcon(section.icon, "w-5 h-5 xl:w-6 xl:h-6")}
                                </div>
                                <div className="mt-3 xl:mt-4 text-center max-w-20 xl:max-w-24">
                                    <div className="text-xs xl:text-sm text-gray-600 font-medium mb-1">{section.shortName}</div>
                                    <div className="text-xs xl:text-sm text-gray-500 font-semibold">{getSectionProgress(section.id)}%</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompleteMovingJourney;
