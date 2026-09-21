import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export const ThemeToggle: React.FC<{ showLabel?: boolean }> = ({ showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className="btn btn-secondary btn-sm"
      title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: showLabel ? '6px 12px' : '6px 8px',
        borderRadius: 'var(--radius-full)',
        transition: 'all var(--transition-fast)',
      }}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={15} color="#f59e0b" style={{ transition: 'transform 0.3s' }} />
      ) : (
        <Moon size={15} color="#3b82f6" style={{ transition: 'transform 0.3s' }} />
      )}
      {showLabel && (
        <span className="theme-toggle-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </span>
      )}
    </button>
  );
};
