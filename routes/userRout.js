const express = require("express");
const router = express.Router();
const mysql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { checkToken } = require("../Middlewares/midellwar");

dotenv.config();

const db = mysql.createPool({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: process.env.DATABASE,
});

mysql.createConnection;

router.get("/", checkToken, (req, res) => {
	const getUsersQuery = `select * from user`;
	db.query(getUsersQuery, (error, result) => {
		if (error) {
			console.log(error);
			res.send("Error");
		} else {
			console.log("connected");
			res.send("hi doness");
		}
	});
});

router.post("/api/user/register", async (req, res) => {
	const {
		firstName,
		lastName,
		email,
		password,
		confirmPassword,
		userWork,
		imageData,
	} = req.body;

	if (!firstName || !email || !password || !confirmPassword) {
		res.send("fill all entry");
	} else if (password !== confirmPassword) {
		res.send("passwords does not match");
	} else if (password.length < 6 || confirmPassword.length < 6) {
		res.send("passwords length is less then 6");
	} else {
		let hashedPassword = await bcrypt.hash(password, 10);
		let hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);

		const userPostQuery = `insert into user(firstName,
			lastName,
			email,
			password,
			confirmPassword,
			userWork,
			imageData,
			dateCreated
			) values(?,?,?,?,?,?,?,now())`;
		db.query(
			userPostQuery,
			[
				firstName,
				lastName,
				email,
				hashedPassword,
				hashedConfirmPassword,
				userWork,
				imageData,
			],
			(error, result) => {
				if (error) {
					console.log(error);
					res.send("Error");
				} else {
					console.log("user Created");
					res.send("User Created");
				}
			}
		);
	}
});

router.post("/api/user/login", (req, res) => {
	const { email, password } = req.body;

	if (!email || !password || password.length < 6) {
		res.send("Error");
	} else {
		const loginInUserQuery = `select email,password,confirmPassword from user where email = ?`;
		db.query(loginInUserQuery, [email], async (error, result) => {
			if (error) {
				console.log(error);
				res.send("Error");
			} else if (result.length === 0) {
				console.log("No such email exist");
				res.send("no user");
			} else {
				const passwordFromDb = result[0].password;
				const comparedOne = await bcrypt.compare(password, passwordFromDb);

				if (comparedOne === true) {
					// getting jwt token
					const jasonToken = jwt.sign({ userEmail: email }, "SecretePassword", {
						expiresIn: "1hr",
					});
					// setting jwt token in cookies
					res.cookie("userEmail", jasonToken, {
						maxAge: 2 * 60 * 60 * 1000,
						httpOnly: true,
						secure: false,
					});
					console.log("logged in");
					res.status(200).send("Logged In");
					// return jasonToken;
				}
			}
		});
	}
});

router.get("/api/user/getOneUser/:email", checkToken, (req, res) => {
	const email = req.params.email;
	const getUserById = `select userId,firstName,lastName,email,dateCreated,userWork,imageData from user where email = ?`;
	db.query(getUserById, [email], (error, result) => {
		if (error) console.log(error);
		// console.log(result);
		res.send(result[0]);
	});
});

router.get("/api/user/getCurrentUser", checkToken, (req, res) => {
	res.send({ message: "present", email: req.emails });
});

router.get("/api/post/getAllPosts", checkToken, (req, res) => {
	const getPostQuery = `select postId,userId,imageOfPost,title,postDescription,createdAt from posts `;
	db.query(getPostQuery, (error, result) => {
		if (error) {
			console.log(error);
		}
		res.send(result);
	});
});

router.get("/api/post/getPostByUserId/:userId", checkToken, (req, res) => {
	const userId = req.params.userId;
	const getSingUserPosts = `select postId,userId,imageOfPost,title,postDescription,createdAt from posts where userId = ?`;
	db.query(getSingUserPosts, [userId], (error, result) => {
		if (error) {
			console.log(error);
			res.send("error");
		} else {
			res.send(result);
		}
	});
});
router.get("/api/post/getOneSinglePost/:postId", checkToken, (req, res) => {
	// console.log();
	const postId = req.params.postId;
	const getTheSinglePOstQuery = `select postId,userId,imageOfPost,title,postDescription,createdAt from posts where postId = ?`;
	db.query(getTheSinglePOstQuery, [postId], (error, result) => {
		if (error) console.log(error);
		else {
			// console.log(result);
			res.send(result[0]);
		}
	});
	// console.log(res);
});
router.post("/api/post/createPost", checkToken, (req, res) => {
	const { userId, imageOfPost, title, postDescription } = req.body;
	console.log(userId);
	if (!userId || !title) {
		res.send("Title is must");
	} else {
		const createPostQuery = `insert into posts(userId, imageOfPost, title, postDescription, createdAt) values(?,?,?,?,now())`;
		db.query(
			createPostQuery,
			[userId, imageOfPost, title, postDescription],
			(error, result) => {
				if (error) {
					console.log(error);
					res.send("Error");
				}
				res.send("Post created");
			}
		);
	}
});

module.exports = router;
