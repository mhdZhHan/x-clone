import express from "express"
import { protectRoute } from "../middlewares/protectRoute.js"
import {
	getAllPosts,
	getLikedPosts,
    getFollowingPosts,
    getUserPosts,
	createPost,
	toggleLikePost,
	commentOnPost,
	deletePost,
} from "../controllers/post.controller.js"

const router = express.Router()

router.get("/", protectRoute, getAllPosts)
router.get("/following", protectRoute, getFollowingPosts)
router.get("/likes/:id", protectRoute, getLikedPosts)
router.get("/user/:username", protectRoute, getUserPosts)
router.post("/create", protectRoute, createPost)
router.post("/toggle-like/:id", protectRoute, toggleLikePost)
router.post("/comment/:id", protectRoute, commentOnPost)
router.delete("/:id", protectRoute, deletePost)

export default router
