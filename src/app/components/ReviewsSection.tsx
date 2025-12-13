// src/app/components/ReviewsSection.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ActivityIndicator,
} from "react-native";
import { API_ENDPOINTS } from "../../../config/constants";

const darkBrown = "#423120";

interface Review {
    id: string;
    userId: string;
    saloonId: string;
    rating: number;
    comment: string | null;
    createdAt: string;
    user?: {
        name: string | null;
        email: string;
        clerkId?: string;
    };
}

interface ReviewsSectionProps {
    saloonId: string;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({ saloonId }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!saloonId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await fetch(`${API_ENDPOINTS.REVIEWS}?saloonId=${saloonId}`);

                if (!response.ok) {
                    throw new Error("Failed to fetch reviews");
                }

                const data = await response.json();
                setReviews(data);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setError(err instanceof Error ? err.message : "Failed to load reviews");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [saloonId]);

    // Render star rating
    const renderStars = (rating: number) => {
        return (
            <View style={{ flexDirection: "row", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Text
                        key={star}
                        style={{
                            fontSize: 14,
                            color: star <= rating ? darkBrown : "#E0CFB9",
                        }}
                    >
                        ★
                    </Text>
                ))}
            </View>
        );
    };

    // Get first letter from name or email
    const getInitials = (name?: string | null, email?: string): string => {
        if (name && name.length > 0) {
            return name.charAt(0).toUpperCase();
        }
        if (email && email.length > 0) {
            return email.charAt(0).toUpperCase();
        }
        return "?";
    };

    if (loading) {
        return (
            <View style={{ padding: 24, alignItems: "center" }}>
                <ActivityIndicator size="small" color={darkBrown} />
            </View>
        );
    }

    if (error) {
        return (
            <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{ color: "#999", fontFamily: "Philosopher-Regular" }}>
                    Arvostelujen lataaminen epäonnistui
                </Text>
            </View>
        );
    }

    if (reviews.length === 0) {
        return (
            <View style={{ padding: 24, alignItems: "center" }}>
                <Text style={{
                    color: darkBrown,
                    fontFamily: "Philosopher-Regular",
                    opacity: 0.7,
                    textAlign: "center"
                }}>
                    Ei vielä arvosteluja
                </Text>
            </View>
        );
    }

    return (
        <View style={{ marginTop: 20 }}>
            {/* <Text style={{
                fontSize: 20,
                fontFamily: "Philosopher-Bold",
                color: darkBrown,
                marginBottom: 16,
                textAlign: "center",
            }}>
                Arvostelut ({reviews.length})
            </Text> */}

            {reviews.map((review) => (
                <View
                    key={review.id}
                    style={{
                        backgroundColor: "#FFFFFF",
                        borderRadius: 12,
                        padding: 16,
                        marginBottom: 15,
                        borderWidth: 1,
                        borderColor: "#E0D7CA",
                        shadowColor: "#423120",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.05,
                        shadowRadius: 2,
                        elevation: 1,
                    }}
                >
                    {/* User info row */}
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                        {/* Avatar - using initials */}
                        <View
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: 20,
                                backgroundColor: "#D7C3A7",
                                marginRight: 12,
                                justifyContent: "center",
                                alignItems: "center",
                            }}
                        >
                            <Text style={{
                                fontFamily: "Philosopher-Bold",
                                fontSize: 18,
                                color: darkBrown,
                            }}>
                                C
                            </Text>
                        </View>

                        {/* Name and Verified Badge */}
                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 12,
                                color: darkBrown, // Green color for verified
                                fontFamily: "Philosopher-Regular",
                            }}>
                                ✓ Vahvistettu asiakas
                            </Text>
                        </View>
                    </View>

                    {/* Stars */}
                    <View style={{ marginBottom: 8 }}>
                        {renderStars(review.rating)}
                    </View>

                    {/* Comment */}
                    {review.comment && (
                        <Text style={{
                            fontFamily: "Philosopher-Regular",
                            fontSize: 14,
                            color: darkBrown,
                            opacity: 0.8,
                            lineHeight: 20,
                        }}>
                            {review.comment}
                        </Text>
                    )}
                </View>
            ))}
        </View>
    );
};

export default ReviewsSection;
