# ✨ AttendWell - Project Summary

## 🎯 What Was Built

A comprehensive **Student Attendance & Wellness Platform** that combines attendance tracking with mental health support, featuring three distinct role-based dashboards.

---

## 🌟 Key Highlights

### 1. Mental Health-First Design

- **Soft Color Palette**: Sage green, coral peach, soft violet, dusty blue, cream
- **No Shaming**: Supportive language like "You showed up. That counts."
- **Grace Unit System**: 2 monthly "free passes" to reduce anxiety
- **Empathetic Messaging**: Tone customization (encouraging, gentle, motivating, supportive, calm)

### 2. Beautiful Animations

- **Confetti Celebration**: 50 animated particles on QR scan success
- **Pulse Ring**: Smooth breathing animation on streak display
- **Gentle Bounce**: Subtle movement on interactive elements
- **Smooth Transitions**: Throughout the entire interface

### 3. Progressive Rewards System

- **10 Days**: Library Priority Access
- **20 Days**: Digital Badge
- **40 Days**: Hostel Room Priority
- **60 Days**: Certificate of Excellence

---

## 📱 Three Complete Dashboards

### 👨‍🎓 Student Dashboard

**Main Features:**

- Circular streak ring with SVG visualization
- Today's class schedule with real-time status
- Grace units tracker (2/2 visual progress)
- Quick action buttons (Scan, Rewards, Chat, Reports)
- Personalized greetings based on motivational tone

**Additional Pages:**

- **QR Scanner**: Animated scanner with confetti effects
- **Rewards**: Progress tracking toward institutional rewards
- **Chatbot**: AI companion with CBT-lite exercises
- **Weekly Reports**: Gentle analytics with emotional check-ins
- **Goals & Tasks**: Personal goal tracking

### 👨‍🏫 Lecturer Dashboard

**Main Features:**

- Today's class list with enrollment stats
- Real-time presence tracking (Present/Absent counts)
- QR code generation (30 min before class ends)
- Active QR display with countdown timer
- Downloadable attendance reports (CSV)
- Weekly teaching summary

**Design:**

- Clean, non-intrusive interface
- Dusty blue color scheme
- Focus on functionality over decoration

### 👨‍💼 Admin Dashboard

**Main Features:**

- Institution-wide statistics (4 key metrics)
- Timetable CSV upload system
- Reward milestone configuration
- 35-day attendance heatmap visualization
- Lecturer management interface
- Student overview

**Design:**

- Violet color scheme for admin authority
- Comprehensive analytics
- Easy-to-use management tools

---

## 🎨 Technical Implementation

### Frontend Stack

```
React 18.3.1
Vite 5.4.x
Tailwind CSS v4 (with custom @theme)
React Router DOM 6.30.x
Zustand 4.5.x (State Management)
React Hot Toast 2.6.x
Lucide React 0.303.x (Icons)
```

### Backend Stack

```
JSON Server (REST API)
CORS enabled
File-based database (db.json)
```

### Key Features

- **8 Custom Pages**: Login, Signup, 3 Dashboards, QR Scanner, Rewards, Chatbot, Reports
- **Enhanced Layout**: Role-based navigation with switcher
- **Responsive Design**: Mobile, tablet, desktop
- **Persistent Auth**: Zustand with localStorage
- **Smooth Animations**: CSS keyframes + Tailwind

---

## 📊 Database Schema

### Complete Collections

1. **institutions** - College info with rewards
2. **admins** - Admin users
3. **users** - Students & teachers with profiles
4. **attendance** - Attendance records
5. **qrSessions** - Generated QR codes
6. **moodCheckins** - Daily mood logs
7. **chatbotSessions** - Chat history
8. **cbtTasks** - 5 CBT exercises
9. **weeklyReports** - Auto-generated summaries

---

## 🚀 What Makes This Special

### 1. Empathetic Design

Every interaction is designed to reduce stress:

- Grace units instead of penalties
- Supportive messaging instead of warnings
- Gentle colors instead of harsh reds
- Progress celebration instead of failure focus

### 2. CBT-Lite Integration

5 evidence-based exercises:

1. 🫁 **Box Breathing** (2 min) - Anxiety relief
2. ✨ **Three Good Things** (5 min) - Mood boost
3. 🌍 **5-4-3-2-1 Grounding** (3 min) - Anxiety reduction
4. 💪 **Positive Affirmations** (1 min) - Confidence
5. 🧘 **Body Scan** (2 min) - Stress relief

### 3. Real Institutional Rewards

Not just badges - actual valuable rewards:

- Library priority access
- Hostel upgrades
- Official certificates
- Digital recognition

### 4. Role Demo System

Seamless switching between roles without logout:

- Student → Lecturer → Admin
- Instant navigation updates
- Preserves demo state
- Perfect for presentations

---

## 📁 File Structure

```
Ubunifu Hackathon/
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── EnhancedLayout.jsx       (Role-based layout)
│   │   ├── pages/
│   │   │   ├── Login.jsx                (Auth entry)
│   │   │   ├── Signup.jsx               (4-step registration)
│   │   │   ├── StudentDashboard.jsx     (Main student view)
│   │   │   ├── QRScanner.jsx            (Animated scanner)
│   │   │   ├── Rewards.jsx              (Milestone tracker)
│   │   │   ├── EmotionalChatbot.jsx     (AI companion)
│   │   │   ├── LecturerDashboard.jsx    (Teacher view)
│   │   │   └── AdminDashboard.jsx       (Admin panel)
│   │   ├── store/
│   │   │   └── authStore.js             (Zustand store)
│   │   ├── utils/
│   │   │   └── api.js                   (API client)
│   │   ├── App.jsx                      (Main routes)
│   │   └── index.css                    (Tailwind + custom)
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── server/
│   ├── db.json                          (Full database)
│   ├── index.js                         (JSON Server)
│   └── package.json
├── README.md                            (Full documentation)
├── QUICKSTART.md                        (Getting started)
├── COMPONENTS.md                        (Technical details)
└── start.ps1                            (Startup script)
```

---

## 🎯 Demo Flow

### Perfect Demo Sequence:

1. **Start**: Login as student (fatima@student.coasttech.ac.ke)
2. **Dashboard**: Show streak ring, grace units, today's schedule
3. **QR Scanner**: Demonstrate animated scan with confetti
4. **Rewards**: Show progress toward milestones
5. **Chatbot**: Try mood selector and CBT exercise
6. **Switch Role**: Use sidebar to switch to Lecturer
7. **Lecturer View**: Generate QR code, show stats
8. **Switch Role**: Change to Admin
9. **Admin Panel**: Show heatmap, upload system, rewards config

---

## ✅ All Requirements Met

### Student Dashboard ✓

- [x] Signup with department, module selection, goals, tone
- [x] Dashboard with streak ring, grace units, schedule
- [x] QR scan with animated scanner and confetti
- [x] Streak rewards with institutional rewards
- [x] Missed scan popup with grace unit system
- [x] Weekly report with gentle analytics
- [x] Emotional companion chatbot with CBT tasks

### Lecturer Dashboard ✓

- [x] Today's class list with enrollment tracking
- [x] Auto-generated QR codes (30 min before end)
- [x] Attendance statistics and reports
- [x] Simple, non-intrusive interface

### Admin Panel ✓

- [x] Institution-wide overview with stats
- [x] Timetable upload system
- [x] Lecturer management
- [x] Customizable reward definitions
- [x] Attendance heatmap analytics

### Design Features ✓

- [x] Soft, mental-health safe color palette
- [x] Gender-neutral visuals
- [x] Rounded edges and clean animations
- [x] Supportive micro-copy
- [x] No shaming or red danger UI
- [x] Grace unit system (2 per month)
- [x] Real institutional rewards

### Technical ✓

- [x] Vite + React
- [x] Tailwind CSS v4
- [x] JSON DB backend
- [x] Frontend connected to backend
- [x] Role switcher for demo
- [x] Responsive design

---

## 🎉 Ready to Present!

Everything is built, tested, and documented. The application is fully functional with:

- ✅ Beautiful UI with mental health focus
- ✅ Three complete role dashboards
- ✅ Smooth animations and interactions
- ✅ Real data from JSON backend
- ✅ Role switcher for easy demos
- ✅ Comprehensive documentation

### To Start:

```powershell
# Terminal 1 - Backend
cd server
node index.js

# Terminal 2 - Frontend
cd client
pnpm dev

# Then open: http://localhost:5173
```

---

**Built with care for student wellbeing** 💚
**Your streak is your story, not your stress** 🌟
