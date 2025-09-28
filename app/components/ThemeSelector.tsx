import {useTheme, type Theme} from '../utils/useTheme';
import {Button} from '@headlessui/react';
import {
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import {useState} from 'react';

const themeOptions = [
  {value: 'light' as Theme, label: 'Mode clar', icon: SunIcon},
  {value: 'dark' as Theme, label: 'Mode fosc', icon: MoonIcon},
  {value: 'system' as Theme, label: 'Segons sistema', icon: ComputerDesktopIcon},
];

export function ThemeSelector() {
  const {theme, setTheme} = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const currentTheme = themeOptions.find(option => option.value === theme) || themeOptions[1];

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex w-full items-center justify-between gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
      >
        <div className="flex items-center gap-2">
          <currentTheme.icon className="h-4 w-4" />
          <span>{currentTheme.label}</span>
        </div>
        <ChevronDownIcon
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border border-white/20 bg-white/10 backdrop-blur shadow-lg z-50">
          <div className="py-1">
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  setTheme(option.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition hover:bg-white/10 ${
                  theme === option.value
                    ? 'text-sky-300 bg-white/5'
                    : 'text-white/70'
                }`}
              >
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
