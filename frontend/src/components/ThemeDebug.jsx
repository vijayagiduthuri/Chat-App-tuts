import { useThemeStore } from "../store/useThemeStore";
import { useEffect, useState } from "react";

const ThemeDebug = () => {
    const { theme } = useThemeStore();
    const [documentTheme, setDocumentTheme] = useState('');
    const [computedStyles, setComputedStyles] = useState({});

    useEffect(() => {
        // Check what theme is actually applied to the document
        const actualTheme = document.documentElement.getAttribute('data-theme');
        setDocumentTheme(actualTheme);

        // Get computed CSS variables to see if theme is working
        const root = document.documentElement;
        const styles = getComputedStyle(root);
        setComputedStyles({
            primary: styles.getPropertyValue('--p'),
            secondary: styles.getPropertyValue('--s'),
            accent: styles.getPropertyValue('--a'),
            neutral: styles.getPropertyValue('--n'),
            base100: styles.getPropertyValue('--b1'),
            base200: styles.getPropertyValue('--b2'),
            base300: styles.getPropertyValue('--b3'),
        });
    }, [theme]);

    return (
        <div className="fixed bottom-4 right-4 p-4 bg-base-200 rounded-lg shadow-lg text-xs max-w-xs">
            <h4 className="font-bold mb-2">Theme Debug</h4>
            <div className="space-y-1">
                <div>Store Theme: <span className="font-mono">{theme}</span></div>
                <div>Document Theme: <span className="font-mono">{documentTheme}</span></div>
                <div className="mt-2">
                    <div className="text-xs font-semibold">CSS Variables:</div>
                    <div className="grid grid-cols-2 gap-1 text-xs">
                        <div>Primary: {computedStyles.primary}</div>
                        <div>Secondary: {computedStyles.secondary}</div>
                        <div>Accent: {computedStyles.accent}</div>
                        <div>Neutral: {computedStyles.neutral}</div>
                        <div>Base-100: {computedStyles.base100}</div>
                        <div>Base-200: {computedStyles.base200}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeDebug;