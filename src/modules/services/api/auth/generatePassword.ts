import { randomInt } from "crypto";

export function generateTemporaryPassword(length = 10): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const symbols = "!@#$%&*";
  const all = upper + lower + digits + symbols;

  const pick = (chars: string) => chars[randomInt(0, chars.length)];

  const required = [pick(upper), pick(lower), pick(digits), pick(symbols)];

  const rest = Array.from({ length: length - required.length }, () =>
    pick(all),
  );

  return [...required, ...rest]
    .sort(() => Math.random() - 0.5)
    .join("");
}