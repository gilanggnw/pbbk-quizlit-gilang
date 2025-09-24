# PDF Text Extractor for Quizlit

A Go-based command-line tool to extract text from PDF files. This utility is designed for the Quizlit application where users can upload PDF files as learning resources.

## Features

- ✅ Extract text from PDF files
- ✅ Display PDF information (file size, page count, etc.)
- ✅ Comprehensive error handling and validation
- ✅ Support for large PDF files (up to 100MB)
- ✅ Command-line interface for easy testing
- ✅ Cross-platform compatibility

## Prerequisites

- Go 1.19 or higher
- Git

## Installation & Setup

1. Navigate to the backend directory:

```bash
cd be
```

2. Install dependencies:

```bash
go mod tidy
```

## Usage

### Basic Text Extraction

```bash
go run *.go -file "path/to/your/document.pdf"
```

### Show PDF Information Only

```bash
go run *.go -file "path/to/your/document.pdf" -info
```

### Show Help

```bash
go run *.go -help
```

### Build Executable

```bash
go build -o pdf-extractor
./pdf-extractor -file "document.pdf"
```

## Command Line Options

| Option | Description | Required |
|--------|-------------|----------|
| `-file` | Path to the PDF file to parse | Yes |
| `-info` | Show only PDF information without extracting text | No |
| `-help` | Show help message | No |

## Examples

### Extract text from a PDF

```bash
go run *.go -file "sample-document.pdf"
```

### Check PDF information

```bash
go run *.go -file "large-document.pdf" -info
```

### Extract from PDF with spaces in filename

```bash
go run *.go -file "My Document With Spaces.pdf"
```

## Error Handling

The tool includes comprehensive error handling for:

- ❌ File not found
- ❌ Invalid file extensions (non-PDF files)
- ❌ File permission issues
- ❌ Corrupted PDF files
- ❌ Empty files
- ❌ Files exceeding size limits (100MB)
- ❌ PDFs with no extractable text

Each error includes helpful suggestions for resolution.

## File Structure

```text
be/
├── main.go          # Command-line interface and main logic
├── pdf_parser.go    # PDF parsing functionality
├── utils.go         # File validation and error handling
├── go.mod           # Go module file
├── go.sum           # Dependency checksums
└── README.md        # This file
```

## Integration with Quizlit

This PDF parser can be integrated into your Quizlit web application as an HTTP API endpoint or background job processor.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request