import express from "express"
import { protectRoute } from "../middlewares/protectRoute.js"
import {
	getAllPosts,
	getLikedPosts,
	createPost,
	toggleLikePost,
	commentOnPost,
	deletePost,
} from "../controllers/post.controller.js"

const router = express.Router()

router.get("/", protectRoute, getAllPosts)
router.get("/likes/:id", protectRoute, getLikedPosts)
router.post("/create", protectRoute, createPost)
router.post("/toggle-like/:id", protectRoute, toggleLikePost)
router.post("/comment/:id", protectRoute, commentOnPost)
router.delete("/:id", protectRoute, deletePost)

export default router
