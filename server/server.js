import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"

import { connectDB } from "./db/connectDB.js"

// routes imports
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import postRoutes from "./routes/post.route.js"
import notificationRoutes from "./routes/notification.route.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

// middlewares
app.use(express.json())
app.use(cookieParser())

// routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/posts", postRoutes)
app.use("/api/notifications", notificationRoutes)

app.listen(PORT, () => {
	connectDB()
	console.log(`Server is running at http://localhost:${PORT}`)
})
