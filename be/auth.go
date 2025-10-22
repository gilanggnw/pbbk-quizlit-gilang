package main

import (
	"context"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// SupabaseClaims represents the JWT claims from Supabase Auth
type SupabaseClaims struct {
	Sub   string `json:"sub"`   // User ID
	Email string `json:"email"` // User email
	Role  string `json:"role"`  // User role (e.g., "authenticated")
	jwt.RegisteredClaims
}

// SupabaseJWTSecret will be loaded from config
var SupabaseJWTSecret string

// ValidateSupabaseToken validates a JWT token issued by Supabase and returns the claims
func ValidateSupabaseToken(tokenString string) (*SupabaseClaims, error) {
	// Parse token
	token, err := jwt.ParseWithClaims(tokenString, &SupabaseClaims{}, func(token *jwt.Token) (interface{}, error) {
		// Validate signing method
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(SupabaseJWTSecret), nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to parse token: %w", err)
	}

	// Extract claims
	claims, ok := token.Claims.(*SupabaseClaims)
	if !ok || !token.Valid {
		return nil, ErrInvalidToken
	}

	return claims, nil
}

// AuthMiddleware is a middleware that validates Supabase JWT tokens
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Get token from Authorization header
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			sendJSONError(w, "Authorization header required", http.StatusUnauthorized)
			return
		}

		// Extract token from "Bearer <token>"
		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			sendJSONError(w, "Invalid authorization header format", http.StatusUnauthorized)
			return
		}

		tokenString := parts[1]

		// Validate Supabase token
		claims, err := ValidateSupabaseToken(tokenString)
		if err != nil {
			sendJSONError(w, "Invalid or expired token", http.StatusUnauthorized)
			return
		}

		// Add user info to context
		ctx := context.WithValue(r.Context(), "user_id", claims.Sub)
		ctx = context.WithValue(ctx, "email", claims.Email)

		// Call next handler with updated context
		next(w, r.WithContext(ctx))
	}
} // GetUserIDFromContext extracts user ID from request context
func GetUserIDFromContext(r *http.Request) string {
	userID, ok := r.Context().Value("user_id").(string)
	if !ok {
		return ""
	}
	return userID
}

// GetEmailFromContext extracts email from request context
func GetEmailFromContext(r *http.Request) string {
	email, ok := r.Context().Value("email").(string)
	if !ok {
		return ""
	}
	return email
}
