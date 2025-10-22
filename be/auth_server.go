package main

import (
	"log"
	"net/http"
	"time"
)

// AuthServer handles HTTP requests for authentication
type AuthServer struct {
	authHandler *AuthHandler
}

// NewAuthServer creates a new authentication server instance
func NewAuthServer() *AuthServer {
	return &AuthServer{
		authHandler: NewAuthHandler(),
	}
}

// Start starts the authentication HTTP server
func (s *AuthServer) StartAuthServer(port string) error {
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/api/auth/health", enableCORS(handleAuthHealth))

	// Protected routes (require Supabase JWT token)
	mux.HandleFunc("/api/auth/profile", enableCORS(AuthMiddleware(s.authHandler.GetProfile)))

	// You can add more protected endpoints here that use the authenticated user info
	// Example: mux.HandleFunc("/api/auth/settings", enableCORS(AuthMiddleware(s.authHandler.UpdateSettings)))

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Printf("🚀 Auth API Server starting on http://localhost:%s", port)
	log.Println("\n📝 Available endpoints:")
	log.Println("  GET  /api/auth/profile   - Get user profile (protected)")
	log.Println("  GET  /api/auth/health    - Health check")
	log.Println("\n✨ Using Supabase Auth for user management")
	log.Println("   Register/Login handled by Supabase client SDK in frontend")

	return server.ListenAndServe()
}

// enableCORS adds CORS headers to allow frontend access
func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// handleAuthHealth returns the health status of the auth API
func handleAuthHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]interface{}{
		"status":  "healthy",
		"message": "Auth API is running",
		"time":    time.Now().Format(time.RFC3339),
	}

	sendJSON(w, response, http.StatusOK)
}
