const jwt = require("jsonwebtoken");

const checkToken = (req, res, next) => {
	// we verify the user Exist by jwt token
	// we used cookie parser to get cookies see in server.js
	let token = req.cookies.userEmail;
	if (token) {
		jwt.verify(token, "SecretePassword", (error, decoded) => {
			if (error) {
				console.log(error);
				res.send("Invalid Token");
			} else {
				// res.send(decoded);
				// sending data to the route using req method and variable name you wwant
				req.emails = decoded.userEmail;
				console.log("success");
				next();
			}
		});
	} else {
		res.send("accessDenied");
	}
};

module.exports = { checkToken };
