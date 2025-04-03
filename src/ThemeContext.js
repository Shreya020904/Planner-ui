import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const storedTheme = localStorage.getItem('theme') || 'light';
    const [theme, setTheme] = useState(storedTheme);
    const [isDarkMode, setIsDarkMode] = useState(storedTheme === 'dark'); // Initialize isDarkMode

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setIsDarkMode(newTheme === 'dark'); // Update isDarkMode
    };

    useEffect(() => {
        localStorage.setItem('theme', theme);
        document.body.className = theme;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode, setIsDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};