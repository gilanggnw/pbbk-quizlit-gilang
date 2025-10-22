package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// FileValidator handles file validation operations
type FileValidator struct{}

// NewFileValidator creates a new file validator instance
func NewFileValidator() *FileValidator {
	return &FileValidator{}
}

// ValidateFile performs comprehensive validation on a file
func (v *FileValidator) ValidateFile(filePath string) error {
	// Check if file path is empty
	if strings.TrimSpace(filePath) == "" {
		return fmt.Errorf("file path cannot be empty")
	}

	// Check if file exists
	fileInfo, err := os.Stat(filePath)
	if os.IsNotExist(err) {
		return fmt.Errorf("file does not exist: %s", filePath)
	}
	if err != nil {
		return fmt.Errorf("failed to access file: %w", err)
	}

	// Check if it's a directory
	if fileInfo.IsDir() {
		return fmt.Errorf("path points to a directory, not a file: %s", filePath)
	}

	// Check file extension
	if !v.isPDFFile(filePath) {
		ext := filepath.Ext(filePath)
		if ext == "" {
			return fmt.Errorf("file has no extension, expected .pdf")
		}
		return fmt.Errorf("invalid file extension '%s', expected .pdf", ext)
	}

	// Check file size (limit to 100MB)
	const maxFileSize = 100 * 1024 * 1024 // 100MB
	if fileInfo.Size() > maxFileSize {
		return fmt.Errorf("file too large: %s (max allowed: 100MB)", formatFileSize(fileInfo.Size()))
	}

	// Check if file is empty
	if fileInfo.Size() == 0 {
		return fmt.Errorf("file is empty")
	}

	return nil
}

// isPDFFile checks if the file has a PDF extension
func (v *FileValidator) isPDFFile(filePath string) bool {
	ext := strings.ToLower(filepath.Ext(filePath))
	return ext == ".pdf"
}

// formatFileSize returns a human-readable file size
func formatFileSize(size int64) string {
	const unit = 1024
	if size < unit {
		return fmt.Sprintf("%d B", size)
	}
	div, exp := int64(unit), 0
	for n := size / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(size)/float64(div), "KMGTPE"[exp])
}

// ErrorHandler provides centralized error handling
type ErrorHandler struct{}

// NewErrorHandler creates a new error handler instance
func NewErrorHandler() *ErrorHandler {
	return &ErrorHandler{}
}

// HandleError handles different types of errors with appropriate messages
func (h *ErrorHandler) HandleError(err error, context string) {
	if err == nil {
		return
	}

	fmt.Printf("Error in %s: %v\n", context, err)

	// Provide suggestions based on error type
	errorMsg := err.Error()
	switch {
	case strings.Contains(errorMsg, "does not exist"):
		fmt.Println("Suggestion: Check if the file path is correct and the file exists.")
	case strings.Contains(errorMsg, "permission denied"):
		fmt.Println("Suggestion: Check if you have permission to read the file.")
	case strings.Contains(errorMsg, "invalid file extension"):
		fmt.Println("Suggestion: Ensure the file has a .pdf extension.")
	case strings.Contains(errorMsg, "file too large"):
		fmt.Println("Suggestion: Try with a smaller PDF file (max 100MB).")
	case strings.Contains(errorMsg, "directory"):
		fmt.Println("Suggestion: Provide a path to a file, not a directory.")
	case strings.Contains(errorMsg, "no text could be extracted"):
		fmt.Println("Suggestion: The PDF might be image-based or encrypted. Try with a text-based PDF.")
	default:
		fmt.Println("Suggestion: Check the file and try again.")
	}
}
