import express from "express"
import { protectRoute } from "../middlewares/protectRoute"
import {createPost,
    toggleLikePost,
    commentOnPost,
    deletePost,} from ""

const router = express.Router()

router.post("/create", protectRoute, createPost)
router.post("/toggle-like:/id", protectRoute, toggleLikePost)
router.post("/comment/:id", protectRoute, commentOnPost)
router.delete("/:id", protectRoute, deletePost)

export default router
