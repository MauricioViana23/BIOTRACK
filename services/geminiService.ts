import { GoogleGenAI } from "@google/genai";
import { Bioimpedance } from "../types";

// This service handles AI Analysis of Bioimpedance images.
// Phase 2 Update: Supports more detailed extraction fields.

export const analyzeBioimpedanceImage = async (file: File): Promise<Partial<Bioimpedance>> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    console.warn("Gemini API Key missing. Returning mock analysis.");
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock response
    return {
      weight_kg: 81.2,
      fat_mass_kg: 27.5,
      lean_mass_kg: 53.7,
      fat_percentage: 33.8,
      water_percentage: 46.5,
      muscle_mass_kg: 51.2,
      bone_mass_kg: 3.2,
      visceral_fat_level: 9,
      metabolic_age: 35,
      basal_metabolic_rate: 1650,
      notes: "Dados extraídos automaticamente via Gemini AI (Mock)"
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Convert file to base64
    const base64Data = await fileToGenerativePart(file);

    const model = 'gemini-2.5-flash-image';
    const prompt = `
      Analyze this bioimpedance report image. 
      Extract the following values in JSON format:
      {
        "weight_kg": number,
        "fat_mass_kg": number,
        "lean_mass_kg": number,
        "muscle_mass_kg": number,
        "fat_percentage": number,
        "water_percentage": number,
        "bone_mass_kg": number,
        "visceral_fat_level": number,
        "metabolic_age": number,
        "basal_metabolic_rate": number
      }
      
      Rules:
      1. Use null if a value is not found.
      2. Return ONLY valid JSON.
      3. Do not use markdown blocks.
      4. Do not include explanations.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: file.type } },
          { text: prompt }
        ]
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    // Clean markdown if present
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

    const data = JSON.parse(cleanText);
    return {
      weight_kg: data.weight_kg || 0,
      fat_mass_kg: data.fat_mass_kg || 0,
      lean_mass_kg: data.lean_mass_kg || 0,
      fat_percentage: data.fat_percentage || 0,
      water_percentage: data.water_percentage || 0,
      muscle_mass_kg: data.muscle_mass_kg || 0,
      bone_mass_kg: data.bone_mass_kg || 0,
      visceral_fat_level: data.visceral_fat_level || 0,
      metabolic_age: data.metabolic_age || 0,
      basal_metabolic_rate: data.basal_metabolic_rate || 0,
      notes: "Dados extraídos via Gemini AI"
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

async function fileToGenerativePart(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}