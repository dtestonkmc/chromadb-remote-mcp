import Tesseract from 'tesseract.js';
import pdfParse from 'pdf-parse';

/**
 * Extract text from an image using Tesseract OCR
 * @param imageBuffer - Buffer containing image data
 * @returns Extracted text
 */
export async function ocrImage(imageBuffer: Buffer): Promise<string> {
  try {
    const worker = await Tesseract.createWorker('eng');
    const { data: { text } } = await Tesseract.recognize(imageBuffer);
    await worker.terminate();
    return text.trim();
  } catch (error) {
    throw new Error(`Image OCR failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Extract text from a PDF file
 * @param pdfBuffer - Buffer containing PDF data
 * @returns Extracted text
 */
export async function ocrPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text.trim();
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error instanceof Error ? error.message : String(error)}`);
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
