package main

import (
	"flag"
	"fmt"
	"os"
	"strings"
)

func main() {
	// Define command line flags
	var (
		filePath = flag.String("file", "", "Path to the PDF file to parse (required)")
		infoOnly = flag.Bool("info", false, "Show only PDF information without extracting text")
		help     = flag.Bool("help", false, "Show help message")
	)
	flag.Parse()

	// Show help if requested or no arguments provided
	if *help || len(os.Args) == 1 {
		showHelp()
		return
	}

	// Validate required arguments
	if *filePath == "" {
		fmt.Println("Error: PDF file path is required")
		fmt.Println("Use -help for usage information")
		os.Exit(1)
	}

	// Create PDF parser instance
	parser := NewPDFParser()

	// Show PDF info if requested
	if *infoOnly {
		err := showPDFInfo(parser, *filePath)
		if err != nil {
			fmt.Printf("Error: %v\n", err)
			os.Exit(1)
		}
		return
	}

	// Extract and display text
	err := extractAndDisplayText(parser, *filePath)
	if err != nil {
		fmt.Printf("Error: %v\n", err)
		os.Exit(1)
	}
}

func showHelp() {
	fmt.Println("PDF Text Extractor")
	fmt.Println("==================")
	fmt.Println()
	fmt.Println("A command-line tool to extract text from PDF files for the Quizlit application.")
	fmt.Println()
	fmt.Println("Usage:")
	fmt.Println("  go run *.go -file <path_to_pdf>")
	fmt.Println()
	fmt.Println("Options:")
	fmt.Println("  -file string    Path to the PDF file to parse (required)")
	fmt.Println("  -info          Show only PDF information without extracting text")
	fmt.Println("  -help          Show this help message")
	fmt.Println()
	fmt.Println("Examples:")
	fmt.Println("  go run *.go -file document.pdf")
	fmt.Println("  go run *.go -file document.pdf -info")
	fmt.Println("  go run *.go -file \"C:\\path\\to\\document.pdf\"")
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
