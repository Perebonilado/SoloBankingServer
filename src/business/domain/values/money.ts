export function toKobo(value: string | number | bigint): number {
  const kobo = Number(value);
  if (!Number.isSafeInteger(kobo)) {
    throw new RangeError(`Invalid kobo amount: ${String(value)}`);
  }
  return kobo;
}
