import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import "@tauri-apps/api/core";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
