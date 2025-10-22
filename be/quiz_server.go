package main

import (
	"log"
	"net/http"
	"time"
)

// runQuizServer starts the quiz API server
func runQuizServer(port string) {
	log.Println("Starting Quiz API Server...")

	// Load configuration
	config, err := LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Set Supabase JWT secret for token validation
	SupabaseJWTSecret = config.SupabaseJWTSecret

	// Initialize database connection
	if config.DatabaseURL != "" {
		if err := InitDatabase(config.DatabaseURL); err != nil {
			log.Fatalf("Failed to initialize database: %v", err)
		}
		defer CloseDatabase()
		log.Printf("✅ Database connection established")
	}

	log.Printf("✅ Supabase configuration loaded")
	log.Printf("   URL: %s", config.SupabaseURL)

	// Create HTTP server mux
	mux := http.NewServeMux()

	// Public routes
	mux.HandleFunc("/api/quiz/list", enableCORS(ListQuizzes))
	mux.HandleFunc("/api/quiz/take/", enableCORS(GetQuizForTaking))

	// Protected routes (require authentication)
	mux.HandleFunc("/api/quiz/create", enableCORS(AuthMiddleware(CreateQuiz)))
	mux.HandleFunc("/api/quiz/submit", enableCORS(AuthMiddleware(SubmitQuizAttempt)))
	mux.HandleFunc("/api/quiz/attempt/", enableCORS(AuthMiddleware(GetQuizAttempt)))
	mux.HandleFunc("/api/quiz/attempts", enableCORS(AuthMiddleware(ListUserAttempts)))

	// Start server
	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Printf("🚀 Quiz server is running on http://localhost%s", server.Addr)
	log.Println("\nAvailable Quiz Endpoints:")
	log.Println("  Public:")
	log.Println("    GET  /api/quiz/list                - List all quizzes")
	log.Println("    GET  /api/quiz/take/:id            - Get quiz for taking")
	log.Println("  Protected (requires Authorization header):")
	log.Println("    POST /api/quiz/create              - Create a new quiz")
	log.Println("    POST /api/quiz/submit              - Submit quiz attempt")
	log.Println("    GET  /api/quiz/attempt/:id         - Get attempt details")
	log.Println("    GET  /api/quiz/attempts            - List user's attempts")
	log.Println()

	if err := server.ListenAndServe(); err != nil {
		log.Fatalf("Failed to start quiz server: %v", err)
	}
}
