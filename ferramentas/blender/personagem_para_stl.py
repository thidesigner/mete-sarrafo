"""Prepara um personagem do jogo para a impressora 3D.

Recebe o "modelo colorido" (.glb) baixado no editor de personagens e gera um
STL de uma peça só, fechado (sem buracos), em pé sobre uma base, com a altura
pedida em milímetros.

Uso (Blender sem janela):
    blender -b -P ferramentas/blender/personagem_para_stl.py -- personagem.glb saida.stl 80

Também funciona colando no Blender (aba Scripting) ou pelo conector do Blender
no Claude desktop: troque ENTRADA, SAIDA e ALTURA_MM lá embaixo.
"""
import sys

import bpy

ENTRADA = "personagem.glb"
SAIDA = "personagem.stl"
ALTURA_MM = 80.0
DETALHE_MM = 0.4  # tamanho do "grão" que fecha os buracos; menor = mais detalhe e arquivo maior


def preparar(entrada, saida, altura_mm, detalhe_mm=DETALHE_MM):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=entrada)

    pecas = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not pecas:
        raise SystemExit("O arquivo não tem nenhuma peça 3D.")
    bpy.ops.object.select_all(action="DESELECT")
    for o in pecas:
        o.select_set(True)
    bpy.context.view_layer.objects.active = pecas[0]
    bpy.ops.object.parent_clear(type="CLEAR_KEEP_TRANSFORM")
    bpy.ops.object.join()
    boneco = bpy.context.view_layer.objects.active
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

    # glTF já chega com Z para cima no Blender. Ajusta a altura em milímetros (1 unidade = 1 mm).
    zs = [(boneco.matrix_world @ v.co).z for v in boneco.data.vertices]
    escala = altura_mm / (max(zs) - min(zs))
    boneco.scale = (escala, escala, escala)
    bpy.ops.object.transform_apply(scale=True)

    # Junta tudo numa casca só, fechada, que o fatiador aceita sem reclamar.
    remesh = boneco.modifiers.new("fechar", "REMESH")
    remesh.mode = "VOXEL"
    remesh.voxel_size = detalhe_mm
    bpy.ops.object.modifier_apply(modifier=remesh.name)

    # Apoia na mesa (z = 0) e centraliza.
    cantos = [boneco.matrix_world @ v.co for v in boneco.data.vertices]
    cx = (min(c.x for c in cantos) + max(c.x for c in cantos)) / 2
    cy = (min(c.y for c in cantos) + max(c.y for c in cantos)) / 2
    boneco.location -= type(boneco.location)((cx, cy, min(c.z for c in cantos)))
    bpy.ops.object.transform_apply(location=True)

    bpy.ops.wm.stl_export(filepath=saida, export_selected_objects=True, ascii_format=False)
    d = boneco.dimensions
    print(f"Pronto: {saida} ({d.x:.0f} x {d.y:.0f} x {d.z:.0f} mm, {len(boneco.data.polygons)} faces)")


if __name__ == "__main__":
    args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    if args:
        preparar(args[0], args[1] if len(args) > 1 else SAIDA, float(args[2]) if len(args) > 2 else ALTURA_MM)
    else:
        preparar(ENTRADA, SAIDA, ALTURA_MM)
