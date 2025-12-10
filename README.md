# AttendWell - Student Attendance & Wellness Platform

A comprehensive student attendance tracking system with mental health support, built with Vite, React, Tailwind CSS v4, and JSON Server.

## 🌟 Features

### Student Dashboard

- **Streak Ring Visualization**: Beautiful circular progress showing attendance streak with milestone tracking
- **Grace Units System**: 2 monthly grace units to preserve streaks when life happens
- **Today's Schedule**: Clear view of all classes with attendance status
- **QR Code Scanning**: Animated scanner with confetti celebration on success
- **Institutional Rewards**: Progressive rewards at 10, 20, 40, and 60-day milestones
- **Emotional Companion Chatbot**: CBT-lite micro-tasks, mood tracking, and supportive messaging
- **Weekly Reports**: Gentle analytics with emotional check-ins
- **Customizable Tone**: Choose from encouraging, gentle, motivating, supportive, or calm messaging

### Lecturer Dashboard

- **Today's Class List**: Real-time enrollment and presence tracking
- **Auto-generated QR Codes**: Available 30 minutes before class ends
- **Attendance Statistics**: Comprehensive stats and downloadable reports
- **Simple Interface**: Clean, non-intrusive design

### Admin Panel

- **Institution-wide Overview**: Complete stats dashboard
- **Timetable Upload System**: CSV-based timetable management
- **Lecturer Management**: Add and manage teaching staff
- **Customizable Rewards**: Define and manage reward milestones
- **Attendance Heatmap**: Visual analytics across the institution

## 🎨 Design Features

- **Mental Health-Safe Color Palette**:

  - Sage Green (#5a925a) - Calming and growth
  - Coral Peach (#e56b5a) - Warm and encouraging
  - Soft Violet (#8c6ac0) - Peaceful and creative
  - Dusty Blue (#7099bd) - Stable and trustworthy
  - Cream (#cdb68d) - Warm and comforting

- **Supportive Micro-copy**:

  - "You showed up. That counts."
  - "Your streak is your story, not your stress"
  - No shaming or red danger UI

- **Smooth Animations**:

  - Confetti effects on attendance success
  - Gentle pulse animations
  - Smooth transitions throughout

- **Gender-neutral Visuals**: Inclusive design for all students
- **Rounded Edges**: Soft, approachable interface

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (or npm/yarn)

### Backend Setup

1. Navigate to the server directory:

```powershell
cd server
```

2. Install dependencies:

```powershell
pnpm install
```

3. Start the JSON server:

```powershell
pnpm start
```

The server will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the client directory:

```powershell
cd client
```

2. Install dependencies:

```powershell
pnpm install
```

3. Start the development server:

```powershell
pnpm dev
```

The app will run on `http://localhost:5173`

## 👤 Demo Credentials

### Student Account

- Email: `fatima@student.coasttech.ac.ke`
- Password: any password
- Features: Full student dashboard with all features

### Lecturer Account

- Email: `anne@coasttech.ac.ke`
- Password: any password
- Features: Class management and QR code generation

### Admin Account

- Email: `admin@coasttech.ac.ke`
- Password: any password
- Features: Institution-wide management

## 🎯 Role Switcher

Use the role switcher in the top-right corner of the sidebar to demo all three views (student, lecturer, admin).

## 📂 Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── EnhancedLayout.jsx       # Layout with role switcher
│   │   ├── pages/
│   │   │   ├── Login.jsx                # Login page
│   │   │   ├── Signup.jsx               # Multi-step signup
│   │   │   ├── StudentDashboard.jsx     # Student home
│   │   │   ├── QRScanner.jsx            # QR scanning with animations
│   │   │   ├── Rewards.jsx              # Rewards progress
│   │   │   ├── EmotionalChatbot.jsx     # AI companion
│   │   │   ├── LecturerDashboard.jsx    # Lecturer view
│   │   │   └── AdminDashboard.jsx       # Admin panel
│   │   ├── store/
│   │   │   └── authStore.js             # Authentication state
│   │   ├── utils/
│   │   │   └── api.js                   # API utilities
│   │   ├── App.jsx                      # Main app component
│   │   └── index.css                    # Tailwind CSS v4 config
│   └── package.json
├── server/
│   ├── db.json                          # Database
│   ├── index.js                         # Server setup
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Frontend**:

  - React 18
  - Vite 5
  - Tailwind CSS v4
  - React Router DOM
  - Zustand (State Management)
  - React Hot Toast (Notifications)
  - Lucide React (Icons)

- **Backend**:
  - JSON Server
  - CORS enabled

## 🎨 Color Customization

The mental health-safe color palette is defined in `client/src/index.css` using Tailwind CSS v4's `@theme` directive. You can customize colors by modifying the CSS custom properties.

## 📱 Responsive Design

The application is fully responsive and works on:

- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔐 Security Notes

This is a demo application. In production:

- Implement proper authentication with JWT tokens
- Hash passwords with bcrypt
- Use HTTPS
- Implement rate limiting
- Add input validation and sanitization
- Use environment variables for sensitive data

## 🤝 Contributing

This project was created for the Ubunifu Hackathon. Feel free to fork and enhance!

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🙏 Acknowledgments

- Inspired by mental health-first design principles
- Built with care for student wellbeing
- Designed to reduce academic stress and anxiety

---

**Remember**: Your streak is your story, not your stress. Every day you show up counts. 🌟
