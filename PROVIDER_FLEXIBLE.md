# Provider-flexible AI routing

SocialPilot uses Vercel AI SDK + AI Gateway. The primary model is configurable with `AI_MODEL`; Gateway fallbacks are supplied through `AI_FALLBACK_MODELS`. In Vercel production, the AI SDK can authenticate through Vercel OIDC, avoiding a manually managed API key.

Current defaults:
1. google/gemini-2.5-flash-lite
2. google/gemini-2.5-flash
3. openai/gpt-5.6-luna
4. anthropic/claude-sonnet-4.6
