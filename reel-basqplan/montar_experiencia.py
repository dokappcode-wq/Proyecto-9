#!/usr/bin/env python3
"""Reel «¿Cómo es una experiencia con basqplan?» (9:16).

    python3 montar_experiencia.py   -> salida/experiencia_basqplan.mp4

Cada plano usa un archivo de fuentes/ (foto o vídeo). Para cambiar un plano por
material nuevo, cambia "src" en PLANOS (foto .jpg/.png o vídeo .mp4/.mov).
"""
import os, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BASE = os.path.dirname(os.path.abspath(__file__))
FU = lambda p: os.path.join(BASE, "fuentes", p)
W, H, FPS = 1080, 1920, 30
XF = 0.3
CREAM, GOLD, NAVY = (247, 243, 236), (201, 168, 107), (16, 24, 37)
SERIF, SERIF_I, SANS = (os.path.join(BASE, "fonts", f) for f in
                        ("Fraunces.ttf", "Fraunces-Italic.ttf", "SpaceGrotesk.ttf"))

# src: archivo; half: 0/1 para fotos dobles de la web (izq/dcha); focus: punto hacia el que
# se acerca la cámara (x, y en 0-1); zoom: acercamiento final; ss: segundo de inicio (vídeo)
PLANOS = [
    dict(src="nosotros-bilbao.jpg", dur=4.0, focus=(0.62, 0.35), zoom=1.10, intro=True,
         hora="10:00", sub="despertar"),
    dict(src="pagoeta-txakoli.jpg", half=0, dur=3.0, focus=(0.62, 0.62), zoom=1.30,
         hora="10:00", sub="1. Plan"),
    dict(src="k5-ceramica.jpg", half=1, dur=3.0, focus=(0.45, 0.75), zoom=1.12,
         hora="11:00", sub="elaboración de pan"),
    dict(src="costa.mp4", dur=3.0, ss=0.0, hora="11:30", sub="2. Plan"),
    dict(src="barco-flysch-ganeta.jpg", half=1, dur=3.0, focus=(0.6, 0.55), zoom=1.15,
         hora="12:30", sub="llegada a la txakolindegi"),
    dict(src="granja-txakoli.jpg", half=1, dur=3.0, focus=(0.45, 0.45), zoom=1.10,
         hora="13:00", sub="sirviendo las copas"),
    dict(src="pagoeta-anchoas-getaria.jpg", half=1, dur=3.0, focus=(0.4, 0.8), zoom=1.12,
         hora="13:30", sub="a comer"),
    dict(src="flysch.mp4", dur=4.0, ss=0.0, final=True),
]


def font(path, size, wght=400, opsz=None):
    f = ImageFont.truetype(path, size)
    try:
        vals = []
        for ax in f.get_variation_axes():
            n = ax["name"] if isinstance(ax["name"], str) else ax["name"].decode()
            n = n.lower()
            if "weight" in n: vals.append(wght)
            elif "optical" in n: vals.append(opsz or min(max(size / 2, ax["minimum"]), ax["maximum"]))
            else: vals.append(ax["default"])
        f.set_variation_by_axes(vals)
    except Exception:
        pass
    return f


def lienzo():
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def texto(img, xy, txt, fnt, fill=CREAM, sombra=120, radio=16, tracking=0):
    d0 = ImageDraw.Draw(img)
    if tracking:
        total = sum(d0.textlength(c, font=fnt) for c in txt) + tracking * (len(txt) - 1)
        x = xy[0] - total / 2
        capa = Image.new("RGBA", img.size, (0, 0, 0, 0)); dc = ImageDraw.Draw(capa)
        pos = []
        for c in txt:
            pos.append((x, c)); x += d0.textlength(c, font=fnt) + tracking
        for x, c in pos: dc.text((x, xy[1]), c, font=fnt, fill=(0, 0, 0, sombra), anchor="lm")
        img.alpha_composite(capa.filter(ImageFilter.GaussianBlur(radio)))
        for x, c in pos: d0.text((x, xy[1]), c, font=fnt, fill=fill + (255,), anchor="lm")
        return
    capa = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(capa).multiline_text(xy, txt, font=fnt, fill=(0, 0, 0, sombra), anchor="mm",
                                        align="center", spacing=10)
    img.alpha_composite(capa.filter(ImageFilter.GaussianBlur(radio)))
    d0.multiline_text(xy, txt, font=fnt, fill=fill + (255,), anchor="mm", align="center", spacing=10)


def velo(img, arriba=True, abajo=True, fuerza=150):
    """Degradados suaves arriba/abajo para que el texto se lea sobre cualquier fondo."""
    g = Image.new("L", (1, H))
    for y in range(H):
        a = 0
        if arriba and y < H * 0.22: a = 110 * (1 - y / (H * 0.22)) ** 1.5
        if abajo and y > H * 0.55: a = max(a, fuerza * ((y - H * 0.55) / (H * 0.45)) ** 1.6)
        g.putpixel((0, y), int(a))
    c = Image.new("RGBA", (W, H), NAVY + (0,)); c.putalpha(g.resize((W, H)))
    img.alpha_composite(c)


def reloj(img, hora):
    texto(img, (W / 2, 250), hora, font(SERIF, 118, 500), radio=12)
    d = ImageDraw.Draw(img)
    d.line([(W / 2 - 34, 338), (W / 2 + 34, 338)], fill=GOLD + (255,), width=3)


def subtitulo(img, s):
    texto(img, (W / 2, H * 0.80), s, font(SERIF_I, 92 if s[:2] in ("1.", "2.") else 82, 400))


def capas(p, tmp, i):
    """Devuelve [(png, inicio, fin, fade_in, fade_out)] para el plano."""
    out = []
    def guarda(img, nombre, t0, t1, fi=0.3, fo=0.0):
        path = os.path.join(tmp, f"c{i}_{nombre}.png"); img.save(path); out.append((path, t0, t1, fi, fo))
    if p.get("intro"):
        a = lienzo(); velo(a, arriba=False)
        texto(a, (W / 2, H * 0.47), "¿Cómo es una\nexperiencia con\nbasqplan?", font(SERIF, 104, 500), radio=18)
        guarda(a, "pregunta", 0.0, 1.8, fi=0.25, fo=0.3)
        b = lienzo(); velo(b, arriba=False)
        texto(b, (W / 2, H * 0.47), p["hora"], font(SERIF, 280, 500), radio=20)
        texto(b, (W / 2, H * 0.47 + 200), p["sub"], font(SERIF_I, 88, 400))
        guarda(b, "hora", 1.8, p["dur"] + XF, fi=0.3, fo=0.45)
    elif p.get("final"):
        a = Image.new("RGBA", (W, H), NAVY + (105,)); velo(a, arriba=False, fuerza=200)
        logo = Image.open(FU("logo_crema.png")).convert("RGBA"); lw = 300
        logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
        a.alpha_composite(logo, (int(W / 2 - lw / 2), int(H * 0.58)))
        texto(a, (W / 2, H * 0.58 + logo.height + 70), "basqplan", font(SERIF, 92, 500))
        texto(a, (W / 2, H * 0.58 + logo.height + 160), "RESERVA EN EL ENLACE DE LA BIO",
              font(SANS, 30, 500), fill=GOLD, tracking=6, sombra=150, radio=8)
        guarda(a, "final", 0.6, p["dur"], fi=0.6)
    else:
        a = lienzo(); velo(a); reloj(a, p["hora"]); guarda(a, "reloj", 0.0, p["dur"] + XF, fi=0.35)
        b = lienzo(); subtitulo(b, p["sub"]); guarda(b, "sub", 0.35, p["dur"] + XF, fi=0.35)
    return out


def recorte_916(p, tmp, i):
    im = Image.open(FU(p["src"])).convert("RGB")
    w, h = im.size
    if "half" in p:
        im = im.crop((p["half"] * w // 2, 0, (p["half"] + 1) * w // 2, h)); w, h = im.size
    fx = p.get("focus", (0.5, 0.5))[0]
    if w / h > 9 / 16:
        cw = int(h * 9 / 16); x = int(min(max(fx * w - cw / 2, 0), w - cw)); im = im.crop((x, 0, x + cw, h))
    else:
        ch = int(w * 16 / 9); y = (h - ch) // 2; im = im.crop((0, y, w, y + ch))
    im = im.resize((W * 2, H * 2), Image.LANCZOS)
    path = os.path.join(tmp, f"base{i}.png"); im.save(path); return path


LOOK = ("eq=contrast=0.96:saturation=0.92:gamma=1.02,"
        "colorbalance=rs=0.02:bs=-0.03:rm=0.01:bm=-0.02,noise=alls=5:allf=t")


def segmento(p, tmp, i, ultimo):
    d = p["dur"] + (0 if ultimo else XF)
    n = int(round(d * FPS))
    if p["src"].lower().endswith((".mp4", ".mov", ".webm", ".m4v")):
        cmd = ["ffmpeg", "-y", "-ss", str(p.get("ss", 0)), "-t", str(d), "-i", FU(p["src"])]
        base = (f"[0:v]scale=-2:{int(H*1.06)},crop={W}:{H}:x='(in_w-{W})/2+(in_w-{W})*0.04*(t/{d}-0.5)':"
                f"y='(in_h-{H})/2',fps={FPS},setsar=1")
    else:
        img = recorte_916(p, tmp, i)
        fx, fy = p.get("focus", (0.5, 0.5)); z = p.get("zoom", 1.1)
        cmd = ["ffmpeg", "-y", "-loop", "1", "-framerate", str(FPS), "-t", str(d), "-i", img]
        # acercamiento suave (ease-out) hacia el punto focal
        zexpr = f"1+({z}-1)*(1-pow(1-on/{n},2))"
        base = (f"[0:v]zoompan=z='{zexpr}':d=1:s={W}x{H}:fps={FPS}:"
                f"x='max(0,min(iw-iw/zoom,{fx}*iw-iw/zoom/2))':y='max(0,min(ih-ih/zoom,{fy}*ih-ih/zoom/2))',setsar=1")
    fc = [f"{base},{LOOK},format=yuv420p[b0]"]
    prev = "b0"
    for k, (png, t0, t1, fi, fo) in enumerate(capas(p, tmp, i)):
        cmd += ["-loop", "1", "-framerate", str(FPS), "-t", str(d), "-i", png]
        f = f"[{k+1}:v]format=rgba,fade=t=in:st={t0}:d={fi}:alpha=1"
        if fo: f += f",fade=t=out:st={t1-fo}:d={fo}:alpha=1"
        fc.append(f + f"[t{k}]")
        fc.append(f"[{prev}][t{k}]overlay=0:0:enable='between(t,{t0},{t1})'[b{k+1}]")
        prev = f"b{k+1}"
    out = os.path.join(tmp, f"seg{i}.mp4")
    cmd += ["-filter_complex", ";".join(fc), "-map", f"[{prev}]", "-t", str(d), "-an",
            "-c:v", "libx264", "-preset", "medium", "-crf", "17", "-pix_fmt", "yuv420p", out]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    return out, d


def main():
    tmp = os.path.join(BASE, "salida", "tmp_exp"); os.makedirs(tmp, exist_ok=True)
    segs = [segmento(p, tmp, i, i == len(PLANOS) - 1) for i, p in enumerate(PLANOS)]
    total = sum(p["dur"] for p in PLANOS)
    inputs, fc, off, prev = [], [], 0.0, "0:v"
    for s, _ in segs: inputs += ["-i", s]
    for i in range(1, len(segs)):
        off += segs[i - 1][1] - XF
        fc.append(f"[{prev}][{i}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[v{i}]")
        prev = f"v{i}"
    fc.append(f"[{prev}]fade=t=out:st={total-0.5}:d=0.5[vf]")
    # despertador: pitidos de 1 kHz en ráfagas, que se apagan al aparecer el primer plan
    alarma = ("aevalsrc='0.32*(sin(2*PI*1040*t)+0.35*sin(2*PI*2080*t))*lt(mod(t,0.2),0.1)"
              f"*lt(mod(t,1),0.8)*lt(t,3.6)':s=48000:d={total}")
    fc.append(f"{alarma},afade=t=in:d=0.05,afade=t=out:st=3.0:d=0.7,aformat=channel_layouts=stereo[a]")
    out = os.path.join(BASE, "salida", "experiencia_basqplan.mp4")
    subprocess.run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(fc), "-map", "[vf]", "-map", "[a]",
                    "-t", str(total), "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p",
                    "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", out],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    subprocess.run(["ffmpeg", "-y", "-ss", "0.8", "-i", out, "-frames:v", "1",
                    os.path.join(BASE, "salida", "experiencia_portada.jpg")],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    shutil.rmtree(tmp)
    print("Listo:", out, f"({total:.0f} s)")


if __name__ == "__main__":
    main()
