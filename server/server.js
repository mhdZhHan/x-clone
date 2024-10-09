import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

import { connectDB } from "./db/connectDB.js"

// routes imports
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

// middlewares
app.use(express.json())
app.use(cookieParser())

// routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)

app.listen(PORT, () => {
	connectDB()
	console.log(`Server is running at http://localhost:${PORT}`)
})
