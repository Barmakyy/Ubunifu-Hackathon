const jsonServer = require('json-server')
const cors = require('cors')
const path = require('path')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults()

// CORS configuration for production
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://ubunifu-hackathon.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}

server.use(cors(corsOptions))
server.use(jsonServer.bodyParser)
server.use(middlewares)

// Custom routes - must come before router
server.get('/reports', (req, res) => {
  const db = router.db
  res.json(db.get('weeklyReports').value())
})

server.get('/reports/latest', (req, res) => {
  const db = router.db
  const reports = db.get('weeklyReports').value()
  const latestReport = reports.length > 0 ? reports[reports.length - 1] : null
  res.json(latestReport)
})

server.use(router)

const PORT = process.env.PORT || 8000

server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on port ${PORT}`)
})