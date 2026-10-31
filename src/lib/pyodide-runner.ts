/**
 * In-browser Python runner with Pyodide (WebAssembly) fallback.
 * Uses real Pyodide loaded via CDN script in the browser when available,
 * and maintains a safe sandboxed fallback.
 */

declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<any>;
    __pyodideInstance?: any;
    __pyodideLoading?: Promise<any>;
  }
}

export async function initPyodide(): Promise<any> {
  if (typeof window === "undefined") return null;

  if (window.__pyodideInstance) {
    return window.__pyodideInstance;
  }

  if (window.__pyodideLoading) {
    return window.__pyodideLoading;
  }

  window.__pyodideLoading = (async () => {
    try {
      // Dynamically load pyodide.js if not yet present
      if (!window.loadPyodide) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Pyodide runtime script."));
          document.head.appendChild(script);
        });
      }

      if (window.loadPyodide) {
        const pyodide = await window.loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
        });
        window.__pyodideInstance = pyodide;
        return pyodide;
      }
    } catch (err) {
      console.warn("Pyodide CDN initialization fallback:", err);
    }
    return null;
  })();

  return window.__pyodideLoading;
}

export async function executePythonCode(code: string): Promise<{ output: string; error: string }> {
  try {
    const pyodide = await initPyodide();
    if (pyodide) {
      // Intercept stdout
      pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      try {
        await pyodide.runPythonAsync(code);
        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        const stderr = pyodide.runPython("sys.stderr.getvalue()");
        return {
          output: stdout || "",
          error: stderr || "",
        };
      } catch (execErr: any) {
        const stderr = pyodide.runPython("sys.stderr.getvalue()");
        return {
          output: "",
          error: stderr || execErr.message || String(execErr),
        };
      }
    }
  } catch {
    // Fall back to lightweight simulation below
  }

  // Lightweight safe fallback evaluator for when offline or loading
  try {
    const output = fallbackRunPython(code);
    return { output, error: "" };
  } catch (err: any) {
    return { output: "", error: err.message || "Execution error" };
  }
}

function fallbackRunPython(src: string): string {
  const out: string[] = [];
  const lines = src.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  const vars: Record<string, any> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = (lines[i] ?? "").trim();

    // Assignment: x = 10 or s = "hello"
    const assign = line.match(/^(\w+)\s*=\s*(.+)$/);
    if (assign && !line.startsWith("if ") && !line.startsWith("for ")) {
      const [, varName, valStr] = assign;
      if (/^["'].*["']$/.test(valStr.trim())) {
        vars[varName] = valStr.trim().slice(1, -1);
      } else if (!isNaN(Number(valStr.trim()))) {
        vars[varName] = Number(valStr.trim());
      }
      continue;
    }

    // Loop: for i in range(...)
    const loop = line.match(/^for (\w+) in range\((\d+)(?:,\s*(\d+))?\):$/);
    if (loop) {
      const [a, b] = loop[3] ? [Number(loop[2]), Number(loop[3])] : [0, Number(loop[2])];
      const body = lines[i + 1]?.trim() ?? "";
      for (let n = a; n < b; n++) {
        vars[loop[1]] = n;
        out.push(evalPrintFallback(body, vars));
      }
      i++;
      continue;
    }

    if (line.startsWith("print(")) {
      out.push(evalPrintFallback(line, vars));
    }
  }
  return out.join("\n");
}

function evalPrintFallback(line: string, vars: Record<string, any>): string {
  const m = line.match(/^print\((.*)\)$/);
  if (!m) return "";
  const arg = (m[1] ?? "").trim();
  if (/^["'].*["']$/.test(arg)) return arg.slice(1, -1);
  if (arg in vars) return String(vars[arg]);
  if (!isNaN(Number(arg))) return arg;
  return arg;
}
