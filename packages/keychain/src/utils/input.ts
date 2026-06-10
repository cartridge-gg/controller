// E.164 international phone number format
export function isValidPhoneNumber(value: string): boolean {
  return /^\+[1-9]\d{6,14}$/.test(value);
}

export function isValidEmailAddress(value: string): boolean {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
}
