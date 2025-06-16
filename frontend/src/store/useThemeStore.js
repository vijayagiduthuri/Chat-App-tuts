import { create } from "zustand";

// Get initial theme from localStorage
const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        // Check both possible localStorage keys for compatibility
        const savedTheme = localStorage.getItem("theme") || localStorage.getItem("chat-theme");
        return savedTheme || "light"; // Default to light instead of coffee
    }
    return "light";
};

// Apply theme to document
const applyTheme = (theme) => {
    if (typeof document !== 'undefined') {
        // Apply DaisyUI theme
        document.documentElement.setAttribute('data-theme', theme);
        
        // Apply Tailwind dark mode classes
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        console.log('Theme applied to document:', theme);
        console.log('Document theme attribute:', document.documentElement.getAttribute('data-theme'));
        console.log('Document classes:', document.documentElement.className);
    }
};

export const useThemeStore = create((set, get) => {
    const initialTheme = getInitialTheme();
    
    // Apply initial theme immediately
    applyTheme(initialTheme);
    
    return {
        theme: initialTheme,
        setTheme: (theme) => {
            console.log('Setting theme to:', theme);
            if (typeof window !== 'undefined') {
                // Save to both localStorage keys for compatibility
                localStorage.setItem("theme", theme);
                localStorage.setItem("chat-theme", theme);
            }
            set({ theme });
            applyTheme(theme);
        },
        
        // Helper method to toggle between light and dark
        toggleTheme: () => {
            const currentTheme = get().theme;
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            get().setTheme(newTheme);
            return newTheme;
        }
    };
});