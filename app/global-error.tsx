"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("GlobalError:", error?.message, error?.digest);
  }, [error]);

  return (
    <html lang="ru">
      <body style={{ fontFamily: "system-ui", padding: "2rem", maxWidth: "480px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Что-то пошло не так</h1>
        <p style={{ color: "#666", marginBottom: "1.5rem" }}>
          Не удалось загрузить страницу. Попробуйте обновить или вернуться на главную.
        </p>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.5rem 1rem",
              background: "#0d9488",
              color: "#fff",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            Повторить
          </button>
          <a
            href="/"
            style={{
              padding: "0.5rem 1rem",
              background: "#e5e7eb",
              color: "#374151",
              borderRadius: "0.5rem",
              textDecoration: "none",
            }}
          >
            На главную
          </a>
        </div>
      </body>
    </html>
  );
}
