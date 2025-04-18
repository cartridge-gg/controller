export function eip191Encode(message: string): string {
  return `Ethereum Signed Message:\n${message.length}\n${message}`;
}
