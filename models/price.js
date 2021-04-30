var mongoose = require("mongoose");

var priceSchema = mongoose.Schema({
	price: Number,
	owner: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	}
});

module.exports = mongoose.model("Price", priceSchema);