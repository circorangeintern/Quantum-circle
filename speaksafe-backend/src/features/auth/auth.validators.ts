import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .min(1, "Email is required")
      .max(255, "Email is too long"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long"),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password is too long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
  }),
});

export type LoginRequest = z.infer<typeof loginSchema>["body"];
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>["body"];
export type ChangePasswordRequest = z.infer<
  typeof changePasswordSchema
>["body"];
export type ForgotPasswordRequest = z.infer<
  typeof forgotPasswordSchema
>["body"];
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>["body"];
