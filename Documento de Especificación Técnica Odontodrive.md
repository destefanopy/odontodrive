# **Documento de Especificación Técnica y Arquitectura (SRS)**

## **Sistema de Gestión Odontológica (MVP) con Integración IA**

### **1\. Visión General del Producto**

El sistema es una aplicación web responsiva (SaaS) diseñada para optimizar el flujo de trabajo en consultorios odontológicos. Su filosofía es la "baja fricción": interfaces limpias, carga de datos rápida y navegación optimizada para pantallas táctiles. Además, incorpora un asistente de Inteligencia Artificial (OdontólogoIA) para el análisis de documentos clínicos e imágenes, actuando como copiloto del profesional.

### **2\. Arquitectura Tecnológica**

Se utilizará una arquitectura Serverless orientada a despliegues rápidos, bajo costo inicial y alta escalabilidad.

* **Frontend (Hosting en Vercel):** Next.js (App Router) o React \+ Vite. Estilizado con Tailwind CSS para un diseño minimalista.  
* **Backend & Base de Datos (Supabase):**  
  * PostgreSQL relacional.  
  * Supabase Auth (Autenticación de usuarios).  
  * Supabase Storage (Buckets seguros para radiografías, fotos y PDFs).  
* **Inteligencia Artificial (OdontólogoIA):**  
  * Integración vía API (ej. Gemini Pro/Flash) para procesamiento de lenguaje natural y visión artificial.  
  * Arquitectura RAG (Retrieval-Augmented Generation) para que la IA lea y contextualice los PDFs e historiales subidos.

### **3\. Requerimientos Funcionales (Módulos del Sistema)**

* **Módulo 1: Agenda:** Vista diaria/semanal, creación rápida de turnos y estados por color (Confirmado, En Sala, Atendido).  
* **Módulo 2: Ficha Clínica:** Datos demográficos, antecedentes médicos (alergias, cirugías, enfermedades sistémicas) y línea de tiempo de evolución.  
* **Módulo 3: Odontograma:** Representación 2D interactiva (clics/taps) para marcar estados en piezas dentales (caries, restauraciones, extracciones).  
* **Módulo 4: Presupuestos y Caja:** Armado de planes de tratamiento valorizados y registro de pagos por sesión (cuenta corriente).  
* **Módulo 5: Gestión de Archivos:** Subida de imágenes y documentos médicos directamente a la ficha del paciente, almacenados en la nube.

### **4\. Módulo OdontólogoIA (Asistente Inteligente)**

Este módulo transforma el sistema de un simple registro a un asistente clínico avanzado.

* **Funcionalidad de Chat Contextual:** El odontólogo tendrá una ventana de chat en la ficha del paciente. Podrá hacer preguntas en lenguaje natural como: *"¿Cuándo fue la última vez que este paciente tomó antibióticos según su historial?"* o *"Resume los antecedentes familiares de este PDF"*.  
* **Análisis de Documentos (RAG):** Cuando se suba un PDF (como resultados de análisis de sangre o derivaciones médicas), el sistema extraerá el texto y permitirá a la IA utilizarlo como contexto para responder preguntas.  
* **Análisis de Imágenes (Visión Artificial):** Al subir una radiografía panorámica, el profesional podrá solicitar un análisis. La IA devolverá sugerencias estructuradas (ej. *"Se detecta posible retención en pieza 38"*).  
* **Restricción Médica (Guardrail):** El sistema incluirá alertas visuales obligatorias indicando que la IA es una herramienta de asistencia y el diagnóstico final es exclusiva responsabilidad del profesional.

---

### **5\. Esquema de Base de Datos (Código SQL para Supabase)**

El siguiente código está optimizado para PostgreSQL e incluye las tablas base y la habilitación de Row Level Security (RLS) para garantizar la privacidad de los datos de salud.

SQL  
\-- 1\. Tabla de Pacientes  
CREATE TABLE pacientes (  
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
  clinica\_id UUID NOT NULL, \-- Para multitenant (aislar datos por odontólogo/clínica)  
  nombres\_apellidos TEXT NOT NULL,  
  documento\_identidad TEXT,  
  fecha\_nacimiento DATE,  
  sexo TEXT,  
  grupo\_sanguineo TEXT,  
  telefono\_celular TEXT,  
  estado\_civil TEXT,  
  lugar\_residencia TEXT,  
  profesion TEXT,  
  contacto\_urgencia TEXT,  
  fecha\_ingreso TIMESTAMPTZ DEFAULT NOW(),  
  created\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 2\. Tabla de Antecedentes Médicos (Relación 1 a 1\)  
CREATE TABLE antecedentes\_medicos (  
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
  paciente\_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,  
  alergias TEXT,  
  problemas\_coagulacion TEXT,  
  enfermedades\_sistemicas TEXT, \-- Ej: Diabetes, Hipertensión  
  internaciones\_previas TEXT,  
  antecedentes\_familiares TEXT,  
  medicacion\_actual TEXT,  
  observaciones TEXT,  
  updated\_at TIMESTAMPTZ DEFAULT NOW()  
);

\-- 3\. Tabla del Odontograma (Histórico de piezas)  
CREATE TABLE odontograma\_registros (  
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
  paciente\_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,  
  pieza\_dental INTEGER NOT NULL, \-- Ej: 18, 47, 85  
  cara\_dental TEXT, \-- Oclusal, Mesial, Distal, etc. (Opcional)  
  estado TEXT NOT NULL, \-- Caries, Restauración, Extracción  
  notas TEXT,  
  fecha\_registro TIMESTAMPTZ DEFAULT NOW()  
);

\-- 4\. Tabla de Presupuestos (Cabecera)  
CREATE TABLE presupuestos (  
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
  paciente\_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,  
  profesional\_asignado TEXT,  
  estado TEXT DEFAULT 'Pendiente', \-- Pendiente, Aprobado, Finalizado  
  fecha\_creacion TIMESTAMPTZ DEFAULT NOW()  
);

\-- 5\. Tabla de Presupuestos (Detalle/Ítems)  
CREATE TABLE presupuestos\_detalle (  
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
  presupuesto\_id UUID REFERENCES presupuestos(id) ON DELETE CASCADE,  
  categoria TEXT, \-- Restauración, Ortodoncia, Cirugía  
  descripcion TEXT NOT NULL,  
  pieza\_dental INTEGER,  
  costo NUMERIC(10, 2\) NOT NULL,  
  fecha\_planificada TEXT \-- Ej: 'ENERO 2029'  
);

\-- 6\. Tabla de Cuenta Corriente (Caja)  
CREATE TABLE pagos (  
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
  paciente\_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,  
  tratamiento\_realizado TEXT,  
  monto\_entregado NUMERIC(10, 2\) NOT NULL,  
  fecha\_pago TIMESTAMPTZ DEFAULT NOW()  
);

\-- 7\. Tabla de Documentos y Archivos (Para el OdontólogoIA)  
CREATE TABLE documentos\_paciente (  
  id UUID DEFAULT gen\_random\_uuid() PRIMARY KEY,  
  paciente\_id UUID REFERENCES pacientes(id) ON DELETE CASCADE,  
  tipo\_archivo TEXT NOT NULL, \-- 'radiografia', 'foto\_clinica', 'pdf\_analisis'  
  url\_archivo TEXT NOT NULL, \-- Referencia al bucket de Supabase Storage  
  texto\_extraido TEXT, \-- Texto procesado para que la IA lo lea (RAG)  
  analisis\_ia TEXT, \-- Resultados o sugerencias previas generadas por la IA  
  fecha\_subida TIMESTAMPTZ DEFAULT NOW()  
);

\-- \==========================================  
\-- POLÍTICAS DE SEGURIDAD (RLS Básicas)  
\-- \==========================================  
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;  
ALTER TABLE antecedentes\_medicos ENABLE ROW LEVEL SECURITY;  
ALTER TABLE odontograma\_registros ENABLE ROW LEVEL SECURITY;  
ALTER TABLE documentos\_paciente ENABLE ROW LEVEL SECURITY;

\-- Ejemplo de política: Un usuario solo puede ver los pacientes de su propia clínica  
\-- (Requiere configurar el JWT de Supabase Auth previamente)  
\-- CREATE POLICY "Aislamiento por clinica" ON pacientes   
\-- FOR ALL USING (clinica\_id \= auth.uid());  
