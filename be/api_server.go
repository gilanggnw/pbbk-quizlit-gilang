package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/google/uuid"
)

// APIServer handles HTTP requests for PDF processing
type APIServer struct {
	parser    *PDFParser
	validator *FileValidator
	uploadDir string
}

// NewAPIServer creates a new API server instance
func NewAPIServer(uploadDir string) *APIServer {
	// Create upload directory if it doesn't exist
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		log.Fatalf("Failed to create upload directory: %v", err)
	}

	return &APIServer{
		parser:    NewPDFParser(),
		validator: NewFileValidator(),
		uploadDir: uploadDir,
	}
}

// Start starts the HTTP server
func (s *APIServer) Start(port string) error {
	mux := http.NewServeMux()

	// Register routes
	mux.HandleFunc("/api/health", s.enableCORS(s.handleHealth))
	mux.HandleFunc("/api/pdf/upload", s.enableCORS(s.handlePDFUpload))
	mux.HandleFunc("/api/pdf/info", s.enableCORS(s.handlePDFInfo))

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	log.Printf("🚀 Server starting on http://localhost:%s", port)
	log.Println("📁 Upload directory:", s.uploadDir)
	log.Println("\nAvailable endpoints:")
	log.Println("  GET  /api/health        - Health check")
	log.Println("  POST /api/pdf/upload    - Upload and extract text from PDF")
	log.Println("  POST /api/pdf/info      - Get PDF information")

	return server.ListenAndServe()
}

// enableCORS adds CORS headers to allow frontend access
func (s *APIServer) enableCORS(next http.HandlerFunc) http.HandlerFunc {
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

// handleHealth returns the health status of the API
func (s *APIServer) handleHealth(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		s.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	response := map[string]interface{}{
		"status":  "healthy",
		"message": "PDF Parser API is running",
		"time":    time.Now().Format(time.RFC3339),
	}

	s.sendJSON(w, response, http.StatusOK)
}

// handlePDFUpload handles PDF file upload and text extraction
func (s *APIServer) handlePDFUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		s.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form (max 100MB)
	if err := r.ParseMultipartForm(100 << 20); err != nil {
		s.sendError(w, "Failed to parse form data: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get the file from form data
	file, header, err := r.FormFile("file")
	if err != nil {
		s.sendError(w, "Failed to get file from request: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file extension
	if filepath.Ext(header.Filename) != ".pdf" {
		s.sendError(w, "Invalid file type. Only PDF files are allowed", http.StatusBadRequest)
		return
	}

	// Generate unique filename
	uniqueFilename := fmt.Sprintf("%s_%s", uuid.New().String(), header.Filename)
	filePath := filepath.Join(s.uploadDir, uniqueFilename)

	// Save the file
	dst, err := os.Create(filePath)
	if err != nil {
		s.sendError(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		os.Remove(filePath) // Clean up on error
		s.sendError(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Validate the saved file
	if err := s.validator.ValidateFile(filePath); err != nil {
		os.Remove(filePath) // Clean up invalid file
		s.sendError(w, "File validation failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get PDF info
	info, err := s.parser.GetPDFInfo(filePath)
	if err != nil {
		os.Remove(filePath) // Clean up on error
		s.sendError(w, "Failed to get PDF info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Extract text from PDF
	text, err := s.parser.ExtractTextFromFile(filePath)
	if err != nil {
		os.Remove(filePath) // Clean up on error
		s.sendError(w, "Failed to extract text: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Clean up the uploaded file after processing
	os.Remove(filePath)

	// Prepare response
	response := map[string]interface{}{
		"success": true,
		"message": "PDF processed successfully",
		"data": map[string]interface{}{
			"filename":   header.Filename,
			"file_size":  info.FormatFileSize(),
			"page_count": info.PageCount,
			"text":       text,
			"word_count": len([]rune(text)),
		},
	}

	s.sendJSON(w, response, http.StatusOK)
}

// handlePDFInfo handles getting PDF information without full text extraction
func (s *APIServer) handlePDFInfo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		s.sendError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Parse multipart form (max 100MB)
	if err := r.ParseMultipartForm(100 << 20); err != nil {
		s.sendError(w, "Failed to parse form data: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get the file from form data
	file, header, err := r.FormFile("file")
	if err != nil {
		s.sendError(w, "Failed to get file from request: "+err.Error(), http.StatusBadRequest)
		return
	}
	defer file.Close()

	// Validate file extension
	if filepath.Ext(header.Filename) != ".pdf" {
		s.sendError(w, "Invalid file type. Only PDF files are allowed", http.StatusBadRequest)
		return
	}

	// Generate unique filename
	uniqueFilename := fmt.Sprintf("%s_%s", uuid.New().String(), header.Filename)
	filePath := filepath.Join(s.uploadDir, uniqueFilename)

	// Save the file temporarily
	dst, err := os.Create(filePath)
	if err != nil {
		s.sendError(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		os.Remove(filePath)
		s.sendError(w, "Failed to save file: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Validate the saved file
	if err := s.validator.ValidateFile(filePath); err != nil {
		os.Remove(filePath)
		s.sendError(w, "File validation failed: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get PDF info
	info, err := s.parser.GetPDFInfo(filePath)
	if err != nil {
		os.Remove(filePath)
		s.sendError(w, "Failed to get PDF info: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Clean up the uploaded file
	os.Remove(filePath)

	// Prepare response
	response := map[string]interface{}{
		"success": true,
		"message": "PDF info retrieved successfully",
		"data": map[string]interface{}{
			"filename":   info.FileName,
			"file_size":  info.FormatFileSize(),
			"page_count": info.PageCount,
		},
	}

	s.sendJSON(w, response, http.StatusOK)
}

// sendJSON sends a JSON response
func (s *APIServer) sendJSON(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// sendError sends an error response
func (s *APIServer) sendError(w http.ResponseWriter, message string, statusCode int) {
	response := map[string]interface{}{
		"success": false,
		"error":   message,
	}
	s.sendJSON(w, response, statusCode)
}
