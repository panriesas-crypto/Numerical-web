import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MathJaxContext } from "better-react-mathjax";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App.jsx";
import './style.css';
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <MathJaxContext config={{ tex: { inlineMath: [["\\(", "\\)"]] } }}>
        <Routes>
          <Route path="*" element={<App />} />
        </Routes>
      </MathJaxContext>
    </BrowserRouter>
  </React.StrictMode>,
);
