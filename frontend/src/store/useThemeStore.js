import { create } from "zustand";

// Get initial theme from localStorage
const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        const savedTheme = localStorage.getItem("chat-theme");
        return savedTheme || "coffee";
    }
    return "coffee";
};

// Apply theme to document
const applyTheme = (theme) => {
    if (typeof document !== 'undefined') {
        // Remove any existing theme attributes
        const existingTheme = document.documentElement.getAttribute('data-theme');
        if (existingTheme) {
            document.documentElement.removeAttribute('data-theme');
        }
        
        // Apply new theme
        document.documentElement.setAttribute('data-theme', theme);
        
        // Force a reflow to ensure the theme is applied
        document.documentElement.offsetHeight;
        
        console.log('Theme applied to document:', theme);
        console.log('Document theme attribute:', document.documentElement.getAttribute('data-theme'));
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
                localStorage.setItem("chat-theme", theme);
            }
            set({ theme });
            applyTheme(theme);
        }
    };
});