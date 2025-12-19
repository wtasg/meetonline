import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useThrottle } from "./useThrottle.js";

describe("useThrottle", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("calls the callback immediately on first call", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottle(callback, 500));

        act(() => {
            result.current("test");
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("test");
    });

    it("throttles subsequent calls within the delay period", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottle(callback, 500));

        act(() => {
            result.current("call1");
            result.current("call2");
            result.current("call3");
        });

        // Only first call should execute immediately
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("call1");

        // Advance time by 500ms
        act(() => {
            vi.advanceTimersByTime(500);
        });

        // Last call should execute after delay
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith("call3");
    });

    it("allows calls after the throttle delay has passed", () => {
        const callback = vi.fn();
        const { result } = renderHook(() => useThrottle(callback, 500));

        act(() => {
            result.current("call1");
        });

        expect(callback).toHaveBeenCalledTimes(1);

        // Advance time beyond throttle delay
        act(() => {
            vi.advanceTimersByTime(600);
        });

        act(() => {
            result.current("call2");
        });

        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith("call2");
    });

    it("handles async callbacks", async () => {
        const callback = vi.fn().mockResolvedValue("result");
        const { result } = renderHook(() => useThrottle(callback, 500));

        let promise;
        act(() => {
            promise = result.current("test");
        });

        const value = await promise;
        expect(value).toBe("result");
        expect(callback).toHaveBeenCalledWith("test");
    });

    it("updates when callback changes", () => {
        const callback1 = vi.fn();
        const callback2 = vi.fn();
        const { result, rerender } = renderHook(
            ({ cb }) => useThrottle(cb, 500),
            { initialProps: { cb: callback1 } }
        );

        act(() => {
            result.current("test1");
        });

        expect(callback1).toHaveBeenCalledTimes(1);

        // Change callback
        rerender({ cb: callback2 });

        act(() => {
            vi.advanceTimersByTime(600);
        });

        act(() => {
            result.current("test2");
        });

        expect(callback2).toHaveBeenCalledTimes(1);
        expect(callback2).toHaveBeenCalledWith("test2");
    });

    it("handles errors in immediate execution", async () => {
        const error = new Error("Test error");
        const callback = vi.fn().mockRejectedValue(error);
        const { result } = renderHook(() => useThrottle(callback, 500));

        let promise;
        act(() => {
            promise = result.current("test");
        });

        await expect(promise).rejects.toThrow("Test error");
    });

    it("handles errors in delayed execution", async () => {
        const error = new Error("Delayed error");
        const callback = vi.fn().mockRejectedValue(error);
        const { result } = renderHook(() => useThrottle(callback, 500));

        // First call executes immediately
        act(() => {
            result.current("call1");
        });

        // Second call should be delayed
        let promise;
        act(() => {
            promise = result.current("call2");
        });

        // Advance time to trigger delayed call
        act(() => {
            vi.advanceTimersByTime(500);
        });

        await expect(promise).rejects.toThrow("Delayed error");
    });
});
