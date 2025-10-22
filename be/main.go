package main

import (
	"log"
	"pbkk-quizlit-backend/internal/api"
	"pbkk-quizlit-backend/internal/config"

	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize configuration
	cfg := config.Load()

	// Initialize and start the server
	server := api.NewServer(cfg)
	
	log.Printf("Starting server on port %s", cfg.Port)
	if err := server.Start(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}