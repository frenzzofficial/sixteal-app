import { z } from "zod";
import { parseEnv } from "../utils/parse-env";
import { envAppConfig } from "./app.env";

// On Vercel, default the public origin from the deployment host instead of localhost.
const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const defaultOrigin = vercelHost
	? `https://${vercelHost}`
	: `http://localhost:${envAppConfig.PORT}`;

/**
 * Public environment schema.
 *
 * Everything here is safe to expose — app identity/version info that's
 * fine to surface on a health check, a Swagger page, or to a frontend,
 * plus the CORS/origin allowlist itself (which every client inspecting
 * network requests can already see). Nothing in this file is a secret.
 */
const publicEnvSchema = z.object({
	// App identity — safe to surface on /health, /status, or docs
	APP_NAME: z.string().default("Six Teal App"),
	APP_VERSION: z.string().default("1.0.0"),
	APP_DESCRIPTION: z
		.string()
		.default(
			"Six Teal Store is a modern e-commerce platform that offers a wide range of products and services to customers worldwide. Our mission is to provide a seamless shopping experience with high-quality products, competitive prices, and exceptional customer service.",
		),

	DEFAULT_LOCALE: z.string().default("en"),
	DEFAULT_TIMEZONE: z.string().default("UTC"),

	SITE_ORIGIN: z.url().default(defaultOrigin),
	SITE_DOCUMENTATION: z.url().default(`${defaultOrigin}/documentation`),
	SITE_API: z.url().default(`${defaultOrigin}${envAppConfig.API_PREFIX}`),
});

/**
 * Public, immutable config.
 */
export const envPublicConfig = Object.freeze(parseEnv(publicEnvSchema, "Public"));

export type EnvPublicConfig = typeof envPublicConfig;
