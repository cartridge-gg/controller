export const remoteSvgIcon = (uri: string, size: string, fill: string) => {
  return (
    <div
      style={{
        height: size,
        width: size,
        backgroundColor: fill,
        maskImage: `url(${uri})`,
        maskSize: "100% 100%",
        WebkitMaskImage: `url(${uri})`,
        WebkitMaskSize: "100% 100%",
      }}
    />
  );
};
