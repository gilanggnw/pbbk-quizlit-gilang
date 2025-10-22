# Free AI Quiz Generation Setup Guide

Your QuizLit application now supports **multiple AI providers** with automatic fallbacks, so you can generate quizzes without paying for OpenAI tokens!

## 🎯 Current Status

✅ **Server Updated**: Your backend now includes free AI alternatives  
✅ **Auto-Fallback**: If OpenAI fails, the system automatically tries free options  
✅ **Rule-Based Backup**: Even without any AI, intelligent quiz generation works  

## 🚀 How It Works (Priority Order)

1. **OpenAI GPT-3.5** (if API key is valid and has credits)
2. **Ollama Local AI** (free, runs on your computer)  
3. **Intelligent Rule-Based Generation** (always works, no AI needed)

## 📝 Testing Right Now

Your system is **ready to use** immediately! Try uploading a file or generating a quiz:

- Frontend: http://localhost:3000
- Backend: http://localhost:8080/health

The system will automatically use rule-based generation for your demo, which creates:
- Multiple choice questions
- True/false questions  
- Fill-in-the-blank questions
- Based on content analysis and keyword extraction

## 🔧 Optional: Install Ollama for Better Free AI

For even better quiz quality, you can install Ollama (100% free local AI):

### Windows Installation:

1. **Download Ollama**:
   ```powershell
   # Visit https://ollama.ai/download or install via winget
   winget install Ollama.Ollama
   ```

2. **Install a Model** (one-time setup):
   ```powershell
   ollama pull llama2
   # Or for a smaller, faster model:
   ollama pull phi
   ```

3. **Start Ollama** (runs automatically after install):
   ```powershell
   ollama serve
   ```

4. **Verify Installation**:
   ```powershell
   curl http://localhost:11434/api/generate -d '{"model":"llama2","prompt":"Hello","stream":false}'
   ```

### After Ollama Installation:

Your QuizLit app will automatically detect and use Ollama when generating quizzes, providing much better AI-generated questions than the rule-based system.

## 🧪 Testing Different Scenarios

1. **Test Rule-Based Generation** (works now):
   - Upload any text/PDF file  
   - Should generate quiz immediately using intelligent algorithms

2. **Test with Ollama** (after installation):
   - Same process, but you'll get AI-quality questions locally
   - Check server logs to see "Using Ollama for quiz generation"

3. **Check Logs**:
   ```powershell
   # Server logs show which AI provider is being used:
   # "Using OpenAI for quiz generation" 
   # "Using Ollama for quiz generation"
   # "Using intelligent rule-based quiz generation"
   ```

## 📊 What You'll Get

### Rule-Based Generation (Available Now):
- ✅ Fast generation (no network calls)
- ✅ Always works offline  
- ✅ Good variety of question types
- ⚠️ Questions based on text patterns, not deep understanding

### Ollama Local AI (After Installation):
- ✅ True AI understanding of content
- ✅ More natural, coherent questions  
- ✅ Better context awareness
- ✅ Completely free and private
- ⚠️ Requires ~3-7GB disk space for models
- ⚠️ Slower than cloud AI (but still fast)

## 🛟 Troubleshooting

### If Quiz Generation Fails:
1. Check server logs in terminal
2. Verify file upload is working  
3. Try smaller text content
4. The system should always fall back to rule-based generation

### If Ollama Doesn't Work:
1. Check if Ollama is running: `ollama list`
2. Verify port 11434 is accessible
3. Try different models: `ollama pull phi` (smaller/faster)
4. The system will automatically fall back to rule-based generation

## 🎉 Ready to Demo!

Your QuizLit application is now **demo-ready** with free AI alternatives. No more "Failed to generate quiz" errors due to OpenAI billing limits!

**Try it now**: Upload a document or paste some text to see the intelligent quiz generation in action.