// Import the new modular WelcomeLayout component
import WelcomeLayout from '@/components/welcome/WelcomeLayout';

/**
 * WelcomeLayoutTest - Refactored to use modular components
 * 
 * This component now serves as a simple wrapper around the new
 * modular WelcomeLayout component which contains all the logic
 * and sections broken down into reusable components.
 */
export default function WelcomeLayoutTest() {
    return <WelcomeLayout />;
}