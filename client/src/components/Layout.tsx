'use client';
import React from 'react';
import { Toaster } from '@/components/ui/sonner';
import Header from './Header';
import { ThemeProvider } from '../components/theme-provider';

interface Props {
    children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <Header />
            {children}
            <Toaster position="top-center" />
        </ThemeProvider>
    );
};

export default Layout;
