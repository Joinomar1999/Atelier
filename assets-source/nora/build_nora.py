"""
Nora - draft v4 (phase 2). Built in metres at spec scale (body ~26 cm, head ~110 mm).
Blender front = -Y (exported to glTF as +Z). Run:
  blender -b --python build_nora.py -- <out_dir>
Changes from v3: hooded mantle built as a shaped, folded shell with a wavy hem;
hood shell over the head; dark glass eyes with gold rim; graphite neck; thicker limbs.
Still a procedural draft, not a sculpt. See STATUS.md.
"""
import sys, math, os
import bpy, bmesh
from mathutils import Vector

out_dir = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else os.path.dirname(__file__)
bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, base, rough=0.5, metal=0.0, coat=0.0, emit=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Coat Weight" in b.inputs: b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1.0)
        b.inputs["Emission Strength"].default_value = 0.5
    return m

M_IVORY = mat("Ivory ceramic", (0.93, 0.89, 0.80), rough=0.32, coat=0.25)
M_SLATE = mat("Slate mantle", (0.30, 0.32, 0.36), rough=0.8)
M_CHAMP = mat("Champagne metal", (0.82, 0.64, 0.38), rough=0.25, metal=1.0)
M_GRAPH = mat("Graphite", (0.13, 0.13, 0.14), rough=0.4, metal=0.4)
M_IRIS = mat("Iris dark blue", (0.08, 0.13, 0.19), rough=0.15)
M_PUPIL = mat("Pupil", (0.01, 0.01, 0.02), rough=0.2)
M_GLASS = mat("Eye glass", (0.9, 0.93, 0.96), rough=0.02, coat=1.0)
M_HILITE = mat("Highlight", (1, 1, 1), rough=0.1, emit=(1, 1, 1))

def shade(o, m, smooth=True):
    o.data.materials.clear(); o.data.materials.append(m)
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    return o

def prim(kind, name, m, loc=(0, 0, 0), scale=(1, 1, 1), rot=(0, 0, 0), **kw):
    if kind == "sphere": bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=20, location=loc, **kw)
    elif kind == "cyl": bpy.ops.mesh.primitive_cylinder_add(vertices=20, location=loc, **kw)
    elif kind == "torus": bpy.ops.mesh.primitive_torus_add(location=loc, major_segments=48, minor_segments=12, **kw)
    o = bpy.context.active_object; o.name = name; o.rotation_euler = rot; o.scale = scale
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    return shade(o, m)

parts = []

# ---- head, neck, torso ----
parts.append(prim("sphere", "Head", M_IVORY, loc=(0, 0, 0.19), scale=(0.055, 0.055, 0.055), radius=1.0))
parts.append(prim("cyl", "Neck", M_GRAPH, loc=(0, 0, 0.138), scale=(0.018, 0.018, 0.012), radius=1.0, depth=1.0))
parts.append(prim("sphere", "Torso", M_IVORY, loc=(0, 0, 0.112), scale=(0.037, 0.032, 0.041), radius=1.0))
parts.append(prim("cyl", "Waist ring", M_CHAMP, loc=(0, 0, 0.076), scale=(0.031, 0.031, 0.0045), radius=1.0, depth=1.0))

# ---- hood: a shell over the top and back of the head, open at the face ----
bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, radius=0.0615, location=(0, 0, 0.196))
hood = bpy.context.active_object; hood.name = "Hood"
bm = bmesh.new(); bm.from_mesh(hood.data)
kill = [f for f in bm.faces if sum(v.co.z for v in f.verts) / len(f.verts) < 0.18 or
        sum(v.co.y for v in f.verts) / len(f.verts) < -0.022]
bmesh.ops.delete(bm, geom=kill, context="FACES")
bm.to_mesh(hood.data); bm.free()
hood.data.materials.append(M_SLATE)
bpy.ops.object.shade_smooth()
sol = hood.modifiers.new("Thick", "SOLIDIFY"); sol.thickness = 0.0035; sol.offset = 0
parts.append(hood)

# ---- mantle: a folded shell from the shoulders to a wavy hem, open at the front ----
bm = bmesh.new()
rows, cols = 14, 56
span = math.pi - 0.42            # open at the front (theta = pi)
grid = []
for i in range(rows + 1):
    t = i / rows                   # 0 at shoulders, 1 at hem
    z_shoulder, z_hem = 0.150, 0.040
    z_base = z_shoulder + (z_hem - z_shoulder) * t
    row = []
    for j in range(cols + 1):
        u = -1 + 2 * j / cols      # -1..1 across the open arc
        th = u * span
        r = 0.050 + 0.030 * t**1.3 + 0.0035 * math.sin(th * 6.0) * t      # flare and folds
        hem_wave = 0.012 * (0.5 + 0.5 * math.cos(th * 2.0)) * t**2        # wavy hem
        x = r * math.sin(th); y = r * math.cos(th)
        z = z_base - hem_wave
        row.append(bm.verts.new((x, y, z)))
    grid.append(row)
for i in range(rows):
    for j in range(cols):
        bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
bm.normal_update()
me = bpy.data.meshes.new("Mantle"); bm.to_mesh(me); bm.free()
mantle = bpy.data.objects.new("Mantle", me); bpy.context.collection.objects.link(mantle)
mantle.data.materials.append(M_SLATE)
bpy.context.view_layer.objects.active = mantle; mantle.select_set(True)
sol = mantle.modifiers.new("Thick", "SOLIDIFY"); sol.thickness = 0.0022; sol.offset = 0
mantle.modifiers.new("Smooth", "SUBSURF").levels = 1
bpy.ops.object.modifier_apply(modifier="Thick"); bpy.ops.object.modifier_apply(modifier="Smooth")
shade(mantle, M_SLATE)
parts.append(mantle)
# gold brooch at the front of the mantle
parts.append(prim("torus", "Brooch", M_CHAMP, loc=(0, -0.052, 0.128), rot=(math.pi / 2, 0, 0), major_radius=0.0065, minor_radius=0.0028))

# ---- halo ring on a short stalk ----
parts.append(prim("cyl", "Halo stalk", M_CHAMP, loc=(0, 0, 0.246), scale=(0.002, 0.002, 0.006), radius=1.0, depth=1.0))
parts.append(prim("torus", "Halo ring", M_CHAMP, loc=(0, 0, 0.262), rot=(math.pi / 2, 0, 0), major_radius=0.024, minor_radius=0.003))

# ---- backpack, straps ----
parts.append(prim("sphere", "Backpack", M_CHAMP, loc=(0, 0.046, 0.118), scale=(0.030, 0.020, 0.040), radius=1.0))

# ---- eyes: dark glass, iris, pupil, highlight, gold rim ----
for side, sx in (("L", -1), ("R", 1)):
    x = 0.026 * sx
    parts.append(prim("sphere", f"Eye glass {side}", M_GLASS, loc=(x, -0.047, 0.195), scale=(0.026, 0.026, 0.026), radius=1.0))
    parts.append(prim("sphere", f"Iris {side}", M_IRIS, loc=(x, -0.062, 0.195), scale=(0.0175, 0.0175, 0.0175), radius=1.0))
    parts.append(prim("sphere", f"Pupil {side}", M_PUPIL, loc=(x, -0.072, 0.195), scale=(0.0085, 0.0085, 0.0085), radius=1.0))
    parts.append(prim("sphere", f"Highlight {side}", M_HILITE, loc=(x + 0.005, -0.078, 0.205), scale=(0.003, 0.003, 0.003), radius=1.0))
    parts.append(prim("torus", f"Eye rim {side}", M_CHAMP, loc=(x, -0.040, 0.195), rot=(math.pi / 2, 0, 0), major_radius=0.0245, minor_radius=0.0016))

# ---- shoulders, arms ----
for side, sx in (("L", -1), ("R", 1)):
    sh = (0.040 * sx, 0, 0.132)
    parts.append(prim("sphere", f"Shoulder {side}", M_GRAPH, loc=sh, scale=(0.014, 0.014, 0.014), radius=1.0))
    parts.append(prim("cyl", f"Upper arm {side}", M_IVORY, loc=(sh[0] + 0.002 * sx, 0, 0.100), scale=(0.0095, 0.0095, 0.031), radius=1.0, depth=2.0))
    parts.append(prim("sphere", f"Elbow {side}", M_CHAMP, loc=(sh[0] + 0.004 * sx, 0, 0.078), scale=(0.011, 0.011, 0.011), radius=1.0))
    parts.append(prim("cyl", f"Forearm {side}", M_IVORY, loc=(sh[0] + 0.004 * sx, 0, 0.058), scale=(0.0085, 0.0085, 0.021), radius=1.0, depth=2.0))
    parts.append(prim("sphere", f"Hand {side}", M_IVORY, loc=(sh[0] + 0.004 * sx, 0, 0.040), scale=(0.0125, 0.011, 0.013), radius=1.0))

# ---- hips, legs, feet ----
for side, sx in (("L", -1), ("R", 1)):
    hx = 0.020 * sx
    parts.append(prim("sphere", f"Hip {side}", M_GRAPH, loc=(hx, 0, 0.072), scale=(0.013, 0.013, 0.013), radius=1.0))
    parts.append(prim("cyl", f"Thigh {side}", M_IVORY, loc=(hx, 0, 0.050), scale=(0.0115, 0.0115, 0.021), radius=1.0, depth=2.0))
    parts.append(prim("sphere", f"Knee {side}", M_CHAMP, loc=(hx, 0, 0.030), scale=(0.0125, 0.0125, 0.0125), radius=1.0))
    parts.append(prim("cyl", f"Shin {side}", M_IVORY, loc=(hx, 0, 0.016), scale=(0.0105, 0.0105, 0.015), radius=1.0, depth=2.0))
    parts.append(prim("sphere", f"Foot {side}", M_IVORY, loc=(hx, -0.007, 0.011), scale=(0.020, 0.030, 0.013), radius=1.0))
    parts.append(prim("cyl", f"Ankle ring {side}", M_CHAMP, loc=(hx, 0, 0.022), scale=(0.012, 0.012, 0.0035), radius=1.0, depth=1.0))

# ---- join and export ----
bpy.ops.object.select_all(action="DESELECT")
for p in parts: p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
nora = bpy.context.active_object; nora.name = "Nora"
bpy.ops.object.transform_apply(location=False, rotation=False, scale=False)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(out_dir, "nora.blend"))
bpy.ops.export_scene.gltf(filepath=os.path.join(out_dir, "nora.glb"), export_format="GLB", use_selection=False, export_yup=True, export_apply=True)
print("NORA_OK dims_m=%s" % (tuple(round(d, 4) for d in nora.dimensions),))
