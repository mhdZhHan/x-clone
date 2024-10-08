import express from "express"
import dotenv from "dotenv"

import { connectDB } from "./db/connectDB.js"

// routes imports
import authRoutes from "./routes/auth.routes.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

// middlewares
app.use(express.json())

// routes
app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
	connectDB()
	console.log(`Server is running at http://localhost:${PORT}`)
})
