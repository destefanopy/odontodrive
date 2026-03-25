import { NextResponse } from 'next/server';
// @ts-expect-error - pdf-parse no tiene tipos por defecto
import pdfParse from 'pdf-parse';

export async function POST(req: Request) {
  try {
    const { imageUrls, prompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "No se configuró la API Key de OpenAI en el servidor." }, { status: 400 });
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "Faltan los archivos para analizar." }, { status: 400 });
    }

    let extractedPdfText = "";
    const finalImageUrls: string[] = [];

    // Separar URLs de imágenes vs URLs de PDFs
    for (const url of imageUrls) {
      if (typeof url === 'string') {
        const lowerUrl = url.toLowerCase();
        // Si tiene un indicador de PDF en la URL (al subir a Supabase, suele tener extensión .pdf)
        if (lowerUrl.includes('.pdf')) {
          try {
            const pdfRes = await fetch(url);
            const arrayBuffer = await pdfRes.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const pdfData = await pdfParse(buffer);
            extractedPdfText += `\n\n--- TEXTO EXTRAÍDO DEL DOCUMENTO PDF ---\n${pdfData.text}\n--- FIN DEL DOCUMENTO PDF ---\n`;
          } catch (pdfErr) {
            console.error("Error parseando PDF:", pdfErr);
            extractedPdfText += `\n[Nota: Hubo un error al extraer el texto de un PDF proporcionado]`;
          }
        } else {
          finalImageUrls.push(url);
        }
      }
    }

    let userTextContent = prompt || "Por favor, analiza estos archivos clínicos detalladamente.";
    if (extractedPdfText) {
      userTextContent += `\n\nAdemás, el usuario adjuntó uno o más documentos PDF. Este es el texto extraído:\n${extractedPdfText}\nPor favor ten en cuenta ambos (las imágenes y este texto) para tu análisis.`;
    }

    const messages = [
      {
        role: "system",
        content: "Eres 'OdontólogoIA', un experto en radiología oral, ortodoncia y diagnóstico clínico dental. Tu objetivo es ayudar a los dentistas analizando radiografías, fotografías clínicas, y documentos o historia médica en texto. Señala anomalías anatómicas, patologías (caries, pérdida ósea, etc.) o progreso del tratamiento histórico si hay texto. Utiliza terminología médica profesional, sé breve pero muy preciso."
      },
      {
        role: "user",
        // @ts-ignore - NextJS types and fetch types are sometimes strict about object shapes inside content arrays
        content: [
          { type: "text", text: userTextContent },
          ...finalImageUrls.map((url: string) => ({
            type: "image_url",
            image_url: { url }
          }))
        ]
      }
    ];

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
        max_tokens: 600,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error devuelto por OpenAI");
    }

    const data = await response.json();
    return NextResponse.json({ result: data.choices[0].message.content });

  } catch (error: any) {
    console.error("OpenAI API Route Error:", error);
    return NextResponse.json({ error: error.message || "Error interno de IA" }, { status: 500 });
  }
}
