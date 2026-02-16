# OCR Feature Implementation Guide

## What Was Added

I've successfully added OCR (Optical Character Recognition) capability to your chromadb-remote-mcp fork. The implementation uses:

- **tesseract.js**: Pure JavaScript/WebAssembly OCR engine (no system dependencies!)
- **pdf-parse**: Pure Node.js PDF text extraction

## Files Modified/Created

### 1. `/src/ocr-utils.ts` (NEW FILE)
Contains OCR utilities:
- `ocrImage()` - Extract text from images (PNG, JPG, etc.)
- `ocrPdf()` - Extract text from PDF files  
- `extractTextFromFile()` - Main function that handles both

### 2. `/src/chroma-tools.ts` (MODIFIED)
Added:
- Import for OCR utilities
- New tool definition: `chroma_add_documents_from_file`
- Handler for the new tool in the switch statement

### 3. `/package.json` (MODIFIED)
Added dependencies:
- `tesseract.js`: ^5.1.1
- `pdf-parse`: ^1.1.1

### 4. `/Dockerfile` (NO CHANGES NEEDED!)
The Dockerfile works as-is because both libraries are pure JavaScript/Node.js with no system dependencies.

## Next Steps

### 1. Install Dependencies
```bash
cd /Users/danielteston/chromadb-remote-mcp
yarn install
```

### 2. Build the TypeScript
```bash
yarn build
```

### 3. Test Locally (Optional)
```bash
yarn dev
```

### 4. Build Docker Image
```bash
yarn docker:build:local
```

### 5. Deploy
Use docker-compose or your existing deployment method.

## How to Use the New Tool

Once deployed and connected to Claude Desktop, I can use it like this:

```typescript
// Example usage from Claude
chroma_add_documents_from_file({
  collection_name: "scanned_docs",
  file_data: "<base64_encoded_file_content>",
  file_type: "pdf",  // or "png", "jpg", "jpeg", etc.
  document_id: "invoice_001",
  metadata: {
    source: "scanned_invoice.pdf",
    date: "2026-02-13",
    category: "invoices"
  }
})
```

## Supported File Types

- **PDFs**: Full text extraction
- **Images**: PNG, JPG, JPEG, BMP, TIFF, GIF

## Benefits of This Approach

✅ **No system dependencies** - Pure JavaScript/Node.js  
✅ **Easy to deploy** - No changes to Dockerfile needed  
✅ **Works in Docker** - No apt-get or system libraries required  
✅ **Clean integration** - Follows existing MCP tool patterns  
✅ **Type-safe** - Full TypeScript support  

## Performance Notes

- **First OCR may be slow** as tesseract.js loads the WebAssembly worker
- **Subsequent OCRs are faster** 
- **PDFs with actual text** are extracted instantly (no OCR needed)
- **Scanned PDFs and images** require OCR processing (slower)

## Troubleshooting

If you encounter issues:

1. **Build errors**: Run `yarn install` again
2. **Type errors**: Run `yarn type-check` to verify
3. **Runtime errors**: Check the logs for specific error messages
4. **Docker build fails**: Make sure you're using Node 24.13.0+

## Testing

You can test the OCR functionality once deployed by:
1. Connecting Claude Desktop
2. Having me upload a PDF or image
3. Asking me to OCR it and add to a collection

Ready to proceed with building and deploying?
