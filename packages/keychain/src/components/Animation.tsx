import { ReactElement } from "react";

export function FullPageAnimation({
  show,
  View,
}: {
  show: boolean;
  View: ReactElement;
}) {
  return (
    <div
      className={`${show ? 'flex' : 'hidden'} fixed items-center justify-center top-0 left-0 h-screen w-screen bg-solid-bg z-[9999]`}
    >
      <div className="w-full md:w-[400px]">{View}</div>
    </div>
  );
}
