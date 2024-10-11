import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import Notification from "../models/notification.model.js"
import cloudinary from "../lib/cloudinary.js"

export const getAllPosts = async (req, res) => {
	try {
		const posts = await Post.find()
			.sort({ createdAt: -1 })
			.populate({ path: "user", select: "-password" })
			.populate({ path: "comments.user", select: "-password" })
		
		if (posts.length === 0) {
			return res.status(200).json([])
		}

		res.status(200).json(posts)
	} catch (error) {
		console.log("Error in getAllPosts controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const createPost = async (req, res) => {
	try {
		const { text } = req.body
		let { image } = req.body

		const userId = req.user._id.toString()
		const user = await User.findById(userId)

		if (!user) return res.status(404).json({ message: "User not found" })

		if (!text && !image)
			return res
				.status(400)
				.json({ message: "Post must have text or image" })

		// upload image to cloudinary
		if (image) {
			const uploadedResponse = await cloudinary.uploader.upload(image)
			image = uploadedResponse.secure_url
		}

		const newPost = new Post({
			user: userId,
			text,
			image,
		})

		await newPost.save()
		res.status(200).json(newPost)
	} catch (error) {
		console.log("Error in createPost controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const toggleLikePost = async (req, res) => {
	try {
		const userId = req.user._id.toString()
		const { id: postId } = req.params

		const post = await Post.findById(postId)

		if (!post) {
			return res.status(404).json({ message: "Post not found" })
		}

		console.log(post)

		const isUserLikedPost = post.likes.includes(userId)

		if (isUserLikedPost) {
			// unLike post
			await Post.updateOne({ id: postId }, { $pull: { likes: userId } })
			res.status(200).json({ message: "Post unliked successfully" })
		} else {
			// like post
			post.likes.push(userId)
			await post.save()

			// send notification to teh post owner
			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			})
			await notification.save()

			res.status(200).json({ message: "Post liked successfully" })
		}
	} catch (error) {
		console.log("Error in toggleLikePost controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body
		const postId = req.params.id
		const userId = req.user._id

		if (!text)
			return res.status(400).json({ message: "Text field is required" })

		const post = await Post.findById(postId)

		if (!post) return res.status(404).json({ message: "Post not found" })

		const comment = { user: userId, text }
		post.comments.push(comment)
		await post.save()

		res.status(200).json(post)
	} catch (error) {
		console.log("Error in commentOnPost controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post) return res.status(404).json({ message: "Post not found" })

		if (post.user.toString() !== req.user._id.toString())
			return res
				.status(401)
				.json({ message: "You are not authorized to delete this post" })

		// delete image from cloud storage
		if (post.image) {
			const imageId = post.image.split("/").pop().split(".")[0]
			cloudinary.uploader.destroy(imageId)
		}

		await Post.findByIdAndDelete(req.params.id)
		res.status(200).json({ message: "Post deleted successfully" })
	} catch (error) {
		console.log("Error in deletePost controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}
