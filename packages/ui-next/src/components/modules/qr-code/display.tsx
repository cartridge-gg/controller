import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const qrCode = new QRCodeStyling({
  width: 192,
  height: 192,
  image: "https://cardpack-demo.preview.cartridge.gg/qr-logo.png",
  dotsOptions: {
    color: "#fff",
    type: "rounded",
  },
  imageOptions: {
    crossOrigin: "anonymous",
    margin: 10,
  },
  cornersSquareOptions: {
    type: "extra-rounded",
    color: "#fff",
  },
  cornersDotOptions: {
    type: "rounded",
    color: "#fff",
  },
  backgroundOptions: {
    color: "#161A17",
  },
});

export function QrCode(props: { data: string }) {
  const ref = useRef<HTMLDivElement>(null);

  // Update the useEffect for QR code initialization
  useEffect(() => {
    if (ref.current) {
      qrCode.append(ref.current);
    }

    // Cleanup function
    return () => {
      if (ref.current) {
        ref.current.innerHTML = ""; // Clear the QR code
      }
    };
  }, []);

  // Update the useEffect for QR code data
  useEffect(() => {
    if (ref.current) {
      qrCode.update({
        data: props.data,
      });
    }
  }, [props.data, ref]);

  return <div ref={ref} />;
}
