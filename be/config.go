package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	SupabaseURL       string
	SupabaseAnonKey   string
	SupabaseJWTSecret string
	DatabaseURL       string
	ServerPort        string
}

// Database connection pool
var DB *pgxpool.Pool

// LoadConfig loads configuration from environment variables
func LoadConfig() (*Config, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	config := &Config{
		SupabaseURL:       os.Getenv("SUPABASE_URL"),
		SupabaseAnonKey:   os.Getenv("SUPABASE_ANON_KEY"),
		SupabaseJWTSecret: os.Getenv("SUPABASE_JWT_SECRET"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		ServerPort:        os.Getenv("SERVER_PORT"),
	}

	// Set defaults
	if config.ServerPort == "" {
		config.ServerPort = "8080"
	}

	// Validate required fields for Supabase Auth
	if config.SupabaseURL == "" {
		return nil, fmt.Errorf("SUPABASE_URL is required")
	}

	if config.SupabaseAnonKey == "" {
		return nil, fmt.Errorf("SUPABASE_ANON_KEY is required")
	}

	if config.SupabaseJWTSecret == "" {
		return nil, fmt.Errorf("SUPABASE_JWT_SECRET is required")
	}

	// Database URL is optional (only needed if using direct DB access)
	// if config.DatabaseURL == "" {
	// 	return nil, fmt.Errorf("DATABASE_URL is required")
	// }

	return config, nil
}

// InitDatabase initializes the database connection pool
func InitDatabase(databaseURL string) error {
	var err error

	// Create connection pool config
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Create connection pool
	DB, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection
	if err := DB.Ping(context.Background()); err != nil {
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connection established")
	return nil
}

// CloseDatabase closes the database connection pool
func CloseDatabase() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}
