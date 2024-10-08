import express from "express"
import dotenv from "dotenv"

// routes imports
import authRoutes from "./routes/auth.routes.js"

dotenv.config()

const app = express()

const PORT = process.env.PORT || 5000

// routes
app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
	console.log(`Server is running at http://localhost:${PORT}`)
})
