import { useEffect, useState } from "react";

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

interface EmbedProps extends React.EmbedHTMLAttributes<HTMLEmbedElement> {
  src: string;
}

type DynamicAssetRendererProps = ImgProps | EmbedProps;

const DynamicAssetRenderer = ({ src, ...props }: DynamicAssetRendererProps) => {
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

  if (tagType === "embed") {
    return <embed type="image/svg+xml" {...(props as EmbedProps)} src={src} />;
  } else {
    return <img alt="Asset Image" {...(props as ImgProps)} src={src} />;
  }
};

export default DynamicAssetRenderer;
