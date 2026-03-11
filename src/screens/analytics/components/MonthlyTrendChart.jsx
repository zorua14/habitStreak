import React from "react";
import { View, Text } from "react-native";
import { withOpacity } from "../utils/colorUtils";

const MonthlyTrendChart = ({ data, accent, textColor }) => {
  if (!data || data.length === 0) {
    return (
      <View
        style={{ height: 100, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ fontSize: 13, color: textColor, opacity: 0.4 }}>
          No data yet
        </Text>
      </View>
    );
  }

  const max = Math.max(...data.map((d) => d.rate), 1);
  const lastIndex = data.length - 1;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "flex-end",
        height: 100,
        justifyContent: "space-between",
      }}
    >
      {data.map((d, i) => {
        const isCurrent = i === lastIndex;
        return (
          <View key={d.label} style={{ alignItems: "center", flex: 1 }}>
            <Text
              style={{
                fontSize: 10,
                color: accent,
                fontWeight: "700",
                marginBottom: 3,
              }}
            >
              {d.rate > 0 ? `${d.rate}%` : ""}
            </Text>
            <View
              style={{
                width: "55%",
                height: Math.max(4, (d.rate / max) * 65),
                backgroundColor: isCurrent
                  ? accent
                  : withOpacity(accent, 0.35),
                borderRadius: 6,
                borderWidth: isCurrent ? 1.5 : 0,
                borderColor: accent,
              }}
            />
            <Text
              style={{
                fontSize: 9,
                color: textColor,
                opacity: 0.55,
                marginTop: 4,
              }}
            >
              {d.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

export default MonthlyTrendChart;