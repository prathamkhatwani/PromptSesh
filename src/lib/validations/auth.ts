import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().max(100, "Name cannot exceed 100 characters").optional(),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address.")
    .max(255, "Email cannot exceed 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password cannot exceed 128 characters."),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please enter a valid email address.")
    .max(255, "Email cannot exceed 255 characters."),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .trim()
    .min(16, "Invalid reset token format.")
    .max(256, "Reset token is invalid."),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters long.")
    .max(128, "Password cannot exceed 128 characters."),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
