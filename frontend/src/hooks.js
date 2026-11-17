import { useCallback, useEffect, useState } from "react";

// Loads data from the API and lets the page reload it after an action
// Pass { poll: milliseconds } to refresh quietly in the background while the tab is open.
export function useLoad(fn, deps = [], { poll = 0 } = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const reload = useCallback(() => {
    setLoading(true);
    return fn()
      .then((d) => {
        setData(d);
        setError("");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, deps);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    if (!poll) return undefined;
    const timer = setInterval(() => {
      if (document.hidden) return;
      fn()
        .then((d) => setData(d))
        .catch(() => {});
    }, poll);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reload, poll]);

  return { data, error, loading, reload };
}

export function fmtDateTime(d) {
  return d ? new Date(d).toLocaleString() : "";
}
