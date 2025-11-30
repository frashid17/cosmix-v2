import React, { useState, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Platform,
    RefreshControl,
    Modal,
    Alert,
} from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import useAuthStore from '@/store/auth.store';
import Header from './components/Header';
import SideMenu from './components/SideMenu';
import {
    parseWebViewMessage,
    getTokenInjectionScript,
    getLogoutHandlerScript,
    getConsoleLogCaptureScript,
} from '@/lib/webview-bridge';
import { signOut } from '@/lib/appwrite';

const ADMIN_DASHBOARD_URL = process.env.EXPO_PUBLIC_ADMIN_DASHBOARD_URL || 'https://cosmix-admin.vercel.app';
const DASHBOARD_PATH = process.env.EXPO_PUBLIC_ADMIN_DASHBOARD_PATH || '';

export default function AdminWebViewScreen() {
    const router = useRouter();
    const webViewRef = useRef<WebView>(null);
    const { authToken, setIsAuthenticated, setUser, setAuthToken } = useAuthStore();
    const insets = useSafeAreaInsets();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [canGoBack, setCanGoBack] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [isMenuVisible, setMenuVisible] = useState(false);

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

    const dashboardUrl = `${ADMIN_DASHBOARD_URL}${DASHBOARD_PATH}`;

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
                console.error('WebView error:', message.payload);
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
            setIsAuthenticated(false);
            setUser(null);
            setAuthToken(null);
            router.replace('/');
        } catch (e) {
            console.error('Logout error:', e);
            router.replace('/');
        }
    };

    // Handle WebView navigation state changes
    const handleNavigationStateChange = (navState: WebViewNavigation) => {
        setCanGoBack(navState.canGoBack);
        // Sync loading state with WebView's actual state
        // This fixes the issue where the spinner persists if onLoadEnd doesn't fire correctly
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
        console.error('WebView error:', nativeEvent);
        setError('Failed to load admin dashboard. Please check your internet connection.');
        setLoading(false);
    };

    // Handle HTTP errors (like 401)
    const handleHttpError = (syntheticEvent: any) => {
        const { nativeEvent } = syntheticEvent;
        console.warn('WebView HTTP error:', nativeEvent.statusCode, nativeEvent);

        // Don't show error for 401 - user can sign in through the web interface
        // Only show errors for server issues
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

    // Combine injected JavaScript
    // Note: Token injection is optional - if no authToken, users can sign in through the web interface
    const injectedJavaScript = `
    ${getTokenInjectionScript(authToken)}
    ${getLogoutHandlerScript()}
    ${getConsoleLogCaptureScript()}
    true; // Required for iOS
  `;

    return (
        <View style={[styles.container, { backgroundColor: white }]}>
            {/* Use the shared Header component exactly like Profile page */}
            <Header
                title="COSMIX"
                showBack={false}
                showMenu={true}
                onBackPress={handleGoBack}
                onMenuPress={() => setMenuVisible(true)}
            />

            {/* Error Display */}
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: '#fee' }]}>
                    <Text style={styles.errorText}>{error}</Text>
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
                    javaScriptEnabled={true}              // Required for Mapbox
                    domStorageEnabled={true}              // Required for Mapbox
                    geolocationEnabled={true}             // Enable location services

                    // ========== ANDROID OPTIMIZATIONS ==========
                    {...Platform.select({
                        android: {
                            // CRITICAL: Enable hardware acceleration for WebGL
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

                    // Allow HTTPS
                    originWhitelist={['*']}

                    // iOS specific
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

            {/* Modal for the side menu */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isMenuVisible}
                onRequestClose={() => setMenuVisible(false)}
            >
                <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View
                        style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: veryLightBeige,
                            alignSelf: 'flex-end',
                        }}
                    >
                        <SideMenu onClose={() => setMenuVisible(false)} />
                    </View>
                </View>
            </Modal>
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
