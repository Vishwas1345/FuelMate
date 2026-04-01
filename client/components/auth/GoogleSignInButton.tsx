import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const OAUTH_MESSAGE = 'fuelmate-oauth';
const POPUP_NAME = 'fuelmateGoogleOAuth';

interface GoogleSignInButtonProps {
    text?: string;
    className?: string;
}

const popupErrorMessage = (code: string): string => {
    const labels: Record<string, string> = {
        oauth_error: 'Google sign-in failed. Please try again.',
        oauth_failed: 'Google sign-in was cancelled or failed.',
        oauth_not_configured: 'Google sign-in is not configured on this server.',
        no_token: 'No sign-in token received.',
    };
    return labels[code] || 'Please try again.';
};

const GoogleSignInButton = ({
    text = 'Continue with Google',
    className = ''
}: GoogleSignInButtonProps) => {
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        const onMessage = (event: MessageEvent) => {
            if (event.origin !== window.location.origin) return;
            const data = event.data;
            if (!data || data.type !== OAUTH_MESSAGE) return;

            if (data.error) {
                toast({
                    title: 'Sign-in failed',
                    description: popupErrorMessage(String(data.error)),
                    variant: 'destructive',
                });
                return;
            }

            if (typeof data.token === 'string' && data.token.length > 0) {
                navigate(`/auth/callback?token=${encodeURIComponent(data.token)}`, { replace: true });
            }
        };

        window.addEventListener('message', onMessage);
        return () => window.removeEventListener('message', onMessage);
    }, [navigate, toast]);

    const handleGoogleSignIn = useCallback(async () => {
        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL;

            const response = await fetch(`${backendUrl}/api/auth/google`, {
                method: 'GET',
                redirect: 'manual',
            });

            if (response.headers.get('content-type')?.includes('application/json')) {
                toast({
                    title: 'Google Sign-In Unavailable',
                    description: 'Google OAuth is not configured on this server. Please use email/password login or contact support.',
                    variant: 'destructive',
                });
                return;
            }

            const w = 520;
            const h = 640;
            const left = window.screenX + Math.max(0, (window.outerWidth - w) / 2);
            const top = window.screenY + Math.max(0, (window.outerHeight - h) / 2);
            const features = [
                `popup=yes`,
                `width=${w}`,
                `height=${h}`,
                `left=${Math.round(left)}`,
                `top=${Math.round(top)}`,
                'scrollbars=yes',
                'resizable=yes',
                'noreferrer',
            ].join(',');

            const popup = window.open(
                `${backendUrl}/api/auth/google`,
                POPUP_NAME,
                features
            );

            if (!popup) {
                toast({
                    title: 'Popup blocked',
                    description: 'Allow popups for this site to sign in with Google in a separate window.',
                    variant: 'destructive',
                });
                return;
            }

            popup.focus();
        } catch (error) {
            console.error('Google Sign-In error:', error);
            toast({
                title: 'Connection Error',
                description: 'Unable to connect to authentication server. Please try again.',
                variant: 'destructive',
            });
        }
    }, [toast]);

    return (
        <Button
            type="button"
            className={`w-full bg-white text-slate-900 border border-slate-200 hover:border-orange-500 hover:bg-slate-50 transition-all duration-300 ${className}`}
            onClick={handleGoogleSignIn}
        >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {text}
        </Button>
    );
};

export default GoogleSignInButton;
