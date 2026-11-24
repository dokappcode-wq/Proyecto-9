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

| Plano | Texto | Vídeo |
|---|---|---|
| 1 | — (con despertador) | Persona mirando el mar desde un monte (basqplan.com) |
| 2 | 10:30, vacas frente al Cantábrico. | Vacas en el prado |
| 3 | — | Vaca de cuernos largos con ternero, de cerca |
| 4 | — | Manada en el prado |
| 5 | 13:00, cuatro txakolis. | Espumoso cayendo en la copa (cámara lenta) |
| 6 | — | Platos de comida de colores |
| 7 | logo + basqplan / Una sola reserva. | Flysch desde el aire (basqplan.com) |

**Créditos que hay que poner en el texto del post** (los exigen las licencias):
- Copas: Sarah Stierch, CC BY 4.0. https://commons.wikimedia.org/wiki/File:Turkovich_Family_Wines_-_June_2019_-_Stierch_03.ogv
- Comida: Sarah Stierch, CC BY 4.0. https://commons.wikimedia.org/wiki/File:Yuca_Mami_-_February_2024_-_Sarah_Stierch.webm
- Ganado (planos 3 y 4): CC BY-SA 4.0. El autor figura en https://commons.wikimedia.org/wiki/File:Eine_Herde_Schottische_Hochlandrinder_auf_einer_Weide_bei_Bederwitz_(482).webm y en el (488).
- Vacas (plano 2): «Cattle near Aberfeldy», CC0. No exige crédito.

Para cambiar un plano, copia el archivo en `fuentes/` y cambia `src` en `PLANOS`.
