var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
	name: String,
	pprice: Number,
	image: String,
	imageId: String,
	des: String,
	enddate: Date,
	state: String,
	owner:{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],
	price: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Price"
		}
	]
});

module.exports = mongoose.model("Products", productSchema);
