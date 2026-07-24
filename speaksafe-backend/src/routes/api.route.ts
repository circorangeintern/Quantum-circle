import express from "express";

import authRoutes from "../features/auth/auth.routes";
import reportRoutes from "../features/reports/report.routes";
import adminUserRoutes from "../features/admin-users/user.routes";
import schoolRoutes from "../features/schools/school.routes";
import registrationRoutes from "../features/school-registration/registration.routes";

const api = express.Router();

api.use("/auth", authRoutes);
api.use("/reports", reportRoutes);
api.use("/admin-users", adminUserRoutes);
api.use("/schools", schoolRoutes);
api.use("/api/registrations", registrationRoutes);

export default api;
