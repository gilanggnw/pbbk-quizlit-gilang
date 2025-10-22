package main

import (
	"encoding/json"
	"net/http"
)

// AuthHandler handles authentication-related HTTP requests
type AuthHandler struct{}

// NewAuthHandler creates a new authentication handler
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// GetProfile handles getting user profile (protected route)
// This extracts user info from the Supabase JWT token
func (h *AuthHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get user info from context (set by AuthMiddleware)
	userID := GetUserIDFromContext(r)
	email := GetEmailFromContext(r)

	if userID == "" {
		sendJSONError(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Return user info from the Supabase JWT token
	// No database lookup needed - all info is in the token
	response := map[string]interface{}{
		"success": true,
		"user": map[string]interface{}{
			"id":    userID,
			"email": email,
		},
	}

	sendJSON(w, response, http.StatusOK)
}

// Helper functions

// sendJSON sends a JSON response
func sendJSON(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// sendJSONError sends a JSON error response
func sendJSONError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": false,
		"error":   message,
	})
}
