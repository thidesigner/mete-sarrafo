"""Monta o site do Mete Sarrafo a partir de fonte/.

    python3 ferramentas/montar.py            -> gera teste/index.html (versão de teste)
    python3 ferramentas/montar.py --oficial  -> copia teste/index.html para index.html (versão oficial)

fonte/jogo.html é a mesma página publicada como artefato no Claude (sem o esqueleto <html>).
Aqui ela ganha o esqueleto, a conexão online (PeerJS) e o modo online de fonte/online.js.
"""
import os
import re
import shutil
import sys

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def rep(s, a, b):
    assert s.count(a) == 1, f"trecho não encontrado (ou repetido) em fonte/jogo.html: {a[:70]!r}"
    return s.replace(a, b)


def montar_teste():
    base = open(os.path.join(RAIZ, "fonte", "jogo.html"), encoding="utf-8").read()
    online = open(os.path.join(RAIZ, "fonte", "online.js"), encoding="utf-8").read()
    s = re.sub(r'const LINK = "[^"]*";', "const LINK = location.origin + location.pathname;", base, count=1)
    s = rep(s, '    <p class="dim" style="font-size:14px">Para funcionar no celular de quem não tem conta, ative o link público no botão Compartilhar da página.</p>\n', "")
    s = rep(s, '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>',
            '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>\n'
            '<script src="https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js"></script>')
    s = s.rstrip() + "\n\n<script>\n" + online + "\nrender();\n</script>\n"
    i = s.index('<div class="app"')
    head, body = s[:i], s[i:]
    reset = (":root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}"
             "body{margin:0;-webkit-text-size-adjust:100%}img{max-width:100%}[hidden]{display:none!important}"
             ".faixa-teste{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:50;background:#ff4d6d;color:#fff;"
             "font:800 12px/1 system-ui,sans-serif;letter-spacing:.08em;padding:4px 10px;border-radius:0 0 8px 8px;pointer-events:none}")
    html = ("<!doctype html>\n<html lang=\"pt-BR\">\n<head>\n<meta charset=\"utf-8\">\n"
            "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
            "<meta name=\"theme-color\" content=\"#0f3057\">\n<style>" + reset + "</style>\n"
            + head + "</head>\n<body>\n<div class=\"faixa-teste\" id=\"faixa-teste\">VERSÃO DE TESTE</div>\n"
            + body + "</body>\n</html>\n")
    os.makedirs(os.path.join(RAIZ, "teste"), exist_ok=True)
    destino = os.path.join(RAIZ, "teste", "index.html")
    open(destino, "w", encoding="utf-8").write(html)
    print("Versão de teste gerada:", os.path.relpath(destino, RAIZ))


def promover():
    origem = os.path.join(RAIZ, "teste", "index.html")
    html = open(origem, encoding="utf-8").read()
    html = html.replace('<div class="faixa-teste" id="faixa-teste">VERSÃO DE TESTE</div>\n', "")
    open(os.path.join(RAIZ, "index.html"), "w", encoding="utf-8").write(html)
    print("Versão de teste copiada para a oficial: index.html")


if __name__ == "__main__":
    if "--oficial" in sys.argv:
        promover()
    else:
        montar_teste()
