"use client";

import { useEffect, useRef, useState } from "react";
import * as T from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { FontLoader, type Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

export default function SmokerScene() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [fallback, setFallback] = useState(false);
  useEffect(() => {
    const host = hostRef.current;
    const root = host?.closest<HTMLElement>("[data-smoker-root]");
    if (!host || !root) return;
    let disposed = false;
    let renderer: T.WebGLRenderer;
    try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
    catch { setFallback(true); root.dataset.sceneReady = "true"; window.dispatchEvent(new Event("smoker-ready")); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.7));
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);
    const scene = new T.Scene();
    const pmrem = new T.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .05);
    scene.environment = environment.texture;
    scene.environmentIntensity = .55;
    room.dispose(); pmrem.dispose();
    const camera = new T.PerspectiveCamera(37, 1, .1, 100);
    const group = new T.Group(); scene.add(group);
    const resources: Array<{ dispose: () => void }> = [];
    function keep<A extends { dispose: () => void }>(item: A): A { resources.push(item); return item; }
    const steel = keep(new T.MeshStandardMaterial({ color: 0x858d90, roughness: .27, metalness: .94 }));
    const black = keep(new T.MeshStandardMaterial({ color: 0x080b0d, roughness: .48, metalness: .67 }));
    const inner = keep(new T.MeshStandardMaterial({ color: 0x090d0f, roughness: .8, metalness: .4, side: T.DoubleSide }));
    const noise = document.createElement("canvas"); noise.width = noise.height = 128;
    const nc = noise.getContext("2d")!; const pixels = nc.createImageData(128, 128);
    let seed = 71; const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    for (let i = 0; i < pixels.data.length; i += 4) { const n = 100 + random() * 65; pixels.data[i] = pixels.data[i+1] = pixels.data[i+2] = n; pixels.data[i+3] = 255; }
    nc.putImageData(pixels, 0, 0);
    const bump = keep(new T.CanvasTexture(noise)); bump.wrapS = bump.wrapT = T.RepeatWrapping; bump.repeat.set(9, 5); black.bumpMap = bump; black.bumpScale = .018;
    function box(parent: T.Object3D, x: number, y: number, z: number, px: number, py: number, pz: number, mat: T.Material) {
      const mesh = new T.Mesh(keep(new T.BoxGeometry(x,y,z)), mat); mesh.position.set(px,py,pz); parent.add(mesh); return mesh;
    }
    function bar(parent: T.Object3D, a: T.Vector3, b: T.Vector3, radius: number, mat: T.Material) {
      const direction = b.clone().sub(a);
      const mesh = new T.Mesh(keep(new T.CylinderGeometry(radius, radius, direction.length(), 12)), mat);
      mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0), direction.normalize()); parent.add(mesh); return mesh;
    }
    // Cooking chamber: solid walls, grate and coal bed are separate objects.
    box(group, .2, .9, 5.1, -4.45, -.4, 0, black); box(group, .2, .9, 5.1, 4.45, -.4, 0, black);
    box(group, 8.8, .9, .18, 0, -.4, 2.5, black); box(group, 8.8, .9, .18, 0, -.4, -2.5, black);
    box(group, 9.1, .12, .17, 0, .04, 2.55, steel);
    box(group, .14, .12, 5.15, -4.5, .04, 0, steel); box(group, .14, .12, 5.15, 4.5, .04, 0, steel);
    for (let i = 0; i < 38; i++) { const x = -4.2 + i * 8.4/37; bar(group, new T.Vector3(x,0,-2.35),new T.Vector3(x,0,2.35),.025,steel); }
    bar(group,new T.Vector3(-4.3,-.04,-1.2),new T.Vector3(4.3,-.04,-1.2),.045,steel);
    bar(group,new T.Vector3(-4.3,-.04,1.2),new T.Vector3(4.3,-.04,1.2),.045,steel);
    const coalMaterial = keep(new T.MeshStandardMaterial({ color: 0x101010, emissive: 0x000000, emissiveIntensity: .5, roughness: 1 }));
    const coal = new T.Mesh(keep(new T.PlaneGeometry(8.65,4.7,28,16)),coalMaterial);
    coal.rotation.x = -Math.PI/2; coal.position.y = -.55; group.add(coal);
    const pos = coal.geometry.getAttribute("position");
    for(let i=0;i<pos.count;i++) pos.setZ(i,random()*.06); coal.geometry.computeVertexNormals();
    const glow = new T.PointLight(0xff6727, 18, 12, 2); glow.position.set(0,-.28,.4); group.add(glow);
    scene.add(new T.HemisphereLight(0xdde9f5,0x292422,1.1));
    const key = new T.DirectionalLight(0xffffff,1.8);key.position.set(-4,8,4);scene.add(key);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:.1,far:30});key.shadow.bias=-.0003;key.shadow.normalBias=.025;
    // A thick curved lid. The window is a physical hole in both shell surfaces.
    const hinge = new T.Group(); hinge.position.set(0,.1,-2.5); group.add(hinge);
    const arch = (z: number) => .06 + 1.25*Math.sin(Math.PI*z/5);
    const xMin=-4.45,xMax=4.45,zMin=0,zMax=5;
    function surface(inset: number, windowOnly=false) {
      const positions:number[]=[];const uv:number[]=[];
      const xs=[xMin,-3.1,3.1,xMax]; const zs=Array.from({length:51},(_,i)=>i/10);
      function vertex(x:number,z:number){positions.push(x,arch(z)-inset,z);uv.push((x-xMin)/(xMax-xMin),z/5);}
      for(let xi=0;xi<3;xi++)for(let zi=0;zi<zs.length-1;zi++) {
        const a=xs[xi]!,b=xs[xi+1]!,c=zs[zi]!,d=zs[zi+1]!;
        const hole=xi===1&&c>=1.3&&d<=3.7;
        if(windowOnly?!hole:hole)continue;
        vertex(a,c);vertex(b,d);vertex(b,c);vertex(a,c);vertex(a,d);vertex(b,d);
      }
      const g=keep(new T.BufferGeometry());g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));const smooth=keep(mergeVertices(g));smooth.computeVertexNormals();return smooth;
    }
    const shellMat=keep(black.clone());shellMat.side=T.DoubleSide;
    hinge.add(new T.Mesh(surface(0),shellMat));hinge.add(new T.Mesh(surface(.10),inner));
    // Side cheeks provide actual volume and remain visible during rotation.
    const sideShape=new T.Shape();sideShape.moveTo(0,0);for(let i=0;i<=32;i++){const z=i*5/32;sideShape.lineTo(z,arch(z));}sideShape.lineTo(5,0);sideShape.closePath();
    const sideGeometry=keep(new T.ExtrudeGeometry(sideShape,{depth:.12,bevelEnabled:true,bevelSize:.035,bevelThickness:.02,bevelSegments:2,steps:1}));
    for(const x of [-4.45,4.33]) {const side=new T.Mesh(sideGeometry,black);side.rotation.y=-Math.PI/2;side.position.set(x,0,0);hinge.add(side);}
    const glass=keep(new T.MeshPhysicalMaterial({color:0x758783,transparent:true,opacity:.24,roughness:.12,metalness:.2,depthWrite:false,side:T.DoubleSide}));
    const glassMesh=new T.Mesh(surface(.025,true),glass);glassMesh.renderOrder=2;hinge.add(glassMesh);
    const edgePoints:T.Vector3[]=[];
    for(let i=0;i<=16;i++){const z=1.3+i*2.4/16;edgePoints.push(new T.Vector3(-3.1,arch(z)+.025,z));}
    for(let i=0;i<=16;i++){const x=-3.1+i*6.2/16;edgePoints.push(new T.Vector3(x,arch(3.7)+.025,3.7));}
    for(let i=0;i<=16;i++){const z=3.7-i*2.4/16;edgePoints.push(new T.Vector3(3.1,arch(z)+.025,z));}
    for(let i=0;i<=16;i++){const x=3.1-i*6.2/16;edgePoints.push(new T.Vector3(x,arch(1.3)+.025,1.3));}
    const rim=new T.Mesh(keep(new T.TubeGeometry(new T.CatmullRomCurve3(edgePoints,true),100,.045,8,true)),steel);hinge.add(rim);
    for(const x of [-3.1,0,3.1])for(const z of [1.3,3.7]){const screw=new T.Mesh(keep(new T.SphereGeometry(.065,10,6)),steel);screw.scale.y=.35;screw.position.set(x,arch(z)+.07,z);hinge.add(screw);}
    for(const x of [-2.8,2.8])bar(hinge,new T.Vector3(x,arch(4.5),4.5),new T.Vector3(x,.8,5.05),.09,black);
    bar(hinge,new T.Vector3(-2.9,.8,5.05),new T.Vector3(2.9,.8,5.05),.105,steel);
    for(const x of [-3.5,3.5])bar(group,new T.Vector3(x-.35,.1,-2.5),new T.Vector3(x+.35,.1,-2.5),.13,steel);
    // Solid glyph geometry: front faces, bevels and bronze side walls.
    const textGroup = new T.Group();textGroup.rotation.x=-.70;textGroup.position.set(0,.58,1.0);group.add(textGroup);
    const faceMaterial = keep(new T.MeshStandardMaterial({color:0xffffff,roughness:.95,metalness:0,bumpScale:.006}));
    const edgeMaterial = keep(new T.MeshStandardMaterial({color:0xb79876,roughness:.95,metalness:0}));
    let font: Font | null = null;
    let lastMobile: boolean | null = null;
    function paintLabel() {
      if (!font || !host) return;
      const mobile = false;
      if (mobile === lastMobile) return;
      lastMobile = mobile;
      while(textGroup.children.length){const child=textGroup.children[0] as T.Mesh;child.geometry.dispose();textGroup.remove(child);}
      const lines = mobile ? ["Вкус —", "который", "стоит ждать."] : ["Вкус — который", "стоит ждать."];
      const lineGap = mobile ? 1.12 : 1.65;
      lines.forEach((line,index) => {
        const geometry = new TextGeometry(line, {font:font!,size:mobile?.83:.88,depth:.035,curveSegments:8,bevelEnabled:true,bevelSize:.007,bevelThickness:.009,bevelSegments:3});
        geometry.computeBoundingBox();
        const bounds=geometry.boundingBox!;
        const width=bounds.max.x-bounds.min.x;
        const scale=Math.min(1,8.05/width);
        geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,0);
        geometry.scale(scale,scale,1);
        const positions=geometry.getAttribute('position');const uvs=geometry.getAttribute('uv');
        for(let i=0;i<uvs.count;i++)uvs.setXY(i,(positions.getX(i)+width*scale/2)/(width*scale),positions.getY(i)/.8);
        uvs.needsUpdate=true;
        const mesh=new T.Mesh(geometry,[faceMaterial,edgeMaterial]);
        mesh.position.set(0,index===0?.16:-.70,0);
        mesh.castShadow=true;mesh.receiveShadow=true;textGroup.add(mesh);
      });
    }
    new FontLoader().load('/fonts/bbq-slab-3d-v6.json', loaded => {
      if(disposed)return;font=loaded;paintLabel();root.dataset.sceneReady='true';window.dispatchEvent(new Event('smoker-ready'));
    },undefined,()=>{if(!disposed){setFallback(true);root.dataset.sceneReady='true';window.dispatchEvent(new Event('smoker-ready'));}});
    const smokeCanvas=document.createElement('canvas');smokeCanvas.width=smokeCanvas.height=64;const sc=smokeCanvas.getContext('2d')!;const grad=sc.createRadialGradient(32,32,0,32,32,32);grad.addColorStop(0,'rgba(220,226,220,.22)');grad.addColorStop(.5,'rgba(210,216,210,.09)');grad.addColorStop(1,'rgba(210,216,210,0)');sc.fillStyle=grad;sc.fillRect(0,0,64,64);const smokeTexture=keep(new T.CanvasTexture(smokeCanvas));
    const smoke:T.Sprite[]=[];for(let i=0;i<7;i++){const mat=keep(new T.SpriteMaterial({map:smokeTexture,transparent:true,opacity:.1,depthWrite:false}));const sprite=new T.Sprite(mat);sprite.userData.phase=i/7;sprite.scale.setScalar(1.6);group.add(sprite);smoke.push(sprite);}
    const texture=new T.TextureLoader();
    const sootTexture=keep(texture.load('/images/smoker-steel-v7.webp',()=>{if(disposed)return;sootTexture.colorSpace=T.SRGBColorSpace;inner.color.set(0xffffff);inner.map=sootTexture;inner.bumpMap=sootTexture;inner.bumpScale=.028;inner.roughness=.96;inner.metalness=.12;inner.needsUpdate=true;}));
    const meatTexture=keep(texture.load('/images/beef-grain-v7.webp',()=>{if(disposed)return;const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d')!;c.fillStyle='#f2dfbd';c.fillRect(0,0,1024,512);c.globalAlpha=.14;c.drawImage(meatTexture.image,0,0,1024,512);const face=keep(new T.CanvasTexture(canvas));face.colorSpace=T.SRGBColorSpace;faceMaterial.map=face;faceMaterial.bumpMap=meatTexture;faceMaterial.bumpScale=.006;faceMaterial.needsUpdate=true;}));
const coalTexture=texture.load('/images/embers-v5.webp',()=>{if(disposed){coalTexture.dispose();return;}coalTexture.colorSpace=T.SRGBColorSpace;coalTexture.wrapS=coalTexture.wrapT=T.RepeatWrapping;coalTexture.repeat.set(2,2);coalMaterial.color.set(0x999999);coalMaterial.emissive.set(0xffffff);coalMaterial.map=coalTexture;coalMaterial.emissiveMap=coalTexture;coalMaterial.needsUpdate=true;});keep(coalTexture);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    function resize(){if(!host)return;const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;const vertical=37*Math.PI/180;const distance=Math.max(8.5,11/(2*Math.tan(vertical/2)*camera.aspect));camera.position.set(0,distance*.70,distance*.82);camera.lookAt(0,.85,0);camera.updateProjectionMatrix();paintLabel();}
    const observer=new ResizeObserver(resize);observer.observe(host);resize();
    let visible=true;const io=new IntersectionObserver(([entry])=>{visible=!!entry?.isIntersecting;});io.observe(host);
    let frame=0,last=0,previous=-1;
    function draw(now:number){if(disposed)return;frame=requestAnimationFrame(draw);if(!visible||now-last<33)return;last=now;const opening=Number(root!.style.getPropertyValue('--opening')||1);if(reduced.matches&&opening===previous)return;previous=opening;hinge.rotation.x=-opening*1.6;const t=now/1000;coalMaterial.emissiveIntensity=reduced.matches?.5:.48+Math.sin(t*1.4)*.035;glow.intensity=16+Math.sin(t*1.4)*1.5;for(const sprite of smoke){const p=(t*.13+sprite.userData.phase)%1;sprite.position.set(Math.sin(sprite.userData.phase*21)*3+p*.3,.15+p*1.7,.6+Math.cos(sprite.userData.phase*15));sprite.scale.setScalar(1.1+p*1.7);sprite.material.opacity=reduced.matches?0:Math.sin(p*Math.PI)*.28*opening;}renderer.render(scene,camera);}
    frame=requestAnimationFrame(draw);
    coal.receiveShadow=true;
    const onLost=(event:Event)=>{event.preventDefault();setFallback(true);};renderer.domElement.addEventListener('webglcontextlost',onLost);
    return()=>{disposed=true;cancelAnimationFrame(frame);observer.disconnect();io.disconnect();renderer.domElement.removeEventListener('webglcontextlost',onLost);textGroup.children.forEach(child=>(child as T.Mesh).geometry.dispose());resources.forEach(r=>r.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div ref={hostRef} data-smoker-canvas style={{position:'absolute',inset:0}}>{fallback&&<div style={{position:'absolute',inset:0,background:'linear-gradient(#0005,#0009),url(/images/embers-v5.webp) center/cover',display:'grid',placeItems:'center',textAlign:'center',fontFamily:'var(--font-display)',fontWeight:900,fontSize:'clamp(24px,6vw,90px)',color:'#f3dfba'}}>Вкус — который<br/>стоит ждать.</div>}</div>;
}
