import Script from "next/script";
export const MediaViewer = (props) => {
  const ext = props.src?.split(".").pop();
  const { height, width, src } = props;
  return (
    <>
      {ext === "glb" && (
        <>
          <Script
            async
            strategy="afterInteractive"
            type="module"
            src="https://unpkg.com/@google/model-viewer@^2.1.1/dist/model-viewer.min.js"
          />
          <model-viewer
            camera-controls
            src={src}
            style={{ height: height, width: width }}
          >
            <div class="progress-bar hide" slot="progress-bar">
              <div class="update-bar"></div>
            </div>
          </model-viewer>
        </>
      )}
      {(ext === "jpg" || ext === "png" || ext === "gif") && (
        <img style={{ height: height, width: width }} src={src} />
      )}
    </>
  );
};
