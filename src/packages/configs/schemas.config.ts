import { z } from "zod";
import { getEmailDomain, isDomainBlacklisted, isEmailBlacklisted } from "./domains.config";

/**
 * Zod rules shared by the auth and account request schemas. Compose them into per-endpoint
 * schemas with z.object({ ... }); every export is a field-level schema named `xRules`.
 */

//  SHARED MESSAGES
export const schemaMessages = {
	// EMAIL
	emailRequired: "Email is required",
	emailInvalid: "Invalid email format",
	emailTooLong: "Email must not exceed 255 characters",
	emailBlacklisted: "This email address is not allowed",
	emailDomainBlacklisted: "Disposable or temporary email addresses are not allowed",

	// FULL NAME
	fullnameTooShort: "Full name must be at least 2 characters",
	fullnameTooLong: "Full name must not exceed 100 characters",
	fullnameInvalid: "Full name contains invalid characters",

	// USERNAME
	usernameTooShort: "Username must be at least 5 characters",
	usernameTooLong: "Username must not exceed 30 characters",
	usernameInvalid: "Username may only contain letters, numbers and underscores",

	// PASSWORD
	passwordRequired: "Password is required",
	passwordTooShort: "Password must be at least 8 characters long",
	passwordTooLong: "Password must not exceed 128 characters",
	passwordUpper: "Password must contain at least one uppercase letter",
	passwordLower: "Password must contain at least one lowercase letter",
	passwordNumber: "Password must contain at least one number",
	passwordSpecial: "Password must contain at least one special character",
	passwordNoSpaces: "Password must not contain spaces",
	passwordMismatch: "Passwords do not match",

	// PHONE
	phoneInvalid: "Invalid phone number format",
};

const trimString = () => z.string().trim();

// FULL NAME rules
// Letters and combining marks from any script, plus spaces, apostrophes, dots and hyphens,
// so "Ánna Müller", "李小龙" and "Nguyễn Văn A" all pass.
export const fullnameRules = trimString()
	.min(2, schemaMessages.fullnameTooShort)
	.max(100, schemaMessages.fullnameTooLong)
	.regex(/^[\p{L}\p{M}\s'’.-]+$/u, schemaMessages.fullnameInvalid)
	.describe("Full name");

// USERNAME rules
export const usernameRules = trimString()
	.min(5, schemaMessages.usernameTooShort)
	.max(30, schemaMessages.usernameTooLong)
	.regex(/^[a-zA-Z0-9_]+$/, schemaMessages.usernameInvalid)
	.describe("Username");

// PASSWORD rules
// Not trimmed: silently changing what the user typed would make the stored password differ
// from the one they believe they set. Spaces are rejected instead (see passwordNoSpaces).
export const passwordRules = z
	.string()
	.min(8, schemaMessages.passwordTooShort)
	.max(128, schemaMessages.passwordTooLong)
	.regex(/[A-Z]/, schemaMessages.passwordUpper)
	.regex(/[a-z]/, schemaMessages.passwordLower)
	.regex(/[0-9]/, schemaMessages.passwordNumber)
	.regex(/[^A-Za-z0-9]/, schemaMessages.passwordSpecial)
	.refine((value) => !/\s/.test(value), {
		message: schemaMessages.passwordNoSpaces,
	})
	.describe("Secure password with uppercase, lowercase, number and special character");

export const confirmPasswordRules = z.string().describe("Confirm password");

// Sign-in only checks that something sensible was sent. Complexity rules belong to sign-up
// and password changes; applying them here would 422 users whose password predates a policy
// change instead of giving the normal "invalid email or password" answer.
export const signInPasswordRules = z
	.string()
	.min(1, schemaMessages.passwordRequired)
	.max(128, schemaMessages.passwordTooLong)
	.describe("Account password");

/**
 * Email address: trimmed, lower-cased, valid format, and not a disposable domain or a
 * blocked address (see domains.config.ts).
 */
export const emailRules = z
	.string()
	.trim()
	.toLowerCase()
	.min(1, schemaMessages.emailRequired)
	.max(255, schemaMessages.emailTooLong)
	.pipe(z.email(schemaMessages.emailInvalid))
	.refine((email) => !isDomainBlacklisted(getEmailDomain(email)), {
		message: schemaMessages.emailDomainBlacklisted,
	})
	.refine((email) => !isEmailBlacklisted(email), {
		message: schemaMessages.emailBlacklisted,
	})
	.describe("Email (any domain, blacklist enforced)");

// International phone number rules
export const phoneRules = trimString()
	.regex(/^\+?[1-9]\d{7,14}$/, schemaMessages.phoneInvalid)
	.describe("International phone number");

/**
 * Boolean for JSON bodies and form fields: accepts true/false and the strings "true"/"false"/
 * "1"/"0"/"yes"/"no". Never use z.coerce.boolean() for this: it turns "false" into true.
 */
export const booleanFlagRules = z.union([z.boolean(), z.stringbool()]);

// Opaque single-use token from an email link (verification / password reset).
export const emailTokenRules = z.string().trim().min(20).max(512);
