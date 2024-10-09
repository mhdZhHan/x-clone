import bcryptjs from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"

import User from "../models/user.model.js"
import Notification from "../models/notification.model.js"
import { PASSWORD_REGEX } from "./auth.controller.js"

export const getUserProfile = async (req, res) => {
	try {
		const { username } = req.params

		const user = await User.findOne({ username }).select("-password")

		if (!user) {
			return res.status(404).json({ message: "User not found" })
		}

		res.status(200).json({ user })
	} catch (error) {
		console.log("Error in getUserProfile controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id
		// Find the current user in the database and select only the 'following' field
		const usersFollowedByMe = await User.findById(userId).select(
			"following"
		)

		// Get a random sample of 10 users excluding the current user
		const users = await User.aggregate([
			{ $match: { _id: { $ne: userId } } }, // Exclude current user
			{ $sample: { size: 10 } }, // Randomly select 10 users
			{ $project: { password: 0 } }, // Exclude the password field
		])

		// Filter out users that are already followed by the current user
		const filteredUsers = users.filter(
			(user) => !usersFollowedByMe.following.includes(user._id.toString())
		)

		// Slice the filtered users to get only the first 4 (for suggesting users)
		const suggestedUsers = filteredUsers.slice(0, 4)

		// For security, remove the password field from the suggested users
		suggestedUsers.forEach((user) => (user.password = null))

		// Return the suggested users as a response
		res.status(200).json(suggestedUsers)
	} catch (error) {
		console.log("Error in getSuggestedUsers controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const toggleFollow = async (req, res) => {
	try {
		const { id } = req.params

		const userToToggleFollow = await User.findById(id)
		const currentUser = await User.findById(req.user._id)

		// `.toString()` => must convert the object form to id string
		if (id === req.user._id.toString())
			return res
				.status(400)
				.json({ message: "You cant follow/unfollow yourself" })

		if (!userToToggleFollow || !currentUser)
			return res.status(404).json({ message: "User not fount" })

		const isFollowing = currentUser.following.includes(id)

		if (isFollowing) {
			// unfollow the user
			await User.findByIdAndUpdate(id, {
				$pull: { followers: req.user._id },
			})
			await User.findByIdAndUpdate(req.user._id, {
				$pull: { following: id },
			})

			// TODO return the id of the user as response
			res.status(200).json({ message: "User unfollowed successfully" })
		} else {
			// follow the user
			await User.findByIdAndUpdate(id, {
				$push: { followers: req.user._id },
			})
			await User.findByIdAndUpdate(req.user._id, {
				$push: { following: id },
			})

			// Send notification to the user (Who was followed)
			const notification = new Notification({
				type: "follow",
				from: userToToggleFollow._id, // who was following
				to: req.user._id, // who was followed
			})
			await notification.save()

			// TODO return the id of the user as response
			res.status(200).json({ message: "User followed successfully" })
		}
	} catch (error) {
		console.log("Error in toggleFollow controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const updateUserProfile = async (req, res) => {
	try {
		const {
			username,
			fullName,
			email,
			currentPassword,
			newPassword,
			bio,
			link,
		} = req.body

		let { profileImage, coverImage } = req.body

		const userId = req.user._id
		let user = await User.findById(userId)

		if (!user) return res.status(404).json({ message: "User not found" })

		// updating password
		if (
			(!newPassword && currentPassword) ||
			(!currentPassword && newPassword)
		) {
			return res.status(400).json({
				message:
					"Please provide both current password and new password",
			})
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcryptjs.compare(
				currentPassword,
				user.password
			)

			if (!isMatch)
				return res
					.status(400)
					.json({ message: "Incorrect current password" })

			if (!PASSWORD_REGEX.test(newPassword)) {
				return res.status(400).json({
					message:
						"Password should be 6 to 20 characters long with a numeric,1 lowercase and 1 uppercase letters",
				})
			}

			const salt = await bcryptjs.getSalt(10)
			user.password = await bcryptjs.hash(newPassword, salt)
		}

		// update profile image
		if (profileImage) {
			// if user already have a profile image delete from cloud
			if (user.profileImage) {
				cloudinary.uploader.destroy(
					user.profileImage.split("/").pop().split(".")[0]
				)
			}

			const uploadedResponse = await cloudinary.uploader.upload(
				profileImage
			)
			profileImage = uploadedResponse.secure_url
		}

		// update coverImage
		if (coverImage) {
			// if user already have a coverImage delete from cloud
			if (user.coverImage) {
				cloudinary.uploader.destroy(
					user.coverImage.split("/").pop().split(".")[0]
				)
			}
			const uploadedResponse = await cloudinary.uploader.upload(
				coverImage
			)
			coverImage = uploadedResponse.secure_url
		}

		// update user profile with new values
		user.fullName = fullName || user.fullName
		user.email = email || user.email
		user.username = username || user.username
		user.profileImage = profileImage || user.profileImage
		user.coverImage = coverImage || user.coverImage
		user.bio = bio || user.bio
		user.link = link || user.link

		user = await user.save()
		res.status(200).json({
			...user._doc,
			password: undefined,
		})
	} catch (error) {
		console.log("Error in updateUserProfile controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}
