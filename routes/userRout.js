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

router.get("/", (req, res) => {
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
	// console.log(req.body);
	const { firstName, email, password, confirmPassword } = req.body;
	// console.log(firstName);
	// console.log(email);
	// console.log(password.length);
	// console.log(confirmPassword);
	// console.log("hi");

	if (!firstName || !email || !password || !confirmPassword) {
		res.send("fill all entry");
	} else if (password !== confirmPassword) {
		res.send("passwords doesnot match");
	} else if (password.length < 6 || confirmPassword.length < 6) {
		res.send("passwords length is less then 6");
	} else {
		let hashedPassword = await bcrypt.hash(password, 10);
		// console.log(hashedPassword);
		let hashedConfirmPassword = await bcrypt.hash(confirmPassword, 10);
		// console.log(hashedConfirmPassword);
		// res.send("hashed");

		const userPostQuery = `insert into user(firstName,email,password,confirmPassword,dateCreated) values(?,?,?,?,now())`;
		db.query(
			userPostQuery,
			[firstName, email, hashedPassword, hashedConfirmPassword],
			(error, result) => {
				// console.log(userPostQuery);
				// console.log(error);
				// console.log(result);
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
	// console.log(req.body);
	const { email, password } = req.body;

	if (!email || !password || password.length < 6) {
		res.send("Error");
	} else {
		const loginInUserQuery = `select email,password,confirmPassword from user where email = ?`;
		db.query(loginInUserQuery, [email], async (error, result) => {
			if (error) {
				// console.log("error");
				console.log(error);
				res.send("Error");
			} else if (result.length === 0) {
				console.log("No such email exist");
				res.send("no user");
			} else {
				// const { email, password, confirmPassword } = result[0];
				// const emailFromDb = result[0].email;
				const passwordFromDb = result[0].password;
				// console.log(password);
				// console.log(passwordFromDb, emailFromDb, confirmPasswordFromDb);
				const comparedOne = await bcrypt.compare(password, passwordFromDb);

				if (comparedOne === true) {
					// console.log(comparedOne);
					// console.log(compareConfirmPassword);
					// passwordFromDb = undefined;
					// getting jwt token
					const jasonToken = jwt.sign({ userEmail: email }, "SecretePassword", {
						expiresIn: "1hr",
					});
					// setting jwt token in cookies
					res.cookie("userEmail", jasonToken, {
						maxAge: 2 * 60 * 60 * 1000,
						httpOnly: true,
					});
					res.send(jasonToken);
					// return jasonToken;
				}
				// res.send("error");
				// res.send(result);
			}
		});
	}
});

router.get("/api/user/getOneUser/:userId", checkToken, (req, res) => {
	// console.log(req.params);
	const userId = req.params.userId;
	const getUserById = ` select * from user where userId = ?`;
	db.query(getUserById, [userId], (error, result) => {
		if (error) console.log(error);
		res.send(result[0]);
	});
});

router.get("/api/post/getAllPosts", checkToken, (req, res) => {
	// console.log(req.body);
	const getPostQuery = `select postId,userId,imageOfPost,title,postDescription,createdAt from posts `;
	db.query(getPostQuery, (error, result) => {
		// console.log(result);
		if (error) {
			console.log(error);
		}
		res.send(result);
	});
});

router.get("/api/post/getPostById/:userId", checkToken, (req, res) => {
	const userId = req.params.userId;
	// console.log(req.params);
	// console.log(userId);
	const getSingUserPosts = `select postId,userId,imageOfPost,title,postDescription,createdAt from posts where userId = ?`;
	db.query(getSingUserPosts, [userId], (error, result) => {
		if (error) {
			console.log(error);
			res.send("error");
		} else {
			// console.log(result);
			res.send(result);
		}
	});
});

router.post("/api/post/createPost", checkToken, (req, res) => {
	// console.log(req.body);
	const { userId, imageOfPost, title, postDescription } = req.body;
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
				// console.log(result);
				res.send("Post created");
			}
		);
	}
});

module.exports = router;
