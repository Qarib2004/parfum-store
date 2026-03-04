"use client";

import { useState, useRef } from "react";
import styles from "./ImageSearchWidget.module.scss";

interface SearchResult {
  id?: string;
  name?: string;
  title?: string;
  score?: number;
  imageUrl?: string;
  price?: number;
  [key: string]: any;
}

export function ImageSearchWidget() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResults([]);
    setError(null);
    setSearched(false);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const handleSearch = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("http://localhost:8000/search/upload?top_k=1", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResults(data.results ?? []);
      setSearched(true);
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPreview(null);
    setFile(null);
    setResults([]);
    setError(null);
    setSearched(false);
  };

  const formatPrice = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

  return (
    <div className={styles.wrapper}>
      {open && (
        <div className={styles.panel}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <span className={styles.headerIcon}>✦</span>
              <div>
                <p className={styles.headerTitle}>Visual Search</p>
                <p className={styles.headerSub}>Find by photo</p>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className={styles.body}>
            {!preview ? (
              <div
                className={styles.dropzone}
                onClick={() => inputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <span className={styles.dropIcon}>📷</span>
                <p className={styles.dropText}>Drop an image here</p>
                <p className={styles.dropSub}>or click to browse</p>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFile(f);
                  }}
                />
              </div>
            ) : (
              <div className={styles.previewWrap}>
                <div className={styles.previewRow}>
                  <img src={preview} alt="Preview" className={styles.previewImg} />
                  <div className={styles.previewActions}>
                    <p className={styles.previewName}>{file?.name}</p>
                    <button className={styles.resetBtn} onClick={handleReset}>
                      Change image
                    </button>
                  </div>
                </div>

                {!searched && (
                  <button
                    className={styles.searchBtn}
                    onClick={handleSearch}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className={styles.spinner} />
                        Searching...
                      </>
                    ) : (
                      <>✦ Find similar products</>
                    )}
                  </button>
                )}

                {error && (
                  <div className={styles.errorBox}>
                    <p>{error}</p>
                    <button onClick={() => setError(null)}>✕</button>
                  </div>
                )}

                {searched && results.length === 0 && !error && (
                  <p className={styles.noResults}>No matches found</p>
                )}

                {results.length > 0 && (
                  <div className={styles.results}>
                    <p className={styles.resultsLabel}>
                      {results.length} match{results.length !== 1 ? "es" : ""} found
                    </p>
                    {results.map((r, i) => (
                      <div key={r.id ?? i} className={styles.resultItem}>
                        <div className={styles.resultImage}>
                          {r.imageUrl ? (
                            <img src={r.imageUrl} alt={r.name ?? r.title ?? ""} />
                          ) : (
                            <span>✦</span>
                          )}
                        </div>
                        <div className={styles.resultInfo}>
                          <p className={styles.resultName}>
                            {r.name ?? r.title ?? `Result ${i + 1}`}
                          </p>
                          {r.score != null && (
                            <p className={styles.resultScore}>
                              {Math.round(r.score * 100)}% match
                            </p>
                          )}
                          {r.price != null && (
                            <p className={styles.resultPrice}>{formatPrice(r.price)}</p>
                          )}
                        </div>
                        {r.id && (
                          <a
                            href={`/dashboard/products/${r.slug ?? r.id}`}
                            className={styles.resultLink}
                          >
                            →
                          </a>
                        )}
                      </div>
                    ))}

                    <button className={styles.searchAgainBtn} onClick={handleReset}>
                      Search another image
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <button
        className={`${styles.fab} ${open ? styles.fabOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-label="Visual search"
      >
        {open ? (
          <span className={styles.fabIconClose}>✕</span>
        ) : (
          <span className={styles.fabIcon}>🔍</span>
        )}
      </button>
    </div>
  );
}