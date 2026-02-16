import tesseract from 'node-tesseract-ocr';
// @ts-ignore - pdf-parse doesn't have TypeScript definitions
import pdfParse from 'pdf-parse';
import { fromBuffer } from 'pdf2pic';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

/**
 * Extract text from an image using system Tesseract OCR
 * @param imageBuffer - Buffer containing image data
 * @returns Extracted text
 */
export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  // Write buffer to temp file (tesseract needs a file path)
  const tempFile = join(tmpdir(), `ocr-${Date.now()}.png`);
  
  try {
    writeFileSync(tempFile, imageBuffer);
    
    const config = {
      lang: 'eng',
      oem: 1,
      psm: 3,
    };
    
    const text = await tesseract.recognize(tempFile, config);
    return text.trim();
  } catch (error) {
    throw new Error(`Image OCR failed: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up temp file
    try {
      unlinkSync(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Extract text from a PDF file (tries text extraction first, falls back to OCR)
 * @param pdfBuffer - Buffer containing PDF data
 * @returns Extracted text
 */
export async function ocrPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // First, try to extract text directly (for PDFs with text layer)
    const data = await pdfParse(pdfBuffer);
    
    // If we got substantial text, return it
    if (data.text && data.text.trim().length > 50) {
      return data.text.trim();
    }
    
    // Otherwise, this is likely a scanned PDF - use OCR
    console.log('PDF appears to be scanned, using OCR...');
    
    // Convert PDF pages to images and OCR them
    const convert = fromBuffer(pdfBuffer, {
      density: 300,
      format: 'png',
      width: 2000,
      height: 2000,
    });
    
    let fullText = '';
    
    // Process first 10 pages (to avoid timeout)
    for (let pageNum = 1; pageNum <= Math.min(10, data.numpages || 1); pageNum++) {
      try {
        const page = await convert(pageNum, { responseType: 'buffer' });
        const pageText = await ocrImage(page.buffer as Buffer);
        fullText += pageText + '\n\n';
      } catch (error) {
        console.error(`Failed to OCR page ${pageNum}:`, error);
        // Continue with other pages
      }
    }
    
    return fullText.trim();
  } catch (error) {
    throw new Error(`PDF processing failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract text from a file based on its type
 * @param fileBuffer - Buffer containing file data
 * @param fileType - File extension (pdf, png, jpg, jpeg, etc.)
 * @returns Extracted text
 */
export async function extractTextFromFile(fileBuffer: Buffer, fileType: string): Promise<string> {
  const normalizedType = fileType.toLowerCase().replace('.', '');
  
  if (normalizedType === 'pdf') {
    return await ocrPdf(fileBuffer);
  } else if (['png', 'jpg', 'jpeg', 'bmp', 'tiff', 'gif'].includes(normalizedType)) {
    return await ocrImage(fileBuffer);
  } else {
    throw new Error(`Unsupported file type: ${fileType}. Supported types: PDF, PNG, JPG, JPEG, BMP, TIFF, GIF`);
  }
}
