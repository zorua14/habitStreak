import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

const SectionHeader = ({ title, icon, color }) => (
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 10,
      marginTop: 6,
    }}
  >
    <Feather name={icon} size={16} color={color} style={{ marginRight: 7 }} />
    <Text
      style={{
        fontSize: 13,
        fontWeight: "700",
        color,
        letterSpacing: 1.2,
        textTransform: "uppercase",
      }}
    >
      {title}
    </Text>
  </View>
);

export default SectionHeader;