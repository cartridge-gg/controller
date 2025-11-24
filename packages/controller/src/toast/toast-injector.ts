/**
 * Injects the Toaster component from @cartridge/ui into the parent page.
 * This allows toast notifications to be displayed on the parent page when
 * triggered from the iframe.
 */
export async function injectToaster() {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  // Check if Toaster is already injected
  if (document.getElementById("controller-toaster-root")) {
    console.log("Toaster already initialized");
    return;
  }

  try {
    // Load React and ReactDOM if not already available
    if (!(window as any).React || !(window as any).ReactDOM) {
      await loadScript(
        "https://unpkg.com/react@18/umd/react.production.min.js",
        "React",
      );
      await loadScript(
        "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
        "ReactDOM",
      );
    }

    await loadScript(
      "https://r2.quddus.my/toaster.umd.cjs",
      "CartridgeToaster",
    );

    // 4. Create a root div for the Toaster
    const toasterRoot = document.createElement("div");
    toasterRoot.id = "controller-toaster-root";
    toasterRoot.style.zIndex = "10001";
    toasterRoot.style.position = "fixed";
    toasterRoot.style.pointerEvents = "none";
    document.body.appendChild(toasterRoot);

    // 5. Inject custom styles
    const styleId = "controller-toast-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        #controller-toaster-root [role="region"] {
          z-index: 10001 !important;
        }
        #controller-toaster-root [role="region"] > ol {
          z-index: 10001 !important;
        }
        #controller-toaster-root [data-sonner-toast] {
          z-index: 10001 !important;
        }
        #controller-toaster-root * {
          pointer-events: auto;
        }
      `;
      document.head.appendChild(style);
    }

    // 6. Render the Toaster component
    const { Toaster } = (window as any).CartridgeToaster;
    const root = (window as any).ReactDOM.createRoot(toasterRoot);
    root.render((window as any).React.createElement(Toaster));

    console.log("Toaster initialized successfully");
  } catch (error) {
    console.error("Failed to inject Toaster:", error);
  }
}

/**
 * Load a script and wait for it to be available
 */
function loadScript(src: string, globalName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if ((window as any)[globalName]) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      // Wait a bit for the global to be available
      const checkGlobal = () => {
        if ((window as any)[globalName]) {
          resolve();
        } else {
          setTimeout(checkGlobal, 50);
        }
      };
      checkGlobal();
    };
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
}
