import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";
import { SessionProvider } from "./context/SessionContext.jsx";

const rootElement = document.getElementById("root");
if (rootElement) {
    createRoot(rootElement).render(
        <StrictMode>
            <SessionProvider>
                <App />
            </SessionProvider>
        </StrictMode>
    );
}
