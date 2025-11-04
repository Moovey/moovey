import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="bg-white rounded-md p-2 flex items-center justify-center">
                <img 
                    src="/images/moovey-logo.png" 
                    alt="Moovey Logo" 
                    className="h-10 w-auto"
                />
            </div>
        </>
    );
}
