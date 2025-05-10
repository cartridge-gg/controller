import { useEffect, useState } from "react";

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  enableEmbedStylings?: boolean;
}

interface EmbedProps extends React.EmbedHTMLAttributes<HTMLEmbedElement> {
  src: string;
  enableEmbedStylings?: boolean;
}

type DynamicAssetRendererProps = ImgProps | EmbedProps;

const DynamicAssetRenderer = ({
  src,
  enableEmbedStylings = true,
  ...props
}: DynamicAssetRendererProps) => {
  const [tagType, setTagType] = useState<"img" | "embed">("img");

  useEffect(() => {
    function getTagType(assetPath: string) {
      if (assetPath.startsWith("data:image")) {
        return "embed";
      } else if (
        assetPath.startsWith("http") ||
        assetPath.startsWith("https")
      ) {
        return "img"; // External URL
      } else {
        return "img"; // Unknown format
      }
    }

    setTagType(getTagType(src));
  }, [src]);

  // omit classnames and styles if enableEmbedStylings is false

  if (tagType === "embed" && !enableEmbedStylings) {
    // Omit className and style because we don't want to apply any styles to the embed
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { className, style, ...rest } = props;
    return (
      <embed
        className="pointer-events-none"
        type="image/svg+xml"
        {...(rest as EmbedProps)}
        src={src}
      />
    );
  } else if (tagType === "embed") {
    return (
      <embed
        className="pointer-events-none"
        type="image/svg+xml"
        {...(props as EmbedProps)}
        src={src}
      />
    );
  } else {
    return (
      <img
        className="pointer-events-none"
        alt="Asset Image"
        {...(props as ImgProps)}
        src={src}
      />
    );
  }
};

export default DynamicAssetRenderer;
