# 📊 SeguimientoAcadémico Tracely
> Sistema de seguimiento y alertas académicas para estudiantes y docentes

---

## 🎯 ¿Qué es?

**SeguimientoAcadémico** es una plataforma web institucional que centraliza el seguimiento del rendimiento académico de los estudiantes, generando alertas tempranas y visualizaciones claras del estado académico — sin reemplazar Banner8 ni Moodle, sino complementándolos donde fallan.

---

## 🚨 El problema que resuelve

Las herramientas actuales no ofrecen:

- Una vista unificada y clara del estado académico del estudiante
- Alertas automáticas cuando un estudiante está en riesgo
- Visibilidad temprana de faltas acumuladas
- Un simulador para proyectar notas finales
- Un panel de riesgo académico grupal para docentes

> *"El estudiante se entera que va mal cuando ya es tarde."*

---

## 👥 Usuarios

| Rol | Descripción |
|---|---|
| 🧑‍🎓 Estudiante | Consulta sus notas, asistencia y alertas personales |
| 👩‍🏫 Docente | Sube notas, ve el estado del grupo y gestiona alertas |

---

## ✨ Funcionalidades principales

### Para estudiantes
- 📈 Ver notas por materia y corte académico
- 🔔 Alertas automáticas: riesgo de reprobación, exceso de faltas
- 🧮 Simulador de notas — *¿cuánto necesito en el final para pasar?*
- 📅 Calendario académico con parciales y entregas
- 📊 Dashboard de rendimiento general con gráficas

### Para docentes
- 📤 Carga de notas mediante Excel (plantilla estandarizada)
- 👁️ Vista del estado académico de todo el grupo
- ⚠️ Identificación automática de estudiantes en riesgo
- 🔔 Envío de alertas/notificaciones a estudiantes específicos

---

## ⚙️ Flujo de datos

```
Docente llena plantilla Excel
        ↓
Sube el archivo a la plataforma
        ↓
Sistema parsea y procesa las notas
        ↓
Se generan alertas automáticas
        ↓
Estudiante recibe notificación y puede ver su estado
```

> La plantilla estandarizada es provista por la plataforma, minimizando errores de formato y sin cambiar drásticamente el flujo de trabajo del docente.

---

## 🗺️ Roadmap — MVP

- [x] Definición de requerimientos
- [ ] Diseño de base de datos y roles
- [ ] Módulo de autenticación (estudiante / docente)
- [ ] Carga y parseo de Excel con notas
- [ ] Dashboard de notas y asistencia
- [ ] Motor de alertas automáticas
- [ ] Simulador de notas
- [ ] Panel grupal para docentes
- [ ] Notificaciones (correo institucional)

---

## 🛠️ Stack tecnológico

> *(Por definir según decisiones del equipo)*

**Frontend:** Web — accesible desde cualquier dispositivo y sistema operativo  
**Backend:** Por definir  
**Base de datos:** Por definir  
**Integración:** Google Drive API / carga manual de Excel (.xlsx)

---

## 🏫 Contexto institucional

Este proyecto nace como una iniciativa **oficial de la institución**, diseñada para integrarse con los procesos existentes de Banner8 y Moodle sin generar carga operativa adicional significativa para docentes ni personal administrativo.

---

## 📌 Estado del proyecto

🟡 En fase de definición y diseño

---

## 🤝 Equipo

> Michael [@stevenbisbi](https://github.com/stevenbisbi) <br/> 
> Kevin Manrique Sanchez <br/> 
> [Juan Reina](https://github.com/juanreina19) <br/> 
