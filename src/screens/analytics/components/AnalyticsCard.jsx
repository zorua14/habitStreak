import React from "react";
import { View } from "react-native";
import { withOpacity } from "../utils/colorUtils";

const AnalyticsCard = ({ children, accent, cardBg, style }) => (
  <View
    style={[
      {
        backgroundColor: cardBg,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: withOpacity(accent, 0.12),
      },
      style,
    ]}
  >
    {children}
  </View>
);

export default AnalyticsCard;