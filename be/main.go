package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"pbkk-quizlit-backend/internal/api"
	"pbkk-quizlit-backend/internal/config"
	"strings"

	"github.com/joho/godotenv"
)

func main() {
	// Define command-line flags
	var (
		legacyMode = flag.Bool("legacy", false, "Run in legacy mode with separate services")
		serverMode = flag.Bool("server", false, "Run as PDF parser HTTP server (legacy)")
		authMode   = flag.Bool("auth", false, "Run as authentication HTTP server (legacy)")
		quizMode   = flag.Bool("quiz", false, "Run as quiz HTTP server (legacy)")
		port       = flag.String("port", "", "Server port (overrides config)")
		uploadDir  = flag.String("upload-dir", "./uploads", "Upload directory for PDF server mode")
		filePath   = flag.String("file", "", "Path to the PDF file to parse (CLI mode)")
		infoOnly   = flag.Bool("info", false, "Show only PDF information without extracting text (CLI mode)")
		help       = flag.Bool("help", false, "Show help message")
	)
	flag.Parse()

	// Show help if requested
	if *help {
		showHelp()
		return
	}

	// CLI mode for PDF parsing
	if *filePath != "" {
		runCLI(*filePath, *infoOnly)
		return
	}

	// Legacy mode - run individual services
	if *legacyMode || *authMode || *quizMode || *serverMode {
		portToUse := *port
		if portToUse == "" {
			portToUse = "8080"
		}

		if *authMode {
			runAuthServer(portToUse)
			return
		}

		if *quizMode {
			runQuizServer(portToUse)
			return
		}

		if *serverMode {
			runServer(portToUse, *uploadDir)
			return
		}
	}

	// Default: Run unified server
	runUnifiedServer(*port)
}

func runUnifiedServer(portOverride string) {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize configuration
	cfg := config.Load()

	// Override port if provided
	if portOverride != "" {
		cfg.Port = portOverride
	}

	// Initialize and start the unified server
	server := api.NewServer(cfg)

	log.Printf("Starting unified server on port %s", cfg.Port)
	if err := server.Start(); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
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
	fmt.Println("A multi-purpose backend server for quiz generation with PDF parsing and user authentication.")
	fmt.Println()
	fmt.Println("Default Mode (Unified Server):")
	fmt.Println("  go run *.go                    # Runs all services on configured port (default: 8080)")
	fmt.Println("  go run *.go -port 8081         # Runs all services on port 8081")
	fmt.Println()
	fmt.Println("Legacy Modes (Individual Services):")
	fmt.Println("  go run *.go -auth              # Run only authentication server")
	fmt.Println("  go run *.go -quiz              # Run only quiz server")
	fmt.Println("  go run *.go -server            # Run only PDF parser server")
	fmt.Println("  go run *.go -auth -port 8080   # With custom port")
	fmt.Println()
	fmt.Println("CLI Mode (PDF Parsing):")
	fmt.Println("  go run *.go -file <path_to_pdf>        # Extract text from PDF")
	fmt.Println("  go run *.go -file <path_to_pdf> -info  # Show PDF info only")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -port string      Server port (default: from config or 8080)")
	fmt.Println("  -upload-dir       Upload directory for PDF server mode (default: ./uploads)")
	fmt.Println("  -file string      Path to the PDF file to parse (CLI mode)")
	fmt.Println("  -info             Show only PDF information without extracting text (CLI mode)")
	fmt.Println("  -legacy           Force legacy mode with separate services")
	fmt.Println("  -auth             Run as authentication HTTP server (legacy)")
	fmt.Println("  -quiz             Run as quiz HTTP server (legacy)")
	fmt.Println("  -server           Run as PDF parser HTTP server (legacy)")
	fmt.Println("  -help             Show this help message")
	fmt.Println()
	fmt.Println("Unified API Endpoints (Default Mode):")
	fmt.Println("  GET  /health                       - Health check")
	fmt.Println("  POST /api/v1/quizzes/upload        - Upload PDF and generate quiz")
	fmt.Println("  POST /api/v1/quizzes/generate      - Generate quiz from text")
	fmt.Println("  GET  /api/v1/quizzes/              - List all quizzes")
	fmt.Println("  GET  /api/v1/quizzes/:id           - Get quiz by ID")
	fmt.Println("  PUT  /api/v1/quizzes/:id           - Update quiz")
	fmt.Println("  DELETE /api/v1/quizzes/:id         - Delete quiz")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  # Start unified server (recommended)")
	fmt.Println("  go run *.go")
	fmt.Println()
	fmt.Println("  # Start unified server on custom port")
	fmt.Println("  go run *.go -port 8081")
	fmt.Println()
	fmt.Println("  # CLI mode to parse PDF")
	fmt.Println("  go run *.go -file document.pdf")
	fmt.Println()
	fmt.Println("  # Legacy: Run only auth server")
	fmt.Println("  go run *.go -auth -port 3000")
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
