import { useCallback } from "react";
import { location } from "../session";

function navigateTo(path) {
    location.store("path", path);
    document.dispatchEvent(new Event("route_changed"));
    // cosmetic/visual only change in url
    window.history.pushState({}, "", path);
}

function useNavigate() {
    return useCallback((path) => {
        navigateTo(path);
    }, []);
}


export { useNavigate, navigateTo };
