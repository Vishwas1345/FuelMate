import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
    const navigate = useNavigate();
    const { setUser, setIsAuthenticated, getOrders } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const token = params.get('token');
                const errorParam = params.get('error');

                if (errorParam) {
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage(
                            { type: 'fuelmate-oauth', error: errorParam },
                            window.location.origin
                        );
                        window.close();
                        return;
                    }
                    setError(getErrorMessage(errorParam));
                    setTimeout(() => navigate('/auth'), 3000);
                    return;
                }

                if (!token) {
                    if (window.opener && !window.opener.closed) {
                        window.opener.postMessage(
                            { type: 'fuelmate-oauth', error: 'no_token' },
                            window.location.origin
                        );
                        window.close();
                        return;
                    }
                    setError('No authentication token received');
                    setTimeout(() => navigate('/auth'), 3000);
                    return;
                }

                /* Popup OAuth: hand off to opener and close (main window finishes sign-in) */
                if (window.opener && !window.opener.closed) {
                    window.opener.postMessage(
                        { type: 'fuelmate-oauth', token },
                        window.location.origin
                    );
                    window.close();
                    return;
                }

                // Store the access token; refresh token is handled as an HTTP-only cookie by the server
                localStorage.setItem('token', token);

                // Fetch user profile
                const response = await fetch(
                    `${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const userData = await response.json();

                // Update auth context
                if (setUser) {
                    setUser(userData.user || userData);
                }
                if (setIsAuthenticated) {
                    setIsAuthenticated(true);
                }

                // Fetch user orders upon successful login
                if (getOrders) {
                    getOrders().catch(err => console.error('Failed to fetch orders upon OAuth callback:', err));
                }

                // Redirect based on profile completion
                const userObj = userData.user || userData;

                const userId = userObj?._id || userObj?.id;
                const onboardingSeenKey = userId ? `fuelmate:onboardingSeen:${userId}` : null;
                const hasSeenOnboarding = onboardingSeenKey ? localStorage.getItem(onboardingSeenKey) === '1' : false;
                const isProfileComplete = Boolean(userObj?.isProfileComplete);

                // OAuth callback can represent either sign-in or sign-up.
                // Show onboarding ONLY the first time for a new (incomplete) user.
                if (!isProfileComplete && !hasSeenOnboarding) {
                    navigate('/onboarding');
                    return;
                }

                if (userObj.role === 'station') {
                    navigate('/station');
                } else {
                    navigate('/dashboard');
                }
            } catch (error) {
                console.error('OAuth callback error:', error);
                setError('Authentication failed. Please try again.');
                setTimeout(() => navigate('/auth'), 3000);
            }
        };

        handleCallback();
    }, [navigate, setUser, setIsAuthenticated, getOrders]);

    const getErrorMessage = (errorCode: string): string => {
        const errorMessages: Record<string, string> = {
            'oauth_error': 'Authentication error occurred',
            'oauth_failed': 'Authentication failed',
            'oauth_not_configured': 'Google sign-in is not available on this server',
            'no_token': 'No authentication token received',
            'profile_fetch_failed': 'Failed to fetch user profile'
        };
        return errorMessages[errorCode] || 'An unknown error occurred';
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="text-center">
                {error ? (
                    <div className="space-y-4">
                        <div className="text-red-500 text-6xl mb-4">✕</div>
                        <h2 className="text-2xl font-bold text-white">Authentication Failed</h2>
                        <p className="text-slate-400">{error}</p>
                        <p className="text-sm text-slate-500">Redirecting to login...</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <Loader2 className="h-12 w-12 text-orange-500 animate-spin mx-auto" />
                        <h2 className="text-2xl font-bold text-white">Completing Sign In</h2>
                        <p className="text-slate-400">Please wait while we set up your account...</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthCallback;
