export const Colors = {
  primary: '#7C6FCD',
  primaryDark: '#6A5DBF',
  primaryLight: '#C5BDF0',
  secondary: '#A8D8EA',
  secondaryDark: '#8FC8DC',
  secondaryLight: '#D4EEF5',
  accent: '#F4A261',
  accentLight: '#FAE5D3',
  success: '#A8D8A8',
  successDark: '#7CC47C',
  warning: '#F5D7A8',
  error: '#E8A8A8',
  errorDark: '#D47C7C',
  background: '#F8F7FF',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: 'rgba(124, 111, 205, 0.10)',
  text: '#1A1A2E',
  textDark: '#1A1A2E',
  textSecondary: '#6B7280',
  textGray: '#6B7280',
  textTertiary: '#9CA3AF',
  textInverse: '#FFFFFF',
  shadow: 'rgba(124, 111, 205, 0.10)',
  shadowStrong: 'rgba(124, 111, 205, 0.18)',
  gradientStart: '#C5BDF0',
  gradientEnd: '#D4EEF5',
  overlay: 'rgba(26, 26, 46, 0.4)',
  lavender: '#C5BDF0',
  lavenderLight: '#EEEAFF',
  skyBlue: '#A8D8EA',
  skyBlueLight: '#E8F6FB',
  rose: '#F0C4D0',
  roseLight: '#FDE8EE',
  mint: '#A8D8A8',
  mintLight: '#E8F5E8',
  peach: '#F5D7A8',
  peachLight: '#FDF0E0',
  white: '#FFFFFF',
};

export const HabitColors = [
  '#7C6FCD', '#A8D8EA', '#F0C4D0', '#A8D8A8',
  '#F5D7A8', '#C5BDF0', '#D4EEF5', '#F8DFE8',
];

export const HabitIcons = [
  'star', 'heart', 'book', 'run', 'water',
  'bed', 'cafe', 'meditation', 'yoga', 'walk',
  'fire', 'music', 'palette', 'leaf', 'moon',
];

export const PriorityColors: Record<string, string> = {
  low: '#A8D8A8',
  medium: '#F5D7A8',
  high: '#E8A8A8',
};

export const CategoryColors: Record<string, string> = {
  work: '#7C6FCD',
  personal: '#F0C4D0',
  health: '#A8D8A8',
  finance: '#F5D7A8',
  education: '#A8D8EA',
  social: '#C5BDF0',
};

export const ExerciseCategories = [
  'chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio', 'full_body',
];

export const AchievementColors: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#9CA3AF',
  gold: '#FFD700',
  diamond: '#B9F2FF',
  platinum: '#E5E4E2',
};

export const MoodEmojis = ['😊', '😌', '😐', '😢', '😡'];
export const WaterIntakeGoal = 2000;
export const StepGoal = 10000;
export const SleepGoal = 8;

export const ShadowStyle = {
  card: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  elevated: {
    shadowColor: Colors.shadowStrong,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  floating: {
    shadowColor: Colors.shadowStrong,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 12,
  },
};
