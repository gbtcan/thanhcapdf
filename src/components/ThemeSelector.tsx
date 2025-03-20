import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme, ThemeType } from '../contexts/ThemeContext';

interface ThemeButtonProps {
  current: boolean;
  value: ThemeType;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const ThemeButton: React.FC<ThemeButtonProps> = ({ current, value, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center p-2 rounded-md ${
      current ? 'bg-indigo-100 text-indigo-800 dark:bg-slate-700 dark:text-indigo-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-slate-700'
    }`}
    title={`Switch to ${label} theme`}
    aria-label={`Switch to ${label} theme`}
    aria-pressed={current}
  >
    {icon}
  </button>
);

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="flex items-center space-x-1 rounded-lg border border-gray-200 p-1 dark:border-slate-700">
      <ThemeButton
        current={theme === 'light'}
        value="light"
        onClick={() => setTheme('light')}
        icon={<Sun className="h-4 w-4" />}
        label="Light"
      />
      <ThemeButton
        current={theme === 'dark'}
        value="dark"
        onClick={() => setTheme('dark')}
        icon={<Moon className="h-4 w-4" />}
        label="Dark"
      />
      <ThemeButton
        current={theme === 'system'}
        value="system"
        onClick={() => setTheme('system')}
        icon={<Monitor className="h-4 w-4" />}
        label="System"
      />
    </div>
  );
};

export default ThemeSelector;
