// API routes for authentication endpoints

import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { config } from '@/lib/config';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Email et mot de passe requis',
                    error: 'Email and password are required',
                    code: 'MISSING_CREDENTIALS',
                },
                { status: 400 }
            );
        }

        console.log('=== LOGIN REQUEST ===');
        console.log('📧 Email:', email);
        console.log('🕒 Timestamp:', new Date().toISOString());
        console.log('🔗 URL:', `${config.authApiUrl}/auth/login`);

        // Forward login request to the auth service
        const authResponse = await axios.post(
            `${config.authApiUrl}/auth/login`,
            {
                email,
                password,
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        console.log('📊 Auth service response status:', authResponse.status);
        console.log(
            '✅ Login successful for user:',
            authResponse.data.data?.user?.email
        );

        // Return the response in the expected format
        return NextResponse.json(authResponse.data, {
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    } catch (error) {
        console.error('Login proxy error:', error);

        if (axios.isAxiosError(error) && error.response) {
            // Return error response in the expected format
            const errorData = error.response.data || {};
            return NextResponse.json(
                {
                    success: false,
                    message: errorData.message || 'Échec de la connexion',
                    error: errorData.message || 'Login failed',
                    code: errorData.code || 'LOGIN_FAILED',
                    details: errorData.details,
                },
                { status: error.response.status }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Erreur interne du serveur',
                error: 'Failed to process login request',
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
