
import { GoogleGenAI } from "@google/genai";
import { VerificationResult } from "../types";

export const verifyLocationWithAI = async (lat: number, lng: number): Promise<VerificationResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using gemini-2.5-flash as requested
      contents: `Identifie précisément l'adresse ou le lieu-dit situé aux coordonnées suivantes en France : Latitude ${lat}, Longitude ${lng}. Donne des détails sur ce qu'on y trouve (bâtiment, parc, carrefour, etc.).`,
      config: {
        tools: [{ googleMaps: {} }],
        // Note: toolConfig can be used for geolocation if needed, but here we pass direct coords
      },
    });

    const text = response.text || "Impossible de récupérer une description.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((c: any) => c.maps)
      .map((c: any) => ({
        title: c.maps.title || "Source Google Maps",
        uri: c.maps.uri
      }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      text: "Erreur lors de la vérification avec l'IA. Vérifiez votre connexion ou la validité des coordonnées.",
      sources: []
    };
  }
};
