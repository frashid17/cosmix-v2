import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';

const darkBrown = "#423120";
const lightBrown = "#D7C3A7";
const veryLightBeige = "#F4EDE5";
const white = "#FFFFFF";

type TabType = 'faq' | 'about' | 'contact' | 'terms' | 'privacy';

export default function InfoPage() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [activeTab, setActiveTab] = useState<TabType>('faq');

    useEffect(() => {
        if (params.tab) {
            setActiveTab(params.tab as TabType);
        }
    }, [params.tab]);

    const tabs: { key: TabType; label: string }[] = [
        { key: 'faq', label: 'FAQ' },
        { key: 'about', label: 'About Us' },
        { key: 'contact', label: 'Contact' },
        { key: 'terms', label: 'Terms' },
        { key: 'privacy', label: 'Privacy' },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'faq':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                        <View style={styles.faqItem}>
                            <Text style={styles.question}>How do I book a service?</Text>
                            <Text style={styles.answer}>You can book a service by navigating to the Services page, selecting a category, choosing a service, and picking a time slot.</Text>
                        </View>

                        <View style={styles.faqItem}>
                            <Text style={styles.question}>Can I cancel my booking?</Text>
                            <Text style={styles.answer}>Yes, you can cancel your booking from the "My Bookings" section in your profile, subject to the cancellation policy.</Text>
                        </View>

                        <View style={styles.faqItem}>
                            <Text style={styles.question}>What payment methods are accepted?</Text>
                            <Text style={styles.answer}>We accept major credit cards and online banking payments through Paytrail.</Text>
                        </View>
                    </View>
                );
            case 'about':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>About Us</Text>
                        <Text style={styles.paragraph}>
                            COSMIX is your premier destination for beauty and wellness services. We connect you with top-rated professionals for hair, nails, massage, and more.
                        </Text>
                        <Text style={styles.paragraph}>
                            Our mission is to make self-care accessible and convenient for everyone. Whether you need a quick trim or a full spa day, we've got you covered.
                        </Text>
                    </View>
                );
            case 'contact':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Get in Touch</Text>
                        <Text style={styles.paragraph}>
                            Have questions or feedback? We'd love to hear from you!
                        </Text>

                        <View style={styles.contactItem}>
                            <Ionicons name="mail-outline" size={24} color={darkBrown} />
                            <Text style={styles.contactText}>support@cosmix.fi</Text>
                        </View>

                        <View style={styles.contactItem}>
                            <Ionicons name="call-outline" size={24} color={darkBrown} />
                            <Text style={styles.contactText}>+358 40 123 4567</Text>
                        </View>

                        <View style={styles.contactItem}>
                            <Ionicons name="location-outline" size={24} color={darkBrown} />
                            <Text style={styles.contactText}>Helsinki, Finland</Text>
                        </View>
                    </View>
                );
            case 'terms':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Terms of Use</Text>
                        <Text style={styles.paragraph}>
                            Welcome to COSMIX. By using our app, you agree to these terms.
                        </Text>
                        <Text style={styles.subTitle}>1. User Accounts</Text>
                        <Text style={styles.paragraph}>
                            You are responsible for maintaining the confidentiality of your account and password.
                        </Text>
                        <Text style={styles.subTitle}>2. Bookings</Text>
                        <Text style={styles.paragraph}>
                            Bookings are subject to availability and confirmation by the service provider.
                        </Text>
                        <Text style={styles.subTitle}>3. Cancellations</Text>
                        <Text style={styles.paragraph}>
                            Cancellations must be made at least 24 hours in advance to avoid fees.
                        </Text>
                    </View>
                );
            case 'privacy':
                return (
                    <View>
                        <Text style={styles.sectionTitle}>Privacy Statement</Text>
                        <Text style={styles.paragraph}>
                            Your privacy is important to us. This policy explains how we collect and use your data.
                        </Text>
                        <Text style={styles.subTitle}>Data Collection</Text>
                        <Text style={styles.paragraph}>
                            We collect information you provide directly to us, such as when you create an account or book a service.
                        </Text>
                        <Text style={styles.subTitle}>Data Usage</Text>
                        <Text style={styles.paragraph}>
                            We use your data to provide and improve our services, process payments, and communicate with you.
                        </Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
            <Header
                showBack={true}
                onBackPress={() => router.back()}
                showMenu={true}
            />

            <View style={{ height: 70, backgroundColor: white, paddingVertical: 10 }}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', height: 50 }}
                >
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            onPress={() => setActiveTab(tab.key)}
                            activeOpacity={0.8}
                            style={{
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                marginRight: 10,
                                borderRadius: 25,
                                backgroundColor: activeTab === tab.key ? lightBrown : white,
                                borderWidth: 2,
                                borderColor: activeTab === tab.key ? lightBrown : darkBrown,
                                height: 45,
                                justifyContent: 'center',
                                alignItems: 'center',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2,
                            }}
                        >
                            <Text style={{
                                color: darkBrown,
                                fontFamily: 'Philosopher-Bold',
                                fontSize: 15
                            }}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={{ flex: 1, padding: 20 }}>
                {renderContent()}
                <View style={{ height: 40 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = {
    sectionTitle: {
        fontSize: 24,
        fontFamily: 'Philosopher-Bold',
        color: darkBrown,
        marginBottom: 20,
    },
    subTitle: {
        fontSize: 18,
        fontFamily: 'Philosopher-Bold',
        color: darkBrown,
        marginTop: 16,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        fontFamily: 'Philosopher-Regular',
        color: darkBrown,
        lineHeight: 24,
        marginBottom: 12,
    },
    faqItem: {
        marginBottom: 20,
        backgroundColor: veryLightBeige,
        padding: 16,
        borderRadius: 12,
    },
    question: {
        fontSize: 16,
        fontFamily: 'Philosopher-Bold',
        color: darkBrown,
        marginBottom: 8,
    },
    answer: {
        fontSize: 15,
        fontFamily: 'Philosopher-Regular',
        color: darkBrown,
        lineHeight: 22,
    },
    contactItem: {
        flexDirection: 'row' as 'row',
        alignItems: 'center' as 'center',
        marginBottom: 16,
        backgroundColor: veryLightBeige,
        padding: 16,
        borderRadius: 12,
    },
    contactText: {
        marginLeft: 12,
        fontSize: 16,
        fontFamily: 'Philosopher-Regular',
        color: darkBrown,
    },
};
