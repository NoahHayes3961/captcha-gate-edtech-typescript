import assert from "node:assert/strict";
import { signupSchema } from "../src/signup_service.js";

const parsed = signupSchema.safeParse({ email: "bad", password: "short", name: "", captchaToken: "", ip: "", courseId: "", deadline: "tomorrow" });
assert.equal(parsed.success, false);
const valid = signupSchema.parse({ email: "learner@example.edu", password: "long-enough", name: "Ada", captchaToken: "token", ip: "127.0.0.1", courseId: "course-1", deadline: "2026-10-15" });
assert.equal(valid.courseId, "course-1");
console.log("signup boundary test passed");
