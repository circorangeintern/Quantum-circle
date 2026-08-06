import express from "express";

import authRoutes from "../features/auth/auth.routes";
import userRoutes from "../features/user/user.routes";
import reportRoutes from "../features/reports/report.routes";
import systemUserRoutes from "../features/system/system.routes";
import schoolRoutes from "../features/schools/school.routes";
import registrationRoutes from "../features/school-registration/registration.routes";

const api = express.Router();

api.use("/auth", authRoutes);
api.use("/users", userRoutes);
api.use("/reports", reportRoutes);
api.use("/system", systemUserRoutes);
api.use("/schools", schoolRoutes);
api.use("/registrations", registrationRoutes);

export default api;
