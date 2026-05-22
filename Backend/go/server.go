package main

import (
	"context"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"
)

type loggingResponseWriter struct {
	http.ResponseWriter
	status int
	size   int
}

func (w *loggingResponseWriter) WriteHeader(status int) {
	w.status = status
	w.ResponseWriter.WriteHeader(status)
}

func (w *loggingResponseWriter) Write(b []byte) (int, error) {
	if w.status == 0 {
		w.status = http.StatusOK
	}
	n, err := w.ResponseWriter.Write(b)
	w.size += n
	return n, err
}

func loggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		lw := &loggingResponseWriter{ResponseWriter: w}
		next.ServeHTTP(lw, r)
		if lw.status == 0 {
			lw.status = http.StatusOK
		}
		log.Printf("%s %s %s %d %dB %s",
			r.RemoteAddr, r.Method, r.URL.Path, lw.status, lw.size, time.Since(start))
	})
}

func main() {
	// Flags and env
	var (
		port      = flag.String("port", getEnv("PORT", "8080"), "server port")
		publicDir = flag.String("public", "./public", "directory to serve static files from")
	)
	flag.Parse()

	absPublic, err := filepath.Abs(*publicDir)
	if err != nil {
		log.Fatalf("failed to resolve public dir: %v", err)
	}

	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})

	// Static files: serve files under /static/
	fs := http.FileServer(http.Dir(absPublic))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

	// Root: try to serve index.html for SPA or fallback to 404
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// If requesting "/" or a file that doesn't exist, serve index.html (SPA fallback)
		p := filepath.Clean(r.URL.Path)
		if p == "/" {
			http.ServeFile(w, r, filepath.Join(absPublic, "index.html"))
			return
		}
		// Try to serve the file from public dir
		fp := filepath.Join(absPublic, p)
		if _, err := os.Stat(fp); err == nil {
			http.ServeFile(w, r, fp)
			return
		}
		// Not found: fallback to index.html for client routing
		http.ServeFile(w, r, filepath.Join(absPublic, "index.html"))
	})

	handler := loggingMiddleware(mux)

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", *port),
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Start server
	done := make(chan struct{})
	go func() {
		log.Printf("starting server on %s (serving %s)", srv.Addr, absPublic)
		// If TLS env vars present, run HTTPS
		cert := os.Getenv("TLS_CERT")
		key := os.Getenv("TLS_KEY")
		var err error
		if cert != "" && key != "" {
			err = srv.ListenAndServeTLS(cert, key)
		} else {
			err = srv.ListenAndServe()
		}
		if err != nil && err != http.ErrServerClosed {
			log.Fatalf("server error: %v", err)
		}
		close(done)
	}()

	// Graceful shutdown on SIGINT/SIGTERM
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("shutdown signal received, shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Printf("graceful shutdown failed: %v", err)
		if err := srv.Close(); err != nil {
			log.Printf("server close failed: %v", err)
		}
	}

	<-done
	log.Println("server stopped")
}

func getEnv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
