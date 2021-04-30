//========================================variable==========================================
var express = require("express");
var app = express();
var mongoose = require("mongoose");
var Product = require("./models/product");
var Comment = require("./models/comment");
var Price = require("./models/price");
var User = require("./models/user");
var bodyParser   = require("body-parser");
var passport     = require("passport");
var LocalStrategy  = require("passport-local");
var multer = require('multer');
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
};
var upload = multer({ storage: storage, fileFilter: imageFilter})

var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'db8ty7bc0', 
  api_key: process.env.var1,
  api_secret: process.env.var2 
});

//=============================================database=============================
// mongoose.connect("mongodb://localhost/auctionapp");
mongoose.connect("mongodb+srv://aniket:Superman3.@cluster0-ohhgk.mongodb.net/auction?retryWrites=true");
// mongoose.connect(process.env.DATABASEURL);
//=========================================basic=====================================
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public"));
//========================================authentication===================================
app.use(require("express-session")({
	secret: "im a secret",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
});

app.get("/register", function(req, res){
	res.render("register");
});
app.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			return res.redirect("/register");
		}
		passport.authenticate("local")(req, res, function(){
			res.redirect("/selling");
		});
	});
});
app.get("/login", function(req, res){
	res.render("login");
});
app.post("/login", passport.authenticate("local",  
	{
		successRedirect: "/selling",
		failureRedirect: "/login"
	}), function(req, res){
});
app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/selling");
});
function checkProductOwnership(req, res, next){
	if(req.isAuthenticated()){
		Product.findById(req.params.id, function(err, foundProduct){
			if(err){
				res.redirect("back");
			} else {
				if(foundProduct.owner.id.equals(req.user._id) || req.user.username === "aniket"){
					next();
				} else {
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back");
	}
}



function checkCommentOwnershipedit(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.cid, function(err, foundComment){
			if(err){
				res.redirect("back");
			} else {
				if(foundComment.owner.id.equals(req.user._id)){
					next();
				} else {
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back");
	  }
}
function checkCommentOwnershipdelete(req, res, next){
	if(req.isAuthenticated()){
		Product.findById(req.params.id, function(err, foundProduct){
			if(err){
				res.redirect("back");
			} else {
				Comment.findById(req.params.cid, function(err, foundComment){
					if(err){
						res.redirect("back");
					} else {
						if(foundComment.owner.id.equals(req.user._id) || foundProduct.owner.id.equals(req.user._id) || req.user.username === "aniket"){
							next();
						} else {
							res.redirect("back");
						}
					}
				});
			}
		});
	} else {
		res.redirect("back");
	  }
}
function checkPriceOwnershipedit(req, res, next){
	if(req.isAuthenticated()){
		Price.findById(req.params.pid, function(err, foundPrice){
			if(err){
				res.redirect("back");
			} else {
				if(foundPrice.owner.id.equals(req.user._id)){
					next();
				} else{
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back");
	}
}
function checkPriceOwnershipdelete(req, res, next){
	if(req.isAuthenticated()){
		Product.findById(req.params.id, function(err, foundProduct){
			if(err){
				res.redirect("back");
			} else {
				Price.findById(req.params.pid, function(err, foundPrice){
					if(err){
						res.redirect("back");
					} else {
						if(foundPrice.owner.id.equals(req.user._id) || foundProduct.owner.id.equals(req.user._id) || req.user.username === "aniket"){
							next();
						} else {
							res.redirect("back");
						}
					}
				});
			}
		});
	} else {
		res.redirect("back");
	}
}


function checkProfileOwnership(req, res, next){
	if(req.isAuthenticated()){
		User.findById(req.params.uid, function(err, foundProfile){
			if(err){
				res.redirect("back");
			} else {
				if(foundProfile._id.equals(req.user._id) || req.user.username === "aniket"){
					next();
				} else {
					res.redirect("back");
				}
			}
		});
	} else {
		res.redirect("back");
	}
}
function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
}
//========================================== HOMEPAGE==================================

app.get("/", function(req, res){
	res.render("landing");
});

//===========================================INDEXPAGE===================================
app.get("/selling", function(req, res){
	var noMatch;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Product.find({name: regex}, function(err, allproducts){
			if(err){
				console.log(err);
			} else {
				if(allproducts.length < 1){
					noMatch = "NO MATCH";
				}
				res.render("index", {product: allproducts, noMatch: noMatch});
			}
		});
	} else {
		Product.find({}, function(err, allproducts){
			if(err){
				console.log(err);
			} else {
				res.render("index", {product: allproducts, noMatch: noMatch});
			}
		});
	}
});
function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//==========================================add new product===================================
app.get("/selling/new", isLoggedIn, function(req, res){
	res.render("new");
});
app.post("/selling", isLoggedIn, upload.single('image'), function(req, res){
	cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
	 if(err){
	 	console.log(err);
	 	return res.redirect('back');
	 }
	  req.body.product.image = result.secure_url;
	  req.body.product.imageId = result.public_id;

	  req.body.product.owner = {
	    id: req.user._id,
	    username: req.user.username
	  }
	  Product.create(req.body.product, function(err, product) {
	    if (err) {
	      return res.redirect('back');
	    }
	    res.redirect("/selling");
	  });
	});
});
//=============================================show product====================================
app.get("/selling/:id", function(req, res){
	var id = req.params.id;
	Product.findById(id).populate("comments").populate("price").exec(function(err, product){
		if(err){
			console.log(err);
		} else {
			if(product.state === "onsale"){
				res.render("show", {product: product});
			} else {
				if( req.isAuthenticated() && ( product.owner.id.equals(req.user._id) || req.user.username === "aniket" ) ){
					res.render("show", {product: product});
				} else {
					res.redirect("/selling");
				}
			}
		}
	});
});


//==============================================product edit================================
app.get("/selling/:id/edit", checkProductOwnership, function(req, res){
	Product.findById(req.params.id, function(err, product){
		if(err){
			console.log(err);
		} else {
			res.render("edit", {product: product});
		}
	})
});
app.post("/selling/:id", checkProductOwnership, upload.single('image'), function(req, res){
	Product.findById(req.params.id, async function(err, product){
		if(err){
			console.log(err);
			res.redirect("back");
		} else {
			if(req.file){
				try{
					await cloudinary.v2.uploader.destroy(product.imageId);
					var result = await cloudinary.v2.uploader.upload(req.file.path);
					product.image = result.secure_url;
	  				product.imageId = result.public_id;
				} catch(err) {
					console.log(err);
					return res.redirect("back");
				}
			}
			product.name = req.body.product.name;
			product.pprice = req.body.product.pprice;
			product.des = req.body.product.des;
			product.enddate = req.body.product.enddate;
			product.state = req.body.product.state;
			product.save();
			res.redirect("/selling/" + req.params.id);
		}
	});
});

//===========================================product delete=========================================
app.get("/selling/:id/delete", checkProductOwnership, function(req, res){
	Product.findById(req.params.id, async function(err, product){
		if(err){
			console.log(err);
			return res.redirect("back");
		} 
		try{
			await cloudinary.v2.uploader.destroy(product.imageId);
			product.remove();
			res.redirect("/selling");
		} catch(err){
			console.log(err);
			return res.redirect("back");
		}
	});
});

//==========================================================new comment===========================
app.post("/selling/:id/comment", isLoggedIn, function(req,res){
				Product.findById(req.params.id, function(err, product){
					if(err){
						console.log(err);
					} else {
						Comment.create(req.body.comment, function(err, comment){
							if( err){
								console.log(err);
							} else {
								comment.owner.id = req.user._id;
								comment.owner.username = req.user.username;
								comment.save();
								product.comments.push(comment);
								product.save();
								res.redirect("/selling/" + product._id);
							}
						});
					}
				});
});
app.get("/selling/:id/comment/new", isLoggedIn, function(req, res){
	Product.findById(req.params.id, function(err, product){
		if(err){
			console.log(err);
		} else {
			res.render("comment", {product: product});
		}
	})
});
//========================================================edit comment======================================
app.get("/selling/:id/comment/:cid/edit", checkCommentOwnershipedit, function(req, res){
	Comment.findById(req.params.cid, function(err, comment){
		if(err){
			console.log(err);
		} else {
			Product.findById(req.params.id, function(err, product){
				res.render("cedit", {comment: comment, product: product});
			});
		}
	})
});
app.post("/selling/:id/comment/:cid", checkCommentOwnershipedit, function(req, res){
	Comment.findByIdAndUpdate(req.params.cid, req.body.comment, function(err, comment){
		if(err){
			console.log(err);
		} else {
			res.redirect("/selling/" + req.params.id);
		}
	});
});
//======================================================delete comment=======================================
app.get("/selling/:id/comment/:cid/delete", checkCommentOwnershipdelete, function(req, res){
	Comment.findByIdAndRemove(req.params.cid, function(err){
		if(err){
			console.log(err);
		} else {
			res.redirect("back");
		}
	});
});

//=======================================================new price================================
app.get("/selling/:id/price/new", isLoggedIn, function(req,res){
	Product.findById(req.params.id, function(err, product){
		if(err){
			console.log(err);
		} else {
			res.render("price", {product: product});
		}
	});
});
app.post("/selling/:id/price", isLoggedIn, function(req,res){
				Product.findById(req.params.id, function(err, product){
					if(err){
						console.log(err);
					} else {
						Price.create(req.body.price, function(err, price){
							if( err){
								console.log(err);
							} else {
								price.owner.id = req.user._id;
								price.owner.username = req.user.username;
								price.save();
								product.price.push(price);
								product.save();
								res.redirect("/selling/" + product._id);
							}
						});
					}
				});
});

//=======================================================edit price================================
app.get("/selling/:id/price/:pid/edit", checkPriceOwnershipedit, function(req, res){
	Price.findById(req.params.pid, function(err, price){
		if(err){
			console.log(err);
		} else {
			Product.findById(req.params.id, function(err, product){
				if(err){
					console.log(err);
				} else {
					res.render("pedit", {product: product, price: price});
				}
			});	
		}
	});
});
app.post("/selling/:id/price/:pid", checkPriceOwnershipedit, function(req, res){
	Price.findByIdAndUpdate(req.params.pid, req.body.price, function(err, price){
		if(err){
			console.log(err);
		} else {
			res.redirect("/selling/" + req.params.id);
		}
	});
});

//=======================================================delete price================================
app.get("/selling/:id/price/:pid/delete", checkPriceOwnershipdelete, function(req, res){
	Price.findByIdAndRemove(req.params.pid, function(err){
		if(err){
			console.log(err);
		} else {
			res.redirect("back");
		}
	});
});

//=====================================================profile=========================================
app.get("/profile/:uid", checkProfileOwnership, function(req, res){
	User.findById(req.params.uid, function(err, user){
		if(err){
			console.log(err);
		} else {
			Product.find({}, function(err, product){
				if(err){
					console.log(err);
				} else {
					res.render("profile", {product: product, user: user});
				}
			});
		}
	});
});
// ====================================================changeowner===========================================
app.get("/changeowner/:pid/:umaxid/:umax", function(req, res){
	var noMatch;
	Product.findById(req.params.pid, function(err, product){
		if(err){
			cosole.log(err);
		} else {
			var p = {
				state: "no",
				owner: {
					id: req.params.umaxid,
					username: req.params.umax
				},
				price:[]
			};
			Product.findByIdAndUpdate(req.params.pid, p, function(err, uproduct){
				if(err){
					cosole.log(err);
				} else {
					Product.find({}, function(err, allproducts){
						if(allproducts.length < 1){
							noMatch = "NO MATCH";
						}
						res.render("index", {product: allproducts, noMatch: noMatch});
					});
				}
			});
		}			
	});
});



var port = process.env.PORT || 3000;
app.listen(port, function(){
	console.log("Auction App Started");
});