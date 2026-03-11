import { StyleSheet, View, TouchableOpacity, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { TextInput, Text } from "react-native-paper";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { supabase } from "../lib/supabase";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [touched, setTouched] = useState({ email: false, password: false });

  // Card entrance
  const cardOpacity = useSharedValue(0);
  const cardTranslateY = useSharedValue(40);

  // Floating dot animations
  const dot1Y = useSharedValue(0);
  const dot1Opacity = useSharedValue(0.3);
  const dot2Y = useSharedValue(0);
  const dot2Opacity = useSharedValue(0.2);
  const dot3Y = useSharedValue(0);
  const dot3Opacity = useSharedValue(0.4);

  useEffect(() => {
    cardOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    cardTranslateY.value = withTiming(0, { duration: 700, easing: Easing.out(Easing.cubic) });

    dot1Y.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    );
    dot1Opacity.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    );

    dot2Y.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(-16, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    ));
    dot2Opacity.value = withDelay(300, withRepeat(
      withSequence(
        withTiming(0.7, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    ));

    dot3Y.value = withDelay(600, withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    ));
    dot3Opacity.value = withDelay(600, withRepeat(
      withSequence(
        withTiming(1.0, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.4, { duration: 2000, easing: Easing.inOut(Easing.sin) })
      ), -1, false
    ));
  }, []);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ translateY: cardTranslateY.value }],
  }));

  const dot1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dot1Y.value }],
    opacity: dot1Opacity.value,
  }));

  const dot2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dot2Y.value }],
    opacity: dot2Opacity.value,
  }));

  const dot3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: dot3Y.value }],
    opacity: dot3Opacity.value,
  }));

  // ── Validation helpers ──────────────────────────────────────────
  const validateEmail = (val) => {
    if (!val.trim()) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return "Enter a valid email address.";
    return "";
  };

  const validatePassword = (val) => {
    if (!val) return "Password is required.";
    if (val.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  const isFormValid = () =>
    !validateEmail(email) && !validatePassword(password);

  const handleEmailBlur = () => {
    setTouched((prev) => ({ ...prev, email: true }));
    setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    setFocusedField(null);
  };

  const handlePasswordBlur = () => {
    setTouched((prev) => ({ ...prev, password: true }));
    setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    setFocusedField(null);
  };

  const runValidation = () => {
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ email: emailErr, password: passwordErr });
    setTouched({ email: true, password: true });
    return !emailErr && !passwordErr;
  };

  // ── Auth ────────────────────────────────────────────────────────
  const signIn = async () => {
    if (!runValidation()) return;
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const signUp = async () => {
    if (!runValidation()) return;
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
        // Nothing
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="height">
      {/* Background decoration */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      {/* Floating dots */}
      <Animated.View style={[styles.dot, styles.dot1, dot1AnimatedStyle]} />
      <Animated.View style={[styles.dot, styles.dot2, dot2AnimatedStyle]} />
      <Animated.View style={[styles.dot, styles.dot3, dot3AnimatedStyle]} />

      <Animated.View style={[styles.card, cardAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconWrapper}>
            <Image
              source={require("../../assets/adaptive-icon.png")}
              style={styles.iconImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Habit Tracker</Text>
          <Text style={styles.subtitle}>Your Daily Commitment Companion</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            placeholder="you@example.com"
            value={email}
            onChangeText={(val) => {
              setEmail(val);
              if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
            }}
            autoCapitalize="none"
            keyboardType="email-address"
            onFocus={() => setFocusedField("email")}
            onBlur={handleEmailBlur}
            style={styles.input}
            mode="outlined"
            label=""
            outlineColor={touched.email && errors.email ? "#EF4444" : "#BFDBFE"}
            activeOutlineColor={touched.email && errors.email ? "#EF4444" : "#2563EB"}
            textColor="#0F172A"
            placeholderTextColor="#CBD5E1"
            theme={{
              colors: { background: "#F8FAFF", onSurfaceVariant: "#94A3B8" },
              roundness: 14,
            }}
            left={
              <TextInput.Icon
                icon="email-outline"
                color={
                  touched.email && errors.email
                    ? "#EF4444"
                    : focusedField === "email"
                    ? "#2563EB"
                    : "#94A3B8"
                }
              />
            }
          />
          {touched.email && errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}

          <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Password</Text>
          <TextInput
            placeholder="Min. 6 characters"
            autoCapitalize="none"
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (touched.password) setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
            }}
            secureTextEntry={!showPassword}
            onFocus={() => setFocusedField("password")}
            onBlur={handlePasswordBlur}
            style={styles.input}
            mode="outlined"
            label=""
            outlineColor={touched.password && errors.password ? "#EF4444" : "#BFDBFE"}
            activeOutlineColor={touched.password && errors.password ? "#EF4444" : "#2563EB"}
            textColor="#0F172A"
            placeholderTextColor="#CBD5E1"
            theme={{
              colors: { background: "#F8FAFF", onSurfaceVariant: "#94A3B8" },
              roundness: 14,
            }}
            left={
              <TextInput.Icon
                icon="lock-outline"
                color={
                  touched.password && errors.password
                    ? "#EF4444"
                    : focusedField === "password"
                    ? "#2563EB"
                    : "#94A3B8"
                }
              />
            }
            right={
              <TextInput.Icon
               icon={showPassword ? "eye-off-outline" : "eye-outline"}
               color={focusedField === "password" ? "#2563EB" : "#94A3B8"}
               onPress={() => setShowPassword((prev) => !prev)}
              />
            }
          />
          {touched.password && errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
        </View>

        {/* Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              (loading || !isFormValid()) && styles.primaryBtnDisabled,
            ]}
            onPress={signIn}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>
              {loading ? "Signing in…" : "Sign In"}
            </Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={[
              styles.secondaryBtn,
              (loading || !isFormValid()) && styles.secondaryBtnDisabled,
            ]}
            onPress={signUp}
            disabled={loading}
            activeOpacity={0.7}
          >
            <Text style={styles.secondaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  bgCircle1: {
    position: "absolute",
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "#DBEAFE",
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#BFDBFE",
    bottom: 40,
    left: -60,
  },
  dot: {
    position: "absolute",
    borderRadius: 50,
    backgroundColor: "#2563EB",
  },
  dot1: { width: 10, height: 10, top: "20%", left: "15%" },
  dot2: { width: 6, height: 6, top: "35%", right: "12%" },
  dot3: { width: 14, height: 14, bottom: "22%", right: "18%" },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: 32,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.10,
    shadowRadius: 32,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  iconImage: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13.5,
    color: "#94A3B8",
    textAlign: "center",
    lineHeight: 19,
  },
  form: {
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    marginBottom: 2,
    backgroundColor: "#F8FAFF",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
  actions: {
    marginTop: 16,
  },
  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DBEAFE",
  },
  dividerText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "500",
  },
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#BFDBFE",
    backgroundColor: "transparent",
  },
  secondaryBtnDisabled: {
    opacity: 0.45,
  },
  secondaryBtnText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "600",
  },
});