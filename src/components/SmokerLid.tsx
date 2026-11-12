"use client";

import { useEffect, useRef } from "react";
import * as T from "three";

// The approved photograph is projected onto a curved, solid lid. Its opacity
// remains one at every angle; only the hinge rotates. The chamber stays still.
export default function SmokerLid() {
  const hostRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    const root = host?.closest<HTMLElement>("[data-smoker-root]");
    if (!host || !root) return;
    let stopped = false;
    let renderer: T.WebGLRenderer;
    const resources: Array<{ dispose(): void }> = [];
    const keep = <A extends { dispose(): void }>(value: A): A => { resources.push(value); return value; };
    function ready(fallback = false) {
      if (stopped || !root) return;
      root.dataset.lidReady = fallback ? "fallback" : "true";
      root.dispatchEvent(new Event("smoker-ready"));
    }
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
    catch { ready(true); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.65));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.setAttribute("aria-hidden", "true");
    host.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(2 * Math.atan(.941 / 5) * 180 / Math.PI, 1672 / 941, .05, 30);
    camera.position.set(0, 0, 5);
    const hinge = new T.Group();
    const pivot = new T.Vector3(0, .988, -.25);
    hinge.position.copy(pivot);
    scene.add(hinge);

    const bottom = .869;
    const hole = { left: .370, right: .630, top: .237, bottom: .321 };
    function point(u: number, v: number, inside = false) {
      const t = T.MathUtils.clamp(v / bottom, 0, 1);
      const z = -.25 + .62 * t + .48 * Math.sin(Math.PI * t) - (inside ? .033 : 0);
      const factor = (5 - z) / 5;
      return new T.Vector3((u - .5) * 3.344 * factor, (.5 - v) * 1.882 * factor, z).sub(pivot);
    }
    function left(v: number) { return .019 + .071 * Math.pow(1 - T.MathUtils.clamp(v / bottom, 0, 1), 2.3); }
    const rows = [...new Set([-.08, ...Array.from({ length: 49 }, (_, i) => i * bottom / 48), hole.top, hole.bottom])].sort((a, b) => a - b);
    function geometry(inside = false, glassOnly = false) {
      const positions: number[] = [], uv: number[] = [];
      function vertex(u: number, v: number) { const p = point(u, v, inside); positions.push(p.x, p.y, p.z); uv.push(u, 1 - v); }
      function cell(a: number, b: number, c: number, d: number, y0: number, y1: number) {
        vertex(a, y0); vertex(c, y1); vertex(b, y0);
        vertex(b, y0); vertex(c, y1); vertex(d, y1);
      }
      for (let row = 0; row < rows.length - 1; row++) {
        const y0 = rows[row]!, y1 = rows[row + 1]!;
        const edges0 = [left(y0), hole.left, hole.right, 1 - left(y0)];
        const edges1 = [left(y1), hole.left, hole.right, 1 - left(y1)];
        for (let region = 0; region < 3; region++) {
          const isHole = region === 1 && y0 >= hole.top - .00001 && y1 <= hole.bottom + .00001;
          if (glassOnly !== isHole) continue;
          for (let x = 0; x < 12; x++) {
            const a = T.MathUtils.lerp(edges0[region]!, edges0[region + 1]!, x / 12);
            const b = T.MathUtils.lerp(edges0[region]!, edges0[region + 1]!, (x + 1) / 12);
            const c = T.MathUtils.lerp(edges1[region]!, edges1[region + 1]!, x / 12);
            const d = T.MathUtils.lerp(edges1[region]!, edges1[region + 1]!, (x + 1) / 12);
            cell(a, b, c, d, y0, y1);
          }
        }
      }
      const g = keep(new T.BufferGeometry());
      g.setAttribute("position", new T.Float32BufferAttribute(positions, 3));
      g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
      g.computeVertexNormals();
      return g;
    }
    const loader = new T.TextureLoader();
    function texture(url: string) { return new Promise<T.Texture>((resolve, reject) => { loader.load(url, map => { if (stopped) { map.dispose(); return; } keep(map); map.colorSpace = T.SRGBColorSpace; map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); resolve(map); }, undefined, reject); }); }
    let initialized = false;
    function render() {
      if (stopped || !initialized || !root) return;
      const opening = T.MathUtils.clamp(Number(root.style.getPropertyValue("--opening")) || 0, 0, 1);
      hinge.rotation.x = -opening * Math.PI * .525;
      renderer.render(scene, camera);
    }
    function resize() { if (!host || stopped) return; renderer.setSize(Math.max(1, host.clientWidth), Math.max(1, host.clientHeight), false); render(); }
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    root.addEventListener("smoker-frame", render);
    const onLost = (event: Event) => { event.preventDefault(); ready(true); };
    renderer.domElement.addEventListener("webglcontextlost", onLost);
    void Promise.all([texture("/images/hero-reference-closed.webp"), texture("/images/smoker-steel-v7.webp")]).then(([photo, steel]) => {
      if (stopped) return;
      const front = keep(new T.MeshBasicMaterial({ map: photo, side: T.FrontSide, toneMapped: false }));
      const inner = keep(new T.MeshStandardMaterial({ map: steel, color: 0x8d8881, roughness: .88, metalness: .28, side: T.BackSide }));
      hinge.add(new T.Mesh(geometry(), front), new T.Mesh(geometry(true), inner));
      const edge = keep(new T.MeshStandardMaterial({ color: 0x353c3d, roughness: .36, metalness: .85, side: T.DoubleSide }));
      function rim(points: T.Vector3[], radius: number, material: T.Material) {
        const curve = new T.CatmullRomCurve3(points);
        const mesh = new T.Mesh(keep(new T.TubeGeometry(curve, Math.max(12, points.length * 2), radius, 6, false)), material);
        hinge.add(mesh);
      }
      // Seamed double walls and a rounded lower lip give the shell real thickness.
      for (const side of [0, 1]) {
        rim(rows.map(v => point(side ? 1 - left(v) : left(v), v, true)), .017, edge);
      }
      rim(Array.from({ length: 29 }, (_, i) => point(T.MathUtils.lerp(left(bottom), 1 - left(bottom), i / 28), bottom)), .018, edge);
      const glass = keep(new T.MeshBasicMaterial({ color: 0x142225, transparent: true, opacity: .40, side: T.DoubleSide, depthWrite: false, toneMapped: false }));
      hinge.add(new T.Mesh(geometry(false, true), glass));
      // Clear glass is only a moving pane, never a photograph of the contents.
      const corners = [[hole.left, hole.top], [hole.right, hole.top], [hole.right, hole.bottom], [hole.left, hole.bottom], [hole.left, hole.top]];
      for (let side = 0; side < 4; side++) {
        const a = corners[side]!, b = corners[side + 1]!;
        rim(Array.from({ length: 13 }, (_, i) => point(T.MathUtils.lerp(a[0]!, b[0]!, i / 12), T.MathUtils.lerp(a[1]!, b[1]!, i / 12))), .005, edge);
      }
      // Warm grazing illumination reveals the soot and steel on the inner face.
      scene.add(new T.HemisphereLight(0xf3eee4, 0x221b17, 2));
      const key = new T.DirectionalLight(0xffdfba, 2.1); key.position.set(-3, -.4, 5); scene.add(key);
      const fill = new T.DirectionalLight(0xb6c7cf, 1.3); fill.position.set(4, 3, 4); scene.add(fill);
      initialized = true; resize(); render(); ready();
    }).catch(() => ready(true));
    resize();
    return () => { stopped = true; observer.disconnect(); root.removeEventListener("smoker-frame", render); renderer.domElement.removeEventListener("webglcontextlost", onLost); resources.forEach(resource => resource.dispose()); renderer.dispose(); renderer.domElement.remove(); };
  }, []);
  return <div ref={hostRef} data-solid-lid style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
}
