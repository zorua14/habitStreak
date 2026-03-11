import React, {
  useCallback,
  useLayoutEffect,
  useMemo,
} from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar } from "react-native-calendars";
import { useTheme } from "react-native-paper";
import { Feather } from "@expo/vector-icons";
import { AnimatedCircularProgress } from "react-native-circular-progress";

import {
  useFetchHabitsQuery,
  useMarkHabitCompleteMutation,
  useUnmarkHabitCompleteMutation,
} from "../../redux/api/habitsApi";

import { withOpacity } from "./utils/colorUtils";
import {
  computeAnalytics,
  computeMarkedDates,
  DEFAULT_ANALYTICS,
} from "./utils/analyticsUtils";


import AnalyticsCard from "./components/AnalyticsCard";
import DayOfWeekChart from "./components/DayOfWeekChart";
import MilestoneBadge from "./components/MilestoneBadge";
import MonthlyTrendChart from "./components/MonthlyTrendChart";
import SectionHeader from "./components/SectionHeader";
import StatCard from "./components/StatCard";

// ─── Screen ──────────────────────────────────────────────────────────────────

const Analytics = ({ navigation, route }) => {
  const { colors, dark } = useTheme();
  const { id } = route.params;

  const { data: habits = [] } = useFetchHabitsQuery();
  const [markComplete] = useMarkHabitCompleteMutation();
  const [unmarkComplete] = useUnmarkHabitCompleteMutation();

  const habitRaw = habits.find((h) => h.id === id) ?? null;

  // Stable habit object with normalised completedDates field
  const habit = useMemo(() => {
    if (!habitRaw) return null;
    return {
      ...habitRaw,
      completedDates: habitRaw.completed_dates ?? [],
    };
  }, [habitRaw]);

  // ── Derived values ───────────────────────────────────────────────────────
  const accent =
    (dark ? habit?.primary_color : habit?.secondary_color) ?? "#32C2FF";

  const currentDate = useMemo(
    () => new Date().toISOString().split("T")[0],
    []
  );

  // Both of these recompute only when the RTK cache updates (which now
  // happens synchronously via onQueryStarted in the API slice).
  const markedDates = useMemo(
    () => computeMarkedDates(habit?.completedDates ?? [], accent, currentDate),
    [habit?.completedDates, accent, currentDate]
  );

  const analytics = useMemo(() => {
    if (!habit) return DEFAULT_ANALYTICS;
    return computeAnalytics(habit);
  }, [habit]);

  // ── Navigation header ────────────────────────────────────────────────────
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 8 }}
        >
          <Feather name="arrow-left" size={24} color={colors.title} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, colors]);

  // ── Toggle handler ───────────────────────────────────────────────────────
  const toggleDate = useCallback(
    async (habitId, dateString) => {
      if (!habit) return;
      const isCompleted = habit.completedDates.includes(dateString);
      if (isCompleted) {
        await unmarkComplete({ habitId, day: dateString });
      } else {
        await markComplete({ habitId, day: dateString });
      }
    },
    [habit, markComplete, unmarkComplete]
  );

  // ── Styles ───────────────────────────────────────────────────────────────
  const bg = colors.background;
  const titleColor = colors.title;
  const cardBg = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  // ── Early exits ──────────────────────────────────────────────────────────
  if (!habit) {
    return <View style={{ flex: 1, backgroundColor: bg }} />;
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <Animated.View
        entering={FadeInDown.duration(220).springify()}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 14,
            paddingBottom: 40,
            paddingTop: 8,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
              marginTop: 6,
            }}
          >
            <Text
              style={{ fontSize: 26, fontWeight: "800", color: titleColor }}
            >
              {habit.name}
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("AddHabit", { id: habit.id })}
            >
              <Feather
                name="edit-2"
                size={20}
                color={titleColor}
                style={{ marginLeft: 10 }}
              />
            </TouchableOpacity>
          </View>

          {analytics.firstDate && (
            <Text
              style={{
                alignSelf: "center",
                fontSize: 12,
                color: titleColor,
                opacity: 0.45,
                marginBottom: 14,
              }}
            >
              Started {analytics.firstDate} · {analytics.habitAgeDays} days ago
            </Text>
          )}

          {/* ── Calendar ── */}
          <Calendar
            onDayPress={(day) => toggleDate(id, day.dateString)}
            style={{
              borderRadius: 14,
              marginBottom: 14,
              elevation: 5,
              borderWidth: 1.5,
              borderColor: withOpacity(accent, 0.3),
              overflow: "hidden",
            }}
            theme={{
              calendarBackground: bg,
              dayTextColor: titleColor,
              monthTextColor: accent,
              textDisabledColor: dark ? "#444" : "#ccc",
              arrowColor: accent,
              todayTextColor: accent,
            }}
            current={currentDate}
            maxDate={currentDate}
            hideExtraDays
            enableSwipeMonths
            disableAllTouchEventsForDisabledDays
            markedDates={markedDates}
            markingType="period"
            monthFormat="MMMM yyyy"
            key={`${dark}-${accent}`}
          />

          {/* ── Overview ── */}
          <AnalyticsCard accent={accent} cardBg={cardBg}>
            <SectionHeader title="Overview" icon="activity" color={accent} />
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <StatCard
                label="Current Streak"
                value={`${analytics.currentStreak}d`}
                accent={accent}
                textColor={titleColor}
              />
              <StatCard
                label="Max Streak"
                value={`${analytics.maxStreak}d`}
                accent={accent}
                textColor={titleColor}
              />
              <StatCard
                label="Total Days"
                value={habit.completedDates.length}
                accent={accent}
                textColor={titleColor}
              />
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <StatCard
                label="Avg Streak"
                value={`${analytics.avgStreakLength}d`}
                accent={accent}
                textColor={titleColor}
              />
              <StatCard
                label="Streak Breaks"
                value={analytics.timesStreakBroken}
                accent={accent}
                textColor={titleColor}
              />
              <StatCard
                label="Longest Gap"
                value={`${analytics.longestGap}d`}
                accent={accent}
                textColor={titleColor}
              />
            </View>
          </AnalyticsCard>

          {/* ── Completion Rate ── */}
          <AnalyticsCard accent={accent} cardBg={cardBg}>
            <SectionHeader
              title="Completion Rate"
              icon="percent"
              color={accent}
            />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <AnimatedCircularProgress
                size={110}
                width={13}
                duration={600}
                fill={analytics.completionPercentage}
                tintColor={accent}
                backgroundColor={dark ? "#333" : "#e0e0e0"}
                rotation={0}
                lineCap="round"
              >
                {() => (
                  <Text
                    style={{ fontSize: 22, fontWeight: "800", color: accent }}
                  >
                    {analytics.completionPercentage}%
                  </Text>
                )}
              </AnimatedCircularProgress>

              <View style={{ gap: 10 }}>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: titleColor,
                      opacity: 0.5,
                      fontWeight: "600",
                    }}
                  >
                    AVG DAYS / WEEK
                  </Text>
                  <Text
                    style={{ fontSize: 22, fontWeight: "800", color: accent }}
                  >
                    {analytics.avgDaysPerWeek}
                  </Text>
                </View>
                <View>
                  <Text
                    style={{
                      fontSize: 11,
                      color: titleColor,
                      opacity: 0.5,
                      fontWeight: "600",
                    }}
                  >
                    WEEKS ACTIVE
                  </Text>
                  <Text
                    style={{ fontSize: 22, fontWeight: "800", color: accent }}
                  >
                    {analytics.weeksWithAtLeastOne}
                  </Text>
                </View>
              </View>
            </View>
          </AnalyticsCard>

          {/* ── Month Comparison ── */}
          <AnalyticsCard accent={accent} cardBg={cardBg}>
            <SectionHeader
              title="Month Comparison"
              icon="calendar"
              color={accent}
            />
            <View
              style={{ flexDirection: "row", gap: 8, alignItems: "center" }}
            >
              <StatCard
                label="Last Month"
                value={`${analytics.thisMonthVsLast.lastMonth}%`}
                accent={accent}
                textColor={titleColor}
              />
              <View style={{ alignItems: "center" }}>
                <Feather
                  name={
                    analytics.thisMonthVsLast.diff >= 0
                      ? "trending-up"
                      : "trending-down"
                  }
                  size={22}
                  color={
                    analytics.thisMonthVsLast.diff >= 0 ? "#4CAF50" : "#f44336"
                  }
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color:
                      analytics.thisMonthVsLast.diff >= 0
                        ? "#4CAF50"
                        : "#f44336",
                    marginTop: 2,
                  }}
                >
                  {analytics.thisMonthVsLast.diff >= 0 ? "+" : ""}
                  {analytics.thisMonthVsLast.diff}%
                </Text>
              </View>
              <StatCard
                label="This Month"
                value={`${analytics.thisMonthVsLast.thisMonth}%`}
                accent={accent}
                textColor={titleColor}
              />
            </View>
          </AnalyticsCard>

          {/* ── 6-Month Trend ── */}
          <AnalyticsCard accent={accent} cardBg={cardBg}>
            <SectionHeader
              title="6-Month Trend"
              icon="bar-chart-2"
              color={accent}
            />
            <MonthlyTrendChart
              data={analytics.monthlyRates}
              accent={accent}
              textColor={titleColor}
            />
          </AnalyticsCard>

          {/* ── Best Day of Week ── */}
          <AnalyticsCard accent={accent} cardBg={cardBg}>
            <SectionHeader
              title="Best Day of Week"
              icon="sun"
              color={accent}
            />
            <DayOfWeekChart
              data={analytics.dayOfWeekCounts}
              accent={accent}
              textColor={titleColor}
            />
            <Text
              style={{
                textAlign: "center",
                marginTop: 10,
                fontSize: 13,
                color: titleColor,
                opacity: 0.6,
              }}
            >
              You perform best on{" "}
              <Text style={{ color: accent, fontWeight: "700" }}>
                {analytics.bestDayOfWeek}
              </Text>
            </Text>
          </AnalyticsCard>

          {/* ── Consistency ── */}
          <AnalyticsCard accent={accent} cardBg={cardBg}>
            <SectionHeader
              title="Consistency"
              icon="check-circle"
              color={accent}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <StatCard
                label="Perfect Weeks"
                value={analytics.perfectWeeks}
                accent={accent}
                textColor={titleColor}
              />
              <StatCard
                label="Perfect Months"
                value={analytics.perfectMonths}
                accent={accent}
                textColor={titleColor}
              />
            </View>
          </AnalyticsCard>

          {/* ── Milestones ── */}
          <AnalyticsCard accent={accent} cardBg={cardBg}>
            <SectionHeader title="Milestones" icon="award" color={accent} />
            <View style={{ flexDirection: "row", gap: 4 }}>
              {analytics.milestones.map((m) => (
                <MilestoneBadge
                  key={m.days}
                  days={m.days}
                  achieved={m.achieved}
                  accent={accent}
                  textColor={titleColor}
                />
              ))}
            </View>

            {analytics.nextMilestone ? (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 12,
                  fontSize: 12,
                  color: titleColor,
                  opacity: 0.55,
                }}
              >
                Next milestone:{" "}
                <Text style={{ color: accent, fontWeight: "700" }}>
                  {analytics.nextMilestone.days} days
                </Text>{" "}
                — {analytics.nextMilestone.remaining} streak days to go
              </Text>
            ) : (
              <Text
                style={{
                  textAlign: "center",
                  marginTop: 10,
                  fontSize: 13,
                  color: accent,
                  fontWeight: "700",
                }}
              >
                🏆 All milestones achieved!
              </Text>
            )}
          </AnalyticsCard>
        </ScrollView>
      </Animated.View>
    </View>
  );
};

export default Analytics;