import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface NavSection {
  title: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string | number;
  badgeColor?: string;
}

interface SidebarNavigationProps {
  sections: NavSection[];
}

const SidebarNavigation: React.FC<SidebarNavigationProps> = ({ sections }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(
    sections.map(section => section.title)
  );
  
  // Toggle section expansion
  const toggleSection = (title: string) => {
    setExpandedSections(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title) 
        : [...prev, title]
    );
  };

  return (
    <nav className="space-y-1">
      {sections.map((section) => {
        const isExpanded = expandedSections.includes(section.title);
        
        return (
          <div key={section.title} className="mb-4">
            <button
              onClick={() => toggleSection(section.title)}
              className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-900 dark:text-white rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <span>{section.title}</span>
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              )}
            </button>
            
            {isExpanded && (
              <div className="mt-1 pl-3 space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center px-3 py-2 text-sm rounded-md ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300'
                          : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                      }`
                    }
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                    
                    {/* Badge if present */}
                    {item.badge && (
                      <span
                        className={`ml-auto inline-block py-0.5 px-2 text-xs rounded-full ${
                          item.badgeColor || 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};

export default SidebarNavigation;
