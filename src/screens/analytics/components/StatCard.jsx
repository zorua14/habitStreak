import React from "react";
import { View, Text } from "react-native";
import { withOpacity } from "../utils/colorUtils";

const StatCard = ({ label, value, accent, textColor, flex = 1, style }) => (
  <View
    style={[
      {
        backgroundColor: withOpacity(accent, 0.18),
        borderRadius: 14,
        flex,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderWidth: 1.5,
        borderColor: withOpacity(accent, 0.35),
      },
      style,
    ]}
  >
    <Text style={{ fontSize: 26, fontWeight: "700", color: accent }}>
      {value}
    </Text>
    <Text
      style={{
        fontSize: 11,
        color: textColor,
        opacity: 0.65,
        marginTop: 4,
        textAlign: "center",
        fontWeight: "500",
      }}
    >
      {label}
    </Text>
  </View>
);

export default StatCard;