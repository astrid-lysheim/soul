# Reed v2 — Architecture & Rebuild Spec

## Overview
RSVP (Rapid Serial Visual Presentation) EPUB reader for Android.
Displays words one-at-a-time at a fixed focal point for speed reading.
Rebuild of existing app with proper architecture and improved aesthetics.

## Project Location
`~/Documents/reed/` — branch `v2-rebuild`
Existing code on `master` branch — reference for core logic to preserve.

## Architecture
- **MVVM** with clean separation
- **Hilt** for dependency injection
- **Jetpack Compose** throughout
- **Room** for persistence
- **Kotlin Coroutines + StateFlow** for async/state

### Package Structure
```
com.reed.rsvp/
├── di/                     # Hilt modules
│   ├── AppModule.kt        # Database, SharedPrefs providers
│   └── EpubModule.kt       # EPUB-related providers
├── data/
│   ├── db/
│   │   ├── AppDatabase.kt
│   │   ├── Book.kt         # Entity
│   │   └── BookDao.kt
│   ├── prefs/
│   │   └── UserPreferences.kt  # DataStore or SharedPrefs wrapper
│   └── repository/
│       └── BookRepository.kt
├── epub/
│   ├── EpubOpener.kt       # Opens/validates EPUBs via Readium
│   ├── EpubTokenizer.kt    # HTML → Token stream
│   ├── ImageExtractor.kt   # Extracts images from EPUB
│   ├── TocParser.kt        # Table of Contents extraction
│   ├── Token.kt            # Sealed class (Word, Image, ChapterBreak)
│   └── Tokenizer.kt        # Core text→word tokenizer (KEEP from v1)
├── player/
│   └── RsvpPlayer.kt       # Playback engine (KEEP from v1, minor cleanup)
├── ui/
│   ├── ReedApp.kt          # Top-level Composable (NavHost + Theme)
│   ├── theme/
│   │   ├── Color.kt        # All color definitions
│   │   ├── Theme.kt        # ReedTheme with Light/Dark/OLED
│   │   └── Type.kt         # Typography
│   ├── components/
│   │   ├── RsvpWordDisplay.kt    # Canvas pivot rendering (KEEP from v1)
│   │   └── RsvpReaderControls.kt # Extracted control bar
│   ├── screens/
│   │   ├── library/
│   │   │   ├── LibraryScreen.kt
│   │   │   └── LibraryViewModel.kt
│   │   ├── reader/
│   │   │   ├── ReaderScreen.kt
│   │   │   └── ReaderViewModel.kt
│   │   ├── clipboard/
│   │   │   ├── ClipboardScreen.kt
│   │   │   └── ClipboardViewModel.kt
│   │   ├── settings/
│   │   │   └── SettingsScreen.kt
│   │   └── onboarding/
│   │       └── OnboardingScreen.kt
│   └── navigation/
│       └── Navigation.kt
├── util/
│   ├── LocaleHelper.kt     # Language switching
│   └── Constants.kt        # All magic numbers
├── MainActivity.kt         # Minimal — just Hilt entry point
└── ReedApplication.kt      # @HiltAndroidApp
```

## Color Palettes

### Light Theme — "Nude Tones"
```
Background:       #faf8f3  (warm cream)
Surface:           #faf0e6  (linen)
Surface Variant:   #e1d6ca  (warm sand)
On Background:     #1a1a1a  (near black, not pure)
On Surface:        #2d2d2d
Primary:           #8B4513  (warm brown accent — saddle brown)
Pivot Red:         #C41E3A  (cardinal red — elegant, not harsh)
```

### Dark Theme — "Noirvana Prestige"
```
Background:        #121212  (Material dark baseline)
Surface:           #202322  (from palette)
Surface Variant:   #2a2d2c
On Background:     #e9e7e1  (warm white from palette)
On Surface:        #c0c5ca  (muted from palette)
Primary:           #7eb8a0  (muted sage green — elegant)
Pivot Red:         #ef5350  (Material red 400 — visible on dark)
```

### OLED Dark — "True Black"
```
Background:        #000000  (pure black)
Surface:           #0d0e0d  (from Noirvana — barely visible)
Surface Variant:   #1a1b1a
On Background:     #e9e7e1  (warm white)
On Surface:        #c0c5ca  (muted)
Primary:           #7eb8a0  (same sage green)
Pivot Red:         #ef5350  (same red)
```

## Features

### 1. RSVP Display (KEEP core logic)
- Focal character at 2nd position (≤5 chars) or 3rd position (>5 chars)
- Red pivot character, Canvas-based centering
- OpenDyslexic Mono font
- Bleeds off edges for long words (no truncation)

### 2. Playback Controls
- **Press-and-hold** (when playing, controls hidden): pause while held, resume on release
- **Tap** (when playing): pause + show controls, auto-hide after 6s
- **Tap** (when controls visible): hide controls, resume if was playing
- **Double-tap**: toggle play/pause
- **Vertical drag** (controls visible): scroll through words — BUT make this **fluid/continuous iOS-style** instead of discrete jumps. Use spring physics / fling decay so the word list feels like a smooth scroll wheel, not step-step-step.

### 3. Word Scrolling — iOS Fluid Style
Instead of discrete step-per-threshold:
- Use `Animatable` with `exponentialDecay` for fling
- Map drag velocity to scroll speed
- Words flow smoothly like iOS date picker / clock
- Decelerate naturally after release
- Still snap to whole words at rest

### 4. Progress Bar
- Visual progress track at bottom
- Long-press (1.2s) to activate seeking mode
- Large percentage overlay while seeking
- Undo button after seek

### 5. Table of Contents
- ModalNavigationDrawer from left
- Nested entries with indent
- Navigate to chapter on tap

### 6. Appearance Settings
- Three themes: Light / Dark / OLED
- Bold font toggle
- Punctuation show/hide
- Font size adjust (16–64sp, step 2)
- WPM adjust (100–1000, step 20)

### 7. Library
- Grid of imported books with cover thumbnails
- Last opened tracking
- Import via system file picker (EPUB, PDF, TXT)
- Delete books
- **Demo book** appears as a library entry (not in settings)
  - Has full controls like any other book
  - Title: "Reed Demo" or "Welcome to Reed"
  - Content: a short intro explaining RSVP reading + how to use the app

### 8. Clipboard/Input Text Reader
- Paste or type text
- Read it with full RSVP controls
- Separate from library flow

### 9. Settings
- Language selection (EN, ES, FR, NO)
- Do Not Disturb toggle
- About/version
- NO demo here (moved to library)

### 10. Onboarding
- First-launch experience
- Quick intro to RSVP concept
- Language selection

### 11. Landscape Support
- **Remove `android:configChanges` from manifest** — let Android handle rotation
- Compose naturally adapts to new dimensions
- ViewModel survives recreation
- All layouts use `fillMaxSize()` / responsive modifiers

## Key Technical Decisions

### State Management
- All UI state in ViewModels via StateFlow
- Theme preference stored in SharedPreferences, exposed via a @Singleton PreferencesManager
- NO global mutable objects (no ThemeState, FontState, etc.)
- Theme applied via CompositionLocal in ReedTheme

### Error Handling
- Custom Result types for EPUB operations
- Logging (not swallowing) of exceptions
- User-facing error messages for common failures (corrupt EPUB, missing file)

### Dependencies (keep existing from build.gradle.kts)
- Readium (EPUB parsing)
- Room (database)
- Coil (image loading)
- JSoup (HTML parsing in tokenizer)
- ADD: Hilt (DI)

## Files to PRESERVE from v1 (copy logic, clean up)
1. `Token.kt` — sealed class, computePivotIndex
2. `Tokenizer.kt` — HTML → word tokenization
3. `RsvpPlayer.kt` — playback engine
4. `RsvpWordDisplay.kt` — Canvas pivot rendering
5. `Book.kt` + `BookDao.kt` — Room entities/DAO
6. `LocaleHelper.kt` — language switching
7. String resources (values/, values-es/, values-fr/, values-nb/)

## AndroidManifest.xml
```xml
<activity
    android:name=".MainActivity"
    android:exported="true"
    android:theme="@style/Theme.Reed">
    <!-- NO configChanges — let Android handle rotation properly -->
```
