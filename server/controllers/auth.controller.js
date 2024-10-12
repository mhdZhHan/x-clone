import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { generateTokenAndSetCookie } from "../lib/generateToken.js"

// constants
export const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/

export const signup = async (req, res) => {
	try {
		const { fullName, email, username, password } = req.body

		if (!EMAIL_REGEX.test(email)) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid email formate" })
		}

		if (!PASSWORD_REGEX.test(password)) {
			return res.status(400).json({
				message:
					"Password should be 6 to 20 characters long with a numeric,1 lowercase and 1 uppercase letters",
			})
		}

		const existingUser = await User.findOne({ username })
		if (existingUser) {
			return res
				.status(400)
				.json({ success: false, message: "Username already taken" })
		}

		const existingEmail = await User.findOne({ email })
		if (existingEmail) {
			return res
				.status(400)
				.json({
					success: false,
					message: "This email is already registered",
				})
		}

		// hash password
		const salt = await bcrypt.genSalt(10)
		const hashedPassword = await bcrypt.hash(password, salt)

		const newUser = new User({
			fullName,
			email,
			username,
			password: hashedPassword,
		})

		if (newUser) {
			generateTokenAndSetCookie(newUser._id, res)
			await newUser.save()

			res.status(201).json({
				...newUser._doc,
				password: undefined,
			})
		} else {
			res.status(400).json({
				success: false,
				message: "Invalid user data",
			})
		}
	} catch (error) {
		console.log("Error in signup controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const login = async (req, res) => {
	try {
		const { username, password } = req.body
		const user = await User.findOne({ username })
		const isPasswordCorrect = await bcrypt.compare(
			password,
			user?.password || ""
		)

		if (!user || !isPasswordCorrect) {
			return res
				.status(400)
				.json({
					success: false,
					message: "Invalid username or password",
				})
		}

		generateTokenAndSetCookie(user._id, res)

		res.status(200).json({ ...user._doc, password: undefined })
	} catch (error) {
		console.log("Error in login controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const logout = async (req, res) => {
	try {
		res.clearCookie("token")
		res.status(200).json({
			success: true,
			message: "Logged out successfully",
		})
	} catch (error) {
		console.log("Error in logout controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}

export const getMe = async (req, res) => {
	try {
		if (!req.user) {
			return res
				.status(401)
				.json({ success: false, message: "User not authorized" })
		}

		const user = await User.findById(req.user._id).select("-password")
		res.status(200).json({ user })
	} catch (error) {
		console.log("Error in getMe controller", error)
		res.status(500).json({
			success: false,
			message: "Server error",
			error: error?.message,
		})
	}
}
