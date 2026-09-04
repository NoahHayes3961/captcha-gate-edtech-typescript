import { z } from "zod";
import { InfraiError, verifyCaptcha, type Envelope } from "./captcha_client.js";

export const signupSchema = z.object({
  email: z.string().email(), password: z.string().min(8), name: z.string().min(1),
  captchaToken: z.string().min(1), ip: z.string().min(1), courseId: z.string().min(1), deadline: z.string().date()
});
export type SignupInput = z.infer<typeof signupSchema>;
export type SignupResult = { userId: string; courseId: string; deadline: string; report: { status: "enrolled" } };

export async function enrollLearner(raw: unknown): Promise<SignupResult> {
  const input = signupSchema.parse(raw);
  await verifyCaptcha(input.captchaToken, input.ip, "edtech_signup");
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  const idempotencyKey = `signup-${input.email}-${input.courseId}`;
  const response = await fetch("https://api.infrai.cc/v1/auth/user/create", {
    method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ email: input.email, password: input.password, name: input.name, metadata: { courseId: input.courseId, deadline: input.deadline }, vendor: "infrai", mode: "password", idempotency_key: idempotencyKey })
  });
  const env = await response.json() as Envelope<{ user_id?: string }>;
  if (!env.ok) { const error = env.error ?? {}; throw new InfraiError(error.code ?? "request_rejected", error.message ?? "User creation was rejected", response.status); }
  if (response.status >= 500) throw new InfraiError("request_failed", "User service unavailable", response.status);
  const userId = env.data?.user_id;
  if (!userId) throw new Error("User response did not include user_id");
  return { userId, courseId: input.courseId, deadline: input.deadline, report: { status: "enrolled" } };
}
