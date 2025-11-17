import React from 'react';
import { Link } from '@inertiajs/react';

interface BreadcrumbItem {
    name: string;
    href?: string;
    current?: boolean;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({ items }) => {
    // Generate structured data for breadcrumbs
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.href ? `https://moovey.com${item.href}` : undefined
        }))
    };

    return (
        <>
            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>
            
            {/* Visual Breadcrumb */}
            <nav aria-label="Breadcrumb" className="flex" itemScope itemType="https://schema.org/BreadcrumbList">
                <ol className="flex items-center space-x-2 text-sm">
                    {items.map((item, index) => (
                        <li key={index} className="flex items-center" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            {item.href && !item.current ? (
                                <Link 
                                    href={item.href}
                                    className="text-gray-500 hover:text-gray-700 transition-colors"
                                    itemProp="item"
                                >
                                    <span itemProp="name">{item.name}</span>
                                </Link>
                            ) : (
                                <span 
                                    className={item.current ? "text-gray-900 font-medium" : "text-gray-500"}
                                    itemProp="name"
                                >
                                    {item.name}
                                </span>
                            )}
                            <meta itemProp="position" content={String(index + 1)} />
                            {index < items.length - 1 && (
                                <svg 
                                    className="ml-2 h-4 w-4 text-gray-400" 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                    aria-hidden="true"
                                >
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
};

export default Breadcrumb;