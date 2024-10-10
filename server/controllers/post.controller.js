import User from "../models/user.model.js"
import Post from "../models/post.model.js"
import cloudinary from "../lib/cloudinary.js"

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
	} catch (error) {
		console.log("Error in toggleLikePost controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const commentOnPost = async (req, res) => {
	try {
	} catch (error) {
		console.log("Error in commentOnPost controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const deletePost = async (req, res) => {
	try {
	} catch (error) {
		console.log("Error in deletePost controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}
