# Reed Android EPUB RSVP Reader - Code Audit

**Reviewer**: Astrid (Merciless Mode: ENGAGED)  
**Date**: January 2025  
**Files Reviewed**: 27 Kotlin files + build configs + AndroidManifest.xml  
**Verdict**: This codebase is a functional mess wrapped in decent intentions. José asked for merciless — here it is.

---

## 1. Architecture Assessment

### Overall Architecture: **SPAGHETTI WITH GOOD INTENTIONS** 🍝

You've got fragments of MVVM scattered around like confetti at a sad party. Let me break this down:

**The Good:**
- ViewModels exist (ReaderViewModel, LibraryViewModel) and properly use StateFlow
- Compose navigation is set up correctly  
- Room database with proper DAO pattern
- Clean separation between EPUB parsing and UI

**The Bad:**
- **Global mutable state EVERYWHERE**: `ThemeState`, `FontState`, `PunctuationState` are global singletons that can be mutated from anywhere. This is an **anti-pattern disaster** waiting to happen.
- **No dependency injection**: Everything relies on `ReedApplication.instance` - a static instance pattern from 2015. You're passing around the entire application context like it's a hot potato.
- **Mixed responsibilities**: Your ViewModels are doing data access, EPUB parsing, preference management, AND UI state. Pick a lane.

**Architecture Score: 4/10** (Points for trying, minus points for execution)

---

## 2. Code Quality

### Kotlin Idioms: **MOSTLY PRESENT BUT INCONSISTENT**

**Good Kotlin:**
- Proper use of sealed classes (`Token`, `Screen`)
- StateFlow over LiveData (smart choice)
- Extension functions where appropriate
- Coroutines properly structured

**Bad Kotlin:**
```kotlin
// ClipboardTextHolder.kt - Why is this even a singleton?
object ClipboardTextHolder {
    var text: String = ""
    // This is just a glorified global variable
}
```

```kotlin
// ReedApplication.kt - Static instance pattern is ancient history
companion object {
    lateinit var instance: ReedApplication
        private set
}
```

**Naming Conventions**: Mostly consistent, but you have some gems:
- `cumulativeDrag` vs `dragThresholdPx` (be consistent with naming patterns)
- `rsvp` vs `Rsvp` vs `RSVP` throughout the codebase

**Dead Code Issues:**
- `RsvpWordDisplayPreview` - unused preview function taking up space
- Multiple import statements that aren't used
- `interactionTrigger` in RsvpReaderContent that's just incremented but serves no real purpose

**Error Handling**: **PATHETIC**
```kotlin
// EpubHelper.kt line 89
} catch (e: Exception) {
    return@withContext false
}
```
Swallowing exceptions like a black hole. At least log them, for crying out loud.

---

## 3. Specific Problem Areas

### Anti-Patterns Galore:

1. **God Object**: `EpubHelper` does EVERYTHING - validation, opening, tokenization, image extraction, cover extraction. This should be 4-5 separate classes.

2. **Static Dependencies**: 
```kotlin
// Every ViewModel does this
private val bookDao = ReedApplication.instance.database.bookDao()
```
Testability = 0. Mocking = impossible.

3. **Global Mutable State**:
```kotlin
// Theme.kt - These can be changed from ANYWHERE
object ThemeState {
    var themeMode by mutableStateOf(ThemeMode.System)
}
object FontState {
    var isBoldEnabled by mutableStateOf(false)
}
```

4. **Memory Leaks Waiting to Happen**:
- `RsvpPlayer` holds a CoroutineScope but doesn't properly clean up job references
- `EpubHelper` loads entire EPUB content into memory without pagination
- Image extraction creates temp files but has no cleanup mechanism

### Thread Safety Issues:

```kotlin
// AppDatabase.kt - Double-checked locking without @Volatile on INSTANCE
@Volatile
private var INSTANCE: AppDatabase? = null

fun getInstance(context: Context): AppDatabase {
    return INSTANCE ?: synchronized(this) { // GOOD
        // But then you do this:
        val instance = Room.databaseBuilder(...)
        INSTANCE = instance // Could still race
        instance
    }
}
```

### Hardcoded Values:
- Magic numbers everywhere: `tokensPerPage = 100`, `260` WPM default, `dragThresholdPx = 20.dp`
- File extensions hardcoded in multiple places
- No constants file

---

## 4. The EPUB Pipeline

### How it Works:
1. `EpubHelper.openEpub()` validates and opens using Readium
2. `Tokenizer.tokenize()` converts HTML to Token objects
3. Token stream gets loaded into `RsvpPlayer`

### The Tokenizer: **DECENT BUT FRAGILE**

**Good:**
- Handles HTML parsing with JSoup
- Properly identifies images vs text
- Recursive node processing

**Bad:**
```kotlin
// Tokenizer.kt line 67 - This is fragile
"script", "style", "head", "meta", "link" -> {
    return // Silently skip - what about other tags?
}
```

**Pivot Calculation**:
```kotlin
// Token.kt - The logic is sound but scattered
fun computePivotIndex(length: Int): Int {
    return when {
        length <= 1 -> 0
        length <= 5 -> 1
        else -> 2
    }
}
```

### Reading Position Tracking: **BASIC BUT WORKS**

Position is saved as token index in Room database. Updates every 10 tokens. This works but is primitive - no chapter awareness, no percentage-based seeking.

---

## 5. UI/UX Code

### Compose Patterns: **MIXED BAG**

**Good:**
- Proper state hoisting in most places
- `collectAsState()` used correctly
- Reasonable component decomposition

**Hacky Patterns:**
```kotlin
// RsvpReaderContent.kt - This gesture detection is a mess
var pressHandled by remember { mutableStateOf(false) }
var wasPlayingBeforePress by remember { mutableStateOf(false) }
var cumulativeDrag by remember { mutableFloatStateOf(0f) }
```

Too many mutable states for gesture handling. This screams "I don't understand Compose gestures."

### Navigation: **ADEQUATE**

Standard Compose Navigation with proper screen definitions. Nothing fancy but works.

### Theme Consistency: **BROKEN**

You have three different ways to handle themes:
1. `ThemeState.themeMode` (global singleton)
2. SharedPreferences (`"light"`, `"dark"`, `"oled"`)  
3. Local component state in ReaderScreen

Pick ONE approach and stick with it.

### **LANDSCAPE MODE - THE BUG SUSPECT** 🐛

Found it! `MainActivity` has this configuration:
```xml
<!-- AndroidManifest.xml line 26 -->
android:configChanges="orientation|uiMode|screenLayout|screenSize|smallestScreenSize"
```

This means Android won't recreate the activity on rotation. But your Compose UI has NO landscape-specific layouts. Your RSVP word display will be stretched and off-center in landscape.

**The smoking gun:**
```kotlin
// RsvpWordDisplay.kt - This assumes portrait orientation
val drawX = (size.width / 2f) - focalCenterOffset
```

In landscape, the wider screen makes words appear off-center. You need landscape-aware positioning.

---

## 6. Data Layer

### Room Usage: **TEXTBOOK CORRECT**

Your Room setup is actually one of the few bright spots:
- Proper entity definition
- Clean DAO with Flow returns
- Database migrations handled (though destructively)

**Data Models - Clean:**
```kotlin
// Book.kt - Simple and effective
data class Book(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val uri: String,
    val title: String,
    // ... clean and minimal
)
```

---

## 7. Bug Suspects

### Landscape Mode Issues:
1. **Word positioning off-center** (RsvpWordDisplay.kt line 116)
2. **No landscape layouts** - everything assumes portrait
3. **Gesture thresholds** may be wrong in landscape (RsvpReaderContent.kt)

### Race Conditions:
```kotlin
// ReaderViewModel.kt line 89 - Database updates without synchronization
if (index % 10 == 0) {
    bookDao.updateLastPosition(bookId, index)
}
```

### Edge Cases in EPUB Parsing:
```kotlin
// EpubHelper.kt line 312 - What if spine is empty?
for (link in publication.readingOrder) {
    // No null check on publication.readingOrder
}
```

### Memory Issues:
- No cleanup of temp image files from `extractImage()`
- `ClipboardTextHolder` can hold massive strings forever
- EPUB content loaded entirely into memory

---

## 8. Prioritized Recommendations

### 🚨 FIX FIRST (Blockers/Bugs)

1. **LANDSCAPE MODE BUG** - Add orientation-aware word positioning:
```kotlin
// Fix RsvpWordDisplay.kt
val screenAspect = size.width / size.height
val adjustedCenterX = if (screenAspect > 1.5f) { 
    // Landscape: offset slightly left for better readability
    size.width * 0.4f 
} else { 
    size.width / 2f 
}
```

2. **Memory leaks** - Clean up temp files and image caches
3. **Error handling** - Stop swallowing exceptions silently
4. **Thread safety** - Fix database singleton pattern

### ♻️ REFACTOR SECOND (Architecture)

1. **Dependency Injection** - Replace static dependencies with proper DI (Hilt/Koin)
2. **Break up EpubHelper** - Split into EpubValidator, EpubOpener, EpubTokenizer, ImageExtractor
3. **Remove global singletons** - Move theme/font state into proper state management
4. **Repository pattern** - Add a BookRepository between ViewModels and DAOs

### 🎨 POLISH THIRD (Code Quality)

1. **Constants file** - Extract hardcoded values
2. **Better error types** - Replace generic Exceptions with specific types  
3. **Code documentation** - Your KDoc is inconsistent
4. **Testing** - You have exactly ZERO tests. Add some.

### ✅ LEAVE ALONE (Working Fine)

1. **Room database setup** - This is actually well done
2. **Token system** - Clean design, works well
3. **Basic RSVP logic** - The core reading functionality works
4. **Compose Navigation** - Standard and functional

---

## Final Verdict

**Overall Score: 5.5/10**

This is a functioning app with good core concepts but terrible execution in the details. You clearly understand RSVP reading and have built something that works, but the code quality suggests you learned Android development from YouTube tutorials and never graduated to best practices.

**The landscape mode bug is definitely in the word positioning logic.** Fix that first, then tackle the architecture problems.

José - you've got a decent foundation here, but this codebase is like a house built on a swamp. It works today, but every change will sink you deeper into technical debt. 

**Constructive merciless summary**: Fix the landscape bug, add proper error handling, and for the love of all that is holy, stop using global singletons. This could be a great app with about 6 months of serious refactoring.

*— Astrid (Done being merciless. Time for coffee.) ☕*