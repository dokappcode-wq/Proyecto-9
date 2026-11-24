#!/usr/bin/env python3
"""Monta el reel «Una mañana en Euskadi» de Basqplan (9:16, ~21 s).

Uso:
    python3 montar.py            -> genera salida/reel_basqplan.mp4

Pon tus clips en clips/ con el número del plano: 01.mp4, 02.mov, ... 07.mp4.
Si falta un clip, ese plano sale como tarjeta provisional que indica qué grabar.
Del clip se usa el tramo que empieza en el segundo indicado en INICIO (por defecto 0).
"""
import os, glob, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = os.path.dirname(os.path.abspath(__file__))
W, H = 1080, 1920
XF = 0.35  # duración del fundido entre planos
F_SERIF = os.path.join(BASE, "fonts/Cormorant.ttf")
F_ITAL = os.path.join(BASE, "fonts/Cormorant-Italic.ttf")
F_SANS = os.path.join(BASE, "fonts/Inter.ttf")
CREMA = (246, 240, 228)

# Segundo del clip original desde el que empezar cada plano (ajústalo tras grabar).
INICIO = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0}

# n, duración, hora grande, línea en cursiva, línea pequeña, qué grabar (provisional)
PLANOS = [
    (1, 3.0, "10:30", "vacas frente al Cantábrico", "ZUMAIA · CASERÍO SANTA KLARA",
     "Puerta del caserío abriéndose o la anfitriona recibiendo. Luz de mañana."),
    (2, 3.0, None, "aquí el día empieza antes", None,
     "Animales de cerca: vacas o cabras comiendo. Sonido ambiente."),
    (3, 3.0, None, "y sin prisa", None,
     "Manos de la anfitriona trabajando: ordeñar, dar de comer, el queso."),
    (4, 3.0, None, "el Cantábrico, desde la finca", None,
     "Plano abierto del acantilado / flysch. Viento y mar."),
    (5, 2.0, "12:30", "menos de 30 min hasta Aia", None,
     "Carretera desde el coche, ventanilla bajada. Solo 2 s."),
    (6, 3.0, "13:00", "cuatro txakolis", "AIA · BODEGA K5",
     "Viñedo con el mar al fondo -> el txakoli cayendo en la copa."),
    (7, 4.0, None, "Una mañana. Una sola reserva.", "GUÁRDALO PARA TU PRÓXIMA ESCAPADA",
     "Brindis: dos copas chocando hacia cámara."),
]


def font(path, size, wght=None):
    f = ImageFont.truetype(path, size)
    if wght:
        try:
            f.set_variation_by_axes([wght] if "Cormorant" in path else [14, wght])
        except Exception:
            pass
    return f


def texto_sombra(img, xy, txt, fnt, anchor="mm", fill=CREMA, sombra=110, radio=14):
    capa = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(capa).text(xy, txt, font=fnt, fill=(0, 0, 0, sombra), anchor=anchor)
    capa = capa.filter(ImageFilter.GaussianBlur(radio))
    img.alpha_composite(capa)
    ImageDraw.Draw(img).text(xy, txt, font=fnt, fill=fill + (255,), anchor=anchor)


def overlay(plano, path):
    n, dur, hora, cursiva, peq, _ = plano
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    # degradado inferior suave para legibilidad
    grad = Image.new("L", (1, H))
    for y in range(H):
        t = max(0, (y - H * 0.45) / (H * 0.55))
        grad.putpixel((0, y), int(150 * t ** 1.6))
    sombra = Image.new("RGBA", (W, H), (20, 16, 12, 0))
    sombra.putalpha(grad.resize((W, H)))
    img.alpha_composite(sombra)

    y = H * 0.70
    if n == 7:
        y = H * 0.60
    if hora:
        texto_sombra(img, (W / 2, y), hora, font(F_SERIF, 190, 500))
        y += 140
    if cursiva:
        size = 84 if n != 7 else 76
        texto_sombra(img, (W / 2, y), cursiva, font(F_ITAL, size, 450))
        y += 95
    if peq:
        f = font(F_SANS, 30, 500)
        txt = " ".join(list(peq))  # versalitas espaciadas
        texto_sombra(img, (W / 2, y + 10), txt, f, sombra=140, radio=8)
    if n == 7:
        texto_sombra(img, (W / 2, H * 0.86), "basqplan", font(F_SERIF, 64, 600))
        texto_sombra(img, (W / 2, H * 0.86 + 58), "ficha en el enlace de la bio",
                     font(F_SANS, 28, 400), sombra=140, radio=8)
    img.save(path)


def provisional(plano, path):
    n, _, _, _, _, grabar = plano
    paletas = {1: ((150, 165, 160), (70, 82, 78)), 2: ((132, 150, 112), (56, 70, 50)),
               3: ((170, 150, 125), (78, 64, 52)), 4: ((150, 172, 186), (52, 70, 86)),
               5: ((160, 160, 150), (64, 64, 60)), 6: ((178, 180, 130), (70, 78, 52)),
               7: ((196, 172, 120), (86, 66, 40))}
    a, b = paletas[n]
    img = Image.new("RGB", (W, H))
    d = ImageDraw.Draw(img)
    for y in range(H):
        t = y / H
        d.line([(0, y), (W, y)], fill=tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3)))
    d.rounded_rectangle([90, 200, W - 90, 560], 28, outline=CREMA, width=3)
    d.text((W / 2, 270), f"PLANO {n:02d} · PROVISIONAL", font=font(F_SANS, 34, 600),
           fill=CREMA, anchor="mm")
    # texto envuelto
    f = font(F_SANS, 34, 400)
    palabras, lineas, l = grabar.split(), [], ""
    for p in palabras:
        if d.textlength(l + " " + p, font=f) > W - 260:
            lineas.append(l.strip()); l = p
        else:
            l += " " + p
    lineas.append(l.strip())
    for i, li in enumerate(lineas[:4]):
        d.text((W / 2, 350 + i * 50), li, font=f, fill=CREMA, anchor="mm")
    d.text((W / 2, 520), f"sustituir por clips/{n:02d}.mp4", font=font(F_SANS, 26, 400),
           fill=(230, 225, 215), anchor="mm")
    img.save(path)


def run(cmd):
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)


def tiene_audio(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
                        "stream=index", "-of", "csv=p=0", p], capture_output=True, text=True)
    return bool(r.stdout.strip())


# Look: negros levantados, cálido suave, algo de grano (en la línea del reel de referencia)
LOOK = ("eq=contrast=0.94:saturation=0.9:gamma=1.03,"
        "colorbalance=rs=0.03:bs=-0.04:rm=0.02:bm=-0.02,"
        "curves=all='0/0.05 0.5/0.52 1/0.96',noise=alls=6:allf=t")


def segmento(plano, tmp, ultimo):
    n, dur = plano[0], plano[1]
    d = dur + (0 if ultimo else XF)
    ov = os.path.join(tmp, f"ov{n}.png"); overlay(plano, ov)
    out = os.path.join(tmp, f"seg{n}.mp4")
    clip = sorted(glob.glob(os.path.join(BASE, "clips", f"{n:02d}.*")))
    fade_txt = f"fade=t=in:st=0.15:d=0.45:alpha=1"
    if clip:
        src = clip[0]
        # escala a 110 % y desplazamiento lento (Ken Burns suave)
        vf = (f"[0:v]scale={int(W*1.1)}:{int(H*1.1)}:force_original_aspect_ratio=increase,"
              f"crop={int(W*1.1)}:{int(H*1.1)},"
              f"crop={W}:{H}:x='(in_w-{W})*t/{d}':y='(in_h-{H})/2',fps=30,{LOOK},format=yuv420p[b];"
              f"[1:v]format=rgba,{fade_txt}[t];[b][t]overlay=0:0,format=yuv420p[v]")
        cmd = ["ffmpeg", "-y", "-ss", str(INICIO[n]), "-t", str(d), "-i", src,
               "-loop", "1", "-t", str(d), "-i", ov]
        if tiene_audio(src):
            amap = ["-map", "0:a", "-af", "aresample=48000,volume=0.9"]
        else:
            cmd += ["-f", "lavfi", "-t", str(d), "-i", "anullsrc=r=48000:cl=stereo"]
            amap = ["-map", "2:a"]
    else:
        ph = os.path.join(tmp, f"ph{n}.png"); provisional(plano, ph)
        vf = (f"[0:v]scale={int(W*1.06)}:{int(H*1.06)},"
              f"crop={W}:{H}:x='(in_w-{W})*t/{d}':y='(in_h-{H})/2',fps=30,{LOOK},format=yuv420p[b];"
              f"[1:v]format=rgba,{fade_txt}[t];[b][t]overlay=0:0,format=yuv420p[v]")
        cmd = ["ffmpeg", "-y", "-loop", "1", "-t", str(d), "-i", ph,
               "-loop", "1", "-t", str(d), "-i", ov,
               "-f", "lavfi", "-t", str(d), "-i", "anullsrc=r=48000:cl=stereo"]
        amap = ["-map", "2:a"]
    cmd += ["-filter_complex", vf, "-map", "[v]"] + amap + [
        "-t", str(d), "-c:v", "libx264", "-preset", "medium", "-crf", "18",
        "-c:a", "aac", "-ar", "48000", "-ac", "2", out]
    run(cmd)
    return out, d


def main():
    tmp = os.path.join(BASE, "salida", "tmp"); os.makedirs(tmp, exist_ok=True)
    segs = [segmento(p, tmp, i == len(PLANOS) - 1) for i, p in enumerate(PLANOS)]
    inputs, fc = [], []
    for s, _ in segs:
        inputs += ["-i", s]
    off, vprev, aprev = 0.0, "0:v", "0:a"
    for i in range(1, len(segs)):
        off += segs[i - 1][1] - XF
        fc.append(f"[{vprev}][{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[v{i}]")
        fc.append(f"[{aprev}][{i}:a]acrossfade=d={XF}[a{i}]")
        vprev, aprev = f"v{i}", f"a{i}"
    total = sum(p[1] for p in PLANOS)
    fc.append(f"[{vprev}]fade=t=out:st={total-0.6}:d=0.6[vf]")
    out = os.path.join(BASE, "salida", "reel_basqplan.mp4")
    run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[vf]",
         "-map", f"[{aprev}]", "-c:v", "libx264", "-preset", "medium", "-crf", "18",
         "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out])
    run(["ffmpeg", "-y", "-ss", "1.5", "-i", out, "-frames:v", "1",
         os.path.join(BASE, "salida", "portada.jpg")])
    shutil.rmtree(tmp)
    print("Listo:", out)


if __name__ == "__main__":
    main()
