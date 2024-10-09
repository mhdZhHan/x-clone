export const createPost = async (req, res) => {
	try {
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
