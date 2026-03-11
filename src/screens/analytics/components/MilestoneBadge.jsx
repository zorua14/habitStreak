import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { withOpacity } from "../utils/colorUtils";

const MilestoneBadge = ({ days, achieved, accent, textColor }) => (
  <View
    style={{
      alignItems: "center",
      flex: 1,
      paddingVertical: 10,
      borderRadius: 12,
      backgroundColor: achieved ? withOpacity(accent, 0.18) : "transparent",
      borderWidth: 1.5,
      borderColor: achieved ? accent : withOpacity(accent, 0.2),
      marginHorizontal: 3,
    }}
  >
    <Feather
      name={achieved ? "award" : "lock"}
      size={20}
      color={achieved ? accent : withOpacity(accent, 0.3)}
    />
    <Text
      style={{
        fontSize: 13,
        fontWeight: "700",
        color: achieved ? accent : withOpacity(accent, 0.4),
        marginTop: 5,
      }}
    >
      {days}d
    </Text>
    <Text
      style={{
        fontSize: 9,
        color: textColor,
        opacity: achieved ? 0.65 : 0.3,
        marginTop: 2,
      }}
    >
      {achieved ? "Achieved" : "Locked"}
    </Text>
  </View>
);

export default MilestoneBadge;