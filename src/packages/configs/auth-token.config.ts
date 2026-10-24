export const AuthTokenTypes = {
	EMAIL_VERIFICATION: "EMAIL_VERIFICATION",
	PASSWORD_RESET: "PASSWORD_RESET",
	EMAIL_CHANGE: "EMAIL_CHANGE",
} as const;

export type AuthTokenType = keyof typeof AuthTokenTypes;
