# Reel Basqplan · «Una mañana en Euskadi: del caserío a la copa»

Reel 9:16, 21 s, 7 planos. Look suave y cálido, con rótulos serif en cursiva (estilo del reel de referencia de @sunny.ollie).

## Cómo montarlo con tus clips

1. Copia los clips en `clips/` con el número del plano: `01.mp4`, `02.mov`… `07.mp4` (vale vertical u horizontal).
2. Si un clip no arranca en el momento bueno, cambia su segundo de inicio en `INICIO` dentro de `montar.py`.
3. Ejecuta:

```bash
python3 montar.py
```

Resultado: `salida/reel_basqplan.mp4` y `salida/portada.jpg`. Los planos sin clip salen como tarjeta provisional indicando qué grabar.

| # | Dur. | Rótulo | Qué grabar |
|---|---|---|---|
| 1 | 3 s | **10:30** · vacas frente al Cantábrico · ZUMAIA · CASERÍO SANTA KLARA | Puerta del caserío / anfitriona recibiendo |
| 2 | 3 s | *aquí el día empieza antes* | Vacas o cabras comiendo, de cerca |
| 3 | 3 s | *y sin prisa* | Manos de la anfitriona trabajando |
| 4 | 3 s | *el Cantábrico, desde la finca* | Acantilado / flysch en plano abierto |
| 5 | 2 s | **12:30** · menos de 30 min hasta Aia | Carretera desde el coche |
| 6 | 3 s | **13:00** · cuatro txakolis · AIA · BODEGA K5 | Viñedo con mar → txakoli cayendo en la copa |
| 7 | 4 s | *Una mañana. Una sola reserva.* · GUÁRDALO… · basqplan | Brindis hacia cámara |

Graba cada plano de 5 a 6 s, en vertical, con luz de mañana y sonido ambiente.

## Música

El vídeo lleva solo el sonido ambiente de los clips. La música se añade dentro de Instagram para usar audio con licencia: la referencia usa «hope to see you again (Sped Up)» de Antent. Baja la música a un 30–40 % para que se oigan los animales y las copas.

## Texto del post

> Una mañana, dos lugares que no encontrarías juntos en una guía: visita a una granja familiar de Zumaia y cata de cuatro txakolis en Aia. Nosotros reservamos y coordinamos; vosotros solo conducís menos de 30 min entre una y otra.
>
> Guárdalo para tu próxima escapada · ficha en el enlace de la bio
>
> 📍 Zumaia · Aia, Gipuzkoa

Colaboración: invitar a Santa Klara y K5 como colaboradores solo si aceptan antes. Si no, mencionarlos y poner la ubicación «Zumaia».

---

# Reel 2 · «¿Cómo es una experiencia con basqplan?»

Vídeo de 26 s en 9:16, montado con el material propio de basqplan.com (vídeo de portada y fotos de las experiencias). Usa las tipografías de la marca (Fraunces y Space Grotesk), los colores crema, dorado y navy, y el logo.

```bash
python3 reel-basqplan/montar_experiencia.py
```

Todo es vídeo y todo vertical, recortado a 9:16 a pantalla completa. `santaklara.mp4` y `dron.mp4` son los vídeos que aportaste: no se suben al repositorio, así que hay que copiarlos en `fuentes/` antes de montar.

| Hora | Texto | Vídeo | Nota |
|---|---|---|---|
| 10:00 | ¿Cómo es una experiencia con basqplan? / despertar | Santa Klara al amanecer | — |
| 10:00 | 1. Plan | Fachada del caserío Santa Klara | — |
| 11:00 | elaboración de pan | Horno de leña con pan (`pan.webm`) | Grabado en Fuerteventura |
| 11:30 | 2. Plan | Coche por carretera entre prados (dron) | Ralentizado |
| 12:30 | llegada a la txakolindegi | Costa de Zumaia desde el aire | No sale la bodega |
| 13:00 | sirviendo las copas | Espumoso sirviéndose (`copas.webm`) | — |
| 13:30 | a comer | Comedor de Santa Klara | Ralentizado |
| — | logo + reserva | Flysch (dron) | — |

**Créditos que hay que poner en el texto del post** (los exige la licencia):
- Copas: Sarah Stierch, CC BY 4.0. https://commons.wikimedia.org/wiki/File:Turkovich_Family_Wines_-_June_2019_-_Stierch_03.ogv
- Pan: Wikimedia Commons, CC BY-SA 3.0. El autor figura en https://commons.wikimedia.org/wiki/File:Puerto_del_Rosario_-_Tefia_-_La_Alcogida_-_bread_baking_(oT)_03.ogv

Para cambiar un plano, copia el archivo en `fuentes/` y cambia `src` en `PLANOS`.
