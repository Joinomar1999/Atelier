"""
Nora - first-pass model (phase 2). Built in metres at the spec scale (~26 cm tall).
Front of the character is -Y in Blender (exported to glTF as +Z).
Run:  blender -b --python build_nora.py -- <out_dir>
Proportions follow the approved Nora design sheet: head ~110 mm, torso ~75 mm.
This is a first pass: shapes are primitives refined with modifiers. It is not a
final sculpt. Revise against the approved sheet before rigging (phase 3).
"""
import sys, math, os
import bpy
from mathutils import Vector

out_dir = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else os.path.dirname(__file__)

# ---------- scene reset ----------
bpy.ops.wm.read_factory_settings(use_empty=True)

def mat(name, base, rough=0.5, metal=0.0, coat=0.0, emit=None, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Coat Weight" in b.inputs:
        b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1.0)
        b.inputs["Emission Strength"].default_value = 0.6
    return m

M_IVORY    = mat("Ivory ceramic",  (0.93, 0.89, 0.80), rough=0.32, coat=0.25)
M_SAND     = mat("Slate mantle",   (0.36, 0.38, 0.42), rough=0.75)
M_CHAMP    = mat("Champagne metal",(0.82, 0.64, 0.38), rough=0.25, metal=1.0)
M_GRAPH    = mat("Graphite",       (0.13, 0.13, 0.14), rough=0.4, metal=0.4)
M_BLUE     = mat("Iris dark blue", (0.10, 0.16, 0.22), rough=0.2)
M_PUPIL    = mat("Pupil",          (0.02, 0.02, 0.03), rough=0.2)
M_GLASS    = mat("Eye glass",      (0.95, 0.97, 1.0), rough=0.02, coat=1.0)
M_HIGHLIGHT= mat("Highlight",      (1.0, 1.0, 1.0), rough=0.1, emit=(1.0, 1.0, 1.0))

def shade(obj, m):
    obj.data.materials.clear()
    obj.data.materials.append(m)
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj

def smooth_all(obj):
    for p in obj.data.polygons:
        p.use_smooth = True

def add(kind, name, mat_, loc=(0, 0, 0), scale=(1, 1, 1), rot=(0, 0, 0), **kw):
    if kind == "sphere":
        bpy.ops.mesh.primitive_uv_sphere_add(segments=48, ring_count=24, location=loc, **kw)
    elif kind == "cyl":
        bpy.ops.mesh.primitive_cylinder_add(vertices=24, location=loc, **kw)
    elif kind == "torus":
        bpy.ops.mesh.primitive_torus_add(location=loc, **kw)
    elif kind == "cube":
        bpy.ops.mesh.primitive_cube_add(location=loc, **kw)
    o = bpy.context.active_object
    o.name = name
    o.scale = scale
    o.rotation_euler = rot
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    shade(o, mat_)
    return o

parts = []

# ---------- head and body (ceramic) ----------
head = add("sphere", "Head", M_IVORY, loc=(0, 0, 0.19), scale=(0.055, 0.055, 0.055), radius=1.0)
parts.append(head)
torso = add("sphere", "Torso", M_IVORY, loc=(0, 0, 0.115), scale=(0.036, 0.032, 0.040), radius=1.0)
parts.append(torso)
neck = add("sphere", "Neck joint", M_GRAPH, loc=(0, 0, 0.142), scale=(0.016, 0.016, 0.010), radius=1.0)
parts.append(neck)
waist = add("cyl", "Waist ring", M_CHAMP, loc=(0, 0, 0.078), scale=(0.030, 0.030, 0.004), radius=1.0, depth=1.0)
parts.append(waist)

# ---------- eyes: large glass with iris and pupil ----------
for side, sx in (("L", -1), ("R", 1)):
    x = 0.026 * sx
    parts.append(add("sphere", f"Eye glass {side}", M_GLASS, loc=(x, -0.047, 0.195), scale=(0.026, 0.026, 0.026), radius=1.0))
    parts.append(add("sphere", f"Iris {side}", M_BLUE, loc=(x, -0.062, 0.195), scale=(0.0175, 0.0175, 0.0175), radius=1.0))
    parts.append(add("sphere", f"Pupil {side}", M_PUPIL, loc=(x, -0.072, 0.195), scale=(0.0085, 0.0085, 0.0085), radius=1.0))
    parts.append(add("sphere", f"Highlight {side}", M_HIGHLIGHT, loc=(x + 0.005, -0.078, 0.205), scale=(0.0030, 0.0030, 0.0030), radius=1.0))

# ---------- halo ring on a short stalk ----------
parts.append(add("cyl", "Halo stalk", M_CHAMP, loc=(0, 0, 0.246), scale=(0.0020, 0.0020, 0.006), radius=1.0, depth=1.0))
ring = add("torus", "Halo ring", M_CHAMP, loc=(0, 0, 0.262), rot=(math.pi / 2, 0, 0), major_radius=0.024, minor_radius=0.0030)
parts.append(ring)

# ---------- backpack ----------
pack = add("sphere", "Backpack", M_CHAMP, loc=(0, 0.048, 0.120), scale=(0.030, 0.020, 0.040), radius=1.0)
parts.append(pack)
strap_l = add("cube", "Strap L", M_SAND, loc=(-0.028, -0.010, 0.128), scale=(0.004, 0.004, 0.045), size=2.0)
strap_r = add("cube", "Strap R", M_SAND, loc=(0.028, -0.010, 0.128), scale=(0.004, 0.004, 0.045), size=2.0)
parts += [strap_l, strap_r]

# ---------- cape: arc-shaped sheet around the back and sides ----------
bpy.ops.mesh.primitive_grid_add(x_subdivisions=16, y_subdivisions=6, size=1.0, location=(0, 0, 0))
cape = bpy.context.active_object
cape.name = "Cape"
R0, flare, span = 0.050, 0.024, 2.30
for v in cape.data.vertices:
    u = v.co.x * 2.0          # -1..1 across the width
    t = v.co.y + 0.5          # 0 at the top edge, 1 at the hem
    theta = u * span
    r = R0 + flare * t
    v.co.x = r * math.sin(theta)
    v.co.y = r * math.cos(theta)
    v.co.z = 0.150 - t * 0.105 - 0.012 * math.sin(theta * 1.5) ** 2 * t
cape.location = (0, 0, 0)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=False)
sol = cape.modifiers.new("Thickness", "SOLIDIFY")
sol.thickness = 0.002
sol.offset = 0.0
shade(cape, M_SAND)
parts.append(cape)

# ---------- arms ----------
for side, sx in (("L", -1), ("R", 1)):
    sh = (0.040 * sx, 0.0, 0.132)
    parts.append(add("sphere", f"Shoulder {side}", M_GRAPH, loc=sh, scale=(0.013, 0.013, 0.013), radius=1.0))
    parts.append(add("cyl", f"Upper arm {side}", M_IVORY, loc=(sh[0] + 0.002 * sx, 0, 0.100), scale=(0.0085, 0.0085, 0.032), radius=1.0, depth=2.0))
    parts.append(add("sphere", f"Elbow {side}", M_CHAMP, loc=(sh[0] + 0.004 * sx, 0, 0.078), scale=(0.0095, 0.0095, 0.0095), radius=1.0))
    parts.append(add("cyl", f"Forearm {side}", M_IVORY, loc=(sh[0] + 0.004 * sx, 0, 0.058), scale=(0.0075, 0.0075, 0.022), radius=1.0, depth=2.0))
    parts.append(add("sphere", f"Hand {side}", M_IVORY, loc=(sh[0] + 0.004 * sx, 0, 0.040), scale=(0.0115, 0.010, 0.012), radius=1.0))

# ---------- legs and feet ----------
for side, sx in (("L", -1), ("R", 1)):
    hx = 0.020 * sx
    parts.append(add("sphere", f"Hip {side}", M_GRAPH, loc=(hx, 0, 0.072), scale=(0.012, 0.012, 0.012), radius=1.0))
    parts.append(add("cyl", f"Thigh {side}", M_IVORY, loc=(hx, 0, 0.050), scale=(0.0105, 0.0105, 0.022), radius=1.0, depth=2.0))
    parts.append(add("sphere", f"Knee {side}", M_CHAMP, loc=(hx, 0, 0.030), scale=(0.0115, 0.0115, 0.0115), radius=1.0))
    parts.append(add("cyl", f"Shin {side}", M_IVORY, loc=(hx, 0, 0.016), scale=(0.0095, 0.0095, 0.015), radius=1.0, depth=2.0))
    parts.append(add("sphere", f"Foot {side}", M_IVORY, loc=(hx, -0.006, 0.010), scale=(0.018, 0.028, 0.012), radius=1.0))
    parts.append(add("cyl", f"Ankle ring {side}", M_CHAMP, loc=(hx, 0, 0.020), scale=(0.011, 0.011, 0.003), radius=1.0, depth=1.0))

# ---------- join into one object for export; keep parts as named children ----------
bpy.ops.object.select_all(action="DESELECT")
for p in parts:
    p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.join()
nora = bpy.context.active_object
nora.name = "Nora"
bpy.ops.object.shade_smooth()
bpy.ops.object.transform_apply(location=False, rotation=False, scale=False)

# ---------- save and export ----------
blend_path = os.path.join(out_dir, "nora.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
glb_path = os.path.join(out_dir, "nora.glb")
bpy.ops.export_scene.gltf(filepath=glb_path, export_format="GLB", use_selection=False, export_yup=True, export_apply=True)
dims = nora.dimensions
print(f"NORA_OK dims_m={tuple(round(d, 4) for d in dims)} glb={glb_path}")
