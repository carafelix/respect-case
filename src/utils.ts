/* eslint-disable @typescript-eslint/naming-convention */

/**
 * from vscode: 
 * /src/vs/base/common/charCode.ts
 * /src/vs/base/common/strings.ts
 */

export const enum CharCode {
	Digit0 = 48,
	Digit9 = 57,
	a = 97,
	z = 122,
	A = 65,
	Z = 90,
	Underline = 95,
	Dash = 45,
	Period = 46,
	Slash = 47,
	Colon = 58,
	Comma = 44,
}


export function isAsciiDigit(code: number): boolean {
	return code >= CharCode.Digit0 && code <= CharCode.Digit9;
}

export function isLowerAsciiLetter(code: number): boolean {
	return code >= CharCode.a && code <= CharCode.z;
}

export function isUpperAsciiLetter(code: number): boolean {
	return code >= CharCode.A && code <= CharCode.Z;
}
