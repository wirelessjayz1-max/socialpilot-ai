# SocialPilot AI V4 — Provider Flexible (OIDC + AI Gateway)

This build uses the Vercel AI SDK with Vercel AI Gateway. In a Vercel production deployment, the AI SDK can authenticate to AI Gateway using Vercel OIDC, so the app does not require a manually managed Gateway API key in production. For local development, you can optionally set `AI_GATEWAY_API_KEY`.

## AI configuration
- `AI_MODEL=google/gemini-2.5-flash-lite`
- `AI_FALLBACK_MODELS=google/gemini-2.5-flash,openai/gpt-5.6-luna,anthropic/claude-sonnet-4.6`
- `AI_GATEWAY_API_KEY` is optional in Vercel production; it is useful for local development or non-Vercel hosting.

The generator uses `generateObject` with a Zod schema and Gateway model fallbacks.

## Deploy
1. Deploy this project to the same Vercel project where AI Gateway is enabled.
2. Set `AI_MODEL` and `AI_FALLBACK_MODELS` in Vercel if you want to override the defaults.
3. Remove the old `AI_GATEWAY_API_KEY` if it is invalid; production can use Vercel OIDC instead.
4. Redeploy.

Do not paste API keys into chat or commit them to source control.
