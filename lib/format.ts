export function displayCountry(code: string | null | undefined): string {
  if (!code || code === "XX" || code.toUpperCase() === "UNKNOWN") {
    return "Unknown";
  }
  return code.toUpperCase();
}
