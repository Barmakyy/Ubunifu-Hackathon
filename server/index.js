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
    // Add your Vercel URL after deployment
    // 'https://your-project.vercel.app'
  ],
  credentials: true,
  optionsSuccessStatus: 200
}

server.use(cors(corsOptions))
server.use(jsonServer.bodyParser)
server.use(middlewares)
server.use(router)

const PORT = process.env.PORT || 8000

server.listen(PORT, '0.0.0.0', () => {
  console.log(`JSON Server is running on port ${PORT}`)
})