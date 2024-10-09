import express from "express"
import { protectRoute } from "../middlewares/protectRoute.js"
import {
	getUserProfile,
	getSuggestedUsers,
	toggleFollow,
	updateUserProfile,
} from "../controllers/user.controller.js"

const router = express.Router()

router.get("/profile/:username", protectRoute, getUserProfile)
router.get("/suggested", protectRoute, getSuggestedUsers)
router.post("/toggle-follow/:id", protectRoute, toggleFollow)
router.post("/update", protectRoute, updateUserProfile)

export default router
    