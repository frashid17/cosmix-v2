import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Platform,
    RefreshControl,
    // Modal, // Removed Modal as it was only used for SideMenu
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons'; // Unused if not used elsewhere
import { useClerk, useAuth } from '@clerk/clerk-expo';
import Header from './components/Header';
// import SideMenu from './components/SideMenu'; // REMOVED: SideMenu import
import {
    parseWebViewMessage,
    getTokenInjectionScript,
    getLogoutHandlerScript,
    getConsoleLogCaptureScript,
} from '@/lib/webview-bridge';

const ADMIN_DASHBOARD_URL = process.env.EXPO_PUBLIC_ADMIN_DASHBOARD_URL || 'https://cosmix-admin.vercel.app';
const DASHBOARD_PATH = process.env.EXPO_PUBLIC_ADMIN_DASHBOARD_PATH || '';

export default function AdminWebViewScreen() {
    const router = useRouter();
    const webViewRef = useRef<WebView | null>(null);
    const { signOut } = useClerk();
    const { getToken } = useAuth();
    const insets = useSafeAreaInsets();
    const [authToken, setAuthToken] = useState<string | null>(null);

    // Construct and validate dashboard URL - ensure it has a protocol
    const ensureProtocol = (url: string) => {
        if (!url) return 'https://cosmix-admin.vercel.app';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `https://${url}`;
    };

    const dashboardUrl = ensureProtocol(ADMIN_DASHBOARD_URL) + DASHBOARD_PATH;

    // Log the URL for debugging
    React.useEffect(() => {
        console.log('Dashboard URL:', dashboardUrl);
        console.log('ADMIN_DASHBOARD_URL:', ADMIN_DASHBOARD_URL);
        console.log('DASHBOARD_PATH:', DASHBOARD_PATH);
    }, []);

    // Get auth token on mount
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

    // Handle WebView navigation state changes
    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        setCanGoBack(navState.canGoBack);
        setLoading(navState.loading);
    };

    // Handle WebView load start
    const handleLoadStart = () => {
        setLoading(true);
        setError(null);
    };

    // Handle WebView load end
    const handleLoadEnd = () => {
        setLoading(false);
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

    const injectedJavaScript = `
    ${getTokenInjectionScript(authToken)}
    ${getLogoutHandlerScript()}
    ${getConsoleLogCaptureScript()}
    true;
  `;

    return (
        <View style={[styles.container, { backgroundColor: white }]}>
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
            <View style={[styles.webViewContainer, { paddingBottom: insets.bottom }]}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: dashboardUrl }}
                    userAgent={customUserAgent}
                    onMessage={handleWebViewMessage}
                    onNavigationStateChange={handleNavigationStateChange}
                    onLoadStart={handleLoadStart}
                    onLoadEnd={handleLoadEnd}
                    onError={handleError}
                    onHttpError={handleHttpError}
                    injectedJavaScript={injectedJavaScript}
                    injectedJavaScriptBeforeContentLoaded={getTokenInjectionScript(authToken)}

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
                    scalesPageToFit={true}
                    mixedContentMode="always"
                    allowsBackForwardNavigationGestures={true}
                    sharedCookiesEnabled={true}
                    thirdPartyCookiesEnabled={true}
                    cacheEnabled={true}
                    cacheMode="LOAD_DEFAULT"

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

            {/* REMOVED: Modal component containing SideMenu */}
        </View>
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