# Development Checklist

## ✅ Completed

### Backend Setup

- [x] Express server configuration
- [x] MongoDB connection setup
- [x] User model with authentication
- [x] TimetableEntry model
- [x] Attendance model with compound indexing
- [x] Task model
- [x] Goal model
- [x] Streak model with badges
- [x] WeeklyReport model
- [x] JWT authentication middleware
- [x] Auth routes (signup/login)
- [x] User routes (profile management)
- [x] Timetable routes (CRUD + CSV upload)
- [x] Attendance routes (mark/track/stats)
- [x] Task routes (CRUD + stats)
- [x] Goal routes (CRUD)
- [x] Streak routes (get data)
- [x] Chatbot routes (messaging)
- [x] Report routes (get reports)
- [x] Motivation service (style-based messages)
- [x] Streak service (calculate & award badges)
- [x] Reminder service (cron-based)
- [x] Report service (weekly generation)
- [x] Chatbot service (OpenAI + fallbacks)
- [x] CSV parsing for timetable upload
- [x] Multer file upload configuration

### Frontend Setup

- [x] Vite + React configuration
- [x] Tailwind CSS v4 setup
- [x] React Router setup
- [x] Zustand store for auth
- [x] Axios API client with interceptors
- [x] Layout component with sidebar
- [x] Login page
- [x] Signup page (3-step flow)
- [x] Dashboard page with streaks
- [x] Timetable page with grid view
- [x] Tasks page with filters
- [x] Goals page with progress bars
- [x] Chatbot page with message interface
- [x] Reports page with weekly summaries
- [x] Profile page with preferences
- [x] Protected routes
- [x] Toast notifications
- [x] Responsive design
- [x] Icon integration (lucide-react)

### Documentation

- [x] Main README with features
- [x] QUICKSTART guide
- [x] PROJECT_OVERVIEW with architecture
- [x] Sample CSV timetable
- [x] .gitignore files
- [x] .env.example

### Dependencies

- [x] Server dependencies installed
- [x] Client dependencies installed
- [x] Root package.json scripts

## 🔧 Before Running

### Required Configuration

- [ ] Update `server/.env` with your MongoDB URI
- [ ] Update `server/.env` with secure JWT_SECRET
- [ ] (Optional) Add OpenAI API key for advanced chatbot
- [ ] Ensure MongoDB is running (local or Atlas)

## 🚀 Ready to Test

### Startup Sequence

1. Start MongoDB (if local): `net start MongoDB`
2. Start backend: `cd server && pnpm dev`
3. Start frontend: `cd client && pnpm dev`
4. Open browser: http://localhost:3000

### Test Scenarios

#### 1. User Registration

- [ ] Navigate to signup
- [ ] Fill Step 1 (basic info)
- [ ] Fill Step 2 (academic details, goals)
- [ ] Fill Step 3 (preferences)
- [ ] Submit and verify dashboard loads

#### 2. Timetable Management

- [ ] Upload `sample-timetable.csv`
- [ ] Verify entries appear in grid
- [ ] Add manual entry
- [ ] Edit an entry
- [ ] Delete an entry

#### 3. Attendance Tracking

- [ ] Check "Today's Classes" on dashboard
- [ ] Mark a class as "Attended"
- [ ] Verify motivational message appears
- [ ] Check streak increases
- [ ] Mark another class as "Missed"
- [ ] Verify different motivational tone

#### 4. Task Management

- [ ] Create a task with due date
- [ ] Set priority and category
- [ ] Mark task as complete
- [ ] Verify task streak updates
- [ ] Filter tasks (all/pending/completed)

#### 5. Goal Setting

- [ ] Create a goal with target grade
- [ ] Adjust progress slider
- [ ] Verify progress bar updates
- [ ] Delete a goal

#### 6. Chatbot Interaction

- [ ] Send message: "I'm stressed"
- [ ] Verify response matches motivation style
- [ ] Try quick action buttons
- [ ] Test different emotion keywords

#### 7. Profile Management

- [ ] Update name and phone
- [ ] Change motivation style
- [ ] Update semester goals
- [ ] Save and verify changes persist

#### 8. Weekly Reports (Manual Test)

- [ ] Check if any reports exist
- [ ] Wait for Sunday 6 PM or manually trigger
- [ ] Verify report shows correct stats
- [ ] Check motivational message matches style

## 🐛 Common Issues & Solutions

### "Cannot connect to MongoDB"

**Solution**:

- Check MongoDB is running: `net start MongoDB`
- Verify MONGODB_URI in `.env`
- Try Atlas connection string if local fails

### "Port 3000 already in use"

**Solution**:

- Kill process: `netstat -ano | findstr :3000` then `taskkill /PID <pid> /F`
- Or change port in `client/vite.config.js`

### "Port 5000 already in use"

**Solution**:

- Change PORT in `server/.env`
- Update proxy in `client/vite.config.js`

### "Token expired" or "Unauthorized"

**Solution**:

- Clear localStorage: Dev Tools → Application → Local Storage → Delete
- Login again

### "Chatbot not responding well"

**Solution**:

- Add OPENAI_API_KEY to `.env` for better responses
- Otherwise, it uses fallback templates

### "CSV upload fails"

**Solution**:

- Check CSV format matches sample
- Ensure headers are: title,type,dayOfWeek,startTime,endTime,location,instructor,course
- dayOfWeek must be 0-6 (0=Sunday)

## 🎯 Next Steps After Setup

1. **Add Your Real Schedule**

   - Create your actual timetable
   - Set real semester goals
   - Add upcoming assignments as tasks

2. **Test Reminders**

   - Create a class starting in 30 minutes
   - Verify reminder service triggers (check server console)

3. **Build Consistency**

   - Mark attendance daily
   - Complete tasks regularly
   - Watch your streaks grow!

4. **Customize Experience**
   - Try different motivation styles
   - Adjust study preferences
   - Chat with bot for support

## 📊 Success Metrics

After 1 week of use, you should see:

- [ ] Active attendance streak
- [ ] Active task streak
- [ ] At least one badge earned
- [ ] First weekly report generated
- [ ] Multiple chat interactions logged
- [ ] Progress on at least one goal

## 🎓 Hackathon Presentation Checklist

- [ ] Live demo: Signup → Add timetable → Mark attendance
- [ ] Show streak progression
- [ ] Demonstrate chatbot interaction
- [ ] Display weekly report
- [ ] Explain motivation style customization
- [ ] Show CSV upload feature
- [ ] Highlight responsive design
- [ ] Mention future enhancements

## 🌟 Bonus Features to Showcase

1. **Smart Auto-Marking**: Classes automatically marked missed after 60 minutes
2. **Personalized Motivation**: 4 different styles (Friendly, Strict, Chill, Hype)
3. **Comprehensive Dashboard**: Everything at a glance
4. **Flexible Data Entry**: CSV upload OR manual entry
5. **Progress Tracking**: Multiple metrics (attendance, tasks, goals, streaks)
6. **Emotional Support**: AI chatbot for accountability coaching
7. **Weekly Insights**: Auto-generated progress reports
8. **Badge System**: Gamification with milestone rewards

---

**You're all set! 🚀 Good luck with your hackathon!**
