package services

import (
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/ledongthuc/pdf"
	"golang.org/x/text/encoding/charmap"
)

type FileService struct{}

func NewFileService() *FileService {
	return &FileService{}
}

// ProcessUploadedFile extracts text content from uploaded files
func (fs *FileService) ProcessUploadedFile(file multipart.File, header *multipart.FileHeader) (string, error) {
	defer file.Close()

	// Get file extension
	ext := strings.ToLower(filepath.Ext(header.Filename))

	switch ext {
	case ".txt":
		return fs.processTXTFile(file)
	case ".pdf":
		return fs.processPDFFile(file)
	default:
		return "", fmt.Errorf("unsupported file type: %s", ext)
	}
}

func (fs *FileService) processTXTFile(file multipart.File) (string, error) {
	content, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read TXT file: %w", err)
	}

	// Try to decode as UTF-8 first, fallback to Windows-1252 if needed
	text := string(content)
	if !isValidUTF8(text) {
		decoder := charmap.Windows1252.NewDecoder()
		decodedContent, err := decoder.Bytes(content)
		if err != nil {
			return "", fmt.Errorf("failed to decode text file: %w", err)
		}
		text = string(decodedContent)
	}

	return text, nil
}

func (fs *FileService) processPDFFile(file multipart.File) (string, error) {
	// Read all content into memory
	content, err := io.ReadAll(file)
	if err != nil {
		return "", fmt.Errorf("failed to read PDF file: %w", err)
	}

	// Create a reader from the content
	reader, err := pdf.NewReader(strings.NewReader(string(content)), int64(len(content)))
	if err != nil {
		return "", fmt.Errorf("failed to create PDF reader: %w", err)
	}

	var text strings.Builder
	numPages := reader.NumPage()

	for i := 1; i <= numPages; i++ {
		page := reader.Page(i)
		if page.V.IsNull() {
			continue
		}

		// Try GetPlainText first
		pageText, err := page.GetPlainText(nil)
		if err != nil {
			continue
		}

		// Clean and normalize the text
		cleanedText := fs.cleanPDFText(pageText)
		
		text.WriteString(cleanedText)
		text.WriteString("\n\n") // Add paragraph breaks between pages
	}

	if text.Len() == 0 {
		return "", fmt.Errorf("no text content found in PDF")
	}

	finalText := text.String()
	
	// Final cleaning pass
	finalText = fs.normalizePDFText(finalText)
	
	return finalText, nil
}

// cleanPDFText cleans up PDF text extraction artifacts
func (fs *FileService) cleanPDFText(text string) string {
	// First, remove common PDF artifacts
	text = strings.ReplaceAll(text, "□", " ")
	text = strings.ReplaceAll(text, "�", "")
	text = strings.ReplaceAll(text, "\u00a0", " ") // non-breaking space
	
	// Replace multiple spaces/newlines with single space
	text = strings.Join(strings.Fields(text), " ")
	
	// AGGRESSIVE word boundary detection
	var result strings.Builder
	runes := []rune(text)
	
	for i := 0; i < len(runes); i++ {
		current := runes[i]
		result.WriteRune(current)
		
		if i < len(runes)-1 {
			next := runes[i+1]
			
			// Skip if already has space
			if current == ' ' || next == ' ' {
				continue
			}
			
			// Add space between lowercase and uppercase (camelCase)
			// Example: "matriksselisih" → "matriks selisih"
			if (current >= 'a' && current <= 'z') && (next >= 'A' && next <= 'Z') {
				result.WriteRune(' ')
				continue
			}
			
			// Add space between uppercase and lowercase (if previous was lowercase)
			// Example: "SSdan" → "SS dan"
			if i > 0 && (current >= 'A' && current <= 'Z') && (next >= 'a' && next <= 'z') {
				prev := runes[i-1]
				if prev >= 'a' && prev <= 'z' {
					result.WriteRune(' ')
					continue
				}
			}
			
			// Add space between letter and number
			if ((current >= 'a' && current <= 'z') || (current >= 'A' && current <= 'Z')) && 
			   (next >= '0' && next <= '9') {
				result.WriteRune(' ')
				continue
			}
			
			// Add space between number and letter
			if (current >= '0' && current <= '9') && 
			   ((next >= 'a' && next <= 'z') || (next >= 'A' && next <= 'Z')) {
				result.WriteRune(' ')
				continue
			}
			
			// Add space after closing bracket if followed by letter
			if (current == ')' || current == ']' || current == '}') && 
			   ((next >= 'A' && next <= 'Z') || (next >= 'a' && next <= 'z')) {
				result.WriteRune(' ')
				continue
			}
			
			// Add space before opening bracket if preceded by letter
			if ((current >= 'a' && current <= 'z') || (current >= 'A' && current <= 'Z')) &&
			   (next == '(' || next == '[' || next == '{') {
				result.WriteRune(' ')
				continue
			}
			
			// Add space after period if followed by uppercase (sentence boundary)
			if current == '.' && next >= 'A' && next <= 'Z' {
				result.WriteRune(' ')
				continue
			}
			
			// Add space after comma if not already present
			if current == ',' && ((next >= 'A' && next <= 'Z') || (next >= 'a' && next <= 'z')) {
				result.WriteRune(' ')
				continue
			}
			
			// Add space after colon/semicolon if followed by letter
			if (current == ':' || current == ';') && 
			   ((next >= 'A' && next <= 'Z') || (next >= 'a' && next <= 'z')) {
				result.WriteRune(' ')
				continue
			}
		}
	}
	
	return result.String()
}

// normalizePDFText performs final normalization
func (fs *FileService) normalizePDFText(text string) string {
	// Remove excessive whitespace
	text = strings.Join(strings.Fields(text), " ")
	
	// Fix common ligatures and special characters
	replacements := map[string]string{
		"ﬁ": "fi",
		"ﬂ": "fl",
		"ﬀ": "ff",
		"ﬃ": "ffi",
		"ﬄ": "ffl",
		"□": " ", // Replace box character with space
		"�": "",  // Remove replacement character
	}
	
	for old, new := range replacements {
		text = strings.ReplaceAll(text, old, new)
	}
	
	// Ensure proper sentence spacing
	text = strings.ReplaceAll(text, ". ", ". ")
	text = strings.ReplaceAll(text, "? ", "? ")
	text = strings.ReplaceAll(text, "! ", "! ")
	
	// Remove multiple consecutive spaces again
	text = strings.Join(strings.Fields(text), " ")
	
	return strings.TrimSpace(text)
}

func isValidUTF8(s string) bool {
	// Simple check for valid UTF-8 by looking for replacement characters
	return !strings.Contains(s, "\ufffd")
}