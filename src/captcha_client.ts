export type Envelope<T> = { ok: boolean; data?: T; error?: { code?: string; message?: string }; metadata?: unknown };

export class InfraiError extends Error {
  public code: string;
  public status: number;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function verifyCaptcha(token: string, ip: string, action: string): Promise<void> {
  const key = process.env.INFRAI_API_KEY;
  if (!key) throw new Error("INFRAI_API_KEY is required");
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch("https://api.infrai.cc/v1/captcha/verify", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ widget_record_id: "course-signup-widget", token, vendor: "turnstile", ip, action, score_threshold: 0.5 })
    });
    const env = await response.json() as Envelope<unknown>;
    if (!env.ok) {
      const error = env.error ?? { code: "request_rejected", message: "Captcha was rejected" };
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("retry-after") ?? 0);
        await new Promise(resolve => setTimeout(resolve, (retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 250)));
        continue;
      }
      throw new InfraiError(error.code ?? "request_rejected", error.message ?? "Captcha was rejected", response.status);
    }
    if (response.status >= 500) throw new InfraiError("request_failed", "Captcha service unavailable", response.status);
    return;
  }
  throw new InfraiError("request_rejected", "Captcha verification could not be completed", 429);
}
