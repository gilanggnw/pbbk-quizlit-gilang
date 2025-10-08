# Cleaning Up Build Artifacts

## Binary Files in Directory

The following binary files were found in the `be/` directory:

- `pbkk-quizlit-be.exe` - Main application binary
- `pdf-extractor.exe` - PDF extraction CLI binary

## Recommendation

These `.exe` files are build artifacts and should not be committed to version control.

### To Remove Them

```powershell
# Remove all .exe files
Remove-Item *.exe
```

Or manually delete them from the `be/` directory.

### To Rebuild

You can always rebuild the binary when needed:

```bash
# Build main application
go build -o pbkk-quizlit-be.exe

# Or simply
go build
```

## Note

The `.gitignore` file has been updated to exclude `*.exe` files, so they won't be committed in the future.
