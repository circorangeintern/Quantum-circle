import express from "express";

import authRoutes from "../features/auth/auth.routes";
import reportRoutes from "../features/reports/report.routes";
import adminRequestRoutes from "../features/admin-requests/request.routes";
import adminUserRoutes from "../features/admin-users/user.routes";
import schoolRoutes from "../features/schools/school.routes";

const api = express.Router();

api.use("/auth", authRoutes);
api.use("/reports", reportRoutes);
api.use("/admin/requests", adminRequestRoutes);
api.use("/admin/users", adminUserRoutes);
api.use("/schools", schoolRoutes);

export default api;
