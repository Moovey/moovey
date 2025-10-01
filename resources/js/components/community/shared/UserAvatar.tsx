interface UserAvatarProps {
    userId?: string | number;
    userName: string;
    avatar?: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge';
    clickable?: boolean;
    className?: string;
}

export default function UserAvatar({
    userId,
    userName,
    avatar,
    size = 'medium',
    clickable = true,
    className = '',
}: UserAvatarProps) {
    const sizeClasses = {
        small: 'w-6 h-6',
        medium: 'w-8 h-8',
        large: 'w-12 h-12',
        xlarge: 'w-32 h-32',
    };

    const sizePixels = {
        small: 24,
        medium: 32,
        large: 48,
        xlarge: 128,
    };

    const handleClick = () => {
        if (clickable && userId) {
            window.location.href = `/user/${userId}`;
        }
    };

    const baseClasses = `
        ${sizeClasses[size]} 
        bg-[#17B7C7] 
        rounded-full 
        flex 
        items-center 
        justify-center 
        shadow-md 
        overflow-hidden 
        flex-shrink-0
        ${clickable && userId ? 'hover:shadow-lg transition-shadow cursor-pointer' : ''}
        ${className}
    `;

    const Component = clickable && userId ? 'button' : 'div';

    return (
        <Component 
            onClick={clickable && userId ? handleClick : undefined}
            className={baseClasses}
        >
            {avatar ? (
                <img
                    src={`/storage/${avatar}`}
                    alt={`${userName}'s avatar`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=17B7C7&color=white&size=${sizePixels[size]}`;
                    }}
                />
            ) : (
                <img
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=17B7C7&color=white&size=${sizePixels[size]}`}
                    alt={`${userName}'s avatar`}
                    className="w-full h-full object-cover"
                />
            )}
        </Component>
    );
}