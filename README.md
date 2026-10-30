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
| Apuntar hacia arriba (con dirección: en diagonal) | ↑ · W | ↑ |
| Usar · absorber · copiar (mantén) | E · I | Y |
| Cambiar de marca | Q · Tab | LB / RB |
| Pausa, mapa, páginas | Esc · P · M | Start |

En pantallas táctiles aparecen botones en pantalla.

## Qué hay en esta versión

### Prólogo (alrededor de una hora)

Cinco capítulos jugables con 33 salas y dificultad progresiva. Cada uno enseña algo nuevo:

- **I · La última noche.** Tejados de Eibar con Iker: correr, saltar, vallas, deslizarse, salto de pared, esprintar, lonas, cornisas, tendederos (tirolinas) y una carrera contrarreloj contra Iker. Después, el acantilado (rodar), el desagüe (arrastrarse) y la fortaleza en sigilo: paladines con cono de visión, ojos de cristal con foco, cajas, barriles y cortinas para esconderse. La cámara de los naipes, la huida por la torre y la carrera por las murallas.
- **II · La plaza.** Narbaiza tortura a Martín con la Marca de Sangre delante de todo el pueblo. Esa noche, Iker se despide en el callejón.
- **III · Cinco días.** El pueblo de día: recados para amona (el gato de la panadera, la red de la cofa, el barco del correo visto desde el mirador), vecinos que hablan, el reto de Ane y el montaje de los cinco días hasta la tormenta.
- **IV · La tormenta.** La casa derrumbada, las calles bajo los rayos, la copia de la Energía y la decisión.
- **V · El despertar.** El ataque al convoy en el viaducto y el bosque: disparo, absorción, **disparo hacia arriba** contra los vigías, descarga cargada contra la roca reforzada, rayo hacia abajo, dash, el campamento de la PDC y el jefe **Búho Mayor**, que solo cae disparándole desde abajo.

La historia se cuenta con **escenas animadas en el propio motor**: actores que andan, corren, caen y usan sus marcas, con cámara, bandas de cine, rayos, partículas y bocadillos. Entre salas contiguas hay una **transición de deslizamiento**, y al cambiar de capítulo, un fundido con el título.

Extras del prólogo: tres **lauburus de latón** (+1 de vida máxima), cuatro páginas de la Ascensión más y un punto de control en cada sala.

### Acto I

- **El barrio de los faroles**: la Centralita y las caracolas de bronce (guardado), la PDC que vigila y se alarma, los Acólitos y el Ancla de las cocheras, que se rompe cargando el carro de rayo de Rosa.
- **La Forja**: el pozo del velo, Unai encadenado, la copia de la **Temperatura** (con permiso), las cámaras de escarcha y el Ancla de la Antorcha, que solo se agrieta con frío y calor alternos.

### Sistemas

- **Parkour con los números de la biblia**: casillas de 16 px, resolución interna de 384 × 216, carrera de 8 casillas/s y sprint de 11, salto variable de unas 3,5 casillas, tiempo de gracia de 0,1 s, salto guardado de 0,12 s y dash de 4,5 casillas en 0,15 s. Ningún movimiento corta el impulso.
- **Absorción**: ninguna marca da poder infinito. La Energía se recarga en faroles de tormenta y cristales de rayo, y la Temperatura en braseros y arcones de escarcha.
- **Puertas de marca**: rocas con vetas (Energía), rocas reforzadas (descarga cargada), muros de fuego, hielo y cascadas (Temperatura), velos (Anclas).

## Estructura

```
index.html        lienzo, controles táctiles y carga de scripts
src/sprites.js    paletas, glifos de las marcas, personajes y poses (de la biblia) + caché de sprites
src/data.js       temas, pintor de salas, salas y guiones del Acto I
src/prologo.js    salas, escenas animadas y guiones del prólogo
src/entities.js   Jon y su física, proyectiles, PDC, vigías, Acólitos, jefe, fuentes, Anclas, actores de escena
src/render.js     casillas por tema, fondos con paralaje, clima, viñetas de las cartas y HUD
src/audio.js      efectos y música sintetizados con WebAudio
src/input.js      teclado, mando y táctil
src/game.js       bucle, estados, salas, guiones, menús, mapa y guardado (localStorage)
```

Las salas se conectan por su posición en el mundo: al salir por un borde se entra en la sala vecina de la misma zona.
