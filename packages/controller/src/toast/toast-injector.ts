/**
 * Injects the Toaster component from @cartridge/ui into the parent page.
 * This allows toast notifications to be displayed on the parent page when
 * triggered from the iframe.
 */
let loading: Promise<void> | null = null;

export async function injectToaster() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  if (document.getElementById("controller-toaster-root")) {
    console.log("Toaster already initialized");
    return;
  }

  if (loading) return loading;

  loading = (async () => {
    try {
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

      const toasterRoot = Object.assign(document.createElement("div"), {
        id: "controller-toaster-root",
      });

      document.body.appendChild(toasterRoot);

      injectToastStyles();

      const { Toaster } = (window as any).CartridgeToaster;
      const root = (window as any).ReactDOM.createRoot(toasterRoot);
      root.render((window as any).React.createElement(Toaster));

      console.log("✅ Toaster initialized successfully");
    } catch (err) {
      console.error("❌ Failed to inject Toaster:", err);
      throw err;
    } finally {
      loading = null;
    }
  })();

  return loading;
}

function injectToastStyles() {
  const styleId = "controller-toast-styles";
  if (document.getElementById(styleId)) return;

  const style = document.createElement("style");
  style.id = styleId;
  style.textContent = `
    #controller-toaster-root {
      z-index: 10001;
      position: fixed;
      pointer-events: none;
    }
    @media (min-width: 640px) {
      #controller-toaster-root {
        right: 0;
        bottom: 0;
        top: auto;
        flex-direction: column;
      }
    }
    @media (min-width: 768px) {
      #controller-toaster-root {
        align-items: flex-end;
        max-width: 420px;
      }
    }
     #controller-toaster-root [role="region"],
     #controller-toaster-root [role="region"] > ol,
     #controller-toaster-root [data-sonner-toast] {
       z-index: 10001 !important;
     }
     #controller-toaster-root * {
       pointer-events: auto;
     }
   `;
  document.head.appendChild(style);
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
