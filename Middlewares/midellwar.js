const jwt = require("jsonwebtoken");

const checkToken = (req, res, next) => {
	// we verify the user Exist by jwt token
	// console.log(req.get);
	// console.log(req.cookies.userEmail);
	// let token = req.get("userEmail");
	// we used cookie parser to get cookies see in server.js
	let token = req.cookies.userEmail;
	console.log(token);
	if (token) {
		// token = token.slice(7);
		jwt.verify(token, "SecretePassword", (error, decoded) => {
			if (error) {
				console.log(error);
				res.send("Invalid Token");
			} else {
				console.log("success");
				next();
			}
		});
	} else {
		res.send("accessDenied");
		// next();
	}
};

module.exports = { checkToken };
