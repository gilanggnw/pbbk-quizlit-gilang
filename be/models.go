package main

// Note: With Supabase Auth, user management is handled by Supabase
// We don't need custom User, RegisterRequest, or LoginRequest models
// User authentication is done through Supabase client SDK in the frontend

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error"`
}
