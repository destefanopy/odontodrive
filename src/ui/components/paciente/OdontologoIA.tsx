"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, Sparkles, BrainCircuit } from "lucide-react";
import { incrementIaUsage } from "@/core/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function OdontologoIA({ pacienteId }: { pacienteId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "¡Hola, colega! Soy OdontólogoIA. Estoy listo para ayudarte con dudas de diagnóstico, tratamiento, farmacología bucal o gestión clínica. ¿En qué te puedo asesorar hoy?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/openai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages })
      });

      if (!response.ok) {
        throw new Error("No se pudo conectar con OdontólogoIA.");
      }

      const data = await response.json();
      setMessages([...newMessages, { role: "assistant", content: data.result }]);
      await incrementIaUsage();
    } catch (error: any) {
      alert("Error: " + error.message);
      setMessages([...newMessages, { role: "assistant", content: "Lo siento, ocurrió un error de red al contactar al motor inteligente." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-b border-cyan-100 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            OdontólogoIA <Sparkles className="w-4 h-4 text-cyan-500" />
          </h2>
          <p className="text-xs font-bold text-teal-700">Asistente Clínico Especializado</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center shadow-sm ${msg.role === "user" ? "bg-slate-800 text-white" : "bg-gradient-to-br from-cyan-400 to-teal-500 text-white"}`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-wrap shadow-sm ${
              msg.role === "user" 
                ? "bg-slate-800 text-white rounded-tr-sm" 
                : "bg-white text-slate-700 border border-slate-100 rounded-tl-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-white px-5 py-3.5 rounded-2xl rounded-tl-sm border border-slate-100">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form 
          className="flex gap-2" 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="Pregúntame sobre un diagnóstico, material dental o protocolo..."
            className="flex-1 bg-slate-50 border border-slate-200 text-sm font-medium rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all disabled:opacity-50"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:bg-black transition-all shadow-md disabled:opacity-50 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
      
    </div>
  );
}
