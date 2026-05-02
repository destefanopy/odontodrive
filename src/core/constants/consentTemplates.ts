export const CONSENT_TEMPLATES = {
  general: {
    title: "Consentimiento Informado Odontológico General",
    content: `
Yo, **{{paciente_nombre}}**, con documento de identidad **{{paciente_documento}}**, domiciliado en **{{paciente_direccion}}**, autorizo al odontólogo/a **{{doctor_nombre}}**, con Registro Profesional N° **{{doctor_registro}}**, a realizar los procedimientos odontológicos generales y tratamientos de rutina necesarios para mi salud bucal.

He sido informado/a, en un lenguaje claro y sencillo, sobre:
1. El diagnóstico de mi estado de salud bucodental actual.
2. Los objetivos del tratamiento propuesto, sus beneficios esperados y las alternativas disponibles (si las hubiere).
3. Los riesgos inherentes a los procedimientos clínicos rutinarios, tales como molestias postoperatorias leves, sensibilidad temporal, inflamación leve o sangrado menor.
4. La necesidad potencial de utilizar anestesia local y sus posibles efectos adversos (alergias raras, parestesia temporal).

Comprendo que la odontología no es una ciencia exacta y que no se me pueden garantizar resultados absolutos. Me comprometo a seguir las indicaciones postoperatorias, instrucciones de higiene y acudir a las citas de control programadas.

Confirmo que he leído y comprendido íntegramente este documento, que he tenido la oportunidad de aclarar todas mis dudas y que doy mi consentimiento libre y voluntario para iniciar el tratamiento.

En **{{ciudad}}**, **{{pais}}**, a los **{{fecha_dia}}** días del mes de **{{fecha_mes}}** del año **{{fecha_anio}}**.
`
  },
  extraccion: {
    title: "Consentimiento Informado para Extracción Dental (Exodoncia)",
    content: `
Yo, **{{paciente_nombre}}**, con documento de identidad **{{paciente_documento}}**, autorizo al odontólogo/a **{{doctor_nombre}}**, con Registro Profesional N° **{{doctor_registro}}**, a realizar la extracción (exodoncia) de la(s) pieza(s) dental(es) acordada(s) previamente en mi plan de tratamiento.

Se me ha explicado detalladamente:
1. Que el procedimiento consiste en la remoción quirúrgica de la pieza dental y requiere anestesia local.
2. Las alternativas posibles a la extracción y las consecuencias de no realizar el procedimiento (infección severa, dolor, quistes, etc.).
3. Los riesgos quirúrgicos y postoperatorios que incluyen, pero no se limitan a:
   - Dolor, inflamación y aparición de hematomas (moretones).
   - Sangrado postoperatorio prolongado.
   - Infección postoperatoria (alveolitis) que puede requerir tratamiento adicional.
   - Daño a dientes adyacentes o restauraciones cercanas durante la maniobra quirúrgica.
   - Parestesia (pérdida temporal o muy raramente permanente de la sensibilidad) en labio, lengua o mentón si la pieza está cerca de nervios sensitivos, especialmente en terceros molares (muelas del juicio).
   - Comunicación bucosinusal en el caso de extracciones de piezas superiores.

Reconozco que no se pueden dar garantías absolutas sobre los resultados de la cirugía. Me comprometo a cumplir estrictamente con la medicación recetada y los cuidados indicados tras la extracción (dieta blanda, no escupir, no usar pajitas, aplicar frío).

He leído, comprendido y resuelto todas mis dudas. Doy mi autorización de manera libre y consciente.

En **{{ciudad}}**, **{{pais}}**, a los **{{fecha_dia}}** días del mes de **{{fecha_mes}}** del año **{{fecha_anio}}**.
`
  },
  endodoncia: {
    title: "Consentimiento Informado para Tratamiento de Conducto (Endodoncia)",
    content: `
Yo, **{{paciente_nombre}}**, con documento de identidad **{{paciente_documento}}**, autorizo al odontólogo/a **{{doctor_nombre}}**, con Registro Profesional N° **{{doctor_registro}}**, a realizar un tratamiento de conducto (endodoncia) en la(s) pieza(s) dental(es) diagnosticada(s).

He sido informado/a que el procedimiento consiste en la eliminación del tejido pulpar (nervio) infectado o inflamado, limpieza, desinfección y posterior sellado de los conductos radiculares para intentar salvar la pieza dental.

Se me han explicado los siguientes riesgos y posibles complicaciones:
1. Dolor o inflamación postoperatoria que puede durar varios días.
2. Dificultades anatómicas (conductos calcificados, curvos o bloqueados) que impidan la instrumentación completa.
3. Separación (fractura) de pequeños instrumentos dentro del conducto, lo cual puede requerir cirugía periapical, derivación a un especialista o, en el peor de los casos, la extracción del diente.
4. Perforación de la raíz o de la cámara pulpar.
5. Infección persistente que haga necesario un retratamiento endodóntico, cirugía o extracción.
6. Fractura coronaria o radicular de la pieza dentaria debido a su fragilidad natural tras el tratamiento, por lo cual es obligatorio colocar una restauración definitiva o corona a la brevedad posible.

Entiendo que la alternativa a este tratamiento es la extracción del diente. Se me ha garantizado que se emplearán todos los medios y técnicas actuales para lograr el éxito del tratamiento, aunque comprendo que en medicina no existen garantías del 100%.

Declaro haber leído, entendido y aclarado todas mis dudas, prestando mi conformidad para la realización del tratamiento.

En **{{ciudad}}**, **{{pais}}**, a los **{{fecha_dia}}** días del mes de **{{fecha_mes}}** del año **{{fecha_anio}}**.
`
  }
};
