# Ascend

Plataformas 2D en pixel art basado en la **Biblia de Ascend**. Jon, un chico de Eibar, nace la noche de la fortaleza con la marca del **Destino**: puede copiar las marcas de los demás sin quitárselas. Ibaia está encerrada en diez velos de luz ámbar, y cada velo cae al romper su Ancla.

Todo se dibuja píxel a píxel con código (los sprites, el esqueleto y las poses salen del sistema de la biblia). No hay imágenes ni dependencias, y no hace falta compilar nada.

## Cómo jugar

Abre `index.html` en un navegador. Si el navegador bloquea los scripts al abrir el archivo directamente, sirve la carpeta:

```bash
python3 -m http.server 8000
```

Luego entra en `http://localhost:8000`.

| Acción | Teclado | Mando |
| --- | --- | --- |
| Mover | ← → · A D | Cruceta / stick |
| Saltar (suelta antes: salto corto) | Espacio · Z · K | A |
| Agacharse · deslizarse · rodar al caer | ↓ · S | ↓ |
| Disparo de la marca (mantén: carga) | X · J | X |
| Poder de la marca | C · L | RT |
| Dash en el aire (Energía) | Shift · V | B |
| Usar · absorber · copiar (mantén) | E · ↑ | Y |
| Cambiar de marca | Q · Tab | LB / RB |
| Pausa, mapa, páginas | Esc · P · M | Start |

En pantallas táctiles aparecen botones en pantalla.

## Qué hay en esta versión

- **Prólogo jugable**: los tejados de Eibar con Iker (tutorial de parkour), la fortaleza en sigilo, la cámara de los naipes, la huida por la torre con tirolina, la tormenta, la copia de la Energía al Desconocido y la decisión (matarle o perdonarle), el bosque del viaducto y la primera vista de Ibaia.
- **Acto I, barrio 1, El barrio de los faroles**: la Centralita y las caracolas de bronce (guardado), Txema, Pello, los tejados, la PDC que vigila y se alarma, los Acólitos, y el Ancla de las cocheras, que se rompe cargando el carro de rayo de Rosa.
- **Acto I, barrio 2, La Forja**: el pozo del velo, Unai encadenado, la copia de la **Temperatura** (con permiso), las cámaras de escarcha y el Ancla de la Antorcha, que solo se agrieta con frío y calor alternos.
- **Parkour con los números de la biblia**: casillas de 16 px, resolución interna 384 × 216, carrera de 8 casillas/s y sprint de 11, salto variable de unas 3,5 casillas, tiempo de gracia de 0,1 s, salto guardado de 0,12 s, dash de 4,5 casillas en 0,15 s, salto de pared, cornisas, vallas, deslizamiento y rodar para evitar el daño por caída. Ningún movimiento corta el impulso.
- **Absorción**: ninguna marca da poder infinito. La Energía se recarga en faroles de tormenta y cristales de rayo, y la Temperatura en braseros y arcones de escarcha. Las fuentes también se vacían y tardan en recuperarse.
- **Puertas de marca**: rocas con vetas azules (Energía), muros de fuego, hielo y cascadas (Temperatura), velos (Anclas). El mapa marca con «!» las salas donde falta una marca.
- **Cuatro páginas de la Ascensión** coleccionables.

## Estructura

```
index.html        lienzo, controles táctiles y carga de scripts
src/sprites.js    paletas, glifos de las marcas, personajes y poses (de la biblia) + caché de sprites
src/data.js       salas (con un «pintor» de casillas), temas, guiones y textos
src/entities.js   Jon y su física, proyectiles, PDC, vigías, Acólitos, fuentes, Anclas, objetos
src/render.js     casillas por tema, fondos con paralaje, clima, viñetas de las cartas y HUD
src/audio.js      efectos y música sintetizados con WebAudio
src/input.js      teclado, mando y táctil
src/game.js       bucle, estados, salas, guiones, menús, mapa y guardado (localStorage)
```

Las salas se conectan por su posición en el mundo: al salir por un borde se entra en la sala vecina de la misma zona.
