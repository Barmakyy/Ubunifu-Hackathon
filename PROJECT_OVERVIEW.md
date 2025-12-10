# Student Accountability App - Project Overview

## 🎯 Problem Statement

Students often struggle with:

- Missing classes due to poor time management
- Losing motivation and accountability
- Forgetting assignments and deadlines
- Tracking academic progress
- Maintaining consistent study habits

## 💡 Solution

**StudySync** is a comprehensive accountability platform that combines:

- **Automated reminders** for classes and tasks
- **Streak tracking** to build consistency
- **Personalized motivation** based on user preference
- **AI chatbot support** for emotional accountability
- **Progress analytics** with weekly reports

## 🏗️ Architecture

### Frontend (React + Vite + Tailwind CSS v4)

```
client/src/
├── pages/          # Route-based pages
│   ├── Login.jsx         # Authentication
│   ├── Signup.jsx        # Multi-step onboarding
│   ├── Dashboard.jsx     # Main hub
│   ├── Timetable.jsx     # Schedule management
│   ├── Tasks.jsx         # To-do list
│   ├── Goals.jsx         # Goal tracking
│   ├── Chatbot.jsx       # AI support
│   ├── Reports.jsx       # Weekly summaries
│   └── Profile.jsx       # Settings
├── components/
│   └── Layout.jsx        # Main layout with sidebar
├── store/
│   └── authStore.js      # Zustand state management
└── utils/
    └── api.js            # Axios API client
```

### Backend (Node.js + Express + MongoDB)

```
server/
├── models/         # MongoDB schemas
│   ├── User.js           # User profile & preferences
│   ├── TimetableEntry.js # Classes/exams/events
│   ├── Attendance.js     # Class attendance records
│   ├── Task.js           # To-do items
│   ├── Goal.js           # Semester goals
│   ├── Streak.js         # Streak tracking & badges
│   └── WeeklyReport.js   # Progress reports
├── routes/         # API endpoints
│   ├── auth.js           # Signup/login
│   ├── user.js           # Profile management
│   ├── timetable.js      # Schedule CRUD
│   ├── attendance.js     # Mark/track attendance
│   ├── task.js           # Task CRUD
│   ├── goal.js           # Goal CRUD
│   ├── streak.js         # Get streak data
│   ├── chatbot.js        # AI messaging
│   └── report.js         # Weekly reports
├── services/       # Business logic
│   ├── motivationService.js   # Generate motivational messages
│   ├── streakService.js       # Calculate streaks & badges
│   ├── reminderService.js     # Send class reminders
│   ├── reportService.js       # Generate weekly reports
│   └── chatbotService.js      # AI responses
├── middleware/
│   └── auth.js           # JWT authentication
└── server.js       # Entry point with cron jobs
```

## 🔄 Data Flow

### 1. Signup Flow

```
User → Signup Form (3 steps) → Backend → MongoDB
                                    ↓
                              Create User
                              Create Streak Record
                                    ↓
                              Return JWT Token
                                    ↓
                              Redirect to Dashboard
```

### 2. Timetable Ingestion

```
CSV/Manual Entry → Backend → Parse Data → Store in MongoDB
                                              ↓
                                    Create TimetableEntry docs
                                              ↓
                                    Activate Reminder Service
```

### 3. Reminder System (Cron Job - Every Minute)

```
Cron Trigger → Check Current Time → Find Upcoming Classes
                                            ↓
                        30min/10min/0min before class?
                                            ↓
                            Create/Update Attendance Record
                                            ↓
                                    Send Notification
                                            ↓
                        Class ended + 60min & still pending?
                                            ↓
                                Auto-mark as "missed"
                                            ↓
                            Generate motivational message
```

### 4. Attendance Tracking

```
Class Reminder → User Action → Mark Attended/Missed
                                        ↓
                            Update Attendance Record
                                        ↓
                            Generate Motivational Note
                                        ↓
                            Update Streak (streakService)
                                        ↓
                        Calculate new streak count
                        Check for badge milestones
                        Update totalPoints
```

### 5. Task Management

```
User Creates Task → Store in MongoDB
                            ↓
        Task Reminder (if due soon)
                            ↓
        User Marks Complete
                            ↓
        Update Task Status
                            ↓
        Update Task Streak
```

### 6. Weekly Report (Cron Job - Sunday 6 PM)

```
Cron Trigger → For Each User:
                    ↓
    Get attendance data (last 7 days)
    Get task data (last 7 days)
    Get goal progress
                    ↓
    Calculate stats:
    - Classes attended vs missed
    - Tasks completed vs pending
    - Goal progress percentage
                    ↓
    Generate suggestions based on performance
    Create motivational message (style-based)
                    ↓
    Store WeeklyReport document
                    ↓
    Send notification/email (future)
```

### 7. Chatbot Interaction

```
User Message → Backend chatbotService
                        ↓
            Analyze intent/emotion
            (stressed, behind, unfocused, etc.)
                        ↓
            OpenAI API? → Personalized response
            OR
            Fallback templates → Style-based response
                        ↓
            Return message to user
```

## 📊 Database Schema

### User

```javascript
{
  name: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  institution: String,
  course: String,
  year: String,
  semesterGoals: [String] (max 3),
  studyPreference: Enum ['morning', 'night', 'weekend', 'flexible'],
  motivationStyle: Enum ['friendly', 'strict', 'chill', 'hype'],
  timestamps
}
```

### TimetableEntry

```javascript
{
  userId: ObjectId,
  title: String,
  type: Enum ['class', 'exam', 'event'],
  dayOfWeek: Number (0-6),
  startTime: String (HH:MM),
  endTime: String (HH:MM),
  location: String,
  instructor: String,
  course: String,
  isRecurring: Boolean,
  specificDate: Date,
  color: String (hex),
  remindersEnabled: Boolean,
  timestamps
}
```

### Attendance

```javascript
{
  userId: ObjectId,
  timetableEntryId: ObjectId,
  date: Date,
  status: Enum ['attended', 'missed', 'pending'],
  markedAt: Date,
  motivationalNote: String,
  timestamps,
  unique: [userId, timetableEntryId, date]
}
```

### Task

```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  dueDate: Date,
  priority: Enum ['low', 'medium', 'high'],
  category: Enum ['assignment', 'study', 'revision', 'other'],
  completed: Boolean,
  completedAt: Date,
  reminderSent: Boolean,
  timestamps
}
```

### Streak

```javascript
{
  userId: ObjectId (unique),
  attendanceStreak: {
    current: Number,
    longest: Number,
    lastUpdated: Date
  },
  taskStreak: {
    current: Number,
    longest: Number,
    lastUpdated: Date
  },
  totalPoints: Number,
  badges: [{
    name: String,
    description: String,
    earnedAt: Date,
    icon: String
  }],
  timestamps
}
```

## 🎨 UI Components

### Color Scheme (Tailwind CSS v4)

- **Primary**: Blue shades (from-primary-500 to-primary-700)
- **Success**: Green (#22c55e)
- **Warning**: Yellow (#f59e0b)
- **Error**: Red (#ef4444)
- **Background**: Light gray (#f9fafb)

### Key Components

1. **Dashboard Cards**: Streak display, today's classes, tasks
2. **Timetable Grid**: 7-day week view with color-coded entries
3. **Task List**: Checkboxes, priority badges, due dates
4. **Progress Bars**: Goal tracking, attendance rate
5. **Chatbot Interface**: Message bubbles, quick actions
6. **Weekly Report Cards**: Stats grid, suggestions, motivation

## 🔐 Security

### Authentication

- JWT tokens stored in localStorage (auth-storage)
- Tokens expire in 7 days
- Passwords hashed with bcrypt (12 rounds)
- Protected routes require valid token

### API Security

- Middleware validates JWT on protected routes
- User ID extracted from token for data isolation
- Input validation on all endpoints
- CORS configured for frontend origin

## 🚀 Performance Optimizations

1. **Database Indexing**

   - Compound index on Attendance (userId, timetableEntryId, date)
   - Email index on User for fast lookups

2. **Efficient Queries**

   - Populate only needed fields
   - Limit results where appropriate
   - Date range filters for reports

3. **Cron Job Optimization**

   - Reminder service checks only relevant time windows
   - Weekly report runs during low-traffic period

4. **Frontend**
   - Lazy loading routes
   - Zustand for efficient state management
   - API call batching on dashboard

## 🧪 Testing Scenarios

### User Journey

1. **Signup** → Create account with all preferences
2. **Onboarding** → Upload timetable CSV
3. **Daily Use**:
   - Morning: Check dashboard
   - Before class: Receive reminder
   - After class: Mark attendance
   - Evening: Complete tasks, check streak
4. **Weekly**: Review progress report on Sunday
5. **Support**: Chat with bot when stressed

### Edge Cases

- Missing class → Auto-mark after 60min
- No classes today → Dashboard shows encouraging message
- Streak broken → Reset counter, show motivation
- Empty timetable → Prompt to add schedule
- API failure → Fallback responses in chatbot

## 📈 Future Enhancements

1. **Push Notifications**: Browser/mobile notifications
2. **Email Reminders**: Backup reminder system
3. **Social Features**: Study groups, friend challenges
4. **Advanced Analytics**: Graphs, trends, predictions
5. **OCR Upload**: Scan timetable images
6. **Calendar Integration**: Google Calendar sync
7. **Pomodoro Timer**: Built-in study timer
8. **Rewards System**: Redeem points for badges/themes
9. **Multi-language**: i18n support
10. **Mobile App**: React Native version

## 💻 Development Commands

### Root Level

```powershell
pnpm install:all    # Install all dependencies
pnpm dev           # Run both servers concurrently
```

### Server

```powershell
pnpm dev           # Development with nodemon
pnpm start         # Production server
```

### Client

```powershell
pnpm dev           # Development server
pnpm build         # Production build
pnpm preview       # Preview production build
```

## 🐛 Known Issues & Limitations

1. **Reminders**: Currently console logs only (need notification system)
2. **Time Zones**: Uses server time (should use user timezone)
3. **Chatbot**: Limited without OpenAI API key
4. **File Upload**: No image OCR (only CSV parsing)
5. **Mobile**: Responsive but not optimized for mobile app

## 📝 Contributing

When adding features:

1. Create new route in `/routes`
2. Add corresponding service in `/services`
3. Update API client in `client/src/utils/api.js`
4. Create/update components in `client/src/pages` or `client/src/components`
5. Test all flows thoroughly

## 🎓 Learning Outcomes

This project demonstrates:

- Full-stack MERN development
- Authentication & authorization
- Cron job scheduling
- State management (Zustand)
- RESTful API design
- MongoDB schema design
- Responsive UI with Tailwind CSS v4
- File upload & CSV parsing
- Real-time data updates
- User preference customization

---

**Built with ❤️ for Ubunifu Hackathon**
