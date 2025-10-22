package main

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/ledongthuc/pdf"
)

// PDFParser handles PDF text extraction
type PDFParser struct{}

// NewPDFParser creates a new PDF parser instance
func NewPDFParser() *PDFParser {
	return &PDFParser{}
}

// ExtractTextFromFile extracts text from a PDF file
func (p *PDFParser) ExtractTextFromFile(filePath string) (string, error) {
	// Validate file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return "", fmt.Errorf("file does not exist: %s", filePath)
	}

	// Validate file extension
	if !p.isPDFFile(filePath) {
		return "", errors.New("file is not a PDF")
	}

	// Open the PDF file
	file, reader, err := pdf.Open(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to open PDF file: %w", err)
	}
	defer file.Close()

	// Extract text from all pages
	var textBuilder strings.Builder
	totalPages := reader.NumPage()

	for pageNum := 1; pageNum <= totalPages; pageNum++ {
		page := reader.Page(pageNum)
		if page.V.IsNull() {
			continue
		}

		// Extract text from the current page
		pageText, err := page.GetPlainText(nil)
		if err != nil {
			fmt.Printf("Warning: failed to extract text from page %d: %v\n", pageNum, err)
			continue
		}

		// Add page separator and text
		if pageNum > 1 {
			textBuilder.WriteString("\n--- Page ")
			textBuilder.WriteString(fmt.Sprintf("%d", pageNum))
			textBuilder.WriteString(" ---\n")
		}
		textBuilder.WriteString(pageText)
		textBuilder.WriteString("\n")
	}

	extractedText := textBuilder.String()
	if strings.TrimSpace(extractedText) == "" {
		return "", errors.New("no text could be extracted from the PDF")
	}

	return extractedText, nil
}

// GetPDFInfo returns basic information about the PDF
func (p *PDFParser) GetPDFInfo(filePath string) (*PDFInfo, error) {
	// Validate file exists
	if _, err := os.Stat(filePath); os.IsNotExist(err) {
		return nil, fmt.Errorf("file does not exist: %s", filePath)
	}

	// Validate file extension
	if !p.isPDFFile(filePath) {
		return nil, errors.New("file is not a PDF")
	}

	// Open the PDF file
	file, reader, err := pdf.Open(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to open PDF file: %w", err)
	}
	defer file.Close()

	// Get file info
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return nil, fmt.Errorf("failed to get file info: %w", err)
	}

	info := &PDFInfo{
		FileName:  filepath.Base(filePath),
		FilePath:  filePath,
		FileSize:  fileInfo.Size(),
		PageCount: reader.NumPage(),
	}

	return info, nil
}

// isPDFFile checks if the file has a PDF extension
func (p *PDFParser) isPDFFile(filePath string) bool {
	ext := strings.ToLower(filepath.Ext(filePath))
	return ext == ".pdf"
}

// PDFInfo contains basic information about a PDF file
type PDFInfo struct {
	FileName  string `json:"file_name"`
	FilePath  string `json:"file_path"`
	FileSize  int64  `json:"file_size"`
	PageCount int    `json:"page_count"`
}

// FormatFileSize returns a human-readable file size
func (info *PDFInfo) FormatFileSize() string {
	const unit = 1024
	if info.FileSize < unit {
		return fmt.Sprintf("%d B", info.FileSize)
	}
	div, exp := int64(unit), 0
	for n := info.FileSize / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(info.FileSize)/float64(div), "KMGTPE"[exp])
}
