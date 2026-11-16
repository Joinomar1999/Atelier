import sys, math, os, bpy
from mathutils import Vector
out = sys.argv[sys.argv.index("--") + 1]
bpy.ops.wm.open_mainfile(filepath=os.path.join(out, "nora.blend"))
scene = bpy.context.scene
scene.render.engine = "CYCLES"
scene.cycles.device = "CPU"
scene.cycles.samples = 48
scene.cycles.use_denoising = False
scene.render.resolution_x, scene.render.resolution_y = 600, 760
scene.render.film_transparent = False
world = bpy.data.worlds.new("W"); scene.world = world
world.use_nodes = True
world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.93, 0.90, 0.85, 1)
world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
bpy.ops.object.light_add(type="SUN", location=(1, -2, 3)); sun = bpy.context.active_object; sun.data.energy = 3.0; sun.rotation_euler = (0.7, 0.2, 0.6)
bpy.ops.object.light_add(type="AREA", location=(-0.6, -0.6, 0.5)); area = bpy.context.active_object; area.data.energy = 60; area.data.size = 0.6
cam_data = bpy.data.cameras.new("Cam"); cam = bpy.data.objects.new("Cam", cam_data)
scene.collection.objects.link(cam); scene.camera = cam
cam_data.lens = 70
target = Vector((0, 0, 0.15))
views = {"front": -90, "side": 0, "back": 90, "three_quarter": -45}
for name, deg in views.items():
    a = math.radians(deg)
    dist = 0.85
    cam.location = Vector((dist * math.cos(a), dist * math.sin(a), 0.17))
    direction = target - cam.location
    cam.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    scene.render.filepath = os.path.join(out, f"view_{name}.png")
    bpy.ops.render.render(write_still=True)
    print("VIEW", name)
