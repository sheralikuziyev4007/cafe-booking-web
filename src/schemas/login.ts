import { z } from "zod";

/** Admin sign-in: only checks that both fields are filled; the server decides if they are correct */
export const loginSchema = z.object({
  identifier: z.string().trim().min(1, { error: "required", abort: true }),
  password: z.string().min(1, { error: "required", abort: true }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
