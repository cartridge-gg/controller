import { AlertIcon } from "@cartridge/ui-next";
import { Container } from "@/components/layout";
import { useEffect, useState } from "react";

export function Unsupported({ message }: { message: string }) {
  return (
    <Container
      hideAccount
      Icon={AlertIcon}
      title="Device is not supported"
      description={message}
    ></Container>
  );
}

export function useIsSupported() {
  const [message, setMessage] = useState<string>();

  useEffect(() => {
    const userAgent = window.navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      const iosVersion = /OS (\d+)_?(?:\d+_?){0,2}\s/.exec(userAgent);
      if (iosVersion && Number(iosVersion[1]) < 16) {
        setMessage(
          `iOS ${iosVersion[1]} does not support passkeys. Upgrade to iOS 16 to continue`,
        );
      }
    }
  }, []);

  return { isSupported: !message, message };
}
