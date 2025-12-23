// API route for token refresh

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { config } from '@/lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { refreshToken } = body;

        if (!refreshToken) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Token de rafraîchissement requis',
                    error: 'Refresh token is required',
                    code: 'MISSING_REFRESH_TOKEN',
                },
                { status: 400 }
            );
        }

        console.log('=== TOKEN REFRESH REQUEST ===');
        console.log('🔄 Refresh token provided:', !!refreshToken);
        console.log('🕒 Timestamp:', new Date().toISOString());
        console.log('🔗 URL:', `${config.authApiUrl}/auth/refresh`);

        // Forward refresh request to the auth service
        const authResponse = await axios.post(
            `${config.authApiUrl}/auth/refresh`,
            {
                refreshToken,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('📊 Auth service response status:', authResponse.status);
        console.log('✅ Token refresh successful');

        return NextResponse.json(authResponse.data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Refresh proxy error:', error);

        if (axios.isAxiosError(error) && error.response) {
            const errorData = error.response.data || {};
            return NextResponse.json(
                {
                    success: false,
                    message:
                        errorData.message ||
                        'Échec du rafraîchissement du token',
                    error: errorData.message || 'Token refresh failed',
                    code: errorData.code || 'REFRESH_FAILED',
                    details: errorData.details,
                },
                { status: error.response.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Erreur interne du serveur',
                error: 'Failed to process refresh request',
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
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
