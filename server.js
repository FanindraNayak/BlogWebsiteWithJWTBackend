const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

app.use(express.json());
app.use(
	cors({
		origin: ["http://localhost:3000"],
		methods: ["POST", "GET"],
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const userRoutes = require("./routes/userRout");

const PORT = process.env.PORT || 3012;
app.use("/", userRoutes);
// app.post("/api/user", (req, res) => {
// 	console.log(req.body);
// 	console.log("hi");
// 	res.send("user created");
// });
app.listen(PORT, () => {
	console.log("listining on ", PORT);
});
