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
XF = 0.5
CREAM, GOLD, NAVY = (247, 243, 236), (201, 168, 107), (16, 24, 37)
SERIF, SERIF_I, SANS = (os.path.join(BASE, "fonts", f) for f in
                        ("Fraunces.ttf", "Fraunces-Italic.ttf", "SpaceGrotesk.ttf"))

# src: archivo; half: 0/1 para fotos dobles de la web (izq/dcha); focus: punto hacia el que
# se acerca la cámara (x, y en 0-1); zoom: acercamiento final; ss: segundo de inicio (vídeo)
# Todo vídeo y todo vertical (recorte 9:16 a pantalla completa).
#   santaklara.mp4 / dron.mp4: vídeos aportados (640x360).
#   pan.webm: Wikimedia Commons, «Puerto del Rosario - Tefia - La Alcogida - bread baking (oT) 03» (CC BY-SA 3.0).
#   copas.webm: Wikimedia Commons, «Turkovich Family Wines - June 2019 - Stierch 03», Sarah Stierch (CC BY 4.0).
# crop: zona útil del original (sin bandas negras); fx: centro horizontal del recorte vertical (0-1);
# speed < 1 ralentiza para alargar planos cortos.
DRON = (640, 288, 0, 36)
# portada.mp4 = vídeo de basqplan.com (1920x1080, el más nítido).
PLANOS = [
    dict(src="portada.mp4", ss=57.8, dur=5.0, speed=0.85, fx=0.6, intro=True, hora="10:00", sub="Despertar"),
    dict(src="santaklara.mp4", ss=28.1, dur=4.0, speed=0.8, fx=0.56, limpia=True, hora="10:00", sub="1. Plan"),
    dict(src="pan.webm", ss=1.5, dur=4.0, fx=0.47, hora="11:00", sub="Elaboración de pan"),
    dict(src="dron.mp4", ss=77.4, dur=4.0, speed=0.5, crop=DRON, fx=0.5, limpia=True, hora="11:30", sub="2. Plan"),
    dict(src="portada.mp4", ss=14.6, dur=4.0, fx=0.5, hora="12:30", sub="Llegada a la txakolindegi"),
    dict(src="copas.webm", ss=0.8, dur=4.0, hora="13:00", sub="Sirviendo las copas"),
    dict(src="santaklara.mp4", ss=107.7, dur=4.0, speed=0.52, fx=0.72, limpia=True, hora="13:30", sub="A comer"),
    dict(src="portada.mp4", ss=52.6, dur=5.0, fx=0.5, final=True),
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


def caja(img, cy, txt, fnt, fill=CREAM, alpha=165, padx=46, pady=26, radio=30):
    """Texto centrado sobre una banda navy semitransparente: se lee sobre cualquier fondo."""
    d = ImageDraw.Draw(img)
    l, t, r, b = d.multiline_textbbox((W / 2, cy), txt, font=fnt, anchor="mm", align="center", spacing=12)
    capa = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(capa).rounded_rectangle([l - padx, t - pady, r + padx, b + pady], radio, fill=NAVY + (alpha,))
    img.alpha_composite(capa)
    d.multiline_text((W / 2, cy), txt, font=fnt, fill=fill + (255,), anchor="mm", align="center", spacing=12)


def reloj(img, hora):
    caja(img, 270, hora, font(SERIF, 132, 600), alpha=150, padx=44, pady=22)


def subtitulo(img, s):
    plan = s[:2] in ("1.", "2.")
    caja(img, H * 0.79, s, font(SERIF, 96 if plan else 76, 600), fill=GOLD if plan else CREAM)


def capas(p, tmp, i):
    """Devuelve [(png, inicio, fin, fade_in, fade_out)] para el plano."""
    out = []
    def guarda(img, nombre, t0, t1, fi=0.4, fo=0.0):
        path = os.path.join(tmp, f"c{i}_{nombre}.png"); img.save(path); out.append((path, t0, t1, fi, fo))
    if p.get("intro"):
        a = lienzo()
        caja(a, H * 0.45, "¿Cómo es una\nexperiencia con\nbasqplan?", font(SERIF, 104, 600), alpha=175, pady=36)
        guarda(a, "pregunta", 0.0, 2.4, fi=0.3, fo=0.4)
        b = lienzo()
        caja(b, H * 0.45, p["hora"], font(SERIF, 230, 600), alpha=165, padx=60, pady=10)
        caja(b, H * 0.45 + 210, p["sub"], font(SERIF, 84, 600))
        guarda(b, "hora", 2.4, p["dur"] + XF, fi=0.4, fo=0.5)
    elif p.get("final"):
        a = Image.new("RGBA", (W, H), NAVY + (120,)); velo(a, arriba=False, fuerza=200)
        logo = Image.open(FU("logo_crema.png")).convert("RGBA"); lw = 340
        logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
        a.alpha_composite(logo, (int(W / 2 - lw / 2), int(H * 0.40)))
        texto(a, (W / 2, H * 0.40 + logo.height + 90), "basqplan", font(SERIF, 120, 600))
        # botón dorado
        d = ImageDraw.Draw(a); f = font(SANS, 44, 600); cy = H * 0.40 + logo.height + 230
        l, t, r, b = d.textbbox((W / 2, cy), "Reserva en el enlace de la bio", font=f, anchor="mm")
        d.rounded_rectangle([l - 44, t - 26, r + 44, b + 26], 40, fill=GOLD + (255,))
        d.text((W / 2, cy), "Reserva en el enlace de la bio", font=f, fill=NAVY + (255,), anchor="mm")
        guarda(a, "final", 0.8, p["dur"], fi=0.8)
    else:
        a = lienzo(); reloj(a, p["hora"]); guarda(a, "reloj", 0.0, p["dur"] + XF, fi=0.5)
        b = lienzo(); subtitulo(b, p["sub"]); guarda(b, "sub", 0.6, p["dur"] + XF, fi=0.5)
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
        "colorbalance=rs=0.02:bs=-0.03:rm=0.01:bm=-0.02,noise=alls=3:allf=t")


def segmento(p, tmp, i, ultimo):
    d = p["dur"] + (0 if ultimo else XF)
    n = int(round(d * FPS))
    if p["src"].lower().endswith((".mp4", ".mov", ".webm", ".m4v")):
        sp = p.get("speed", 1.0)
        cmd = ["ffmpeg", "-y", "-ss", str(p.get("ss", 0)), "-t", f"{d*sp+0.1:.3f}", "-i", FU(p["src"])]
        r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                            "stream=width,height", "-of", "csv=p=0", FU(p["src"])], capture_output=True, text=True)
        iw, ih = map(int, r.stdout.strip().split(",")[:2])
        cw, ch, cx, cy = p.get("crop", (iw, ih, 0, 0))
        vw = min(cw, int(ch * 9 / 16)) // 2 * 2
        vx = cx + int(min(max(p.get("fx", 0.5) * cw - vw / 2, 0), cw - vw))
        dn = "hqdn3d=3:3:4:4," if p.get("limpia") else ""
        base = (f"[0:v]crop={vw}:{ch}:{vx}:{cy},{dn}setpts=(PTS-STARTPTS)/{sp},fps={FPS},"
                f"scale={W}:{H}:flags=lanczos,unsharp=5:5:0.7,setsar=1,trim=duration={d},setpts=PTS-STARTPTS")
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
              f"*lt(mod(t,1),0.8)*lt(t,4.6)':s=48000:d={total}")
    fc.append(f"{alarma},afade=t=in:d=0.05,afade=t=out:st=4.0:d=0.6,aformat=channel_layouts=stereo[a]")
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
