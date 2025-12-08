import { useSyncExternalStore } from "react";
import { location } from "../session.js";

function useRoute() {
    const subscribe = (callback) => {
        document.addEventListener("route_changed", callback);
        return () => document.removeEventListener("route_changed", callback);
    };
    const getSnapshot = () => {
        return location.retrieve("path") || "/";
    };
    return useSyncExternalStore(subscribe, getSnapshot);
}

export { useRoute };
