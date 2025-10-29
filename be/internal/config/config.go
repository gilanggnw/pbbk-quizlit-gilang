package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port              string
	OpenAIKey         string
	CorsOrigin        string
	DatabaseURL       string
	SupabaseURL       string
	SupabaseAnonKey   string
	SupabaseJWTSecret string
}

func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	return &Config{
		Port:              getEnv("PORT", "8080"),
		OpenAIKey:         getEnv("OPENAI_API_KEY", ""),
		CorsOrigin:        getEnv("CORS_ORIGIN", "http://localhost:3000"),
		DatabaseURL:       getEnv("DATABASE_URL", ""),
		SupabaseURL:       getEnv("SUPABASE_URL", ""),
		SupabaseAnonKey:   getEnv("SUPABASE_ANON_KEY", ""),
		SupabaseJWTSecret: getEnv("SUPABASE_JWT_SECRET", ""),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
