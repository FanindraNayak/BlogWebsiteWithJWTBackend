const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

app.use(express.json({ limit: "10000kb", extended: true }));
app.use(
	cors({
		origin: ["http://localhost:3000"],
		methods: ["POST", "GET"],
		credentials: true,
	})
);
app.use(cookieParser());
app.use(express.urlencoded({ limit: "10000kb", extended: true }));
const userRoutes = require("./routes/userRout");

const PORT = process.env.PORT || 3012;
app.use("/", userRoutes);
app.listen(PORT, () => {
	console.log("listening on ", PORT);
});
