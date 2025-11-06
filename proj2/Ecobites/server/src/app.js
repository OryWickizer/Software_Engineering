import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import auth from "./routes/auth.routes.js";
import orders from "./routes/orders.routes.js";
import menuRoutes from "./routes/menu.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import profileRoutes from "./routes/profile.routes.js";

const app = express();

// CORS must allow credentials for cookies to work
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use("/api", routes);
app.use("/api/auth", auth);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orders);
app.use('/api/restaurants', restaurantRoutes);

app.use('/api/profile', profileRoutes);


// Helpful root route so visiting http://localhost:3000/ doesn't show "Cannot GET /"
app.get("/", (req, res) => {
	res.json({
		service: "EcoBites API",
		status: "ok",
		try: {
			health: "/api/health",
			auth: {
				register: "/api/auth/register",
				login: "/api/auth/login",
			},
		},
	});
});

export default app;
