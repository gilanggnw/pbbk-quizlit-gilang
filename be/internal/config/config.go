package config

import (
	"os"
)

type Config struct {
	Port       string
	OpenAIKey  string
	CorsOrigin string
}

func Load() *Config {
	return &Config{
		Port:       getEnv("PORT", "8080"),
		OpenAIKey:  getEnv("OPENAI_API_KEY", ""),
		CorsOrigin: getEnv("CORS_ORIGIN", "http://localhost:3000"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}