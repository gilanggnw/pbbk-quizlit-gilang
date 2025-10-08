package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"strings"
)

func main() {
	// Check if running as server or CLI
	var (
		serverMode = flag.Bool("server", false, "Run as PDF parser HTTP server")
		authMode   = flag.Bool("auth", false, "Run as authentication HTTP server")
		port       = flag.String("port", "8080", "Server port (only for server mode)")
		uploadDir  = flag.String("upload-dir", "./uploads", "Upload directory for PDF server mode")
		filePath   = flag.String("file", "", "Path to the PDF file to parse (CLI mode)")
		infoOnly   = flag.Bool("info", false, "Show only PDF information without extracting text (CLI mode)")
		help       = flag.Bool("help", false, "Show help message")
	)
	flag.Parse()

	// Show help if requested or no arguments provided
	if *help || len(os.Args) == 1 {
		showHelp()
		return
	}

	// Authentication server mode
	if *authMode {
		runAuthServer(*port)
		return
	}

	// PDF server mode
	if *serverMode {
		runServer(*port, *uploadDir)
		return
	}

	// CLI mode
	runCLI(*filePath, *infoOnly)
}

func runAuthServer(port string) {
	log.Println("Starting Authentication API Server with Supabase Auth...")

	// Load configuration
	config, err := LoadConfig()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Set Supabase JWT secret for token validation
	SupabaseJWTSecret = config.SupabaseJWTSecret

	log.Printf("✅ Supabase configuration loaded")
	log.Printf("   URL: %s", config.SupabaseURL)

	// Start auth server
	server := NewAuthServer()
	if err := server.StartAuthServer(config.ServerPort); err != nil {
		log.Fatalf("Auth server failed: %v", err)
	}
}

func runServer(port, uploadDir string) {
	log.Println("Starting PDF Parser API Server...")
	server := NewAPIServer(uploadDir)
	if err := server.Start(port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}

func runCLI(filePath string, infoOnly bool) {
	// Validate required arguments
	if filePath == "" {
		fmt.Println("Error: PDF file path is required in CLI mode")
		fmt.Println("Use -help for usage information")
		os.Exit(1)
	}

	// Create PDF parser instance
	parser := NewPDFParser()

	// Show PDF info if requested
	if infoOnly {
		err := showPDFInfo(parser, filePath)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			os.Exit(1)
		}
		return
	}

	// Extract and display text
	err := extractAndDisplayText(parser, filePath)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}

func showHelp() {
	fmt.Println("Quizlit Backend API")
	fmt.Println("===================")
	fmt.Println()
	fmt.Println("A multi-purpose backend server for PDF parsing and user authentication.")
	fmt.Println()
	fmt.Println("Authentication Server Mode:")
	fmt.Println("  go run *.go -auth")
	fmt.Println("  go run *.go -auth -port 8080")
	fmt.Println()
	fmt.Println("PDF Server Mode:")
	fmt.Println("  go run *.go -server")
	fmt.Println("  go run *.go -server -port 8080 -upload-dir ./uploads")
	fmt.Println()
	fmt.Println("CLI Mode:")
	fmt.Println("  go run *.go -file <path_to_pdf>")
	fmt.Println("  go run *.go -file <path_to_pdf> -info")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -auth             Run as authentication HTTP server")
	fmt.Println("  -server           Run as PDF parser HTTP server")
	fmt.Println("  -port string      Server port (default: 8080)")
	fmt.Println("  -upload-dir       Upload directory for PDF server mode (default: ./uploads)")
	fmt.Println("  -file string      Path to the PDF file to parse (CLI mode)")
	fmt.Println("  -info             Show only PDF information without extracting text (CLI mode)")
	fmt.Println("  -help             Show this help message")
	fmt.Println()
	fmt.Println("Auth API Endpoints:")
	fmt.Println("  POST /api/auth/register  - Register new user")
	fmt.Println("  POST /api/auth/login     - Login user")
	fmt.Println("  GET  /api/auth/profile   - Get user profile (protected)")
	fmt.Println("  GET  /api/auth/health    - Health check")
	fmt.Println()
	fmt.Println("PDF API Endpoints:")
	fmt.Println("  GET  /api/health         - Health check")
	fmt.Println("  POST /api/pdf/upload     - Upload and extract text from PDF")
	fmt.Println("  POST /api/pdf/info       - Get PDF information only")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  # Start auth server")
	fmt.Println("  go run *.go -auth")
	fmt.Println()
	fmt.Println("  # Start PDF server")
	fmt.Println("  go run *.go -server")
	fmt.Println()
	fmt.Println("  # CLI mode")
	fmt.Println("  go run *.go -file document.pdf")
}

func showPDFInfo(parser *PDFParser, filePath string) error {
	// Validate file first when called directly
	validator := NewFileValidator()
	if err := validator.ValidateFile(filePath); err != nil {
		errorHandler := NewErrorHandler()
		errorHandler.HandleError(err, "file validation")
		return err
	}

	info, err := parser.GetPDFInfo(filePath)
	if err != nil {
		return err
	}

	fmt.Println("PDF Information")
	fmt.Println("===============")
	fmt.Printf("File Name:    %s\n", info.FileName)
	fmt.Printf("File Path:    %s\n", info.FilePath)
	fmt.Printf("File Size:    %s\n", info.FormatFileSize())
	fmt.Printf("Page Count:   %d\n", info.PageCount)

	return nil
}

func extractAndDisplayText(parser *PDFParser, filePath string) error {
	// Validate file first
	validator := NewFileValidator()
	if err := validator.ValidateFile(filePath); err != nil {
		errorHandler := NewErrorHandler()
		errorHandler.HandleError(err, "file validation")
		return err
	}

	// First show PDF info
	fmt.Println("Processing PDF...")
	err := showPDFInfo(parser, filePath)
	if err != nil {
		return err
	}

	fmt.Println("\nExtracting text...")

	// Extract text
	text, err := parser.ExtractTextFromFile(filePath)
	if err != nil {
		return err
	}

	// Display extracted text
	fmt.Println("\nExtracted Text")
	fmt.Println("==============")

	// Clean up the text a bit for better display
	cleanText := strings.TrimSpace(text)
	if len(cleanText) > 5000 {
		fmt.Printf("%s\n\n[... Text truncated for display. Total length: %d characters ...]\n", cleanText[:5000], len(cleanText))
	} else {
		fmt.Println(cleanText)
	}

	// Show some statistics
	fmt.Println("\nText Statistics")
	fmt.Println("===============")
	fmt.Printf("Total characters: %d\n", len(text))
	fmt.Printf("Total words:      %d\n", len(strings.Fields(text)))
	fmt.Printf("Total lines:      %d\n", strings.Count(text, "\n")+1)

	return nil
}
