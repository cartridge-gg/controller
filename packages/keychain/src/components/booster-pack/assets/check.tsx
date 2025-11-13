interface CheckIconProps {
  color?: string;
  className?: string;
}
export function CheckIcon({ className }: CheckIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="38"
      height="31"
      viewBox="0 0 38 31"
      fill="none"
      className={className}
    >
      <path
        d="M10.1822 30.5467L0 20.3645L3.39331 16.9712L10.1822 23.7601L33.94 0L37.3333 3.39557L10.1822 30.5467Z"
        fill={"#fff"}
      />
    </svg>
  );
}
