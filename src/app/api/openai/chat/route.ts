import { NextResponse } from 'next/server';

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "No se configuró la API Key de OpenAI." }, { status: 400 });
    }

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "No se proporcionaron mensajes válidos." }, { status: 400 });
    }

    const systemPrompt = {
      role: "system",
      content: "Eres OdontologoIA, un asistente virtual experto y altamente especializado en Odontología. Tu objetivo es responder preguntas complejas y teóricas sobre diagnóstico dental, planes de tratamiento, farmacología bucal, intervenciones quirúrgicas, anatomía y operatoria dental u ortodoncia. Si el usuario te hace alguna pregunta completamente ajena a la odontología, la medicina estomatológica o la gestión de su clínica (por ejemplo, preguntas sobre programación de software, cocina, política o entretenimiento), DEBES rechazarla amablemente diciendo que tu ámbito de conocimiento está estrictamente restringido a la Odontología."
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [systemPrompt, ...messages],
        max_tokens: 1500,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Error devuelto por OpenAI");
    }

    const data = await response.json();
    return NextResponse.json({ result: data.choices[0].message.content });

  } catch (error: any) {
    console.error("OpenAI Chat Route Error:", error);
    return NextResponse.json({ error: error.message || "Error interno de IA" }, { status: 500 });
  }
}
