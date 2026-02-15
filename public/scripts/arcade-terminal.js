if (typeof window !== "undefined") {
  if (window.__arcadeTerminalInitialized) {
    return;
  }
  window.__arcadeTerminalInitialized = true;
  const XTERM_SCRIPT_URL = "https://cdn.jsdelivr.net/npm/xterm@5.3.0/lib/xterm.js";
  const XTERM_CSS_URL = "https://cdn.jsdelivr.net/npm/xterm@5.3.0/css/xterm.css";

  const ensureCss = () => {
    if (document.querySelector(`link[href="${XTERM_CSS_URL}"]`)) {
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = XTERM_CSS_URL;
    document.head.appendChild(link);
  };

  const loadXterm = (() => {
    let loader = null;
    return () => {
      if (loader) {
        return loader;
      }
      loader = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-arcade-xterm="${XTERM_SCRIPT_URL}"]`);
        if (existing) {
          if (window.Terminal) {
            resolve(window.Terminal);
            return;
          }
          existing.addEventListener("load", () => resolve(window.Terminal), { once: true });
          existing.addEventListener("error", reject, { once: true });
          return;
        }
        const script = document.createElement("script");
        script.dataset.arcadeXterm = XTERM_SCRIPT_URL;
        script.src = XTERM_SCRIPT_URL;
        script.defer = true;
        script.onload = () => {
          if (window.Terminal) {
            resolve(window.Terminal);
          } else {
            reject(new Error("xterm.js did not expose Terminal"));
          }
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
      return loader;
    };
  })();

  const showError = (message) => {
    const existing = document.getElementById("arcade-terminal-error");
    if (existing) {
      existing.textContent = message;
      return;
    }
    const alert = document.createElement("div");
    alert.id = "arcade-terminal-error";
    alert.textContent = message;
    alert.style.cssText =
      "position:fixed;top:6rem;left:50%;transform:translateX(-50%);background:#250000;color:#ff8c8c;padding:0.4rem 1rem;border:1px solid #ff4d4d;border-radius:0.5rem;font-family:VCR,monospace;z-index:10000;";
    document.body.appendChild(alert);
  };

  const setupTerminals = async () => {
    ensureCss();
    const containers = document.querySelectorAll("[data-terminal-config]");
    const Terminal = await loadXterm().catch((error) => {
      const message = `Failed to load xterm.js: ${error?.message ?? error}`;
      console.error(message);
      showError(message);
      return null;
    });
    if (!Terminal) return;

    containers.forEach((container) => {
      (async () => {
        const configText = container.getAttribute("data-terminal-config");
        if (!configText) return;
        let config;
        try {
          config = JSON.parse(configText);
        } catch (error) {
          console.error("Unable to parse terminal config", error);
          return;
        }

        const term = new Terminal({
          cursorBlink: true,
          fontFamily: "VCR, monospace",
          theme: { background: "#010101", foreground: "#c8ffc8" },
          wordWrap: true,
        });
        term.open(container);
        term.focus();

        const queue = [];
        const enqueue = (value) => {
          for (let i = 0; i < value.length; i += 1) {
            queue.push(value.charCodeAt(i));
          }
        };

        term.onKey(({ key, domEvent }) => {
          if (domEvent.key === "Enter") {
            enqueue("\n");
            term.write("\r\n");
            return;
          }
          if (domEvent.key === "Backspace") {
            enqueue("\b");
            term.write("\b \b");
            return;
          }
          enqueue(key);
          term.write(key);
        });

        const moduleConfig = {
          wasmBinaryFile: config.wasmPath,
          locateFile: (_, scriptDirectory) =>
            config.wasmPath.startsWith("http")
              ? config.wasmPath
              : `${new URL(config.wasmPath, scriptDirectory).href}`,
          print: (text) => term.write(`${text}\r\n`),
          printErr: (text) => term.write(`\x1b[31m${text}\x1b[0m\r\n`),
          stdin: () => (queue.length ? queue.shift() ?? -1 : -1),
          noExitRuntime: true,
          arguments: [],
        };

        let factoryPromise = null;
        const getFactory = () => {
          if (factoryPromise) {
            return factoryPromise;
          }
          factoryPromise = import(config.scriptPath).then((mod) => {
            const maybeFactory =
              (config.factoryName && mod[config.factoryName]) ||
              mod.default ||
              mod.createCndndModule ||
              mod.createModule ||
              mod.Module;
            if (typeof maybeFactory !== "function") {
              throw new Error("Could not resolve a factory function from the C&D&D module");
            }
            return maybeFactory;
          });
          return factoryPromise;
        };

        const runModule = () => {
          getFactory()
            .then((factory) => factory({ ...moduleConfig }))
            .then((instance) => {
              if (!instance) {
                return;
              }
              const shouldCallMain =
                typeof instance.callMain === "function" && !instance.calledRun;
              if (shouldCallMain) {
                instance.callMain([]);
              }
            })
            .catch((error) => {
              const message = `Failed to load C&D&D: ${error?.message ?? error}`;
              term.write(`\x1b[31m${message}\x1b[0m\r\n`);
              console.error(message);
              showError(message);
            });
        };

        runModule();

        const resetButton = container.parentElement?.querySelector("[data-terminal-reset]");
        resetButton?.addEventListener("click", () => {
          factoryPromise = null;
          term.reset();
          term.write("\x1b[33mReloading...\x1b[0m\r\n");
          runModule();
        });
      })();
    });
  };

  if (document.readyState === "complete" || document.readyState === "interactive") {
    setupTerminals();
  } else {
    window.addEventListener("DOMContentLoaded", setupTerminals);
  }
}
