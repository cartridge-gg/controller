import { Flex, Spinner } from "@chakra-ui/react";
import Script from "next/script";
import { useState } from "react";
export const MediaViewer = (props) => {
  const ext = props.src?.split(".").pop();
  const { height, width, src } = props;
  const [isLoading, setIsLoading] = useState(true);
  return (
    <>
      {ext === "glb" && (
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
              <model-viewer
                loading="eager"
                camera-controls
                src={src}
                style={{ height: height, width: width }}
              >
                <div className="progress-bar hide" slot="progress-bar">
                  <div className="update-bar"></div>
                </div>
              </model-viewer>
            )}
          </Flex>
        </>
      )}
      {(ext === "jpg" || ext === "png" || ext === "gif") && (
        <img style={{ height: height, width: width }} src={src} />
      )}
    </>
  );
};
