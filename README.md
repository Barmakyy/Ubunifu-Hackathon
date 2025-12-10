# Student Accountability App (StudySync)

A comprehensive MERN stack application designed to help students stay accountable with their academic commitments through personalized reminders, streak tracking, and motivational support.

## 🚀 Features

### User Experience

- **Personalized Signup Flow**: Collect student info, goals, study preferences, and motivation style
- **Smart Dashboard**: Today's classes, tasks, streaks, and motivational greetings
- **Timetable Management**: Upload CSV or manually add classes, exams, and events
- **Automated Reminders**: 30-min, 10-min, and at-start class reminders
- **Attendance Tracking**: Mark attendance, auto-mark missed classes, get motivational feedback
- **Task Management**: Create, track, and complete tasks with priorities
- **Goal Setting**: Set semester goals with progress tracking
- **Streak System**: Track attendance and task completion streaks with badges
- **AI Chatbot**: Emotional support and accountability coaching
- **Weekly Reports**: Auto-generated progress summaries every Sunday

### Technical Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS v4
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT
- **Scheduling**: node-cron
- **Package Manager**: pnpm

## 📁 Project Structure

```
Ubunifu Hackathon/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand state management
│   │   ├── utils/         # API and utilities
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── server/                # Express backend
    ├── models/            # MongoDB schemas
    ├── routes/            # API routes
    ├── services/          # Business logic
    ├── middleware/        # Auth middleware
    ├── server.js          # Entry point
    └── package.json
```

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- pnpm (`npm install -g pnpm`)

### Backend Setup

1. Navigate to server directory:

```powershell
cd server
```

2. Install dependencies:

```powershell
pnpm install
```

3. Create `.env` file:

```powershell
Copy-Item .env.example .env
```

4. Edit `.env` and configure:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/student-accountability
JWT_SECRET=your_secret_key_here
OPENAI_API_KEY=your_openai_key_here (optional)
NODE_ENV=development
```

5. Start MongoDB (if local):

```powershell
# Start MongoDB service
net start MongoDB
```

6. Start the server:

```powershell
pnpm dev
```

Server will run on http://localhost:5000

### Frontend Setup

1. Open a new terminal and navigate to client directory:

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

Client will run on http://localhost:3000

## 🎯 Usage

### First Time Setup

1. Open http://localhost:3000
2. Click "Sign up"
3. Complete the 3-step onboarding:
   - **Step 1**: Basic info (name, email, password)
   - **Step 2**: Academic details (institution, course, year, goals)
   - **Step 3**: Preferences (study time, motivation style)

### Adding Your Timetable

**Option 1: CSV Upload**

- Create a CSV with columns: `title,type,dayOfWeek,startTime,endTime,location,instructor,course`
- Example:
  ```csv
  title,type,dayOfWeek,startTime,endTime,location,instructor,course
  Data Structures,class,1,09:00,11:00,Room 101,Dr. Smith,CS201
  Algorithms,class,3,14:00,16:00,Room 205,Prof. Johnson,CS301
  ```
- Upload via Timetable page

**Option 2: Manual Entry**

- Click "Add Entry" on Timetable page
- Fill in details and save

### Daily Workflow

1. **Morning**: Check dashboard for today's classes and tasks
2. **Before Class**: Receive reminders (30-min, 10-min, at-start)
3. **After Class**: Mark attendance (attended/missed)
4. **Throughout Day**: Complete tasks, update progress
5. **Evening**: Check streak status, chat with bot if needed

### Using the Chatbot

Navigate to Chatbot page and share:

- "I'm feeling stressed"
- "I'm behind on my work"
- "I need motivation"

The bot responds based on your chosen motivation style.

## 📊 API Endpoints

### Authentication

- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### User

- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile

### Timetable

- `GET /api/timetable` - Get all entries
- `POST /api/timetable` - Create entry
- `POST /api/timetable/upload-csv` - Upload CSV
- `PUT /api/timetable/:id` - Update entry
- `DELETE /api/timetable/:id` - Delete entry

### Attendance

- `GET /api/attendance` - Get attendance records
- `GET /api/attendance/today` - Get today's classes
- `POST /api/attendance/mark` - Mark attendance
- `GET /api/attendance/stats` - Get statistics

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/today` - Get today's tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Goals

- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Streak

- `GET /api/streak` - Get user streaks

### Chatbot

- `POST /api/chatbot/message` - Send message

### Reports

- `GET /api/reports` - Get all reports
- `GET /api/reports/latest` - Get latest report

## 🔄 Automated Services

### Reminder Service

- Runs every minute via cron job
- Sends reminders 30min, 10min, and at class start
- Auto-marks missed classes 60min after start

### Weekly Report Service

- Runs every Sunday at 6 PM
- Generates comprehensive progress report
- Includes attendance, tasks, goals, and suggestions

## 🎨 Customization

### Motivation Styles

- **Friendly**: Warm, encouraging, supportive
- **Strict**: Direct, disciplined, focused
- **Chill**: Relaxed, casual, low-pressure
- **Hype**: Energetic, enthusiastic, pumped

### Study Preferences

- Morning, Night, Weekend, Flexible

## 🔒 Security

- Passwords hashed with bcrypt
- JWT authentication
- HTTP-only cookies (recommended for production)
- Input validation and sanitization

## 🚀 Production Deployment

### Environment Variables

Update `.env` for production:

- Use strong JWT_SECRET
- Configure production MongoDB URI
- Set NODE_ENV=production

### Build Frontend

```powershell
cd client
pnpm build
```

Serve `dist` folder with Express or deploy to Vercel/Netlify.

### Backend Deployment

Deploy to Heroku, Railway, or any Node.js host.

## 📝 CSV Timetable Format

```csv
title,type,dayOfWeek,startTime,endTime,location,instructor,course
Programming,class,1,09:00,11:00,Lab 1,Dr. Brown,CS101
Math Lecture,class,2,14:00,15:30,Hall A,Prof. White,MATH201
Midterm Exam,exam,5,10:00,12:00,Main Hall,Various,CS101
Club Meeting,event,3,16:00,17:00,Room 10,,,
```

**Notes:**

- `dayOfWeek`: 0=Sunday, 1=Monday, ... 6=Saturday
- `type`: class, exam, event
- `startTime/endTime`: 24-hour format (HH:MM)

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running
- Check MONGODB_URI in `.env`
- Verify network connectivity

### Port Already in Use

- Change PORT in server `.env`
- Update proxy in client `vite.config.js`

### Frontend Not Connecting to Backend

- Ensure both servers are running
- Check proxy configuration
- Verify API base URL

## 📄 License

MIT License - feel free to use for your hackathon or personal projects!

## 🙏 Acknowledgments

Built for Ubunifu Hackathon with ❤️ using MERN stack and Tailwind CSS v4.
