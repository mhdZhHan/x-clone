import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import { generateTokenAndSetCookie } from "../lib/generateToken.js"

// constants
const EMAIL_REGEX = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const PASSWORD_REGEX = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/

export const signup = async (req, res) => {
	try {
		const { fullName, email, username, password } = req.body

		if (!EMAIL_REGEX.test(email)) {
			return res.status(400).json({ message: "Invalid email formate" })
		}

		if (!PASSWORD_REGEX.test(password)) {
			return res.status(400).json({
				message:
					"Password should be 6 to 20 characters long with a numeric,1 lowercase and 1 uppercase letters",
			})
		}

		const existingUser = await User.findOne({ username })
		if (existingUser) {
			return res.status(400).json({ message: "Username already taken" })
		}

		const existingEmail = await User.findOne({ email })
		if (existingEmail) {
			return res
				.status(400)
				.json({ message: "This email is already registered" })
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
				user: {
					...newUser._doc,
					password: undefined,
				},
			})
		} else {
			res.status(400).json({ message: "Invalid user data" })
		}
	} catch (error) {
		console.log("Error in signup controller", error)
		res.status(500).json({ message: "Server error", error: error?.message })
	}
}

export const login = async (req, res) => {}

export const logout = async (req, res) => {}
