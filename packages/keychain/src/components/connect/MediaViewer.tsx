import { Flex, Spinner } from "@chakra-ui/react";
import Image, { ImageProps } from "next/image";
import Script from "next/script";
import { useState } from "react";

export function MediaViewer({
  height,
  width,
  src,
  alt = "Media viewer",
}: {
  src: string;
} & Pick<ImageProps, "width" | "height" | "alt">) {
  const ext = src?.split(".").pop();
  const [isLoading, setIsLoading] = useState(true);

  if (ext === "glb") {
    return (
      <>
        <Script
          async
          strategy="afterInteractive"
          type="module"
          src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js"
          onLoad={() => setIsLoading(false)}
        />
        <Flex height={height} width={width} align="center" justify="center">
          {isLoading ? (
            <Spinner />
          ) : (
            // @ts-expect-error model-viewer tag
            <model-viewer
              loading="eager"
              camera-controls
              src={src}
              style={{ height: height, width: width }}
            >
              <div className="progress-bar hide" slot="progress-bar">
                <div className="update-bar"></div>
              </div>
              {/* @ts-expect-error model-viewer tag */}
            </model-viewer>
          )}
        </Flex>
      </>
    );
  }

  if (ext === "jpg" || ext === "png" || ext === "gif") {
    return <Image src={src} alt={alt} width={width} height={height} />;
  }

  return null;
}
