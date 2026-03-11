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

// ─── Constants ──────────────────────────────────────────────────────────────

export const MILESTONE_DAYS = [7, 14, 30, 50, 100];

export const DEFAULT_ANALYTICS = {
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
  milestones: MILESTONE_DAYS.map((d) => ({ days: d, achieved: false })),
  nextMilestone: { days: 7, remaining: 7 },
  weeksWithAtLeastOne: 0,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Builds the markedDates map for react-native-calendars period marking.
 * Consecutive dates are grouped into continuous periods.
 */
export function computeMarkedDates(completedDates, accent, currentDate) {
  if (!completedDates || completedDates.length === 0) {
    return { [currentDate]: { marked: true } };
  }

  const sortedDates = [...completedDates].sort();
  const result = {};

  sortedDates.forEach((date, index) => {
    const prev = sortedDates[index - 1];
    const next = sortedDates[index + 1];

    const isStart =
      !prev || differenceInDays(parseISO(date), parseISO(prev)) > 1;
    const isEnd =
      !next || differenceInDays(parseISO(next), parseISO(date)) > 1;

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

/**
 * Derives all analytics metrics from a habit's completedDates array.
 * Returns DEFAULT_ANALYTICS when there are no completed dates yet.
 */
export function computeAnalytics(habit) {
  const completed = habit?.completedDates ?? [];
  if (completed.length === 0) return { ...DEFAULT_ANALYTICS };

  const sortedDates = [...completed].sort();
  const parsedSorted = sortedDates.map(parseISO);
  const today = new Date();

  // ── Streaks ────────────────────────────────────────────────────────────────
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

  // ── Completion rate ────────────────────────────────────────────────────────
  const daysBetween = differenceInDays(today, parsedSorted[0]) + 1;
  const completionPercentage = Math.round(
    (parsedSorted.length / daysBetween) * 100
  );
  const habitAgeDays = daysBetween;
  const firstDate = format(parsedSorted[0], "MMM d, yyyy");

  // ── Gap analysis ──────────────────────────────────────────────────────────
  let longestGap = 0;
  for (let i = 1; i < parsedSorted.length; i++) {
    const gap = differenceInDays(parsedSorted[i], parsedSorted[i - 1]) - 1;
    if (gap > longestGap) longestGap = gap;
  }

  const avgStreakLength =
    streakLengths.length > 0
      ? Math.round(
          streakLengths.reduce((a, b) => a + b, 0) / streakLengths.length
        )
      : 0;

  // ── Day-of-week distribution ───────────────────────────────────────────────
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0];
  parsedSorted.forEach((d) => dayOfWeekCounts[getDay(d)]++);

  const DAY_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday",
    "Thursday", "Friday", "Saturday",
  ];
  const bestDayIndex = dayOfWeekCounts.indexOf(Math.max(...dayOfWeekCounts));
  const bestDayOfWeek = DAY_NAMES[bestDayIndex];

  // ── Monthly rates (last 6 months) ─────────────────────────────────────────
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

  // ── This month vs last month ───────────────────────────────────────────────
  const thisMonthStart = startOfMonth(today);
  const lastMonthStart = startOfMonth(subMonths(today, 1));
  const lastMonthEnd = endOfMonth(subMonths(today, 1));

  const thisMonthDays = differenceInDays(today, thisMonthStart) + 1;
  const lastMonthDays = differenceInDays(lastMonthEnd, lastMonthStart) + 1;

  const thisMonthCount = parsedSorted.filter((d) =>
    isWithinInterval(d, { start: thisMonthStart, end: today })
  ).length;
  const lastMonthCount = parsedSorted.filter((d) =>
    isWithinInterval(d, { start: lastMonthStart, end: lastMonthEnd })
  ).length;

  const thisMonthRate = Math.round((thisMonthCount / thisMonthDays) * 100);
  const lastMonthRate = Math.round((lastMonthCount / lastMonthDays) * 100);

  // ── Perfect weeks / months ────────────────────────────────────────────────
  const completedSet = new Set(sortedDates);
  const habitStart = parsedSorted[0];

  let perfectWeeks = 0,
    weeksWithAtLeastOne = 0;

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
    if (days.every((d) => completedSet.has(format(d, "yyyy-MM-dd"))))
      perfectMonths++;
  }

  // ── Misc ──────────────────────────────────────────────────────────────────
  const totalWeeks = Math.max(1, Math.ceil(habitAgeDays / 7));
  const avgDaysPerWeek = (parsedSorted.length / totalWeeks).toFixed(1);

  const milestones = MILESTONE_DAYS.map((d) => ({
    days: d,
    achieved: maxStreak >= d,
  }));
  const nextMilestoneDay = MILESTONE_DAYS.find((d) => maxStreak < d) ?? null;
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