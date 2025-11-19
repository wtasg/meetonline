function debounce(fn, delay = 400) {
  let timer = null;
  let pendingReject = null;

  return function (...args) {
    if (pendingReject) {
      pendingReject(new Error("Previous debounced cancelled"));
      pendingReject = null;
    }

    clearTimeout(timer);

    return new Promise((resolve, reject) => {
      pendingReject = reject;

      timer = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (err) {
          reject(err);
        } finally {
          timer = null;
          pendingReject = null;
        }
      }, delay);
    });
  };
}

export { debounce };
