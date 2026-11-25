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

Todo es vídeo, todo vertical y en HD. Dura 30 s, con unos 4 s por plano. El montaje lleva un zoom lento sobre cada plano, transiciones variadas, textos que entran deslizándose sobre bandas navy y una barra dorada de progreso abajo. `portada.mp4` (de basqplan.com) no se sube al repositorio, así que hay que copiarlo en `fuentes/` antes de montar.

Solo lleva tres textos, todos en la parte de abajo: «10:30, vacas frente al Cantábrico.» / «13:00, cuatro txakolis.» / «Una sola reserva.». Al final aparecen el logo y el nombre «basqplan» debajo.

Estructura: «UN DÍA CON basqplan» → 9:00 → 10:00 ganadería en Santa Klara → 13:00 txakoli en K5 → final. Dura 27 s. Todo llena la pantalla: los collages son 3 franjas de 1080×640 apiladas, sin huecos.

| Plano | Texto | Vídeo |
|---|---|---|
| 1 | UN DÍA CON + logo + basqplan | Flysch desde el aire (basqplan.com) |
| 2 | En el centro: 9:00 · Despertar (con despertador) | Persona contemplando el mar desde un monte (basqplan.com) |
| 3 | 10:00 / Ganadería frente al Cantábrico | Collage Santa Klara: vacas junto al caserío y el mar · niños corriendo · familia con las cabras |
| 4 | — | Collage Santa Klara: niños con el poni · vaca con terneros · paseo en poni |
| 5 | 13:00, cuatro txakolis. | Collage K5: abriendo la botella · chicas catando frente al mar · paseo por el viñedo |
| 6 | — | Collage K5: cata en la mesa con el chef · selección de uva · viñedo desde el aire |
| 7 | logo + basqplan / Una sola reserva. | Flysch desde el aire (basqplan.com) |

`santaklara.mp4` y `k5.mp4` (vídeos promocionales de Santa Klara y Bodega K5) no se suben al repositorio. Hay que copiarlos en `fuentes/` antes de montar, y **hace falta permiso de los dos** para publicarlos.

**Audio:** la música suena desde el principio y baja mientras suena el despertador del «9:00». Es «Long Trail» de Kevin MacLeod, con fundido de entrada y de salida.

**Créditos que hay que poner en el texto del post:**
- Despertador: «Alarm clock - 01», Wikimedia Commons, CC BY-SA 4.0. El autor figura en https://commons.wikimedia.org/wiki/File:Alarm_clock_-_01.ogg
- Música: «Long Trail», Kevin MacLeod (incompetech.com). Commons la marca como dominio público; citarlo es buena práctica.
- El resto de imágenes son de basqplan.com, Santa Klara y Bodega K5. Para estas dos últimas hace falta su permiso, y se recomienda etiquetarlas como colaboradoras.

Para cambiar un plano, copia el archivo en `fuentes/` y cambia `src` en `PLANOS`.
