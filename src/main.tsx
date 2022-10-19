import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./normalize.css";
import "./skeleton.css";
import "./style.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
