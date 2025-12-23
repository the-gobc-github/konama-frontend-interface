// Authenticated layout wrapper with user profile

'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ProtectedRoute from '@/components/ProtectedRoute';
import Image from 'next/image';
import Link from 'next/link';
// import { usePathname } from 'next/navigation';

interface AuthenticatedLayoutProps {
    children: ReactNode;
}

export default function AuthenticatedLayout({
    children,
}: AuthenticatedLayoutProps) {
    const { logout, user } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    // Navigation items (currently unused but kept for future reference)
    // const navItems = [
    //     { href: '/', label: 'Studio', icon: '🎨' },
    //     { href: '/images', label: 'Images', icon: '🖼️' },
    //     { href: '/workflow-api-example', label: 'API', icon: '⚡' },
    //     { href: '/diagnostic', label: 'Diagnostic', icon: '🔍' },
    // ];

    return (
        <ProtectedRoute>
            {/* Header with Logo and Logout */}
            <div className="bg-gradient-to-br from-gray-950 via-gray-900 to-black backdrop-blur-sm border-b border-gray-700/50 sticky top-0 z-40">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo and Title */}
                        <div className="flex items-center gap-3">
                            <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                <Image
                                    src="/images/fuzdi_white.png"
                                    alt="Fuzdi Logo"
                                    width={80}
                                    height={40}
                                    className="h-10"
                                />
                                <h1 className="text-2xl font-bold text-white tracking-tight">
                                    STUDIO
                                </h1>
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center gap-6">
                            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
                                Studio
                            </Link>
                            <Link href="/comfy" className="text-sm font-medium text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                Comfy Instances
                            </Link>
                        </div>
                        <div className="flex items-center gap-4">
                            {user && (
                                <div className="text-sm text-gray-300">
                                    {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}` 
                                        : user.email.split('@')[0]
                                    }
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white backdrop-blur-xl border border-white/10 hover:border-white/20 rounded-full transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg hover:shadow-white/5 active:scale-[0.98] overflow-hidden"
                            >
                                {/* Subtle gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                
                                {/* Icon */}
                                <svg
                                    className="w-4 h-4 relative z-10 transition-transform duration-200 group-hover:rotate-12"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    />
                                </svg>
                                
                                {/* Text */}
                                <span className="relative z-10 font-medium text-sm tracking-wide">
                                    Logout
                                </span>
                                
                                {/* Highlight shine effect */}
                                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {children}
        </ProtectedRoute>
    );
}
