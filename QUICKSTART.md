# Quick Start Guide

## Install Dependencies

### Server

```powershell
cd server
pnpm install
```

### Client

```powershell
cd client
pnpm install
```

## Configure Environment

1. Copy example env file:

```powershell
cd server
Copy-Item .env.example .env
```

2. Edit `.env` and update:
   - MongoDB URI (default: `mongodb://localhost:27017/student-accountability`)
   - JWT Secret (generate a random string)
   - OpenAI API Key (optional, for advanced chatbot)

## Start MongoDB

If using local MongoDB:

```powershell
net start MongoDB
```

Or use MongoDB Atlas (cloud) and update the URI in `.env`

## Run the Application

Open two terminal windows:

**Terminal 1 - Backend:**

```powershell
cd server
pnpm dev
```

**Terminal 2 - Frontend:**

```powershell
cd client
pnpm dev
```

## Access the App

Open your browser and navigate to:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health

## First Steps

1. Click "Sign up" on the login page
2. Complete the 3-step registration
3. Add your timetable (manually or via CSV)
4. Start tracking your classes and tasks!

## Sample CSV for Testing

Create `sample-timetable.csv`:

```csv
title,type,dayOfWeek,startTime,endTime,location,instructor,course
Programming 101,class,1,09:00,10:30,Lab 1,Dr. Smith,CS101
Data Structures,class,2,14:00,16:00,Room 201,Prof. Johnson,CS201
Web Development,class,3,10:00,12:00,Lab 2,Dr. Brown,CS301
Database Systems,class,4,13:00,15:00,Room 105,Prof. Davis,CS401
Project Work,class,5,09:00,11:00,Lab 3,Dr. Wilson,CS501
```

Upload this file in the Timetable section to quickly populate your schedule.

## Motivation Styles Explained

- **Friendly** 😊: "Great job! Keep it up!"
- **Strict** 💪: "Good. Stay disciplined."
- **Chill** 😎: "Nice, you made it!"
- **Hype** 🔥: "YES! You're crushing it!"

Choose the style that motivates you best during signup!
