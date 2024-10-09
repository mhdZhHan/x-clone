import mongoose from "mongoose"

const postSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		text: {
			type: String,
		},
		image: {
			type: String,
		},
		likes: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		comments: [
			{
				text: {
					type: String,
					require: true,
				},
				user: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
			},
		],
	},
	{ timestamps: true }
)

const Post = mongoose.model("Post", postSchema)
export default Post
