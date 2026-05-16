# LifeStack — React Native Expo App

## Tech Stack
- Expo SDK 54 with TypeScript
- Expo Router (file-based routing)
- React Native Paper (Material Design 3 UI)
- Zustand (state management)
- Supabase (auth + cloud sync)
- expo-sqlite (local offline storage)
- expo-notifications (push reminders)
- date-fns (date utilities)

## Key Commands
- `npm start` — Start Expo dev server
- `npm run android` — Start on Android emulator
- `npx tsc --noEmit` — TypeScript typecheck
- `npx expo export --platform android` — Build APK

## Project Structure
```
app/              # Expo Router pages
├── (auth)/       # Login, Register
├── (tabs)/       # Habits, Tasks, Goals, Routines, Health, Gym
src/
├── components/   # Shared UI components (ScreenWrapper, PageHeader, StatCard, EmptyState)
├── constants/    # Colors, icons, theme values
├── lib/          # database.ts (SQLite), supabase.ts (client), sync.ts (offline-first), notifications.ts
├── store/        # Zustand stores (auth, habit, task, goal, routine, health, gym)
└── types/        # TypeScript interfaces
```

## Setup
1. Copy `.env.template` to `.env` and fill in Supabase credentials
2. `npm install`
3. `npx expo start`

## Architecture
- **Offline-first**: All data stored in local SQLite first, synced to Supabase when online
- **Auth**: Supports email/password, Google OAuth, and anonymous sign-in
- **Sync**: `sync.ts` handles push/pull with Supabase; stores mark records as `pending` when offline
