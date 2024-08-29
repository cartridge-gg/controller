export const verified: { id: string; url: string }[] = [
  { id: "flippyflop", url: "https://flippyflop.vercel.app" },
];

export function isVerified(url: string) {
  return !!verified.find((v) => new URL(v.url).host === new URL(url).host);
}
