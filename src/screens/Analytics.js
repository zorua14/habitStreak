import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  InteractionManager,
} from "react-native";
import React, { useEffect, useLayoutEffect, useState, useCallback } from "react";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSelector, useDispatch } from "react-redux";
import {
  addDateToHabit,
  removeDateFromHabit,
  selectHabitById,
} from "../redux/habitSlice";
import {
  differenceInDays,
  parseISO,
  format,
  getDay,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  subMonths,
} from "date-fns";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { useTheme } from "react-native-paper";
import { Feather } from "@expo/vector-icons";


const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 50, g: 194, b: 255 };
};

const withOpacity = (hex, opacity) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${opacity})`;
};

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
    <Text style={{ fontSize: 13, fontWeight: "700", color, letterSpacing: 1.2, textTransform: "uppercase" }}>
      {title}
    </Text>
  </View>
);

const DayOfWeekChart = ({ data, accent, textColor }) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const max = Math.max(...data, 1);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 90, justifyContent: "space-between" }}>
      {days.map((day, i) => (
        <View key={day} style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ fontSize: 11, color: accent, fontWeight: "700", marginBottom: 4 }}>
            {data[i]}
          </Text>
          <View
            style={{
              width: "60%",
              height: Math.max(4, (data[i] / max) * 58),
              backgroundColor: data[i] === Math.max(...data) ? accent : withOpacity(accent, 0.35),
              borderRadius: 6,
              borderWidth: data[i] === Math.max(...data) ? 1.5 : 0,
              borderColor: accent,
            }}
          />
          <Text style={{ fontSize: 10, color: textColor, opacity: 0.55, marginTop: 5 }}>
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
};

const MonthlyTrendChart = ({ data, accent, textColor }) => {
  if (!data || data.length === 0) {
    return (
      <View style={{ height: 100, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 13, color: textColor, opacity: 0.4 }}>No data yet</Text>
      </View>
    );
  }
  const max = Math.max(...data.map((d) => d.rate), 1);
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", height: 100, justifyContent: "space-between" }}>
      {data.map((d, i) => (
        <View key={d.label} style={{ alignItems: "center", flex: 1 }}>
          <Text style={{ fontSize: 10, color: accent, fontWeight: "700", marginBottom: 3 }}>
            {d.rate > 0 ? `${d.rate}%` : ""}
          </Text>
          <View
            style={{
              width: "55%",
              height: Math.max(4, (d.rate / max) * 65),
              backgroundColor: i === data.length - 1 ? accent : withOpacity(accent, 0.35),
              borderRadius: 6,
              borderWidth: i === data.length - 1 ? 1.5 : 0,
              borderColor: accent,
            }}
          />
          <Text style={{ fontSize: 9, color: textColor, opacity: 0.55, marginTop: 4 }}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

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

const DEFAULT_ANALYTICS = {
  currentStreak: 0,
  maxStreak: 0,
  completionPercentage: 0,
  longestGap: 0,
  avgStreakLength: 0,
  timesStreakBroken: 0,
  dayOfWeekCounts: [0, 0, 0, 0, 0, 0, 0],
  bestDayOfWeek: "—",
  monthlyRates: [],
  thisMonthVsLast: { thisMonth: 0, lastMonth: 0, diff: 0 },
  perfectWeeks: 0,
  perfectMonths: 0,
  avgDaysPerWeek: "0",
  habitAgeDays: 0,
  firstDate: null,
  milestones: [7, 14, 30, 50, 100].map((d) => ({ days: d, achieved: false })),
  nextMilestone: { days: 7, remaining: 7 },
  weeksWithAtLeastOne: 0,
};

function computeMarkedDates(completedDates, accent, currentDate) {
  if (!completedDates || completedDates.length === 0) {
    return { [currentDate]: { marked: true } };
  }
  const sortedDates = [...completedDates].sort();
  const result = {};
  sortedDates.forEach((date, index) => {
    const prev = sortedDates[index - 1];
    const next = sortedDates[index + 1];
    const isStart = !prev || differenceInDays(parseISO(date), parseISO(prev)) > 1;
    const isEnd = !next || differenceInDays(parseISO(next), parseISO(date)) > 1;
    result[date] = {
      color: accent,
      textColor: "white",
      ...(isStart && { startingDay: true }),
      ...(isEnd && { endingDay: true }),
    };
  });
  if (result[currentDate]) {
    result[currentDate].marked = true;
  } else {
    result[currentDate] = { marked: true };
  }
  return result;
}

function computeAnalytics(habit) {
  const completed = habit?.completedDates ?? [];
  if (completed.length === 0) return { ...DEFAULT_ANALYTICS };

  const sortedDates = [...completed].sort();
  const parsedSorted = sortedDates.map(parseISO);
  const today = new Date();

  let maxStreak = 1,
    tempStreak = 1,
    streakBreaks = 0,
    streakLengths = [1];
  for (let i = 1; i < parsedSorted.length; i++) {
    const diff = differenceInDays(parsedSorted[i], parsedSorted[i - 1]);
    if (diff === 1) {
      tempStreak++;
    } else if (diff > 1) {
      streakLengths.push(tempStreak);
      streakBreaks++;
      tempStreak = 1;
    }
    if (tempStreak > maxStreak) maxStreak = tempStreak;
  }
  streakLengths.push(tempStreak);

  const lastCompleted = parsedSorted[parsedSorted.length - 1];
  const daysSinceLast = differenceInDays(today, lastCompleted);
  const currentStreak = daysSinceLast <= 1 ? tempStreak : 0;

  const daysBetween = differenceInDays(today, parsedSorted[0]) + 1;
  const completionPercentage = Math.round((parsedSorted.length / daysBetween) * 100);
  const habitAgeDays = daysBetween;
  const firstDate = format(parsedSorted[0], "MMM d, yyyy");

  let longestGap = 0;
  for (let i = 1; i < parsedSorted.length; i++) {
    const gap = differenceInDays(parsedSorted[i], parsedSorted[i - 1]) - 1;
    if (gap > longestGap) longestGap = gap;
  }

  const avgStreakLength =
    streakLengths.length > 0
      ? Math.round(streakLengths.reduce((a, b) => a + b, 0) / streakLengths.length)
      : 0;

  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  parsedSorted.forEach((d) => dayOfWeekCounts[getDay(d)]++);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const bestDayIndex = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
  const bestDayOfWeek = dayNames[bestDayIndex];

  const monthlyRates = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(today, i);
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const daysInMonth = differenceInDays(end, start) + 1;
    const completedInMonth = parsedSorted.filter((d) =>
      isWithinInterval(d, { start, end })
    ).length;
    monthlyRates.push({
      label: format(monthDate, "MMM"),
      rate: Math.round((completedInMonth / daysInMonth) * 100),
      count: completedInMonth,
    });
  }

  const thisMonthStart = startOfMonth(today);
  const thisMonthEnd = today;
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));
  const thisMonthDays = differenceInDays(thisMonthEnd, thisMonthStart) + 1;
  const lastMonthDays = differenceInDays(lastMonthEnd, lastMonthStart) + 1;
  const thisMonthCount = parsedSorted.filter((d) =>
    isWithinInterval(d, { start: thisMonthStart, end: thisMonthEnd })
  ).length;
  const lastMonthCount = parsedSorted.filter((d) =>
    isWithinInterval(d, { start: lastMonthStart, end: lastMonthEnd })
  ).length;
  const thisMonthRate = Math.round((thisMonthCount / thisMonthDays) * 100);
  const lastMonthRate = Math.round((lastMonthCount / lastMonthDays) * 100);

  let perfectWeeks = 0, weeksWithAtLeastOne = 0;
  const completedSet = new Set(sortedDates);
  const habitStart = parsedSorted[0];
  let weekStart = startOfWeek(habitStart);
  while (weekStart <= today) {
    const weekEnd = endOfWeek(weekStart);
    const daysInWeek = eachDayOfInterval({
      start: weekStart,
      end: weekEnd > today ? today : weekEnd,
    });
    const completedCount = daysInWeek.filter((d) =>
      completedSet.has(format(d, "yyyy-MM-dd"))
    ).length;
    if (completedCount === 7) perfectWeeks++;
    if (completedCount >= 1) weeksWithAtLeastOne++;
    weekStart = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  }

  let perfectMonths = 0;
  for (let i = 0; i < 24; i++) {
    const monthDate = subMonths(today, i);
    const start = startOfMonth(monthDate);
    const end = i === 0 ? today : endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });
    if (days.every((d) => completedSet.has(format(d, "yyyy-MM-dd")))) perfectMonths++;
  }

  const totalWeeks = Math.max(1, Math.ceil(habitAgeDays / 7));
  const avgDaysPerWeek = (parsedSorted.length / totalWeeks).toFixed(1);

  const milestoneDays = [7, 14, 30, 50, 100];
  const milestones = milestoneDays.map((d) => ({ days: d, achieved: maxStreak >= d }));
  const nextMilestoneDay = milestoneDays.find((d) => maxStreak < d) ?? null;
  const nextMilestone = nextMilestoneDay
    ? { days: nextMilestoneDay, remaining: nextMilestoneDay - maxStreak }
    : null;

  return {
    currentStreak,
    maxStreak,
    completionPercentage,
    longestGap,
    avgStreakLength,
    timesStreakBroken: streakBreaks,
    dayOfWeekCounts,
    bestDayOfWeek,
    monthlyRates,
    thisMonthVsLast: {
      thisMonth: thisMonthRate,
      lastMonth: lastMonthRate,
      diff: thisMonthRate - lastMonthRate,
    },
    perfectWeeks,
    perfectMonths,
    avgDaysPerWeek,
    habitAgeDays,
    firstDate,
    milestones,
    nextMilestone,
    weeksWithAtLeastOne,
  };
}

const Analytics = ({ navigation, route }) => {
  const { colors, dark } = useTheme();
  const [themeChanged, setThemeChanged] = useState(false);
  const { id } = route.params;
  const habit = useSelector((state) => selectHabitById(state, id));
  const dispatch = useDispatch();

  useEffect(() => {
    setThemeChanged((prev) => !prev);
  }, [colors]);

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

  const accent = habit?.primaryColor ?? "#32C2FF";
  const currentDate = new Date().toISOString().split("T")[0];

  const [markedDates, setMarkedDates] = useState({});
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    setAnalytics(null);
    const task = InteractionManager.runAfterInteractions(() => {
      setMarkedDates(computeMarkedDates(habit?.completedDates ?? [], accent, currentDate));
      setAnalytics(computeAnalytics(habit));
    });
    return () => task.cancel();
  }, [habit?.id, habit?.completedDates, accent, currentDate]);

  const displayAnalytics = analytics ?? DEFAULT_ANALYTICS;
  const isReady = analytics !== null;

  const toggleDate = useCallback(
    (habitId, dateString) => {
      if (habit?.completedDates?.includes(dateString)) {
        dispatch(removeDateFromHabit({ id: habitId, date: dateString }));
      } else {
        dispatch(addDateToHabit({ id: habitId, date: dateString }));
      }
    },
    [habit?.completedDates, dispatch]
  );

  const bg = colors.background;
  const titleColor = colors.title;
  const cardBg = dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)";

  const Card = ({ children, style }) => (
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

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      {!isReady ? (
        <View style={{ flex: 1, paddingHorizontal: 14, paddingTop: 8, paddingBottom: 40 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 4, marginTop: 6 }}>
            <Text style={{ fontSize: 26, fontWeight: "800", color: titleColor }}>{habit?.name}</Text>
          </View>
          <View style={{ height: 320, borderRadius: 14, backgroundColor: cardBg, marginBottom: 14 }} />
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <View style={{ flex: 1, height: 80, borderRadius: 14, backgroundColor: cardBg }} />
            <View style={{ flex: 1, height: 80, borderRadius: 14, backgroundColor: cardBg }} />
            <View style={{ flex: 1, height: 80, borderRadius: 14, backgroundColor: cardBg }} />
          </View>
          <View style={{ height: 140, borderRadius: 16, backgroundColor: cardBg }} />
        </View>
      ) : (
        <Animated.View
          entering={FadeInDown.duration(220).springify()}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 40, paddingTop: 8 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 4, marginTop: 6 }}>
              <Text style={{ fontSize: 26, fontWeight: "800", color: titleColor }}>{habit.name}</Text>
              <TouchableOpacity onPress={() => navigation.navigate("AddHabit", { id: habit.id })}>
                <Feather name="edit-2" size={20} color={titleColor} style={{ marginLeft: 10 }} />
              </TouchableOpacity>
            </View>
            {displayAnalytics.firstDate && (
              <Text style={{ alignSelf: "center", fontSize: 12, color: titleColor, opacity: 0.45, marginBottom: 14 }}>
                Started {displayAnalytics.firstDate} · {displayAnalytics.habitAgeDays} days ago
              </Text>
            )}

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
          key={`${themeChanged}-${accent}`}
          current={currentDate}
          maxDate={currentDate}
          hideExtraDays={true}
          enableSwipeMonths={true}
          onPressArrowLeft={(sub) => sub()}
          onPressArrowRight={(add) => add()}
          disableAllTouchEventsForDisabledDays={true}
          markedDates={markedDates}
          markingType={"period"}
          monthFormat="MMMM, yyyy"
        />

        <Card>
          <SectionHeader title="Overview" icon="activity" color={accent} />
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
            <StatCard label="Current Streak" value={`${displayAnalytics.currentStreak}d`} accent={accent} textColor={titleColor} />
            <StatCard label="Max Streak" value={`${displayAnalytics.maxStreak}d`} accent={accent} textColor={titleColor} />
            <StatCard label="Total Days" value={habit.completedDates.length} accent={accent} textColor={titleColor} />
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <StatCard label="Avg Streak" value={`${displayAnalytics.avgStreakLength}d`} accent={accent} textColor={titleColor} />
            <StatCard label="Streak Breaks" value={displayAnalytics.timesStreakBroken} accent={accent} textColor={titleColor} />
            <StatCard label="Longest Gap" value={`${displayAnalytics.longestGap}d`} accent={accent} textColor={titleColor} />
          </View>
        </Card>

        <Card>
          <SectionHeader title="Completion Rate" icon="percent" color={accent} />
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
            <AnimatedCircularProgress
              size={110}
              width={13}
              duration={1000}
              fill={displayAnalytics.completionPercentage}
              tintColor={accent}
              backgroundColor={dark ? "#333" : "#e0e0e0"}
              rotation={0}
              lineCap="round"
            >
              {() => (
                <Text style={{ fontSize: 22, fontWeight: "800", color: accent }}>
                  {displayAnalytics.completionPercentage}%
                </Text>
              )}
            </AnimatedCircularProgress>
            <View style={{ gap: 10 }}>
              <View>
                <Text style={{ fontSize: 11, color: titleColor, opacity: 0.5, fontWeight: "600" }}>AVG DAYS / WEEK</Text>
                <Text style={{ fontSize: 22, fontWeight: "800", color: accent }}>{displayAnalytics.avgDaysPerWeek}</Text>
              </View>
              <View>
                <Text style={{ fontSize: 11, color: titleColor, opacity: 0.5, fontWeight: "600" }}>WEEKS ACTIVE</Text>
                <Text style={{ fontSize: 22, fontWeight: "800", color: accent }}>{displayAnalytics.weeksWithAtLeastOne}</Text>
              </View>
            </View>
          </View>
        </Card>

        <Card>
          <SectionHeader title="Month Comparison" icon="calendar" color={accent} />
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <StatCard label="Last Month" value={`${displayAnalytics.thisMonthVsLast.lastMonth}%`} accent={accent} textColor={titleColor} />
            <View style={{ alignItems: "center" }}>
              <Feather
                name={displayAnalytics.thisMonthVsLast.diff >= 0 ? "trending-up" : "trending-down"}
                size={22}
                color={displayAnalytics.thisMonthVsLast.diff >= 0 ? "#4CAF50" : "#f44336"}
              />
              <Text style={{ fontSize: 12, fontWeight: "700", color: displayAnalytics.thisMonthVsLast.diff >= 0 ? "#4CAF50" : "#f44336", marginTop: 2 }}>
                {displayAnalytics.thisMonthVsLast.diff >= 0 ? "+" : ""}{displayAnalytics.thisMonthVsLast.diff}%
              </Text>
            </View>
            <StatCard label="This Month" value={`${displayAnalytics.thisMonthVsLast.thisMonth}%`} accent={accent} textColor={titleColor} />
          </View>
        </Card>

        <Card>
          <SectionHeader title="6-Month Trend" icon="bar-chart-2" color={accent} />
          <MonthlyTrendChart data={displayAnalytics.monthlyRates} accent={accent} textColor={titleColor} />
        </Card>

        <Card>
          <SectionHeader title="Best Day of Week" icon="sun" color={accent} />
          <DayOfWeekChart data={displayAnalytics.dayOfWeekCounts} accent={accent} textColor={titleColor} />
          <Text style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: titleColor, opacity: 0.6 }}>
            You perform best on{" "}
            <Text style={{ color: accent, fontWeight: "700" }}>{displayAnalytics.bestDayOfWeek}</Text>
          </Text>
        </Card>

        <Card>
          <SectionHeader title="Consistency" icon="check-circle" color={accent} />
          <View style={{ flexDirection: "row", gap: 8 }}>
            <StatCard label="Perfect Weeks" value={displayAnalytics.perfectWeeks} accent={accent} textColor={titleColor} />
            <StatCard label="Perfect Months" value={displayAnalytics.perfectMonths} accent={accent} textColor={titleColor} />
          </View>
        </Card>

        <Card>
          <SectionHeader title="Milestones" icon="award" color={accent} />
          <View style={{ flexDirection: "row", gap: 4 }}>
            {displayAnalytics.milestones.map((m) => (
              <MilestoneBadge
                key={m.days}
                days={m.days}
                achieved={m.achieved}
                accent={accent}
                textColor={titleColor}
              />
            ))}
          </View>
          {displayAnalytics.nextMilestone && (
            <Text style={{ textAlign: "center", marginTop: 12, fontSize: 12, color: titleColor, opacity: 0.55 }}>
              Next milestone:{" "}
              <Text style={{ color: accent, fontWeight: "700" }}>{displayAnalytics.nextMilestone.days} days</Text>
              {" "}— {displayAnalytics.nextMilestone.remaining} streak days to go
            </Text>
          )}
          {!displayAnalytics.nextMilestone && (
            <Text style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: accent, fontWeight: "700" }}>
              🏆 All milestones achieved!
            </Text>
          )}
        </Card>
      </ScrollView>
        </Animated.View>
      )}
    </View>
  );
};

export default Analytics;

const styles = StyleSheet.create({});