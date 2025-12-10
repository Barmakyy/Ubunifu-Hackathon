# 📚 Component & Feature Documentation

## 🎨 Design System

### Color Palette (Mental Health-Safe)

```css
Sage Green:   #5a925a - Growth, calm, nature
Coral Peach:  #e56b5a - Warmth, encouragement
Soft Violet:  #8c6ac0 - Peace, creativity
Dusty Blue:   #7099bd - Stability, trust
Cream:        #cdb68d - Comfort, warmth
```

### Typography

- Font Family: Inter, system fonts
- Headings: Bold, larger sizes with proper hierarchy
- Body: Regular weight, comfortable line height
- Small text: 0.875rem (14px) for secondary info

### Spacing & Borders

- Rounded edges throughout: 1rem, 1.5rem for cards
- Consistent padding: 1.5rem (24px) for cards
- Gap spacing: 1rem (16px) between elements

## 📦 Component Breakdown

### Authentication

#### Login.jsx

- **Purpose**: User authentication entry point
- **Features**:
  - Email/password login
  - Demo credentials display
  - Beautiful gradient background
  - Responsive design
- **Styling**: Sage green accent, rounded corners
- **Props**: None (uses authStore)

#### Signup.jsx

- **Purpose**: Multi-step registration for students
- **Steps**:
  1. Basic info (name, email, password)
  2. Department & module selection
  3. Goal setting (3 goals)
  4. Motivational tone selection
- **Features**:
  - Progress indicator
  - Module selection with visual feedback
  - Tone options with icons
  - Validation at each step
- **Styling**: Rounded cards, sage green primary
- **Props**: None (uses authStore)

### Student Components

#### StudentDashboard.jsx

- **Purpose**: Main hub for students
- **Key Features**:
  - Personalized greeting with motivational tone
  - Circular streak ring visualization (SVG)
  - Today's class schedule with attendance status
  - Grace units tracker with visual progress
  - Quick action buttons (QR, Rewards, Chat, Reports)
  - Motivational quote section
- **State**: todaySchedule, loading
- **Props**: None (uses authStore)

#### QRScanner.jsx

- **Purpose**: Attendance marking via QR code
- **Key Features**:
  - Animated scanner interface
  - Confetti celebration on success (50 particles)
  - Grace unit usage notification
  - Success/failure feedback
  - Remaining grace units display
- **Animations**:
  - Pulse ring during scanning
  - Gentle bounce on camera icon
  - Confetti particles with random colors
- **State**: scanning, scannedCode, showConfetti, result
- **Props**: None (uses authStore)

#### Rewards.jsx

- **Purpose**: Display reward progress and milestones
- **Key Features**:
  - Current streak display with animation
  - 4 reward cards (10, 20, 40, 60 days)
  - Progress bars for each reward
  - Unlock status indicators
  - Claim instructions
  - Encouragement message
- **Calculations**:
  - Progress percentage: (streak / milestone) \* 100
  - Remaining classes: milestone - currentStreak
- **State**: None (uses user data from authStore)
- **Props**: None (uses authStore)

#### EmotionalChatbot.jsx

- **Purpose**: AI companion for mental health support
- **Key Features**:
  - Mood selector (5 moods: happy, calm, neutral, anxious, stressed)
  - Chat interface with bot responses
  - CBT-lite micro-tasks (5 exercises)
  - Task progress tracking with timer
  - Suggested tasks based on mood/input
  - Quick access to all exercises
- **CBT Tasks**:
  1. Box Breathing (120s)
  2. Three Good Things (300s)
  3. 5-4-3-2-1 Grounding (180s)
  4. Positive Affirmations (60s)
  5. Body Scan (120s)
- **State**: messages, input, selectedMood, showMoodSelector, activeTask, taskProgress
- **Props**: None (uses authStore)

### Lecturer Components

#### LecturerDashboard.jsx

- **Purpose**: Class management for teachers
- **Key Features**:
  - Today's classes list
  - Enrollment & attendance stats (Present/Absent)
  - QR code generation button
  - Active QR display with countdown
  - Download reports (CSV)
  - Weekly summary statistics
- **Stats Display**:
  - Enrolled students
  - Present count (green)
  - Absent count (coral)
- **State**: todayClasses, selectedClass, students, qrSession, loading
- **Props**: None (uses authStore)

### Admin Components

#### AdminDashboard.jsx

- **Purpose**: Institution-wide management
- **Key Features**:
  - Overview stats (4 metric cards)
  - Timetable CSV upload
  - Reward definition management
  - Attendance heatmap (35-day grid)
  - Lecturer management list
- **Sections**:
  1. Stats (Students, Lecturers, Attendance, Streaks)
  2. Timetable Upload (CSV format guidance)
  3. Reward Configuration (4 milestones)
  4. Visual Heatmap (intensity-based colors)
  5. Lecturer List (with class counts)
- **State**: stats, showUpload, file, loading
- **Props**: None (uses authStore)

### Layout & Navigation

#### EnhancedLayout.jsx

- **Purpose**: Main app layout with role-based navigation
- **Key Features**:
  - Role-based sidebar navigation
  - Role switcher dropdown (Demo mode)
  - Mobile-responsive sidebar
  - Gradient header with role badge
  - Profile and logout buttons
- **Navigation Arrays**:
  - studentNav: 7 items (Dashboard, Scan, Rewards, etc.)
  - teacherNav: 2 items (Dashboard, Classes)
  - adminNav: 4 items (Dashboard, Students, Lecturers, Rewards)
- **Role Switching**: Changes user in authStore without logout
- **State**: sidebarOpen, showRoleSwitcher
- **Props**: None (uses authStore, Outlet from react-router)

## 🔄 State Management

### authStore (Zustand + Persist)

```javascript
{
  user: {
    id, firstName, lastName, email, role,
    department, selectedUnits, goals, motivationalTone,
    streak, graceUnitsRemaining, graceUnitsTotal,
    totalClasses, attendedClasses
  },
  token: string,
  setAuth: (user, token) => void,
  logout: () => void
}
```

## 🎭 Animations

### Confetti Effect

```css
@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
```

- Duration: 3s
- Random colors from palette
- 50 particles
- Random horizontal positions
- Staggered animation delays

### Pulse Ring

```css
@keyframes pulse-ring {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}
```

- Duration: 2s
- Infinite loop
- Used on streak ring

### Gentle Bounce

```css
@keyframes gentle-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}
```

- Duration: 2s
- Infinite loop
- Used on interactive icons

## 📡 API Integration Points

### Current (Mock)

All data currently mocked in components for demo purposes.

### Production Ready Points

```javascript
// Attendance
POST /attendance { studentId, qrCode, timestamp }
GET /attendance/today
GET /attendance/stats?period=week

// QR Sessions
POST /qr/generate { classId, teacherId, date }
GET /qr/active/:classId

// Reports
GET /attendance/report/:classId (CSV download)

// Timetable
POST /admin/timetable/upload (FormData with CSV)

// Mood Tracking
POST /mood { studentId, mood, energy, stress, notes }
GET /mood/:studentId?period=week

// Chatbot
POST /chatbot/message { studentId, message }
GET /chatbot/history/:studentId
```

## 🎯 Motivational Tone System

### Tone Options

1. **Encouraging**: "You've got this", "Ready to shine"
2. **Gentle**: "Take it one step", "You're doing well"
3. **Motivating**: "Time to crush it", "Let's go"
4. **Supportive**: "We're here for you", "You're not alone"
5. **Calm**: "Peace and focus", "Steady as you go"

### Application

- Dashboard greeting
- Attendance success messages
- Weekly report commentary
- Chatbot responses

## 🏆 Reward Milestones

### Structure

```javascript
{
  milestone: number,    // Days required
  reward: string,       // Title
  description: string,  // Full description
  color: string        // Theme color (sage/violet/dusty/coral)
}
```

### Default Rewards

1. **10 days** → Library Priority Access (sage)
2. **20 days** → Digital Badge (violet)
3. **40 days** → Hostel Room Priority (dusty)
4. **60 days** → Certificate of Excellence (coral)

## 🛡️ Grace Unit System

### Purpose

Reduce anxiety by allowing 2 "free passes" per month for:

- Late arrivals (after QR code expires)
- Missed classes
- Technical issues

### Logic

```javascript
if (lateOrMissed && graceUnitsRemaining > 0) {
  graceUnitsRemaining--;
  maintainStreak();
  showMessage("Grace unit used. Your streak is safe! 💫");
} else if (graceUnitsRemaining === 0) {
  breakStreak();
  showMessage("No grace units left. New streak starts tomorrow.");
}
```

### Display

- Progress bars showing remaining units
- Monthly reset notification
- Empathetic messaging when used

## 🧘 CBT-Lite Exercises

### Exercise Structure

```javascript
{
  id: number,
  type: string,           // breathing/gratitude/grounding/affirmation/mindfulness
  title: string,
  description: string,    // Step-by-step instructions
  duration: number,       // Seconds
  icon: emoji,           // Visual identifier
  category: string       // anxiety/mood/confidence
}
```

### Integration

1. Suggested based on mood/keywords
2. Timer with progress bar
3. Completion celebration
4. Quick access buttons

## 📊 Database Schema

### Key Collections

- **institutions**: Config, rewards
- **admins**: Admin users
- **users**: Students (with profile) & teachers
- **attendance**: Records with timestamps
- **qrSessions**: Generated codes with validity
- **moodCheckins**: Daily mood logs
- **chatbotSessions**: Conversation history
- **cbtTasks**: Exercise definitions
- **weeklyReports**: Auto-generated summaries

## 🔐 Security Considerations

### Current (Demo)

- Mock authentication
- No password hashing
- Client-side validation only

### Production Recommendations

1. JWT tokens with expiry
2. Bcrypt password hashing
3. Rate limiting on QR generation
4. CORS configuration
5. Input sanitization
6. HTTPS only
7. Environment variables for secrets

## 📱 Responsive Breakpoints

```css
mobile: < 768px
tablet: 768px - 1023px
desktop: 1024px+

Grid adjustments:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3-4 columns
```

## 🎨 Component Library Usage

### Icons (lucide-react)

- Navigation: Home, Calendar, Users, etc.
- Actions: QrCode, Send, Download
- Status: CheckCircle, XCircle, Clock
- Emotions: Smile, Heart, Meh, Frown, Angry

### Toasts (react-hot-toast)

- Success: Green with check
- Error: Coral with X
- Info: Blue with info icon
- Custom: Rounded, soft shadows

---

**This documentation covers all major components and features. Use it as a reference for extending or modifying the application!** 🚀
