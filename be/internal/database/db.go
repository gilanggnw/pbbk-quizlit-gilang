package database

import (
	"context"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

var DB *pgxpool.Pool

// Connect initializes the database connection pool
func Connect(databaseURL string) error {
	if databaseURL == "" {
		return fmt.Errorf("database URL is empty")
	}

	// Close existing connection if any
	if DB != nil {
		DB.Close()
		log.Println("Closed existing database connection")
	}

	var err error

	// Create connection pool config
	config, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return fmt.Errorf("failed to parse database URL: %w", err)
	}

	// Disable automatic prepared statement caching to avoid conflicts
	config.ConnConfig.DefaultQueryExecMode = pgx.QueryExecModeSimpleProtocol

	// Set connection pool settings
	config.MaxConns = 10
	config.MinConns = 2

	// Create connection pool
	DB, err = pgxpool.NewWithConfig(context.Background(), config)
	if err != nil {
		return fmt.Errorf("failed to create connection pool: %w", err)
	}

	// Test connection
	if err := DB.Ping(context.Background()); err != nil {
		DB.Close()
		return fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Database connection established")
	return nil
}

// Close closes the database connection pool
func Close() {
	if DB != nil {
		DB.Close()
		log.Println("Database connection closed")
	}
}

// GetDB returns the database connection pool
func GetDB() *pgxpool.Pool {
	return DB
}
