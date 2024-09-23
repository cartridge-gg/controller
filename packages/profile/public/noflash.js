(function () {
  const storageKey = "vite-ui-colorScheme";
  const classNameDark = "dark";
  const params = new URL(document.location).searchParams;
  const colorScheme =
    params.get("colorMode") ?? localStorage.getItem(storageKey) ?? "system";
  const html = document.getElementsByTagName("html")[0];

  switch (colorScheme) {
    case "light":
      break;
    case "dark":
      html.classList.add(classNameDark);
      break;
    case "system":
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        html.classList.add(classNameDark);
      }
      break;
    default:
      break;
  }

  localStorage.setItem(storageKey, colorScheme);
})();
