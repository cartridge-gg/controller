import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

const defaultQrCode: QRCodeStyling = new QRCodeStyling({
  width: 192,
  height: 192,
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

type QrCodeProps = {
  data: string;
  image: string;
  width?: number;
  height?: number;
};

export function QrCode(props: QrCodeProps) {
  const ref = useRef<HTMLDivElement>(null);

  // Update the useEffect for QR code initialization
  useEffect(() => {
    if (ref.current) {
      defaultQrCode.append(ref.current);
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
      defaultQrCode.update({
        data: props.data,
        image: props.image,
        width: props.width || 192,
        height: props.height || 192,
      });
    }
  }, [props.data, props.image, props.width, props.height, ref]);

  return <div ref={ref} />;
}
