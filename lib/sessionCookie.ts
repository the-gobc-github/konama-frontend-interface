// Session cookie management for authentication

export interface SessionData {
    id: string;
    token: string;
    refreshToken: string;
    expiresAt: string;
    refreshExpiresAt: string;
    createdAt: string;
}

export interface UserData {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    clientId: string;
    lastLoginAt: string;
}

export interface ClientData {
    id: string;
    name: string;
    slug: string;
}

export interface AuthSessionData {
    session: SessionData;
    user: UserData;
    client: ClientData;
}

const SESSION_COOKIE_NAME = 'konama-auth-session';

// Persist auth session in cookie
export const persistAuthSession = (data: AuthSessionData): void => {
    if (typeof window === 'undefined') {
        return; // Server-side, use Next.js cookies API
    }

    const sessionString = JSON.stringify(data);
    const expiresAt = new Date(data.session.refreshExpiresAt);

    document.cookie = `${SESSION_COOKIE_NAME}=${encodeURIComponent(sessionString)}; path=/; expires=${expiresAt.toUTCString()}; secure; samesite=strict`;
};

// Read auth session from cookie
export const readAuthSession = (): AuthSessionData | null => {
    if (typeof window === 'undefined') {
        return null; // Server-side handling would be done differently
    }

    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie =>
        cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`)
    );

    if (!sessionCookie) {
        return null;
    }

    try {
        const sessionValue = sessionCookie.split('=')[1];
        const sessionString = decodeURIComponent(sessionValue);
        return JSON.parse(sessionString);
    } catch (error) {
        console.error('Erreur lors de la lecture de la session:', error);
        return null;
    }
};

// Get auth tokens from session
export const getAuthTokens = (): {
    token: string;
    refreshToken: string;
} | null => {
    const session = readAuthSession();
    if (!session) {
        return null;
    }

    return {
        // Fallback to session.id if token is empty
        token: session.session.token || session.session.id,
        refreshToken: session.session.refreshToken,
    };
};

// Clear auth session cookie
export const clearAuthSession = (): void => {
    if (typeof window === 'undefined') {
        return;
    }

    document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

// Check if session is expired
export const isSessionExpired = (): boolean => {
    const session = readAuthSession();
    if (!session) {
        return true;
    }

    const now = new Date().getTime();
    const expiresAt = new Date(session.session.expiresAt).getTime();

    return now >= expiresAt;
};

// Check if refresh token is expired
export const isRefreshTokenExpired = (): boolean => {
    const session = readAuthSession();
    if (!session) {
        return true;
    }

    const now = new Date().getTime();
    const refreshExpiresAt = new Date(
        session.session.refreshExpiresAt
    ).getTime();

    return now >= refreshExpiresAt;
};

// Server-side helpers for Next.js
export const getServerAuthSession = (): AuthSessionData | null => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { cookies } = require('next/headers');
        const cookieStore = cookies();
        const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

        if (!sessionCookie?.value) {
            return null;
        }

        const sessionString = decodeURIComponent(sessionCookie.value);
        return JSON.parse(sessionString);
    } catch (error) {
        console.error(
            'Erreur lors de la lecture de la session côté serveur:',
            error
        );
        return null;
    }
};

export const clearServerAuthSession = (): void => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { cookies } = require('next/headers');
        const cookieStore = cookies();
        cookieStore.set(SESSION_COOKIE_NAME, '', {
            path: '/',
            expires: new Date(0),
            secure: true,
            sameSite: 'strict',
        });
    } catch (error) {
        console.error(
            'Erreur lors de la suppression de la session côté serveur:',
            error
        );
    }
};
