import React, { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserRole = 'admin' | 'provider' | 'customer' | null;

const PROVIDER_STATUS_KEY = 'providerStatus';

const ADMIN_DASHBOARD_URL = process.env.EXPO_PUBLIC_ADMIN_DASHBOARD_URL || 'http://localhost:3000';
const ADMIN_API_KEY = process.env.EXPO_PUBLIC_ADMIN_API_KEY || '';

export default function RoleRouterScreen() {
    const router = useRouter();
    const { getToken, isSignedIn, isLoaded, userId } = useAuth();
    const [userRole, setUserRole] = useState<UserRole>(null);
    const prevUserIdRef = useRef<string | null | undefined>(null);
    // Becomes false once we've consulted the cache, so we never render the
    // spinner (or let the API check route to "pending") for a known-ACTIVE provider.
    const [redirectedFromCache, setRedirectedFromCache] = useState(false);

    // ── Redirect to sign-in when not signed in ────────────────────────────
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            setUserRole(null);
            AsyncStorage.removeItem(PROVIDER_STATUS_KEY);
            router.replace('/sign-in?redirect=/admin-webview');
        }
    }, [isLoaded, isSignedIn, router]);

    // ── Reset on user switch ──────────────────────────────────────────────
    useEffect(() => {
        if (prevUserIdRef.current !== null && prevUserIdRef.current !== userId) {
            setUserRole(null);
        }
        prevUserIdRef.current = userId;
    }, [userId]);

    // ── Cache-first: route ACTIVE providers instantly, no spinner/flash ────
    // Runs on mount WITHOUT waiting for Clerk to finish loading — if we have a
    // cached ACTIVE status we already know where to go, so there's nothing to wait for.
    useEffect(() => {
        let cancelled = false;
        AsyncStorage.getItem(PROVIDER_STATUS_KEY).then(cached => {
            if (cancelled) return;
            if (cached === 'ACTIVE') {
                setRedirectedFromCache(true);
                router.replace('/(provider)/bookings');
            }
        });
        return () => { cancelled = true; };
    }, [router]);

    // ── Role check — runs once per signed-in user, refreshes cache ─────────
    useEffect(() => {
        if (!isLoaded || !isSignedIn || userRole !== null) return;

        const checkRole = async () => {
            try {
                const token = await getToken();
                if (!token) {
                    setUserRole('customer');
                    return;
                }

                const res = await fetch(`${ADMIN_DASHBOARD_URL}/api/admin/check`, {
                    headers: {
                        Authorization: `Bearer ${ADMIN_API_KEY}`,
                        'X-User-Token': token,
                    },
                });

                if (!res.ok) {
                    setUserRole('customer');
                    return;
                }

                const data = await res.json();

                if (data.isAdmin) {
                    setUserRole('admin');
                    return;
                }

                // Route provider based on providerStatus
                const statusRoutes: Record<string, string> = {
                    'NOT_APPLIED':     '/(onboarding)/phase1',
                    'PHASE1_PENDING':  '/(onboarding)/pending',
                    'PHASE1_APPROVED': '/(onboarding)/phase2',
                    'PHASE2_PENDING':  '/(onboarding)/pending',
                    'PHASE2_APPROVED': '/(onboarding)/phase3',
                    // Phase 3 completion activates the provider immediately — treat
                    // PHASE3_PENDING as dashboard-bound, same as pending.tsx, so the
                    // two routers don't bounce the provider back and forth.
                    'PHASE3_PENDING':  '/(provider)/bookings',
                    'ACTIVE':          '/(provider)/bookings',
                    'REJECTED':        '/(onboarding)/rejected',
                };

                const status = data.providerStatus ?? 'NOT_APPLIED';
                const route = statusRoutes[status];
                const goesToDashboard = route === '/(provider)/bookings';

                // Keep the cache in sync with the source of truth. Cache whenever the
                // provider lands on their dashboard — not only on the literal 'ACTIVE'
                // string — so statuses like PHASE3_PENDING that also route there seed it too.
                if (goesToDashboard) {
                    await AsyncStorage.setItem(PROVIDER_STATUS_KEY, 'ACTIVE');
                } else {
                    await AsyncStorage.removeItem(PROVIDER_STATUS_KEY);
                }

                // If we already bounced to the dashboard from cache and the server
                // agrees, there's nothing more to do — avoid a redundant re-route.
                if (redirectedFromCache && goesToDashboard) return;

                if (route) {
                    router.replace(route as any);
                } else {
                    setUserRole('customer');
                }
            } catch {
                setUserRole('customer');
            }
        };

        checkRole();
    }, [isLoaded, isSignedIn, userRole, getToken, redirectedFromCache, router]);

    // ── Navigate once role is resolved ────────────────────────────────────
    useEffect(() => {
        if (userRole === 'admin') router.replace('/(admin)/overview');
        if (userRole === 'provider') router.replace('/(provider)/bookings');
        if (userRole === 'customer') router.replace('/(app)/(tabs)/');
    }, [userRole, router]);

    // Transient router screen — only a spinner, and only when we're not already
    // bouncing an ACTIVE provider straight to their dashboard from cache.
    return (
        <View style={styles.container}>
            {!redirectedFromCache && <ActivityIndicator size="large" color="#423120" />}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
});
