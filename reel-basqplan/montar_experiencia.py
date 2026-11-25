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
XF = 0.4
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
#   brindis.webm: Wikimedia Commons, «Buena Vista Winery - September 2024 - Sarah Stierch 02» (CC0).
#   cocina.webm: Wikimedia Commons, «COMREL Cooking Demonstration (1015886)» (dominio público, DVIDS).
#   musica.mp3: Scott Buckley, «Wanderlust» (CC BY 4.0, Wikimedia Commons).
# fx: centro horizontal del recorte vertical (0-1); speed < 1 ralentiza; trans: transición de entrada.
#   k5.mp4: vídeo promocional de Bodega K5 (aportado; pedir permiso).
#   santaklara.mp4: vídeo promocional del agroturismo Santa Klara (aportado; pedir permiso).
# Estructura: «Un día con basqplan» → 10:00 ganadería en Santa Klara (cortes rápidos) → txakoli → cocina → final.
K5 = (1920, 752, 0, 164)
SK = dict(src="santaklara.mp4", limpia=True)
PLANOS = [
    # Apertura: título sobre el flysch y, después, en el centro «9:00 · Despertar» con vistas al mar
    dict(src="portada.mp4", ss=0.2, dur=3.5, fx=0.5, titulo=True),
    # Actividad 1: ganadería. Collage de 3 vídeos apilados (se ven mucho más nítidos que recortados en vertical)
    dict(SK, dur=4.2, stack=[(49.05, 0.62), (69.0, 1.0), (63.1, 0.6)],
         hora="10:00", etiqueta="GANADERÍA", frase="aprender con los animales", trans="slideleft"),
    dict(SK, dur=4.0, stack=[(77.1, 0.53), (94.7, 0.8), (83.4, 0.95)], trans="slideup"),
    # Txakoli en K5 (vídeo promocional de Bodega K5, Full HD): collages de 3 para verlo entero y sin huecos
    dict(src="k5.mp4", crop=K5, dur=4.2, stack=[(62.95, 0.74), (66.5, 0.97), (5.0, 0.97)],
         hora="13:00", etiqueta="CATA DE TXAKOLI", frase="en bodega", trans="zoomin"),
    dict(src="k5.mp4", crop=K5, dur=4.0, stack=[(57.75, 0.62), (35.05, 0.75), (0.8, 0.88)], trans="slideup"),
    dict(src="portada.mp4", ss=52.6, dur=4.5, fx=0.5, final=True, trans="fade"),
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


def ajusta(path, txt, size, wght, maxw=W - 160):
    """Reduce el tamaño de letra hasta que el texto quepa en el ancho."""
    d = ImageDraw.Draw(Image.new("RGBA", (10, 10)))
    while size > 30:
        f = font(path, size, wght)
        if d.textlength(txt, font=f) <= maxw: return f
        size -= 4
    return font(path, size, wght)


def suave(img, xy, txt, fnt, fill=CREAM, tracking=0):
    """Texto sin caja: doble sombra difusa (halo amplio + sombra cercana) para leerse sobre cualquier fondo."""
    for alpha, r in ((150, 26), (170, 7)):
        capa = Image.new("RGBA", img.size, (0, 0, 0, 0))
        dc = ImageDraw.Draw(capa)
        if tracking:
            total = sum(dc.textlength(c, font=fnt) for c in txt) + tracking * (len(txt) - 1)
            x = xy[0] - total / 2
            for c in txt:
                dc.text((x, xy[1]), c, font=fnt, fill=(10, 14, 22, alpha), anchor="lm"); x += dc.textlength(c, font=fnt) + tracking
        else:
            dc.multiline_text(xy, txt, font=fnt, fill=(10, 14, 22, alpha), anchor="mm", align="center", spacing=14)
        img.alpha_composite(capa.filter(ImageFilter.GaussianBlur(r)))
    d = ImageDraw.Draw(img)
    if tracking:
        total = sum(d.textlength(c, font=fnt) for c in txt) + tracking * (len(txt) - 1)
        x = xy[0] - total / 2
        for c in txt:
            d.text((x, xy[1]), c, font=fnt, fill=fill + (255,), anchor="lm"); x += d.textlength(c, font=fnt) + tracking
    else:
        d.multiline_text(xy, txt, font=fnt, fill=fill + (255,), anchor="mm", align="center", spacing=14)


def filete(img, cy, ancho=150):
    """Línea dorada fina con sombra suave."""
    capa = Image.new("RGBA", img.size, (0, 0, 0, 0))
    ImageDraw.Draw(capa).line([(W / 2 - ancho / 2, cy), (W / 2 + ancho / 2, cy)], fill=(10, 14, 22, 160), width=6)
    img.alpha_composite(capa.filter(ImageFilter.GaussianBlur(6)))
    ImageDraw.Draw(img).line([(W / 2 - ancho / 2, cy), (W / 2 + ancho / 2, cy)], fill=GOLD + (255,), width=3)


def reloj(img, hora):
    caja(img, 270, hora, font(SERIF, 132, 600), alpha=150, padx=44, pady=22)


def subtitulo(img, s):
    plan = s[:2] in ("1.", "2.")
    caja(img, H * 0.79, s, font(SERIF, 96 if plan else 76, 600), fill=GOLD if plan else CREAM)


def logo_img(lw):
    logo = Image.open(FU("logo_crema.png")).convert("RGBA")
    return logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)


def capas(p, tmp, i):
    """Devuelve [(png, inicio, fin, fade_in, fade_out, dy)] para el plano."""
    out = []
    def guarda(img, nombre, t0, t1, fi=0.45, fo=0.0, dy=60):
        path = os.path.join(tmp, f"c{i}_{nombre}.png"); img.save(path); out.append((path, t0, t1, fi, fo, dy))
    fin = p["dur"] + XF
    if p.get("titulo"):
        tf = 2.75 if p.get("centro") else fin          # si luego viene la hora, el título se va antes
        fo = 0.4 if p.get("centro") else 0.0
        a = Image.new("RGBA", (W, H), NAVY + (55,))
        texto(a, (W / 2, H * 0.33), "UN DÍA CON", font(SANS, 70, 600), fill=GOLD, tracking=18, sombra=160, radio=10)
        guarda(a, "undia", 0.2, tf, fi=0.5, fo=fo, dy=-60)
        b = lienzo(); lg = logo_img(330); b.alpha_composite(lg, (int(W / 2 - 165), int(H * 0.39)))
        texto(b, (W / 2, H * 0.39 + lg.height + 110), "basqplan", font(SERIF, 190, 600), radio=20)
        guarda(b, "marca", 0.7, tf, fi=0.6, fo=fo, dy=80)
    if p.get("centro"):
        t0 = p.get("alarma_t", 0.3)
        a = lienzo(); caja(a, H * 0.46, p["hora"], font(SERIF, 280, 600), alpha=160, padx=70, pady=6)
        guarda(a, "hora", t0, fin, dy=70)
        b = lienzo(); caja(b, H * 0.46 + 215, p["frase"], font(SERIF_I, 96, 500), alpha=165, padx=50, pady=22)
        guarda(b, "frase", t0 + 0.4, fin, dy=60)
        return out
    if p.get("hora") and not p.get("frase"):
        a = lienzo(); caja(a, H * 0.72, p["hora"], font(SERIF, 260, 600), alpha=160, padx=70, pady=6)
        guarda(a, "hora", 0.25, fin, dy=70)
    elif p.get("hora"):
        y = H * 0.68
        a = lienzo(); suave(a, (W / 2, y), p["hora"], font(SERIF, 200, 500)); filete(a, y + 128)
        guarda(a, "hora", 0.3, fin, dy=50)
        b = lienzo()
        suave(b, (W / 2, y + 200), p["etiqueta"], font(SANS, 50, 700), fill=(227, 210, 178), tracking=12)
        suave(b, (W / 2, y + 285), p["frase"], ajusta(SERIF_I, p["frase"], 84, 400))
        guarda(b, "frase", 0.8, fin, dy=50)
    elif p.get("frase"):
        b = lienzo(); caja(b, H * 0.78, p["frase"], ajusta(SERIF_I, p["frase"], 76, 500), alpha=165)
        guarda(b, "frase", 0.3, fin, dy=60)
    if p.get("final"):
        a = Image.new("RGBA", (W, H), NAVY + (60,))
        lg = logo_img(340); ly = int(H * 0.36)
        a.alpha_composite(lg, (int(W / 2 - 170), ly))
        texto(a, (W / 2, ly + lg.height + 95), "basqplan", font(SERIF, 130, 600))
        guarda(a, "logo", 0.4, p["dur"], fi=0.8, dy=0)
        b = lienzo()
        suave(b, (W / 2, H * 0.76), "Una reserva única,", font(SERIF_I, 96, 400))
        suave(b, (W / 2, H * 0.76 + 110), "llena de experiencias.", font(SERIF_I, 96, 400), fill=(227, 210, 178))
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
    off = 1
    if p.get("stack"):
        # 3 vídeos horizontales apilados sobre fondo navy, entrando de lado uno tras otro
        cmd = ["ffmpeg", "-y"]
        PH, GAP = H // 3, 0   # 3 franjas de 1080x640 que llenan toda la pantalla, sin huecos
        y0 = 0
        fc0 = [f"color=c=0x{NAVY[0]:02x}{NAVY[1]:02x}{NAVY[2]:02x}:s={W}x{H}:r={FPS}:d={d}[can0]"]
        r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                            "stream=width,height", "-of", "csv=p=0", FU(p["src"])], capture_output=True, text=True)
        iw, ih = map(int, r.stdout.strip().split(",")[:2])
        cw, ch, cx, cy = p.get("crop", (iw, ih, 0, 0))
        A = W / PH
        sw = min(cw, int(ch * A)) // 2 * 2; sh = min(ch, int(sw / A)) // 2 * 2
        sx = cx + (cw - sw) // 2; sy = cy + (ch - sh) // 2
        dn = "hqdn3d=3:3:4:4," if p.get("limpia") else ""
        for k, (ss, sp) in enumerate(p["stack"]):
            cmd += ["-ss", str(ss), "-t", f"{d*sp+0.1:.3f}", "-i", FU(p["src"])]
            fc0.append(f"[{k}:v]crop={sw}:{sh}:{sx}:{sy},{dn}setpts=(PTS-STARTPTS)/{sp},fps={FPS},"
                       f"scale={W}:{PH}:flags=lanczos,unsharp=5:5:0.6,setsar=1,trim=duration={d},setpts=PTS-STARTPTS[p{k}]")
            t0 = 0.12 * k; sgn = -1 if k % 2 == 0 else 1
            xe = f"if(lt(t,{t0}),{sgn}*{W},{sgn}*{W}*pow(1-min(1,(t-{t0})/0.55),3))"
            fc0.append(f"[can{k}][p{k}]overlay=x='{xe}':y={y0 + k*(PH+GAP)}:eval=frame[can{k+1}]")
        base = ";".join(fc0) + f";[can3]null"
        off = 3
    elif p["src"].lower().endswith((".mp4", ".mov", ".webm", ".m4v")):
        sp = p.get("speed", 1.0)
        cmd = ["ffmpeg", "-y", "-ss", str(p.get("ss", 0)), "-t", f"{d*sp+0.1:.3f}", "-i", FU(p["src"])]
        r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                            "stream=width,height", "-of", "csv=p=0", FU(p["src"])], capture_output=True, text=True)
        iw, ih = map(int, r.stdout.strip().split(",")[:2])
        cw, ch, cx, cy = p.get("crop", (iw, ih, 0, 0))
        vw = min(cw, int(ch * 9 / 16)) // 2 * 2
        vx = cx + int(min(max(p.get("fx", 0.5) * cw - vw / 2, 0), cw - vw))
        dn = "hqdn3d=3:3:4:4," if p.get("limpia") else ""
        if p.get("brillo"): dn += "eq=brightness=0.05:gamma=1.12:saturation=1.1,"
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
        f = f"[{k+off}:v]format=rgba,fade=t=in:st={t0}:d={fi}:alpha=1"
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
    # música (sin despertador): entra con fundido y sale con fundido al final
    na = len(segs)
    inputs += ["-ss", "34.5", "-i", FU("musica.mp3")]
    fc.append(f"[{na}:a]aresample=48000,atrim=0:{total},asetpts=PTS-STARTPTS,volume=1.0,"
              f"afade=t=in:d=1.0,afade=t=out:st={total-2.5}:d=2.5,apad,atrim=0:{total},"
              f"aformat=channel_layouts=stereo,alimiter=limit=0.89[a]")
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
