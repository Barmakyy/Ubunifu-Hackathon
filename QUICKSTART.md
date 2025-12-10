# 🚀 Quick Start Guide - AttendWell

## Starting the Application

### Step 1: Start the Backend (JSON Server)

Open a terminal and run:

```powershell
cd "C:\Users\Admin\Documents\Ubunifu Hackathon\server"
node index.js
```

You should see:

```
JSON Server is running on http://localhost:8000
```

### Step 2: Start the Frontend (Vite)

Open another terminal and run:

```powershell
cd "C:\Users\Admin\Documents\Ubunifu Hackathon\client"
pnpm dev
```

You should see:

```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### Step 3: Open the Application

Navigate to `http://localhost:5173` in your browser.

## 🎭 Testing Different Roles

### 1. Student Experience

**Login:**

- Email: `fatima@student.coasttech.ac.ke` (or any email)
- Password: any password

**Features to Test:**

1. **Dashboard**: View streak ring, today's schedule, grace units
2. **QR Scanner**: Click "Scan QR" to see animated scanner with confetti
3. **Rewards**: Check reward progress and milestones
4. **Chatbot**: Try the emotional companion with CBT exercises
5. **Reports**: View weekly analytics

### 2. Lecturer Experience

**Switch Role:**

- Click the "Switch Role (Demo)" button in the sidebar
- Select "👨‍🏫 Lecturer View"

OR **Login:**

- Email: `anne@coasttech.ac.ke`
- Password: any password

**Features to Test:**

1. **Today's Classes**: View class list with enrollment stats
2. **Generate QR**: Click to create QR code for attendance
3. **Download Reports**: Export attendance data

### 3. Admin Experience

**Switch Role:**

- Click the "Switch Role (Demo)" button in the sidebar
- Select "👨‍💼 Admin View"

OR **Login:**

- Email: `admin@coasttech.ac.ke`
- Password: any password

**Features to Test:**

1. **Stats Overview**: View institution-wide metrics
2. **Timetable Upload**: Upload CSV timetable
3. **Reward Management**: Configure milestone rewards
4. **Attendance Heatmap**: Visual analytics
5. **Lecturer Management**: Add/manage staff

## 🎨 Key Features to Showcase

### Mental Health-Safe Design

- Notice the soft color palette (sage green, coral, violet, dusty blue, cream)
- Look for supportive messages like "You showed up. That counts."
- No red danger colors or shaming language

### Animations & Interactions

- **Confetti**: Triggers on successful QR scan
- **Pulse Ring**: Animated streak visualization
- **Gentle Bounce**: Subtle movement on interactive elements
- **Smooth Transitions**: Throughout the interface

### Grace Unit System

- Students get 2 grace units per month
- Preserves streak even when late or absent
- Shows remaining units in dashboard

### CBT-Lite Chatbot

- Select your mood
- Get supportive responses
- Try quick exercises:
  - 🫁 Box Breathing
  - ✨ Three Good Things
  - 🌍 5-4-3-2-1 Grounding
  - 💪 Positive Affirmations
  - 🧘 Body Scan

### Institutional Rewards

- **10 days**: Library Priority Access
- **20 days**: Digital Badge
- **40 days**: Hostel Room Priority
- **60 days**: Certificate of Excellence

## 📝 Database Structure

The `server/db.json` contains:

- **institutions**: College/university info with rewards
- **admins**: Admin users
- **users**: Students and teachers
- **attendance**: Attendance records
- **qrSessions**: Generated QR codes
- **moodCheckins**: Student mood tracking
- **chatbotSessions**: Chat history
- **cbtTasks**: Available exercises
- **weeklyReports**: Generated reports

## 🔧 Customization

### Change Colors

Edit `client/src/index.css` in the `@theme` section:

```css
@theme {
  --color-sage-500: #5a925a; /* Change this */
  --color-coral-500: #e56b5a; /* And this */
  /* ... etc */
}
```

### Modify Rewards

Edit `server/db.json`:

```json
"rewards": [
  {"milestone": 10, "reward": "Your Custom Reward", "description": "..."}
]
```

### Add Motivational Tones

Edit `client/src/pages/StudentDashboard.jsx`:

```javascript
const tones = {
  yourNewTone: ["Message 1", "Message 2", "Message 3"],
};
```

## 🐛 Troubleshooting

### Port Already in Use

If port 8000 or 5173 is busy:

```powershell
# Find and kill the process
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process
```

### Dependencies Issues

```powershell
# Clear cache and reinstall
cd client
Remove-Item -Recurse -Force node_modules
pnpm install
```

### Tailwind Not Working

Make sure `@tailwindcss/vite` is in `vite.config.js`:

```javascript
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

## 📱 Mobile Testing

The app is responsive! Test on:

- Chrome DevTools (F12 → Toggle Device Toolbar)
- Actual mobile device on same network

## 🎯 Demo Flow Suggestion

1. **Login as Student**
2. Show the beautiful dashboard with streak ring
3. Click "Scan QR" and show the animation
4. Navigate to Rewards to show progress
5. Try the Chatbot with mood selection and CBT exercise
6. **Switch to Lecturer** using sidebar
7. Show class management and QR generation
8. **Switch to Admin** using sidebar
9. Show institution-wide analytics and management

## 💡 Tips

- The role switcher makes demos seamless - no need to log out!
- All data is stored locally in `db.json` - safe to modify
- Use the supportive messaging to highlight mental health focus
- Show the grace unit system as a key differentiator

---

**Enjoy exploring AttendWell!** 🌟

If you need help, check:

- README.md for detailed documentation
- db.json for data structure
- Browser console for any errors
