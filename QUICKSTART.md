# 🚀 Quick Start - PDF Upload REST API

## Start in 3 Steps

### 1️⃣ Start Backend (Terminal 1)
```bash
cd be
go run main.go pdf_parser.go utils.go api_server.go -server
```
✅ Backend running on: **http://localhost:8080**

### 2️⃣ Start Frontend (Terminal 2)
```bash
cd fe
npm run dev
```
✅ Frontend running on: **http://localhost:3000**

### 3️⃣ Test It
Open your browser: **http://localhost:3000/pdf-test**

Upload a PDF file and see the extracted text! 🎉

---

## Test API with cURL

```bash
# Health check
curl http://localhost:8080/api/health

# Upload a PDF (replace with your file)
curl -X POST http://localhost:8080/api/pdf/upload -F "file=@document.pdf"
```

---

## Use in Your Code

```typescript
import { uploadAndExtractPDF } from '@/app/lib/pdfApi';

const result = await uploadAndExtractPDF(pdfFile);
console.log(result.data.text); // The extracted text
```

Or use the component:
```typescript
import PDFUploader from '@/app/components/PDFUploader';

<PDFUploader 
  onTextExtracted={(text) => console.log(text)}
  onError={(error) => console.error(error)}
/>
```

---

## 📚 Full Documentation

- **[Setup Summary](./SETUP_SUMMARY.md)** - What was created
- **[Integration Guide](./INTEGRATION_GUIDE.md)** - How to integrate
- **[API Docs](./be/API_DOCUMENTATION.md)** - API reference

---

## ⚡ That's It!

You now have a fully functional PDF upload and text extraction system! 🎊
