import React, { useState, useRef, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

type UserRole = 'admin' | 'provider' | 'customer' | null;

const ADMIN_DASHBOARD_URL = process.env.EXPO_PUBLIC_ADMIN_DASHBOARD_URL || 'http://localhost:3000';

export default function RoleRouterScreen() {
    const router = useRouter();
    const { getToken, isSignedIn, isLoaded, userId } = useAuth();
    const [userRole, setUserRole] = useState<UserRole>(null);
    const prevUserIdRef = useRef<string | null | undefined>(null);

    // ── Redirect to sign-in when not signed in ────────────────────────────
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            setUserRole(null);
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

    // ── Role check — runs once per signed-in user ─────────────────────────
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
                        Authorization: `Bearer ${token ?? ''}`,
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
                    'PHASE3_PENDING':  '/(onboarding)/pending',
                    'ACTIVE':          '/(provider)/bookings',
                    'REJECTED':        '/(onboarding)/rejected',
                };

                const status = data.providerStatus ?? 'NOT_APPLIED';
                const route = statusRoutes[status];
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
    }, [isLoaded, isSignedIn, userRole, getToken]);

    // ── Navigate once role is resolved ────────────────────────────────────
    useEffect(() => {
        if (userRole === 'admin') router.replace('/(admin)/overview');
        if (userRole === 'provider') router.replace('/(provider)/bookings');
        if (userRole === 'customer') router.replace('/(app)/(tabs)/');
    }, [userRole, router]);

    // Always show spinner — this screen is a transient router, never stays visible
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#423120" />
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
