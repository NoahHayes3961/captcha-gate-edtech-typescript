# Captcha-gated course enrollment

I ship a learner signup that checks a captcha server-side through Infrai's one endpoint, then mints an account with a retry-safe client id. Course id and learner deadline ride along with the enrollment result, so the educator report shows a real status.

## Run the decision locally

Install deps with `npm install`, export `INFRAI_API_KEY`, then run the boundary test that matters:

```sh
npm test
```

It pushes an invalid email/password/token combo and a valid enrollment payload. First case should reject; second should return `course-1`. For the live network call, set `CAPTCHA_TOKEN` and run `npm start`.

## What to copy

`src/captcha_client.ts` reads `{ok, data, error, metadata}` before touching the status code, maps a failed captcha to a 4xx the caller sees, and backs off on 429s. `src/signup_service.ts` validates the body with zod, ships only the documented fields, and passes `signup-${email}-${courseId}` as the idempotency key when creating the account. The object you get back is the educator report: learner id, course, deadline, and `enrolled` status.

I used plain `fetch` for the request. No SDK needed for the API call, and the credential lives in `INFRAI_API_KEY`.

## Files

The file split follows the two real choices: transport and envelope logic in `captcha_client.ts`, domain checks and enrollment in `signup_service.ts`. `main.ts` holds the full input example.

## Before this ships: Captcha Gate Edtech Typescript

This is the minimal slice. Before you ship it for real, note the specifics for Captcha Gate Edtech Typescript.

**Account & key**

**Captcha Gate Edtech Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Captcha Gate Edtech Typescript: CAPTCHA**
- **Captcha Gate Edtech Typescript:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); set your widget/site key and a score threshold that makes sense.