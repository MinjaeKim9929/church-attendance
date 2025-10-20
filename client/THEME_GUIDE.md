# Color Theme Guide

## Primary Color: #d1bbfa (Lavender Purple)

This theme provides a complete color system for both light and dark modes with the primary color being a soft lavender purple.

---

## 🎨 Color Palette Overview

### Primary Colors (Lavender Purple)
| Shade | Light Mode | Dark Mode | Usage |
|-------|-----------|-----------|-------|
| 50    | #f5f1fe   | #2a1f3d   | Very light backgrounds |
| 100   | #ebe3fd   | #3d2f57   | Light backgrounds |
| 200   | #d1bbfa   | #b89bf7   | Main primary color |
| 300   | #b89bf7   | #d1bbfa   | Hover states |
| 400   | #9f7af4   | #e0d1fc   | Active states |
| 500   | #8659f1   | #ebe3fd   | Strong emphasis |
| 600   | #7444d8   | #f5f1fe   | Text on light bg |

### Accent Colors (Mint Green - Complementary)
| Shade | Hex       | Usage |
|-------|-----------|-------|
| 50    | #f0fdf4   | Very light accent |
| 100   | #dcfce7   | Light accent bg |
| 200   | #bbf7d0   | Accent backgrounds |
| 300   | #86efac   | Accent elements |
| 400   | #4ade80   | Main accent |
| 500   | #22c55e   | Strong accent |
| 600   | #16a34a   | Dark accent |

### Status Colors

#### Success (Green)
- **Light Mode**: `#10b981` (emerald-500) on `#d1fae5` background
- **Dark Mode**: `#34d399` (emerald-400) on `#064e3b` background

#### Warning (Amber)
- **Light Mode**: `#f59e0b` (amber-500) on `#fef3c7` background
- **Dark Mode**: `#fbbf24` (amber-400) on `#78350f` background

#### Error (Red)
- **Light Mode**: `#ef4444` (red-500) on `#fee2e2` background
- **Dark Mode**: `#f87171` (red-400) on `#7f1d1d` background

#### Info (Blue)
- **Light Mode**: `#3b82f6` (blue-500) on `#dbeafe` background
- **Dark Mode**: `#60a5fa` (blue-400) on `#1e3a8a` background

---

## 📦 Usage Examples

### 1. Using Tailwind Classes

#### Buttons
```jsx
// Primary Button
<button className="bg-primary-200 hover:bg-primary-300 text-primary-700 dark:bg-primary-300 dark:hover:bg-primary-400 dark:text-primary-900 px-4 py-2 rounded-lg">
  Primary Button
</button>

// Accent Button
<button className="bg-accent-400 hover:bg-accent-500 text-white px-4 py-2 rounded-lg">
  Accent Button
</button>

// Success Button
<button className="bg-success-light hover:bg-success-light/80 dark:bg-success-dark dark:hover:bg-success-dark/80 text-white px-4 py-2 rounded-lg">
  Success
</button>
```

#### Cards
```jsx
// Light mode card with hover
<div className="bg-surface-light hover:bg-surface-light-hover dark:bg-surface-dark dark:hover:bg-surface-dark-hover border border-border-light dark:border-border-dark rounded-xl p-6">
  <h3 className="text-text-light-primary dark:text-text-dark-primary">Card Title</h3>
  <p className="text-text-light-secondary dark:text-text-dark-secondary">Card content</p>
</div>
```

#### Status Badges
```jsx
// Success Badge
<span className="bg-success-light-bg text-success-light-text dark:bg-success-dark-bg dark:text-success-dark-text px-3 py-1 rounded-full text-sm font-medium">
  Success
</span>

// Warning Badge
<span className="bg-warning-light-bg text-warning-light-text dark:bg-warning-dark-bg dark:text-warning-dark-text px-3 py-1 rounded-full text-sm font-medium">
  Warning
</span>

// Error Badge
<span className="bg-error-light-bg text-error-light-text dark:bg-error-dark-bg dark:text-error-dark-text px-3 py-1 rounded-full text-sm font-medium">
  Error
</span>
```

#### Input Fields
```jsx
<input
  type="text"
  className="w-full px-4 py-2 border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark text-text-light-primary dark:text-text-dark-primary rounded-lg focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-300 focus:border-primary-200 dark:focus:border-primary-300 outline-none"
  placeholder="Enter text..."
/>
```

### 2. Using CSS Variables

```css
/* Button with CSS variables */
.custom-button {
  background-color: var(--color-primary-200);
  color: var(--color-text-primary);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: var(--shadow-md);
}

.custom-button:hover {
  background-color: var(--color-primary-300);
}

/* Card with CSS variables */
.custom-card {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
}
```

### 3. Using Utility Classes (from theme.css)

```jsx
// Status badges using utility classes
<span className="badge-success">Success</span>
<span className="badge-warning">Warning</span>
<span className="badge-error">Error</span>
<span className="badge-info">Info</span>

// Primary colored elements
<div className="bg-primary text-primary border-primary">
  Primary colored element
</div>

// Accent colored elements
<div className="bg-accent text-accent">
  Accent colored element
</div>
```

---

## 🌓 Dark Mode Implementation

### Enable Dark Mode

Add the `dark` class to your root element (usually `<html>` or `<body>`):

```javascript
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Enable dark mode
document.documentElement.classList.add('dark');

// Disable dark mode
document.documentElement.classList.remove('dark');
```

### React Hook for Dark Mode

```javascript
import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check localStorage or system preference
    const darkMode = localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);

    setIsDark(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDark;
    setIsDark(newMode);
    localStorage.setItem('darkMode', newMode.toString());

    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return { isDark, toggleDarkMode };
}
```

---

## 🎯 Best Practices

### 1. Consistent Color Usage
- **Primary**: Use for main actions, links, and brand elements
- **Accent**: Use sparingly for highlights and secondary actions
- **Status Colors**: Use only for their intended purpose (success, warning, error, info)

### 2. Contrast Ratios
- Ensure text has sufficient contrast (WCAG AA: 4.5:1 for normal text, 3:1 for large text)
- Primary color works best with white or very dark text
- Test all combinations in both light and dark modes

### 3. Hover & Active States
```jsx
// Always provide visual feedback
<button className="bg-primary-200 hover:bg-primary-300 active:bg-primary-400 transition-colors">
  Click me
</button>
```

### 4. Focus States
```jsx
// Always add focus states for accessibility
<button className="focus:ring-2 focus:ring-primary-200 dark:focus:ring-primary-300 focus:outline-none">
  Accessible Button
</button>
```

---

## 📋 Color Combination Examples

### High Contrast Combinations

#### Light Mode
- **Text on Primary**: `text-primary-900` on `bg-primary-200`
- **Primary on Background**: `bg-primary-200` on `bg-white`
- **Accent on Primary**: `bg-accent-400` on `bg-primary-100`

#### Dark Mode
- **Text on Primary**: `text-primary-50` on `bg-primary-300`
- **Primary on Background**: `bg-primary-300` on `bg-slate-900`
- **Accent on Primary**: `bg-accent-300` on `bg-primary-100`

---

## 🚀 Quick Start

1. **Import theme.css** in your main file:
```javascript
import './theme.css';
```

2. **Use Tailwind classes** or CSS variables:
```jsx
// Tailwind
<div className="bg-primary-200 text-primary-700">
  Lavender Purple Box
</div>

// CSS Variables
<div style={{
  backgroundColor: 'var(--color-primary-200)',
  color: 'var(--color-text-primary)'
}}>
  Lavender Purple Box
</div>
```

3. **Enable dark mode support**:
```javascript
// Add dark class to root element
document.documentElement.classList.add('dark');
```

---

## 🎨 Visual Preview

### Primary Color Scale
```
Light Mode:  ▓▓▓░░░░░░░ (darker → lighter)
Dark Mode:   ░░░░░░▓▓▓ (lighter → darker)
```

### Color Harmony
- **Primary**: Lavender Purple (#d1bbfa) - Main brand color
- **Accent**: Mint Green (#4ade80) - Complementary contrast
- **Success**: Emerald Green - Positive actions
- **Warning**: Amber - Caution states
- **Error**: Red - Destructive actions
- **Info**: Blue - Informational content

---

## 📝 Notes

- All colors are optimized for both light and dark modes
- Colors automatically adjust when `dark` class is applied
- WCAG AA compliant color combinations are marked in examples
- Use `transition-colors` for smooth color changes
