import React from "react";
import { View, Text } from "react-native";
import { withOpacity } from "../utils/colorUtils";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const DayOfWeekChart = ({ data, accent, textColor }) => {
  const max = Math.max(...data, 1);
  const peakValue = Math.max(...data);

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        height: 90,
        justifyContent: "space-between",
      }}
    >
      {DAYS.map((day, i) => {
        const isPeak = data[i] === peakValue;
        return (
          <View key={day} style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: 11,
                color: accent,
                fontWeight: "700",
                marginBottom: 4,
              }}
            >
              {data[i]}
            </Text>
            <View
              style={{
                width: "60%",
                height: Math.max(4, (data[i] / max) * 58),
                backgroundColor: isPeak ? accent : withOpacity(accent, 0.35),
                borderRadius: 6,
                borderWidth: isPeak ? 1.5 : 0,
                borderColor: accent,
              }}
            />
            <Text
              style={{
                fontSize: 10,
                color: textColor,
                opacity: 0.55,
                marginTop: 5,
              }}
            >
              {day}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default DayOfWeekChart;