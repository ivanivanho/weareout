/**
 * Gemini AI Service
 * Handles all Google Gemini AI interactions for inventory management
 * @module services/geminiService
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy initialization - create client when first needed, not at module load time
let genAI = null;

function getGeminiClient() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    console.log('🔑 [Gemini] Initializing with API key:', apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}` : 'MISSING');

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables');
    }

    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Process voice/text input to structured inventory data
 * Parses natural language into actionable inventory items
 *
 * @param {string} text - Transcribed voice input or text from user
 * @returns {Promise<Object>} Structured inventory data with action and items
 * @throws {Error} If processing fails or API key is missing
 *
 * @example
 * const result = await processVoiceToInventory("We're out of milk");
 * // Returns: { action: 'remove', items: [{ name: 'Milk', quantity: 0, ... }] }
 */
export async function processVoiceToInventory(text) {
  try {
    if (!text || !text.trim()) {
      throw new Error('Text input is required');
    }

    const model = getGeminiClient().getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash-latest',
      generationConfig: {
        temperature: parseFloat(process.env.GEMINI_TEMPERATURE || '0.7'),
        maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '1024'),
      },
    });

    const prompt = `You are an intelligent inventory assistant. Parse this user input into structured inventory data.

User said: "${text}"

Extract and return ONLY a JSON object with this exact structure:
{
  "action": "add" | "update" | "remove",
  "items": [
    {
      "name": "item name",
      "quantity": number,
      "unit": "units/kg/lbs/pieces/g/ml/etc",
      "category": "category name",
      "confidence": 0-1
    }
  ]
}

Rules for parsing:
- If user says "out of", "ran out", "need", "low on" → set action to "remove" or quantity to 0
- If user says "add", "bought", "got", "purchased" → set action to "add"
- If user says "update", "change", "now have" → set action to "update"
- Infer reasonable units if not specified (e.g., milk → "L", bread → "loaf", eggs → "dozen")
- Infer category from item name (e.g., milk → "Dairy", bread → "Bakery", apples → "Produce")
- Set confidence based on how clear the user input is (0.0 to 1.0)
- Support multiple items in one phrase (e.g., "milk and bread")
- Return valid JSON only, no markdown formatting or explanation`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    console.log('🤖 [Gemini] Raw response:', textResponse);

    // Parse JSON from response (handle potential markdown formatting)
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ [Gemini] Failed to extract JSON from response:', textResponse);
      throw new Error('Failed to extract structured data from AI response');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (!parsedData.action || !Array.isArray(parsedData.items)) {
      throw new Error('Invalid response structure from AI');
    }

    // Validate each item
    parsedData.items.forEach((item, index) => {
      if (!item.name || typeof item.quantity !== 'number' || !item.unit) {
        throw new Error(`Invalid item structure at index ${index}`);
      }
    });

    console.log('✅ [Gemini] Parsed data:', JSON.stringify(parsedData, null, 2));

    return parsedData;
  } catch (error) {
    console.error('❌ [Gemini] Error processing voice to inventory:', error);

    // Provide user-friendly error messages
    if (error.message?.includes('API key')) {
      throw new Error('AI service is not configured. Please contact support.');
    }
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }

    throw new Error(`Failed to process voice input: ${error.message}`);
  }
}

/**
 * Process camera image to identify inventory items
 * Uses Gemini Vision to detect items in photos
 *
 * @param {Buffer} imageBuffer - Image buffer from multer upload
 * @returns {Promise<Object>} Identified items with quantities
 * @throws {Error} If processing fails or image is invalid
 *
 * @example
 * const result = await processImageToInventory(req.file.buffer);
 * // Returns: { items: [{ name: 'Cereal Box', quantity: 1, ... }] }
 */
export async function processImageToInventory(imageBuffer) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Image data is required');
    }

    const model = getGeminiClient().getGenerativeModel({
      model: 'gemini-1.5-flash-latest', // Vision support
      generationConfig: {
        temperature: 0.4, // Lower temperature for more consistent object detection
        maxOutputTokens: 2048,
      },
    });

    const prompt = `You are an inventory assistant analyzing a photo of groceries or pantry items.

Identify all food and household items visible in this image.

Return ONLY a JSON object with this structure:
{
  "items": [
    {
      "name": "specific item name with brand if visible",
      "quantity": estimated_quantity_as_number,
      "unit": "units/kg/pieces/boxes/cans/etc",
      "category": "category name",
      "confidence": 0-1
    }
  ]
}

Guidelines:
- Be specific about brands and product types when visible (e.g., "Cheerios Cereal" not just "Cereal")
- Estimate quantities based on visible items (count individual items when possible)
- Infer appropriate units based on product type
- Categorize items appropriately (Dairy, Produce, Beverages, Snacks, etc.)
- Set confidence based on image clarity and item visibility
- Only include items you can clearly identify
- Return valid JSON only, no markdown or explanation`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    console.log('📸 [Gemini] Processing image...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 [Gemini Vision] Raw response:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ [Gemini Vision] Failed to extract JSON from response:', text);
      throw new Error('Failed to extract structured data from image analysis');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Validate response
    if (!Array.isArray(parsedData.items)) {
      throw new Error('Invalid response structure from AI');
    }

    console.log(`✅ [Gemini Vision] Identified ${parsedData.items.length} items`);

    return parsedData;
  } catch (error) {
    console.error('❌ [Gemini Vision] Error processing image:', error);

    if (error.message?.includes('API key')) {
      throw new Error('AI service is not configured. Please contact support.');
    }
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }

    throw new Error(`Failed to process image: ${error.message}`);
  }
}

/**
 * Process receipt image to extract purchase data
 * Parses receipt for items, quantities, prices, and store info
 *
 * @param {Buffer} imageBuffer - Receipt image buffer from multer
 * @returns {Promise<Object>} Purchase data with store info and items
 * @throws {Error} If processing fails or receipt cannot be parsed
 *
 * @example
 * const result = await processReceiptToInventory(req.file.buffer);
 * // Returns: { storeName: 'Safeway', purchaseDate: '2026-01-10', items: [...] }
 */
export async function processReceiptToInventory(imageBuffer) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Receipt image is required');
    }

    const model = getGeminiClient().getGenerativeModel({
      model: 'gemini-1.5-flash-latest',
      generationConfig: {
        temperature: 0.3, // Low temperature for accurate data extraction
        maxOutputTokens: 3072,
      },
    });

    const prompt = `You are a receipt parser for grocery and household items.

Extract ALL food and household items from this receipt image.

Return ONLY a JSON object with this structure:
{
  "storeName": "store name from receipt",
  "purchaseDate": "YYYY-MM-DD format",
  "totalAmount": total_amount_as_number,
  "items": [
    {
      "name": "item name (cleaned and readable)",
      "quantity": quantity_as_number,
      "unit": "units/kg/lbs/g/ml/etc",
      "price": price_per_item_as_number,
      "category": "inferred category"
    }
  ]
}

Extraction rules:
- Extract store name from header/logo
- Parse date to YYYY-MM-DD format
- Extract total amount (before tax if available, otherwise final total)
- For each line item:
  - Clean up abbreviated names (e.g., "MLK 2%" → "Milk 2%")
  - Infer quantity from item description (e.g., "2 Apples" → quantity: 2, "1L Milk" → quantity: 1, unit: "L")
  - If no quantity specified, default to 1
  - Extract individual item price (not total for multiple)
  - Categorize intelligently (Dairy, Produce, Meat, Beverages, etc.)
- Skip non-food items, taxes, fees
- Return valid JSON only`;

    const imagePart = {
      inlineData: {
        data: imageBuffer.toString('base64'),
        mimeType: 'image/jpeg',
      },
    };

    console.log('🧾 [Gemini] Processing receipt...');
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    console.log('🤖 [Gemini Receipt] Raw response:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ [Gemini Receipt] Failed to extract JSON from response:', text);
      throw new Error('Failed to extract data from receipt. Please ensure the image is clear and readable.');
    }

    const parsedData = JSON.parse(jsonMatch[0]);

    // Validate response structure
    if (!parsedData.storeName || !parsedData.items || !Array.isArray(parsedData.items)) {
      throw new Error('Invalid receipt data structure from AI');
    }

    console.log(`✅ [Gemini Receipt] Extracted ${parsedData.items.length} items from ${parsedData.storeName}`);

    return parsedData;
  } catch (error) {
    console.error('❌ [Gemini Receipt] Error processing receipt:', error);

    if (error.message?.includes('API key')) {
      throw new Error('AI service is not configured. Please contact support.');
    }
    if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
      throw new Error('AI service is temporarily unavailable. Please try again later.');
    }

    throw new Error(`Failed to process receipt: ${error.message}`);
  }
}

// Default export with all functions
export default {
  processVoiceToInventory,
  processImageToInventory,
  processReceiptToInventory,
};
