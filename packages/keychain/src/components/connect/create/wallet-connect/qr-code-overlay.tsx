import { CloneIcon } from "@cartridge/ui";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export const QRCodeOverlay = ({
  uri,
  onCancel,
}: {
  uri: string;
  onCancel: () => void;
}) => {
  const [copyLinkClicked, setCopyLinkClicked] = useState(false);

  const paddingSize = 6;
  const size = 260 - paddingSize * 2;
  const logoSize = 54;

  const logoX = (size - logoSize) / 2;
  const logoY = (size - logoSize) / 2;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (copyLinkClicked) {
      timeoutId = setTimeout(() => {
        setCopyLinkClicked(false);
      }, 3000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [copyLinkClicked, setCopyLinkClicked]);

  return (
    <div
      id="wallet-connect-overlay"
      className="w-full h-full fixed top-0 left-0 flex flex-col items-center justify-center bg-translucent-dark-200 backdrop-blur-sm z-[10001] pointer-events-auto gap-4 p-8"
    >
      <div
        id="qr-code-parent-container"
        className="w-fit h-fit rounded-[16px] p-4 bg-translucent-light-200 shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
      >
        <div id="qr-and-copy-link" className="flex flex-col gap-[1px]">
          <div className="p-[12px] bg-background-200 rounded-t-[12px]">
            <QRCodeSVG
              level="L"
              value={uri}
              size={size}
              bgColor="#00000000"
              fgColor="#ffffff"
              boostLevel={true}
              imageSettings={{
                src: "/logos/wallet-connect.svg",
                x: logoX,
                y: logoY,
                height: logoSize,
                width: logoSize,
                excavate: true,
              }}
            />
          </div>
          <button
            id="copy-link"
            className="relative w-full h-[44px] flex p-3 items-center justify-between rounded-b-[12px]
			bg-background-200 text-foreground-400 hover:text-foreground-300
			transition-colors duration-200 ease-in-out overflow-hidden"
            onClick={() => {
              navigator.clipboard.writeText(uri);
              setCopyLinkClicked(true);
            }}
          >
            <div className="flex-grow text-left">
              <div
                className={`absolute top-1/2 left-3 -translate-y-1/2 whitespace-nowrap ${
                  copyLinkClicked
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                } transition-opacity duration-200 ease-in-out`}
              >
                Copied!
              </div>
              <div
                className={`absolute top-1/2 left-3 -translate-y-1/2 whitespace-nowrap ${
                  copyLinkClicked
                    ? "opacity-0 pointer-events-none"
                    : "opacity-100"
                } transition-opacity duration-200 ease-in-out`}
              >
                Copy link
              </div>
            </div>
            <CloneIcon variant="line" size="sm" />
          </button>
        </div>
      </div>
      <button
        className="w-fit h-fit py-[10px] px-6 gap-2 rounded-[20px] text-foreground-100
		bg-translucent-light-200 hover:bg-translucent-light-200
		transition-colors duration-200 ease-in-out"
        onClick={onCancel}
      >
        Cancel
      </button>
    </div>
  );
};
