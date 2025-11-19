import { describe, it, expect, vi, beforeEach } from "vitest";
import { debounce } from "./debounce.js";

describe("debounce() (Beginner Friendly Tests)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("runs only the last call after the delay", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 500);

    debounced("A").catch(() => {});
    debounced("B").catch(() => {});
    debounced("C").catch(() => {});

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(500);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("C");
  });

  it("resets timer every time run() is called", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 300);

    debounced("first").catch(() => {});
    vi.advanceTimersByTime(200);

    debounced("second").catch(() => {});
    vi.advanceTimersByTime(200);

    debounced("third").catch(() => {});
    vi.advanceTimersByTime(299);

    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);

    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("third");
  });

  it("passes all arguments correctly to the function", () => {
    const fn = vi.fn();
    const debounced = debounce(fn, 200);

    debounced("test", 25, "swarg").catch(() => {});

    vi.advanceTimersByTime(200);

    expect(fn).toHaveBeenCalledWith("test", 25, "swarg");
  });
});
