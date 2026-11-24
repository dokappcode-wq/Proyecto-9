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
# Todo vídeo, todo vertical y en HD.
#   portada.mp4: vídeo de basqplan.com (1920x1080).
#   vacas.webm: Wikimedia Commons, «Cattle near Aberfeldy» (CC0).
#   ganado_cerca.webm / ganado_manada.webm: Wikimedia Commons, «Eine Herde Schottische Hochlandrinder
#       auf einer Weide bei Bederwitz (482)» y «(488)» (CC BY-SA 4.0).
#   copas.webm: Wikimedia Commons, «Turkovich Family Wines - June 2019 - Stierch 03», Sarah Stierch (CC BY 4.0).
#   comida.webm: Wikimedia Commons, «Yuca Mami - February 2024 - Sarah Stierch» (CC BY 4.0).
# fx: centro horizontal del recorte vertical (0-1); speed < 1 ralentiza; trans: transición de entrada.
# Textos: solo «10:30, vacas frente al Cantábrico. 13:00, cuatro txakolis. Una sola reserva.»
PLANOS = [
    dict(src="portada.mp4", ss=57.8, dur=3.5, speed=0.85, fx=0.6),
    dict(src="vacas.webm", ss=32.0, dur=4.5, fx=0.55, hora="10:30,", frase="vacas frente al Cantábrico.",
         trans="smoothleft"),
    dict(src="ganado_cerca.webm", ss=3.0, dur=3.5, fx=0.58, trans="zoomin"),
    dict(src="ganado_manada.webm", ss=2.0, dur=3.5, fx=0.5, trans="smoothup"),
    dict(src="copas.webm", ss=1.8, dur=4.5, speed=0.75, hora="13:00,", frase="cuatro txakolis.", trans="smoothleft"),
    dict(src="comida.webm", ss=0.5, dur=4.0, fx=0.45, trans="zoomin"),
    dict(src="portada.mp4", ss=52.6, dur=5.0, fx=0.5, final=True, trans="fade"),
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
    """Devuelve [(png, inicio, fin, fade_in, fade_out, dy)] para el plano. Textos en la parte de abajo."""
    out = []
    def guarda(img, nombre, t0, t1, fi=0.5, fo=0.0, dy=60):
        path = os.path.join(tmp, f"c{i}_{nombre}.png"); img.save(path); out.append((path, t0, t1, fi, fo, dy))
    if p.get("hora"):
        a = lienzo(); caja(a, H * 0.71, p["hora"], font(SERIF, 170, 600), alpha=150, padx=52, pady=12)
        guarda(a, "hora", 0.3, p["dur"] + XF, dy=60)
        b = lienzo(); caja(b, H * 0.71 + 165, p["frase"], font(SERIF_I, 80, 500), alpha=165)
        guarda(b, "frase", 0.8, p["dur"] + XF, dy=60)
    elif p.get("final"):
        a = Image.new("RGBA", (W, H), NAVY + (115,))
        logo = Image.open(FU("logo_crema.png")).convert("RGBA"); lw = 340
        logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
        ly = int(H * 0.36)
        a.alpha_composite(logo, (int(W / 2 - lw / 2), ly))
        texto(a, (W / 2, ly + logo.height + 95), "basqplan", font(SERIF, 130, 600))
        guarda(a, "logo", 0.4, p["dur"], fi=0.8, dy=0)
        b = lienzo(); caja(b, H * 0.80, "Una sola reserva.", font(SERIF_I, 100, 500), alpha=170, padx=52, pady=28)
        guarda(b, "frase", 1.2, p["dur"], fi=0.6, dy=60)
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


LOOK = ("eq=contrast=1.07:saturation=1.15:gamma=1.0,"
        "colorbalance=rs=0.03:bs=-0.02:rm=0.02:bm=-0.02,vignette=PI/5,noise=alls=2:allf=t")


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
                f"scale={int(W*1.5)}:{int(H*1.5)}:flags=lanczos,unsharp=5:5:0.6,setsar=1,trim=duration={d},setpts=PTS-STARTPTS,"
                f"zoompan=z='1+0.09*on/{n}':d=1:s={W}x{H}:fps={FPS}:x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2'")
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
    for k, (png, t0, t1, fi, fo, dy) in enumerate(capas(p, tmp, i)):
        cmd += ["-loop", "1", "-framerate", str(FPS), "-t", str(d), "-i", png]
        f = f"[{k+1}:v]format=rgba,fade=t=in:st={t0}:d={fi}:alpha=1"
        if fo: f += f",fade=t=out:st={t1-fo}:d={fo}:alpha=1"
        fc.append(f + f"[t{k}]")
        # entrada deslizándose con frenada suave
        ye = f"if(lt(t,{t0}+0.6),pow(1-(t-{t0})/0.6,3)*{dy},0)"
        fc.append(f"[{prev}][t{k}]overlay=x=0:y='{ye}':enable='between(t,{t0},{t1})'[b{k+1}]")
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
        tr = PLANOS[i].get("trans", "fade")
        fc.append(f"[{prev}][{i}:v]xfade=transition={tr}:duration={XF}:offset={off:.3f}[v{i}]")
        prev = f"v{i}"
    # barra dorada de progreso del día, abajo
    fc.append(f"color=c=0xC9A86B:s={W}x10:r={FPS}:d={total}[bar]")
    fc.append(f"[{prev}][bar]overlay=x='-{W}+{W}*t/{total}':y={H-10}:shortest=1[pb]")
    fc.append(f"[pb]fade=t=out:st={total-0.5}:d=0.5[vf]")
    # despertador: pitidos de 1 kHz en ráfagas, que se apagan al aparecer el primer plan
    alarma = ("aevalsrc='0.32*(sin(2*PI*1040*t)+0.35*sin(2*PI*2080*t))*lt(mod(t,0.2),0.1)"
              f"*lt(mod(t,1),0.8)*lt(t,3.4)':s=48000:d={total}")
    fc.append(f"{alarma},afade=t=in:d=0.05,afade=t=out:st=2.9:d=0.5,aformat=channel_layouts=stereo[a]")
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
