import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { imageUrls, prompt } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "No se configuró la API Key de OpenAI en el servidor." }, { status: 400 });
    }

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ error: "Faltan las imágenes para analizar." }, { status: 400 });
    }

    const messages = [
      {
        role: "system",
        content: "Eres 'OdontólogoIA', un experto en radiología oral, ortodoncia y diagnóstico clínico dental. Tu objetivo es ayudar a los dentistas analizando radiografías y fotografías clínicas. Señala anomalías anatómicas, patologías (caries, pérdida ósea, etc.) o progreso del tratamiento si hay varias imágenes. Utiliza terminología médica profesional, sé breve pero muy preciso."
      },
      {
        role: "user",
        // @ts-ignore - NextJS types and fetch types are sometimes strict about object shapes inside content arrays
        content: [
          { type: "text", text: prompt || "Por favor, analiza estas imágenes clínicas detalladamente." },
          ...imageUrls.map((url: string) => ({
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
