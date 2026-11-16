"""
The Atelier cast - draft pass for all six characters (phase 2 draft).
One shared builder, per-character configuration from the character family sheet.
Nora is built separately in ../nora/build_nora.py (base file, kept as is).
Run: blender -b --python build_cast.py -- <out_dir>
Output: <name>.glb per character, metres, feet at y=0 (Blender -Y front -> glTF +Z).
These are procedural drafts for layout and scale, not approved sculpts.
"""
import sys, math, os
import bpy, bmesh

out_dir = sys.argv[sys.argv.index("--") + 1] if "--" in sys.argv else os.path.dirname(__file__)

def mat(name, base, rough=0.5, metal=0.0, coat=0.0, emit=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*base, 1.0)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if "Coat Weight" in b.inputs: b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1.0)
        b.inputs["Emission Strength"].default_value = 0.6
    return m

MAT = {
    "ivory": mat("Ivory ceramic", (0.93, 0.89, 0.80), rough=0.32, coat=0.25),
    "champ": mat("Champagne metal", (0.82, 0.64, 0.38), rough=0.25, metal=1.0),
    "graph": mat("Graphite", (0.13, 0.13, 0.14), rough=0.4, metal=0.4),
    "glass": mat("Eye glass", (0.9, 0.93, 0.96), rough=0.02, coat=1.0),
    "iris": mat("Iris dark blue", (0.08, 0.13, 0.19), rough=0.15),
    "pupil": mat("Pupil", (0.01, 0.01, 0.02), rough=0.2),
    "hilite": mat("Highlight", (1, 1, 1), rough=0.1, emit=(1, 1, 1)),
    "slate": mat("Slate fabric", (0.30, 0.32, 0.36), rough=0.8),
    "sand": mat("Sand fabric", (0.80, 0.74, 0.62), rough=0.9),
    "rust": mat("Rust-orange ceramic", (0.78, 0.42, 0.20), rough=0.35, coat=0.2),
    "rose": mat("Dusty rose fabric", (0.80, 0.56, 0.52), rough=0.85),
    "sage": mat("Sage green", (0.42, 0.50, 0.40), rough=0.6),
    "steel": mat("Blue-grey shell", (0.45, 0.55, 0.62), rough=0.3, coat=0.2),
    "lilac": mat("Lilac ceramic", (0.66, 0.60, 0.76), rough=0.3, coat=0.2),
    "glow": mat("Glow", (0.7, 0.8, 1.0), rough=0.2, emit=(0.6, 0.75, 1.0)),
}

def shade(o, m):
    o.data.materials.clear(); o.data.materials.append(m)
    for p in o.data.polygons: p.use_smooth = True
    return o

def prim(kind, name, m, loc=(0, 0, 0), scale=(1, 1, 1), rot=(0, 0, 0), **kw):
    if kind == "sphere": bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, location=loc, radius=1.0)
    elif kind == "cyl": bpy.ops.mesh.primitive_cylinder_add(vertices=20, location=loc, radius=1.0, depth=1.0)
    elif kind == "torus": bpy.ops.mesh.primitive_torus_add(location=loc, major_segments=40, minor_segments=10, **kw)
    elif kind == "cube": bpy.ops.mesh.primitive_cube_add(location=loc, size=2.0)
    o = bpy.context.active_object; o.name = name; o.rotation_euler = rot; o.scale = scale
    bpy.ops.object.transform_apply(scale=True, rotation=False, location=False)
    return shade(o, m)

def limb(name, a, b, r, m):
    """Cylinder between two points a, b (tuples)."""
    ax, ay, az = a; bx, by, bz = b
    L = math.dist(a, b); cx, cy, cz = (ax + bx) / 2, (ay + by) / 2, (az + bz) / 2
    bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=r, depth=L, location=(cx, cy, cz))
    o = bpy.context.active_object; o.name = name
    from mathutils import Vector
    d = Vector((bx - ax, by - ay, bz - az)).normalized()
    o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d)
    return shade(o, m)

def build(name, c):
    parts = []
    H = c["head_r"]; hz = c["head_z"]
    parts.append(prim("sphere", "Head", MAT[c["shell"]], loc=(0, 0, hz), scale=(H, H, H * c.get("head_squash", 1.0))))
    # eyes (large glass, dark or light iris per the sheet)
    er = c["eye_r"]
    for sx in (-1, 1):
        x = c["eye_x"] * sx; y = -H * 0.86
        parts.append(prim("sphere", "Eye glass", MAT["glass"], loc=(x, y, hz + 0.004), scale=(er, er, er)))
        parts.append(prim("sphere", "Iris", MAT[c["iris"]], loc=(x, y - er * 0.35, hz + 0.004), scale=(er * 0.66,) * 3))
        parts.append(prim("sphere", "Pupil", MAT["pupil"], loc=(x, y - er * 0.62, hz + 0.004), scale=(er * 0.32,) * 3))
    # body
    bz, bsx, bsy, bsz = c["torso"]
    parts.append(prim("sphere", "Torso", MAT[c["shell"]], loc=(0, 0, bz), scale=(bsx, bsy, bsz)))
    parts.append(prim("cyl", "Neck", MAT["graph"], loc=(0, 0, c["neck_z"]), scale=(H * 0.35, H * 0.35, H * 0.25)))
    if c.get("waist"):
        parts.append(prim("cyl", "Waist ring", MAT[c["accent"]], loc=(0, 0, bz - bsz * 0.9), scale=(bsx * 0.9, bsx * 0.9, 0.0045)))
    # legs & feet, or wheels, or hover
    if c["loco"] == "legs":
        for sx in (-1, 1):
            hx = 0.020 * sx
            parts.append(limb("Leg", (hx, 0, c["hip_z"]), (hx, 0, c["foot_h"] + 0.012), 0.0105, MAT[c["shell"]]))
            parts.append(prim("sphere", "Foot", MAT[c["shell"]], loc=(hx, -0.007, c["foot_h"] * 0.5), scale=(0.020, 0.030, c["foot_h"] * 0.6)))
    elif c["loco"] == "wheels":
        for sx in (-1, 1):
            parts.append(prim("cyl", "Wheel", MAT["graph"], loc=(0.060 * sx, 0, 0.040), scale=(0.040, 0.040, 0.018), rot=(0, math.pi / 2, 0)))
    elif c["loco"] == "hover":
        parts.append(prim("sphere", "Thruster glow", MAT["glow"], loc=(0, 0, c["hover_z"] - 0.030), scale=(0.018, 0.018, 0.018)))
    # arms
    if c.get("arms", True):
        for sx in (-1, 1):
            parts.append(limb("Arm", (0.040 * sx, 0, bz + 0.012), (0.046 * sx, 0, bz - 0.040), 0.0095, MAT[c["shell"]]))
            parts.append(prim("sphere", "Hand", MAT[c["shell"]], loc=(0.046 * sx, 0, bz - 0.050), scale=(0.011, 0.011, 0.011)))
    # accessories
    for acc in c.get("accessories", []):
        kind = acc[0]
        if kind == "halo":
            parts.append(prim("cyl", "Halo stalk", MAT["champ"], loc=(0, 0, hz + H + 0.006), scale=(0.002, 0.002, 0.006)))
            parts.append(prim("torus", "Halo", MAT["champ"], loc=(0, 0, hz + H + 0.020), rot=(math.pi / 2, 0, 0), major_radius=0.024, minor_radius=0.003))
        elif kind == "antennae":
            for sx in (-1, 1):
                parts.append(limb("Antenna", (0.02 * sx, 0, hz + H * 0.8), (0.035 * sx, 0, hz + H + 0.05), 0.0025, MAT["graph"]))
                parts.append(prim("sphere", "Antenna tip", MAT["champ"], loc=(0.035 * sx, 0, hz + H + 0.05), scale=(0.007, 0.007, 0.007)))
        elif kind == "ball_antenna":
            parts.append(limb("Antenna", (0, 0, hz + H * 0.9), (0.012, 0, hz + H + 0.06), 0.0025, MAT["graph"]))
            parts.append(prim("sphere", "Antenna ball", MAT["champ"], loc=(0.012, 0, hz + H + 0.06), scale=(0.011, 0.011, 0.011)))
        elif kind == "leaf":
            parts.append(prim("sphere", "Leaf", MAT[acc[1]], loc=(0.02, 0.01, hz + H + 0.025), scale=(0.012, 0.005, 0.030), rot=(0.3, 0, 0.5)))
        elif kind == "disc":
            parts.append(prim("cyl", "Disc top", MAT["graph"], loc=(0, 0, hz + H + 0.012), scale=(H * 1.35, H * 1.35, 0.008)))
        elif kind == "tall_fins":
            for sx in (-1, 1):
                parts.append(prim("sphere", "Fin", MAT[acc[1]], loc=(0.030 * sx, 0.006, hz + H * 0.6), scale=(0.010, 0.004, 0.026), rot=(0, 0, 0.5 * sx)))
        elif kind == "cape":
            # simple shell from shoulders to hem, open at the front
            bm = bmesh.new()
            rows, cols = 8, 36; span = math.pi - 0.45
            grid = []
            for i in range(rows + 1):
                t = i / rows; z = bz + 0.02 - t * c.get("cape_len", 0.12)
                row = []
                for j in range(cols + 1):
                    u = -1 + 2 * j / cols; th = u * span
                    r = bsx * 1.25 + 0.022 * t
                    row.append(bm.verts.new((r * math.sin(th), r * math.cos(th), z - 0.006 * t * abs(math.sin(th * 2)))))
                grid.append(row)
            for i in range(rows):
                for j in range(cols):
                    bm.faces.new((grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]))
            bm.normal_update()
            me = bpy.data.meshes.new("Cape"); bm.to_mesh(me); bm.free()
            cape = bpy.data.objects.new("Cape", me); bpy.context.collection.objects.link(cape)
            cape.data.materials.append(MAT[acc[1]])
            bpy.context.view_layer.objects.active = cape; cape.select_set(True)
            s = cape.modifiers.new("T", "SOLIDIFY"); s.thickness = 0.002
            cape.modifiers.new("S", "SUBSURF").levels = 1
            bpy.ops.object.modifier_apply(modifier="T"); bpy.ops.object.modifier_apply(modifier="S")
            parts.append(shade(cape, MAT[acc[1]]))
        elif kind == "satchel":
            parts.append(prim("cube", "Satchel", MAT[acc[1]], loc=(0.05, 0.0, bz - 0.02), scale=(0.018, 0.012, 0.024)))
        elif kind == "belt":
            parts.append(prim("cyl", "Tool belt", MAT["graph"], loc=(0, 0, bz - bsz * 0.4), scale=(bsx * 1.05, bsx * 1.05, 0.010)))
        elif kind == "brooch":
            parts.append(prim("sphere", "Brooch", MAT["champ"], loc=(0, -H * 1.02, bz + 0.005), scale=(0.006, 0.006, 0.006)))
        elif kind == "backpack":
            parts.append(prim("sphere", "Backpack", MAT[acc[1]], loc=(0, bsy * 1.25, bz), scale=(bsx * 0.8, bsy * 0.6, bsz * 0.9)))
    # join, drop to floor, export
    bpy.ops.object.select_all(action="DESELECT")
    for p in parts: p.select_set(True)
    bpy.context.view_layer.objects.active = parts[0]
    bpy.ops.object.join()
    obj = bpy.context.active_object; obj.name = name
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=False)
    zmin = min((obj.matrix_world @ v.co).z for v in obj.data.vertices)
    obj.location.z -= zmin
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=False)
    dims = obj.dimensions
    bpy.ops.export_scene.gltf(filepath=os.path.join(out_dir, name.lower() + ".glb"), export_format="GLB", use_selection=False, export_yup=True, export_apply=True)
    print("CAST_OK %s dims=%s" % (name, tuple(round(d, 3) for d in dims)))
    # clear the scene for the next character
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()

CFG = {
    "Otto": dict(shell="rust", iris="iris", accent="graph", head_r=0.060, head_z=0.20, eye_r=0.022, eye_x=0.027, torso=(0.120, 0.050, 0.045, 0.052), neck_z=0.150, loco="legs", hip_z=0.07, foot_h=0.030, accessories=[("antennae",), ("belt",), ("backpack", "graph")], torso_dims=None),
    "Mika": dict(shell="ivory", iris="iris", accent="rose", head_r=0.050, head_z=0.20, eye_r=0.020, eye_x=0.024, torso=(0.115, 0.034, 0.030, 0.040), neck_z=0.148, loco="legs", hip_z=0.07, foot_h=0.030, accessories=[("leaf", "sage"), ("cape", "rose")]),
    "Eli": dict(shell="ivory", iris="iris", accent="graph", head_r=0.060, head_z=0.12, eye_r=0.022, eye_x=0.028, torso=(0.060, 0.040, 0.040, 0.030), neck_z=0.095, loco="wheels", hover_z=0.0, accessories=[("disc",)], arms=False),
    "Ari": dict(shell="sage", iris="iris", accent="champ", head_r=0.050, head_z=0.27, eye_r=0.021, eye_x=0.024, torso=(0.150, 0.034, 0.028, 0.050), neck_z=0.215, loco="legs", hip_z=0.085, foot_h=0.030, accessories=[("tall_fins", "champ"), ("cape", "champ"), ("satchel", "graph")], cape_len=0.16),
    "Pip": dict(shell="lilac", iris="iris", accent="champ", head_r=0.045, head_z=0.095, eye_r=0.017, eye_x=0.021, torso=(0.045, 0.030, 0.030, 0.030), neck_z=0.060, loco="hover", hover_z=0.030, accessories=[("ball_antenna",)], arms=False),
}

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete()
for name in ["Otto", "Mika", "Eli", "Ari", "Pip"]:
    build(name, CFG[name])
print("CAST_DONE")
