import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "../pages/schedule-detail/App.jsx";
import "../pages/schedule-detail/styles.css";
import "../pages/schedule-detail/layout-fix.css";
import "../shared/ticket.css";

createRoot(document.getElementById("root")).render(<App />);
