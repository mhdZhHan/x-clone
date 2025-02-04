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
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const getLikedPosts = async (req, res) => {
	try {
		const userId = req.params.id
		const user = await User.findById(userId)
		if (!user)
			return res
				.status(404)
				.json({ success: false, message: "User not found" })

		// Fetch all posts from the Post collection whose _id exists in the user's likedPosts array,
		// populate the 'user' field (excluding the password) and the 'comments.user' field (excluding the password)
		const likedPosts = await Post.find({
			_id: { $in: user.likedPosts },
		})
			.sort({ createdAt: -1 })
			.populate({ path: "user", select: "-password" })
			.populate({ path: "comments.user", select: "-password" })

		res.status(200).json(likedPosts)
	} catch (error) {
		console.log("Error in getLikedPosts controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const getFollowingPosts = async (req, res) => {
	try {
		const userId = req.user._id
		const user = await User.findById(userId)
		if (!user)
			return res
				.status(404)
				.json({ success: false, message: "User not found" })

		const following = user.following

		// Fetch all posts created by users that the current user is following
		const feedPosts = await Post.find({ user: { $in: following } })
			.sort({
				createdAt: -1,
			})
			.populate({
				path: "user",
				select: "-password",
			})
			.populate({
				path: "comments.user",
				select: "-password",
			})

		res.status(200).json(feedPosts)
	} catch (error) {
		console.log("Error in getFollowingPosts controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const getUserPosts = async (req, res) => {
	try {
		const { username } = req.params
		const user = await User.find({ username })
		if (!user)
			return res
				.status(404)
				.json({ success: false, message: "User not found" })

		const posts = await Post.find({ user: user._id })
			.sort({ createdAt: -1 })
			.populate({ path: "user", select: "-password" })
			.populate({ path: "comments.user", select: "-password" })

		res.status(200).json(posts)
	} catch (error) {
		console.log("Error in getUserPosts controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const createPost = async (req, res) => {
	try {
		const { text } = req.body
		let { image } = req.body

		const userId = req.user._id.toString()
		const user = await User.findById(userId)

		if (!user)
			return res
				.status(404)
				.json({ success: false, message: "User not found" })

		if (!text && !image)
			return res.status(400).json({
				success: false,
				message: "Post must have text or image",
			})

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
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const toggleLikePost = async (req, res) => {
	try {
		const userId = req.user._id.toString()
		const { id: postId } = req.params

		const post = await Post.findById(postId)

		if (!post) {
			return res
				.status(404)
				.json({ success: false, message: "Post not found" })
		}

		const isUserLikedPost = post.likes.includes(userId)

		if (isUserLikedPost) {
			// unLike post
			await Post.updateOne({ id: postId }, { $pull: { likes: userId } })
			await User.updateOne(
				{ id: userId },
				{ $pull: { likedPosts: postId } }
			)
			res.status(200).json({
				success: true,
				message: "Post unliked successfully",
			})
		} else {
			// like post
			post.likes.push(userId)
			await User.updateOne(
				{ id: userId },
				{ $push: { likedPosts: postId } }
			)
			await post.save()

			// send notification to teh post owner
			const notification = new Notification({
				from: userId,
				to: post.user,
				type: "like",
			})
			await notification.save()

			res.status(200).json({
				success: true,
				message: "Post liked successfully",
			})
		}
	} catch (error) {
		console.log("Error in toggleLikePost controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const commentOnPost = async (req, res) => {
	try {
		const { text } = req.body
		const postId = req.params.id
		const userId = req.user._id

		if (!text)
			return res
				.status(400)
				.json({ success: false, message: "Text field is required" })

		const post = await Post.findById(postId)

		if (!post)
			return res
				.status(404)
				.json({ success: false, message: "Post not found" })

		const comment = { user: userId, text }
		post.comments.push(comment)
		await post.save()

		res.status(200).json(post)
	} catch (error) {
		console.log("Error in commentOnPost controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id)
		if (!post)
			return res
				.status(404)
				.json({ success: false, message: "Post not found" })

		if (post.user.toString() !== req.user._id.toString())
			return res.status(401).json({
				success: false,
				message: "You are not authorized to delete this post",
			})

		// delete image from cloud storage
		if (post.image) {
			const imageId = post.image.split("/").pop().split(".")[0]
			cloudinary.uploader.destroy(imageId)
		}

		await Post.findByIdAndDelete(req.params.id)
		res.status(200).json({
			success: true,
			message: "Post deleted successfully",
		})
	} catch (error) {
		console.log("Error in deletePost controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}
