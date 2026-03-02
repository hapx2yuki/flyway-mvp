"use client";

import { useState, useEffect, useCallback } from "react";

interface UseFetchResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  mutate: () => void;
}

export function useFetch<T>(url: string | null): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const mutate = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  useEffect(() => {
    if (!url) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`API エラー: ${res.status}`);
        return res.json();
      })
      .then((json) => {
        setData(json);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setError(err.message || "データの取得に失敗しました");
        setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [url, refreshKey]);

  return { data, error, isLoading, mutate };
}
