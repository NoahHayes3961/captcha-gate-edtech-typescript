import { enrollLearner } from "./signup_service.js";

const input = { email: "learner@example.edu", password: "correct-horse", name: "Ada Learner", captchaToken: process.env.CAPTCHA_TOKEN ?? "local-token", ip: "203.0.113.8", courseId: "algebra-101", deadline: "2026-10-15" };
enrollLearner(input).then(result => console.log(JSON.stringify(result, null, 2))).catch(error => { console.error(error.message); process.exitCode = 1; });
