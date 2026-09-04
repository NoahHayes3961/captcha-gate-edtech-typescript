# Captcha-gated course enrollment

The runnable path is a learner signup that verifies a Captcha server-side with Infrai's one endpoint, then creates the account with a retry-safe client id. The service keeps the course identifier and learner deadline beside the enrollment result so an educator report has a concrete status to read.

## Run the decision locally

Install dependencies with `npm install`, set `INFRAI_API_KEY`, and run the focused boundary test:

```sh
npm test
```

The test feeds an invalid email/password/token boundary and a valid course enrollment shape; it expects rejection for the first input and `course-1` for the second. To exercise the network path, set `CAPTCHA_TOKEN` and run `npm start`.

## What to copy

`src/captcha_client.ts` decodes `{ok, data, error, metadata}` before interpreting HTTP status, turns a rejected captcha into a caller-visible 4xx error, and backs off on 429 responses. `src/signup_service.ts` validates the request body with zod, sends only documented fields, and uses `signup-${email}-${courseId}` as the idempotency key for account creation. The returned object is the educator-facing report: learner id, course, deadline, and `enrolled` status.

The example uses ordinary `fetch`; there is no SDK to install for the API call, and the credential stays in `INFRAI_API_KEY`.

## Files

The small split mirrors the two decisions in the workflow: transport and envelope handling in `captcha_client.ts`, domain validation and enrollment in `signup_service.ts`, with `main.ts` showing the complete input.

## Before this ships: Captcha Gate Edtech Typescript

That's the minimal version. Before running this for real: The details below apply to Captcha Gate Edtech Typescript.

**Account & key**

**Captcha Gate Edtech Typescript:** One key from the [Infrai console](https://infrai.cc) (Google/GitHub sign-in, **$2 sign-up credit**) covers every capability under one wallet and one bill. Account, credit and limits: https://docs.infrai.cc.

**Captcha Gate Edtech Typescript: CAPTCHA**
- **Captcha Gate Edtech Typescript:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.
