import React from "react";
import { View, Text } from "react-native";

/**
 * Shown while analytics are computing (InteractionManager deferred).
 * Mirrors the rough layout of the real content to avoid layout shift.
 */
const AnalyticsSkeleton = ({ habitName, titleColor, cardBg }) => (
  <View style={{ paddingHorizontal: 14, paddingTop: 8, paddingBottom: 40 }}>
    <Text
      style={{
        fontSize: 26,
        fontWeight: "800",
        color: titleColor,
        alignSelf: "center",
        marginBottom: 14,
        marginTop: 6,
      }}
    >
      {habitName}
    </Text>

    {/* Calendar placeholder */}
    <View
      style={{
        height: 320,
        borderRadius: 14,
        backgroundColor: cardBg,
        marginBottom: 14,
      }}
    />

    {/* Stat row placeholder */}
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
      {[1, 2, 3].map((k) => (
        <View
          key={k}
          style={{ flex: 1, height: 80, borderRadius: 14, backgroundColor: cardBg }}
        />
      ))}
    </View>

    {/* Card placeholder */}
    <View style={{ height: 140, borderRadius: 16, backgroundColor: cardBg }} />
  </View>
);

export default AnalyticsSkeleton;