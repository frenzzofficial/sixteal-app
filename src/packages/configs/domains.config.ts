/**
 * domains.config.ts
 * ------------------------------------------------------------------
 * Email domain policy used by `emailRules` (schemas.config.ts):
 *   - blacklistedMailDomains -> disposable/throwaway providers, rejected at sign-up
 *   - blacklistedEmails      -> specific banned addresses (abuse, chargebacks, manual flags)
 * ------------------------------------------------------------------
 */

// Disposable / temp-mail providers. Extend as new providers surface; this list can never be
// exhaustive, treat it as a first line of defense, not the only one.
const blacklistedMailDomains: string[] = [
	"mailinator.com",
	"guerrillamail.com",
	"10minutemail.com",
	"yopmail.com",
	"tempmail.com",
	"temp-mail.org",
	"trashmail.com",
	"getnada.com",
	"sharklasers.com",
	"discussable.com",
	"maildrop.cc",
	"fakeinbox.com",
	"throwawaymail.com",
	"discard.email",
	"mintemail.com",
	"moakt.com",
];

// Specific addresses banned regardless of domain. Comparisons are case-insensitive, so store
// lowercase for clarity.
const blacklistedEmails: string[] = [
	// "known-abuser@gmail.com",
];

const normalize = (value: string): string => value.trim().toLowerCase();

export const getEmailDomain = (email: string): string => normalize(email).split("@")[1] ?? "";

export const isDomainBlacklisted = (domain: string): boolean =>
	blacklistedMailDomains.includes(normalize(domain));

export const isEmailBlacklisted = (email: string): boolean =>
	blacklistedEmails.includes(normalize(email));
