import { useRef, useCallback } from "react";

/**
 * Hook to throttle any function (typically network actions)
 * @param {Function} callback - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Throttled function
 * 
 * @example
 * const throttledSearch = useThrottle(searchAction, 500);
 * // Call throttledSearch(...args) - will be throttled to once every 500ms
 */
function useThrottle(callback, delay) {
    const lastCall = useRef(0);
    const timeout = useRef(null);

    const throttledFunction = useCallback((...args) => {
        const now = Date.now();
        const timeSinceLastCall = now - lastCall.current;

        // Clear any pending timeout
        if (timeout.current) {
            clearTimeout(timeout.current);
        }

        if (timeSinceLastCall >= delay) {
            lastCall.current = now;
            // Wrap in Promise.resolve for consistent return type
            return Promise.resolve(callback(...args));
        } else {
            // Schedule the call for later
            return new Promise((resolve, reject) => {
                timeout.current = setTimeout(() => {
                    lastCall.current = Date.now();
                    // Handle both sync and async callbacks, and rejections
                    Promise.resolve(callback(...args))
                        .then(resolve)
                        .catch(reject);
                }, delay - timeSinceLastCall);
            });
        }
    }, [callback, delay]);

    return throttledFunction;
}

export { useThrottle };
