import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Platform,
    RefreshControl,
    SafeAreaView,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { useClerk, useAuth } from '@clerk/clerk-expo';
import Header from './components/Header';
import {
    parseWebViewMessage,
    getTokenInjectionScript,
    getLogoutHandlerScript,
    getConsoleLogCaptureScript,
} from '@/lib/webview-bridge';

const ADMIN_DASHBOARD_URL = process.env.EXPO_PUBLIC_ADMIN_DASHBOARD_URL || 'https://cosmix-admin.vercel.app';
const SALON_DASHBOARD_PATH = process.env.EXPO_PUBLIC_SALON_DASHBOARD_PATH || '/';
const ADMIN_API_KEY = process.env.EXPO_PUBLIC_ADMIN_API_KEY || 'dev-admin-key-change-me';

export default function AdminWebViewScreen() {
    const router = useRouter();
    const webViewRef = useRef<WebView | null>(null);
    const finalUrlRef = useRef<string | null>(null);
    const { signOut } = useClerk();
    const { getToken, isSignedIn } = useAuth();
    const [authToken, setAuthToken] = useState<string | null>(null);
    const [dashboardPath, setDashboardPath] = useState<string>('/');
    const [finalUrl, setFinalUrl] = useState<string | null>(null);
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
    const [hasCheckedAdmin, setHasCheckedAdmin] = useState(false);

    // Construct and validate dashboard URL - ensure it has a protocol
    const ensureProtocol = (url: string) => {
        if (!url) return 'https://cosmix-admin.vercel.app';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    // Use ref to prevent URL changes from causing reloads
    const dashboardUrl = finalUrl || (ensureProtocol(ADMIN_DASHBOARD_URL) + dashboardPath);

    // Check admin status and set path accordingly (only once per user)
    React.useEffect(() => {
        // Prevent multiple checks for the SAME user
        if (hasCheckedAdmin || !isSignedIn) {
            if (!isSignedIn && !hasCheckedAdmin) {
                setIsCheckingAdmin(false);
            }
            return;
        }

        const checkAdminStatus = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    console.log('[ADMIN_WEBVIEW] No Clerk token found, defaulting to SALON_DASHBOARD_PATH');
                    const baseUrl = ensureProtocol(ADMIN_DASHBOARD_URL);
                    const fullUrl = baseUrl + SALON_DASHBOARD_PATH;
                    finalUrlRef.current = fullUrl;
                    setFinalUrl(fullUrl);
                    setDashboardPath(SALON_DASHBOARD_PATH);
                    console.log('[ADMIN_WEBVIEW] Set final URL to (no token):', fullUrl);
                    hasLoadedRef.current = false;
                    hasSuccessfullyLoadedRef.current = false;
                    currentUrlRef.current = null;
                    visitedUrlsRef.current = [];
                    redirectCountRef.current = 0;
                    isInRedirectLoopRef.current = false;
                    setIsCheckingAdmin(false);
                    setHasCheckedAdmin(true);
                    return;
                }

                console.log('[ADMIN_WEBVIEW] Checking admin status with Clerk token');
                const response = await fetch(`${ADMIN_DASHBOARD_URL}/api/admin/check`, {
                    headers: {
                        'Authorization': `Bearer ${ADMIN_API_KEY}`,
                        'X-User-Token': token,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log('[ADMIN_WEBVIEW] Admin check response:', data);
                    // Route to /admin if admin, use SALON_DASHBOARD_PATH otherwise
                    const path = data.isAdmin ? '/admin' : SALON_DASHBOARD_PATH;
                    console.log('[ADMIN_WEBVIEW] Setting dashboard path to:', path);

                    // Set the final URL once to prevent reloads
                    const baseUrl = ensureProtocol(ADMIN_DASHBOARD_URL);
                    const fullUrl = baseUrl + path;
                    finalUrlRef.current = fullUrl;
                    setFinalUrl(fullUrl);
                    setDashboardPath(path);
                    console.log('[ADMIN_WEBVIEW] Set final URL to:', fullUrl);
                    // Reset loaded flags and redirect tracking when URL changes
                    hasLoadedRef.current = false;
                    hasSuccessfullyLoadedRef.current = false;
                    currentUrlRef.current = null;
                    visitedUrlsRef.current = [];
                    redirectCountRef.current = 0;
                    isInRedirectLoopRef.current = false;
                } else {
                    console.log('[ADMIN_WEBVIEW] Admin check failed with status:', response.status);
                    // Default to SALON_DASHBOARD_PATH if check fails
                    const baseUrl = ensureProtocol(ADMIN_DASHBOARD_URL);
                    const fullUrl = baseUrl + SALON_DASHBOARD_PATH;
                    finalUrlRef.current = fullUrl;
                    setFinalUrl(fullUrl);
                    setDashboardPath(SALON_DASHBOARD_PATH);
                    console.log('[ADMIN_WEBVIEW] Set final URL to (check failed):', fullUrl);
                    hasLoadedRef.current = false;
                    hasSuccessfullyLoadedRef.current = false;
                    currentUrlRef.current = null;
                    visitedUrlsRef.current = [];
                    redirectCountRef.current = 0;
                    isInRedirectLoopRef.current = false;
                }
            } catch (error) {
                console.log('[ADMIN_WEBVIEW] Failed to check admin status:', error);
                const baseUrl = ensureProtocol(ADMIN_DASHBOARD_URL);
                const fullUrl = baseUrl + SALON_DASHBOARD_PATH;
                finalUrlRef.current = fullUrl;
                setFinalUrl(fullUrl);
                setDashboardPath(SALON_DASHBOARD_PATH);
                console.log('[ADMIN_WEBVIEW] Set final URL to (error):', fullUrl);
                hasLoadedRef.current = false;
                hasSuccessfullyLoadedRef.current = false;
                currentUrlRef.current = null;
                visitedUrlsRef.current = [];
                redirectCountRef.current = 0;
                isInRedirectLoopRef.current = false;
            } finally {
                setIsCheckingAdmin(false);
                setHasCheckedAdmin(true);
            }
        };

        checkAdminStatus();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSignedIn, authToken]); // **CRITICAL**: Also depend on authToken so check re-runs when user changes!

    // **CRITICAL FIX**: Reset hasCheckedAdmin when authToken changes (new user)
    const prevAuthTokenRef = useRef<string | null>(null);
    React.useEffect(() => {
        if (prevAuthTokenRef.current !== null && prevAuthTokenRef.current !== authToken) {
            // Token changed - new user! Reset everything
            console.log('[ADMIN_WEBVIEW] Auth token changed, resetting for new user');
            setHasCheckedAdmin(false);
            setIsCheckingAdmin(true);
            finalUrlRef.current = null;
            setFinalUrl(null);
            hasLoadedRef.current = false;
            hasSuccessfullyLoadedRef.current = false;
            currentUrlRef.current = null;
            visitedUrlsRef.current = [];
            redirectCountRef.current = 0;
            isInRedirectLoopRef.current = false;
        }
        prevAuthTokenRef.current = authToken;
    }, [authToken]);

    // Log the URL for debugging (only when it changes)
    React.useEffect(() => {
        if (finalUrl) {
            console.log('[ADMIN_WEBVIEW] Final URL state:', finalUrl);
            console.log('[ADMIN_WEBVIEW] Dashboard path:', dashboardPath);
        }
    }, [finalUrl, dashboardPath]);

    // Gate by sign-in; redirect to app sign-in if not signed in
    React.useEffect(() => {
        if (!isSignedIn) {
            // Clear timeout
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
                loadTimeoutRef.current = null;
            }

            // Reset admin check when user signs out
            setHasCheckedAdmin(false);
            setIsCheckingAdmin(true);
            setDashboardPath('/');
            finalUrlRef.current = null;
            setFinalUrl(null);
            hasLoadedRef.current = false;
            hasSuccessfullyLoadedRef.current = false;
            currentUrlRef.current = null;
            visitedUrlsRef.current = [];
            redirectCountRef.current = 0;
            isInRedirectLoopRef.current = false;
            router.replace('/sign-in?redirect=/admin-webview');
        }
    }, [isSignedIn, router]);

    // Cleanup timeout on unmount
    React.useEffect(() => {
        return () => {
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }
        };
    }, []);

    // Get auth token on mount (still kept if needed for other uses)
    React.useEffect(() => {
        const fetchToken = async () => {
            try {
                const token = await getToken();
                setAuthToken(token);
            } catch (e) {
                console.log('Failed to get auth token:', e);
            }
        };
        fetchToken();
    }, [getToken]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // REMOVED: isMenuVisible state

    // Colors matching the app theme
    const darkBrown = '#423120';
    const lightBrown = '#D7C3A7';
    const veryLightBeige = '#F4EDE5';
    const white = '#FFFFFF';

    // Custom user agent to bypass Google OAuth restrictions and enable WebView detection
    const customUserAgent = Platform.select({
        ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1 ReactNativeWebView',
        android: 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.6099.144 Mobile Safari/537.36 ReactNativeWebView',
        default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ReactNativeWebView'
    });

    // Handle messages from WebView
    const handleWebViewMessage = useCallback((event: any) => {
        const message = parseWebViewMessage(event.nativeEvent.data);

        if (!message) return;

        console.log('WebView message received:', message);

        switch (message.type) {
            case 'logout':
                handleLogout();
                break;

            case 'navigate':
                if (message.payload?.screen) {
                    router.push(message.payload.screen);
                }
                break;

            case 'ready':
                console.log('WebView ready at:', message.payload?.timestamp);
                break;

            case 'error':
                console.log('WebView error:', message.payload);
                setError(message.payload?.message || 'An error occurred in the dashboard');
                break;

            case 'console':
                // Log WebView console messages for debugging
                const msgData = message as any;
                const level = msgData.level || 'log';
                const data = msgData.data || JSON.stringify(message);
                console.log(`[WebView ${level.toUpperCase()}]:`, data);
                break;

            default:
                console.log('Unknown message type:', message.type);
        }
    }, [router]);

    // Handle logout
    const handleLogout = async () => {
        try {
            await signOut();
            router.replace('/');
        } catch (e) {
            console.log('Logout error:', e);
            router.replace('/');
        }
    };

    // Track the current URL to prevent reload loops
    const currentUrlRef = useRef<string | null>(null);
    const hasLoadedRef = useRef(false);
    const hasSuccessfullyLoadedRef = useRef(false);
    const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const visitedUrlsRef = useRef<string[]>([]);
    const redirectCountRef = useRef(0);
    const isInRedirectLoopRef = useRef(false);

    // Memoize WebView source to prevent unnecessary reloads
    const webViewSource = useMemo(() => {
        if (!finalUrl) return null;
        console.log('[ADMIN_WEBVIEW] Creating WebView source for URL:', finalUrl);

        const headers: Record<string, string> = {
            Authorization: `Bearer ${ADMIN_API_KEY}`,
        };

        // Add X-User-Token header if we have a Clerk token
        if (authToken) {
            headers['X-User-Token'] = authToken;
            console.log('[ADMIN_WEBVIEW] Adding X-User-Token header to WebView request');
        }

        return {
            uri: finalUrl,
            headers,
        };
    }, [finalUrl, authToken]); // Re-create when finalUrl OR authToken changes

    // Handle WebView navigation state changes
    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        setCanGoBack(navState.canGoBack);
        setLoading(navState.loading);

        console.log('[ADMIN_WEBVIEW] Navigation state:', {
            url: navState.url,
            loading: navState.loading,
            canGoBack: navState.canGoBack,
            hasSuccessfullyLoaded: hasSuccessfullyLoadedRef.current,
        });

        // Track current URL
        if (navState.url) {
            currentUrlRef.current = navState.url;
        }

        // Mark as successfully loaded when page finishes loading
        if (navState.url && !navState.loading && navState.url !== 'about:blank') {
            console.log('[ADMIN_WEBVIEW] Page successfully loaded:', navState.url);
            hasLoadedRef.current = true;
            hasSuccessfullyLoadedRef.current = true;
            setLoading(false);

            // Reset redirect tracking if we've been on this page for a while (not actively redirecting)
            // This allows normal navigation but prevents loops
            if (!navState.loading) {
                // Small delay to see if another redirect happens
                setTimeout(() => {
                    if (currentUrlRef.current === navState.url && !navState.loading) {
                        // Page is stable, reset redirect count
                        redirectCountRef.current = 0;
                        visitedUrlsRef.current = visitedUrlsRef.current.slice(-2); // Keep only last 2
                    }
                }, 2000);
            }
        }
    };

    // Prevent reloading the same URL and detect redirect loops
    const handleShouldStartLoadWithRequest = (request: any) => {
        const requestUrl = request.url;

        // On first load, always allow
        if (!hasLoadedRef.current) {
            visitedUrlsRef.current = [requestUrl];
            redirectCountRef.current = 0;
            return true;
        }

        // Prevent reloading the same URL
        if (currentUrlRef.current && requestUrl === currentUrlRef.current) {
            console.log('[ADMIN_WEBVIEW] Preventing reload of same URL:', requestUrl);
            return false;
        }

        // Check for redirect loops
        if (isInRedirectLoopRef.current) {
            console.log('[ADMIN_WEBVIEW] Redirect loop detected, preventing navigation to:', requestUrl);
            return false;
        }

        // Track visited URLs (keep last 6 URLs)
        visitedUrlsRef.current.push(requestUrl);
        if (visitedUrlsRef.current.length > 6) {
            visitedUrlsRef.current.shift();
        }
        console.log('[ADMIN_WEBVIEW] Visited URLs:', visitedUrlsRef.current);
        console.log('[ADMIN_WEBVIEW] Redirect count:', redirectCountRef.current);

        // Detect redirect loop: check for repeating patterns
        if (visitedUrlsRef.current.length >= 3) {
            const last3 = visitedUrlsRef.current.slice(-3);
            // Check if we have a pattern like: A -> B -> A (immediate loop)
            if (last3[0] === last3[2]) {
                console.log('[ADMIN_WEBVIEW] Redirect loop detected! Pattern:', last3);
                isInRedirectLoopRef.current = true;
                setLoading(false);
                setError('Redirect loop detected. Please check your account setup.');
                return false;
            }
        }

        if (visitedUrlsRef.current.length >= 4) {
            const last4 = visitedUrlsRef.current.slice(-4);
            // Check if we have a pattern like: A -> B -> A -> B
            if (last4[0] === last4[2] && last4[1] === last4[3]) {
                console.log('[ADMIN_WEBVIEW] Redirect loop detected! Pattern:', last4);
                isInRedirectLoopRef.current = true;
                setLoading(false);
                setError('Redirect loop detected. Please check your account setup.');
                return false;
            }
        }

        // Specific check for /dashboard/saloons <-> /post-sign-in loop
        const hasPostSignIn = visitedUrlsRef.current.some(url => url.includes('/post-sign-in'));
        const hasDashboardSaloons = visitedUrlsRef.current.some(url => url.includes('/dashboard/saloons'));
        if (hasPostSignIn && hasDashboardSaloons && visitedUrlsRef.current.length >= 3) {
            // Count occurrences of each
            const postSignInCount = visitedUrlsRef.current.filter(url => url.includes('/post-sign-in')).length;
            const saloonsCount = visitedUrlsRef.current.filter(url => url.includes('/dashboard/saloons')).length;
            if (postSignInCount >= 2 && saloonsCount >= 2) {
                console.log('[ADMIN_WEBVIEW] Specific redirect loop detected: /post-sign-in <-> /dashboard/saloons');
                isInRedirectLoopRef.current = true;
                setLoading(false);
                setError('Account setup redirect loop detected. Please contact support.');
                return false;
            }
        }

        // Increment redirect count
        redirectCountRef.current++;

        // If we've had too many redirects, stop (lowered threshold)
        if (redirectCountRef.current > 5) {
            console.log('[ADMIN_WEBVIEW] Too many redirects, stopping navigation');
            isInRedirectLoopRef.current = true;
            setLoading(false);
            setError('Too many redirects detected. Please check your account setup.');
            return false;
        }

        return true;
    };

    // Handle WebView load start
    const handleLoadStart = () => {
        // Only set loading on initial load (prevents reload loops after successful load)
        if (!hasSuccessfullyLoadedRef.current) {
            setLoading(true);
            setError(null);

            // Clear any existing timeout
            if (loadTimeoutRef.current) {
                clearTimeout(loadTimeoutRef.current);
            }

            // Set a timeout to clear loading state after 30 seconds (safety measure)
            loadTimeoutRef.current = setTimeout(() => {
                if (!hasSuccessfullyLoadedRef.current) {
                    console.log('[ADMIN_WEBVIEW] Load timeout - clearing loading state');
                    setLoading(false);
                    hasSuccessfullyLoadedRef.current = true; // Prevent further reloads
                }
            }, 30000);
        }
    };

    // Handle WebView load end
    const handleLoadEnd = () => {
        console.log('[ADMIN_WEBVIEW] Load ended, current URL:', currentUrlRef.current);

        // Clear timeout if it exists
        if (loadTimeoutRef.current) {
            clearTimeout(loadTimeoutRef.current);
            loadTimeoutRef.current = null;
        }

        // Always clear loading state when load ends
        setLoading(false);
        hasLoadedRef.current = true;
        // Mark as successfully loaded if we have a valid URL
        if (currentUrlRef.current && currentUrlRef.current !== 'about:blank') {
            console.log('[ADMIN_WEBVIEW] Marking as successfully loaded');
            hasSuccessfullyLoadedRef.current = true;
        }
    };

    // Handle WebView errors
    const handleError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.log('WebView error:', JSON.stringify(nativeEvent, null, 2));
        console.log('Attempted URL:', dashboardUrl);

        let errorMessage = 'Failed to load admin dashboard.';

        if (nativeEvent.code === -1100) {
            errorMessage = 'Server not found. Please check the dashboard URL.';
        } else if (!dashboardUrl || dashboardUrl === '') {
            errorMessage = 'Invalid dashboard URL configuration.';
        }

        setError(errorMessage + ' Please check your internet connection.');
        setLoading(false);
    };

    // Handle HTTP errors (like 401)
    const handleHttpError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView HTTP error:', nativeEvent.statusCode, nativeEvent);

        if (nativeEvent.statusCode >= 500) {
            setError('Server error. Please try again later.');
        }
    };

    // Handle back button
    const handleGoBack = () => {
        if (canGoBack && webViewRef.current) {
            webViewRef.current.goBack();
        } else {
            router.back();
        }
    };

    // Handle pull to refresh
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        webViewRef.current?.reload();
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    // Script to disable zooming
    const disableZoomScript = `
      // Disable zoom via viewport meta tag
      var meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      var existingMeta = document.querySelector('meta[name="viewport"]');
      if (existingMeta) {
        existingMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
      } else {
        document.head.appendChild(meta);
      }
      
      // Disable pinch zoom
      document.addEventListener('gesturestart', function(e) { e.preventDefault(); }, { passive: false });
      document.addEventListener('gesturechange', function(e) { e.preventDefault(); }, { passive: false });
      document.addEventListener('gestureend', function(e) { e.preventDefault(); }, { passive: false });
      
      // Disable double-tap zoom
      var lastTouchEnd = 0;
      document.addEventListener('touchend', function(e) {
        var now = Date.now();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      }, { passive: false });
    `;

    const injectedJavaScript = `
    ${disableZoomScript}
    ${getTokenInjectionScript(authToken)}
    // Persist admin bearer in cookie for all subsequent requests
    try {
      document.cookie = 'admin_token=${ADMIN_API_KEY}; path=/; SameSite=None; Secure';
    } catch (e) {
      console.log('Failed to set admin_token cookie', e);
    }
    // **CRITICAL**: Persist Clerk user token in x-user-token-session cookie
    // This allows server to identify the user on subsequent WebView navigations
    ${authToken ? `
    try {
      document.cookie = 'x-user-token-session=${authToken}; path=/; SameSite=Lax; max-age=${60 * 60 * 24}';
      console.log('x-user-token-session cookie set successfully');
    } catch (e) {
      console.log('Failed to set x-user-token-session cookie', e);
    }
    ` : ''}
    ${getLogoutHandlerScript()}
    ${getConsoleLogCaptureScript()}
    true;
  `;

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: white }]}>
            {/* UPDATED HEADER:
                1. showMenu set to false to hide hamburger
                2. Removed onMenuPress
                3. Set showBack to true so you can exit the screen (optional, set to false if preferred)
            */}
            <Header
                title="cosmix"
                showBack={true}
                showMenu={false}
                onBackPress={handleGoBack}
                disableSafeAreaPadding={true}
            />

            {/* Error Display */}
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: '#fee' }]}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Text style={[styles.errorText, { fontSize: 12, marginTop: 8 }]}>
                        URL: {dashboardUrl}
                    </Text>
                    <TouchableOpacity
                        style={[styles.retryButton, { backgroundColor: lightBrown }]}
                        onPress={() => {
                            setError(null);
                            webViewRef.current?.reload();
                        }}
                    >
                        <Text style={[styles.retryButtonText, { color: darkBrown }]}>
                            Retry
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* WebView */}
            <View style={styles.webViewContainer}>
                {isCheckingAdmin ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={darkBrown} />
                        <Text style={styles.loadingText}>Checking access...</Text>
                    </View>
                ) : webViewSource ? (
                    <>
                        <WebView
                            // Force remount when user changes by using authToken as key
                            key={authToken || 'no-auth'}
                            ref={webViewRef}
                            source={webViewSource}
                            userAgent={customUserAgent}
                            onMessage={handleWebViewMessage}
                            onNavigationStateChange={handleNavigationStateChange}
                            onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                            onLoadStart={handleLoadStart}
                            onLoadEnd={handleLoadEnd}
                            onError={(syntheticEvent) => {
                                // Don't show error if we've already successfully loaded (prevents reload loops)
                                if (!hasSuccessfullyLoadedRef.current) {
                                    handleError(syntheticEvent);
                                } else {
                                    // Silently ignore errors after successful load
                                    console.log('[ADMIN_WEBVIEW] Ignoring error after successful load');
                                }
                            }}
                            onHttpError={(syntheticEvent) => {
                                // Only handle HTTP errors if status is critical and we haven't loaded yet
                                const { nativeEvent } = syntheticEvent;
                                if (!hasSuccessfullyLoadedRef.current && nativeEvent.statusCode >= 500) {
                                    handleHttpError(syntheticEvent);
                                } else {
                                    // Silently ignore HTTP errors after successful load (including redirects)
                                    console.log('[ADMIN_WEBVIEW] Ignoring HTTP error after successful load:', nativeEvent.statusCode);
                                }
                            }}
                            injectedJavaScript={injectedJavaScript}
                            injectedJavaScriptBeforeContentLoaded={`
                              // CRITICAL: Clear ALL old auth cookies first to prevent stale user data
                              try {
                                document.cookie = 'x-user-token-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                                document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                                localStorage.removeItem('authToken');
                                localStorage.removeItem('sessionId');
                              } catch(e) {}
                              ${getTokenInjectionScript(authToken)}
                              // Set bearer key in localStorage and cookie for the web app
                              try { localStorage.setItem('admin_api_key', '${ADMIN_API_KEY}'); } catch(e) {}
                              try { document.cookie = 'admin_token=${ADMIN_API_KEY}; path=/; SameSite=None; Secure'; } catch(e) {}
                              // Set Clerk user token cookie for server-side auth
                              ${authToken ? `try { document.cookie = 'x-user-token-session=${authToken}; path=/; SameSite=Lax; max-age=${60 * 60 * 24}'; } catch(e) {}` : ''}
                              true;
                            `}

                            // ========== CRITICAL FOR MAPBOX ==========
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            geolocationEnabled={true}

                            // ========== ANDROID OPTIMIZATIONS ==========
                            {...Platform.select({
                                android: {
                                    androidLayerType: 'hardware',
                                    androidHardwareAccelerationDisabled: false,
                                },
                            })}

                            // ========== PERFORMANCE & COMPATIBILITY ==========
                            startInLoadingState={true}
                            scalesPageToFit={false}
                            mixedContentMode="always"
                            allowsBackForwardNavigationGestures={true}
                            sharedCookiesEnabled={true}
                            thirdPartyCookiesEnabled={true}
                            // Disable caching to prevent stale user data on account switch
                            cacheEnabled={false}
                            cacheMode="LOAD_NO_CACHE"

                            // ========== DISABLE ZOOM ==========
                            setBuiltInZoomControls={false}
                            setDisplayZoomControls={false}
                            bounces={false}
                            scrollEnabled={true}

                            // ========== KEYBOARD HANDLING ==========
                            keyboardDisplayRequiresUserAction={false}

                            originWhitelist={['*']}

                            {...Platform.select({
                                ios: {
                                    allowsInlineMediaPlayback: true,
                                    mediaPlaybackRequiresUserAction: false,
                                },
                            })}

                            style={styles.webView}
                            contentInsetAdjustmentBehavior="never"
                        />

                        {/* Loading Indicator */}
                        {loading && (
                            <View style={styles.loadingContainer}>
                                <ActivityIndicator size="large" color={darkBrown} />
                            </View>
                        )}
                    </>
                ) : (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={darkBrown} />
                        <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                )}
            </View>

            {/* Pull to Refresh Indicator (Android) */}
            {Platform.OS === 'android' && (
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    colors={[darkBrown]}
                    progressBackgroundColor={lightBrown}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    errorContainer: {
        padding: 16,
        alignItems: 'center',
    },
    errorText: {
        color: '#c00',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 12,
        fontFamily: 'Philosopher-Regular',
    },
    retryButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 14,
        fontFamily: 'Philosopher-Bold',
    },
    webViewContainer: {
        flex: 1,
        position: 'relative',
    },
    webView: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        fontFamily: 'Philosopher-Regular',
    },
});