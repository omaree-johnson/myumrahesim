"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { StructuredData } from "./structured-data";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  
  // Add home as first item if not present
  const allItems = items[0]?.name === 'Home' 
    ? items 
    : [{ name: 'Home', url: '/' }, ...items];

  const structuredData = {
    items: allItems.map(item => ({
      name: item.name,
      url: item.url
    }))
  };

  return (
    <>
      <StructuredData type="breadcrumb" data={structuredData} />
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center space-x-2 text-sm ${className}`}
      >
        <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            
            return (
              <li 
                key={item.url}
                className="flex items-center"
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {index === 0 ? (
                  <Link
                    href={item.url}
                    className="flex items-center text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                    itemProp="item"
                  >
                    <Home className="w-4 h-4" />
                    <span className="sr-only" itemProp="name">{item.name}</span>
                  </Link>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-400 mx-1" />
                    {isLast ? (
                      <span 
                        className="text-gray-900 dark:text-white font-medium"
                        itemProp="name"
                      >
                        {item.name}
                      </span>
                    ) : (
                      <Link
                        href={item.url}
                        className="text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                        itemProp="item"
                      >
                        <span itemProp="name">{item.name}</span>
                      </Link>
                    )}
                  </>
                )}
                <meta itemProp="position" content={String(index + 1)} />
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

