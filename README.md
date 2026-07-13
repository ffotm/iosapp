# Adhan & Qibla — Prayer Times App

React Native (Expo) app: prayer times, adhan notifications, and a live Qibla compass — all built and tested **without needing macOS**.

## What's included

- `src/utils/prayerTimes.ts` — prayer time calculations via the `adhan` library (12 calculation methods, Shafi/Hanafi Asr).
- `src/utils/qibla.ts` — great-circle bearing + distance to the Kaaba.
- `src/utils/notifications.ts` — schedules local notifications at each prayer time.
- `src/context/SettingsContext.tsx` — persists calculation method / madhab / notification toggles.
- `src/screens/HomeScreen.tsx` — today's prayer times, next-prayer countdown, adhan playback button.
- `src/screens/QiblaScreen.tsx` — live rotating compass pointing to Mecca.
- `src/screens/SettingsScreen.tsx` — method/madhab/notification preferences.
- `App.tsx` — bottom tab navigation between the three screens.

## 1. Prerequisites (on your computer — Linux/Windows/whatever)

- Node.js 18+ and npm
- The Expo Go app installed on your iPhone (from the App Store — free, no developer account needed for this step)

## 2. Install dependencies

```bash
cd adhan-app
npm install
```

## 3. Add audio assets (required for adhan playback)

This scaffold references two audio files that aren't included (copyright — you should supply your own or use a royalty-free adhan recording):

- `assets/adhan-full.mp3` — full adhan, played in-app when you tap "Play Adhan"
- `assets/adhan-notification.wav` — a short clip (≤30s), used as the iOS notification sound

Also add placeholder app icons: `assets/icon.png` (1024×1024) and `assets/splash.png`.

## 4. Run it on your iPhone — no Mac needed

```bash
npx expo start
```

This prints a QR code in your terminal. Open the **Expo Go** app on your iPhone and scan it (or scan with the Camera app, which will offer to open it in Expo Go). Your phone and computer need to be on the same Wi-Fi network.

Everything in this scaffold — location, the compass, notifications UI, navigation — works fully inside Expo Go. This is your main development/testing loop.

### Known Expo Go limitation

Custom notification **sounds** (the `.wav` adhan clip) and some background-audio behavior only take effect in a real compiled build, not inside Expo Go itself (Expo Go can only use its own default sound). For everyday development this doesn't block you — just build a real binary once you want to test the actual adhan sound end-to-end (next section).

## 5. Building a real installable app — still no Mac needed

This is the part that normally requires Xcode. Instead, use **EAS Build**, Expo's cloud build service, which compiles the real `.ipa` for you on Expo's servers.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile development
```

You'll need:
- A free Expo account (for `eas login`)
- An Apple Developer account ($99/year) — required by Apple for any app to run on a real iPhone outside Expo Go, or to submit to TestFlight/App Store. EAS will walk you through registering your iPhone's device ID and handles all certificate/signing steps itself — you never touch Xcode.

Once the build finishes, EAS gives you a link — open it on your iPhone in Safari and it installs directly, like TestFlight.

For App Store submission later:
```bash
eas build --platform ios --profile production
eas submit --platform ios
```

## 6. Where to go from here

- **Background/critical adhan playback**: iOS restricts apps from reliably auto-playing long audio in the background purely from a local timer. A more robust solution (used by apps like Muslim Pro) combines silent push notifications from your own small backend with `expo-task-manager`, or `expo-background-fetch` — worth tackling once the core app is solid.
- **Multiple cities / manual location override**: add a search screen using a geocoding API (e.g. `expo-location`'s `geocodeAsync`) for users who want to set a location manually instead of using GPS.
- **Widgets/Live Activities**: would require native Swift code (and thus a Mac) — out of scope for the Expo managed workflow, but possible later via a custom native module if you ever get access to a Mac or a CI Mac runner (e.g. Codemagic, Bitrise).
