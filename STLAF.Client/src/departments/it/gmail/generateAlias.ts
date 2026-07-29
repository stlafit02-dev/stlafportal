const SUFFIX_REGEX = /^(jr|sr|ii|iii|iv|v)\.?$/i;
const INITIAL_TOKEN_REGEX = /^[A-Za-z]\.?$/;

export function generateEmailAlias(fullName: string): string {
  let tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return "";

  if (tokens.length > 1 && SUFFIX_REGEX.test(tokens[tokens.length - 1])) {
    tokens = tokens.slice(0, -1);
  }
  if (tokens.length === 0) return "";
  if (tokens.length === 1) {
    return tokens[0].toLowerCase().replace(/[^a-z]/g, "");
  }

  const lastName = tokens[tokens.length - 1];
  const firstMiddleTokens = tokens.slice(0, -1);
  const firstInitial = firstMiddleTokens[0][0];

  let middleInitial = "";
  const explicitInitial = firstMiddleTokens.slice(1).find((t) => INITIAL_TOKEN_REGEX.test(t));
  if (explicitInitial) {
    middleInitial = explicitInitial[0];
  } else if (firstMiddleTokens.length > 1) {
    middleInitial = firstMiddleTokens[firstMiddleTokens.length - 1][0];
  }

  return `${firstInitial}${middleInitial}${lastName}`.toLowerCase().replace(/[^a-z]/g, "");
}

export const EMAIL_DOMAIN = "sadsadtamesislaw.com";