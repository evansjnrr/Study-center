import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Self-hosted fonts + KaTeX styles so everything works fully offline (no CDN).
import "@fontsource-variable/plus-jakarta-sans";
import "@fontsource-variable/jetbrains-mono";
import "katex/dist/katex.min.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
