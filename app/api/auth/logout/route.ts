// API route for logout

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { config } from '@/lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authorization = request.headers.get('Authorization');
        const token = authorization?.replace('Bearer ', '');

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Token d'authentification requis",
                    error: 'Authorization token is required',
                    code: 'MISSING_TOKEN',
                },
                { status: 401 }
            );
        }

        console.log('=== LOGOUT REQUEST ===');
        console.log('🚪 Logout request received');
        console.log('🕒 Timestamp:', new Date().toISOString());
        console.log('🔗 URL:', `${config.authApiUrl}/auth/logout`);

        // Forward logout request to the auth service with Bearer token
        const authResponse = await axios.post(
            `${config.authApiUrl}/auth/logout`,
            {},
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log('📊 Auth service response status:', authResponse.status);
        console.log('✅ Logout successful');

        return NextResponse.json(authResponse.data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            },
        });
    } catch (error) {
        console.error('Logout proxy error:', error);

        if (axios.isAxiosError(error) && error.response) {
            const errorData = error.response.data || {};
            return NextResponse.json(
                {
                    success: false,
                    message: errorData.message || 'Échec de la déconnexion',
                    error: errorData.message || 'Logout failed',
                    code: errorData.code || 'LOGOUT_FAILED',
                    details: errorData.details,
                },
                { status: error.response.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Erreur interne du serveur',
                error: 'Failed to process logout request',
                code: 'PROXY_ERROR',
                details: error instanceof Error ? error.message : String(error),
            },
            { status: 500 }
        );
    }
}

// Handle preflight OPTIONS requests
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
