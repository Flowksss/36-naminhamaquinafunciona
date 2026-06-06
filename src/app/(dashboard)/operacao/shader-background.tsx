"use client";

import { useEffect, useRef } from "react";

// Fundo shader interativo (WebGL): plasma teal/cyan reagindo ao mouse + ripple no clique.
// Adaptado do design Open Design "ERP AgroNegócio". Com cleanup + guards.
export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // respeita preferência de menos movimento
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vs = `attribute vec2 position; void main(){ gl_Position = vec4(position,0.0,1.0); }`;
    const fs = `
      precision highp float;
      uniform float u_time; uniform vec2 u_resolution; uniform vec2 u_mouse;
      uniform float u_click;
      vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec2 mod289(vec2 x){return x-floor(x*(1.0/289.0))*289.0;}
      vec3 permute(vec3 x){return mod289(((x*34.0)+1.0)*x);}
      float snoise(vec2 v){
        const vec4 C=vec4(0.211324865405187,0.366025403784439,-0.577350269189626,0.024390243902439);
        vec2 i=floor(v+dot(v,C.yy)); vec2 x0=v-i+dot(i,C.xx);
        vec2 i1; i1=(x0.x>x0.y)?vec2(1.0,0.0):vec2(0.0,1.0);
        vec4 x12=x0.xyxy+C.xxzz; x12.xy-=i1; i=mod289(i);
        vec3 p=permute(permute(i.y+vec3(0.0,i1.y,1.0))+i.x+vec3(0.0,i1.x,1.0));
        vec3 m=max(0.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.0);
        m=m*m; m=m*m;
        vec3 x=2.0*fract(p*C.www)-1.0; vec3 h=abs(x)-0.5; vec3 ox=floor(x+0.5); vec3 a0=x-ox;
        m*=1.79284291400159-0.85373472095314*(a0*a0+h*h);
        vec3 g; g.x=a0.x*x0.x+h.x*x0.y; g.yz=a0.yz*x12.xz+h.yz*x12.yw;
        return 130.0*dot(m,g);
      }
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution.xy;
        vec2 mouse=u_mouse/u_resolution.xy;
        float t=u_time*0.2;
        float n1=snoise(uv*2.0+t+snoise(uv*0.5+t*0.5));
        float n2=snoise(uv*3.0-t*0.8+n1*0.5);
        float dist=distance(uv,mouse);
        float ripple=sin(dist*20.0-u_time*5.0)*exp(-dist*4.0)*(0.2+u_click*0.6);
        vec3 col1=vec3(0.01,0.05,0.04);
        vec3 col2=vec3(0.0,0.3,0.25);
        vec3 col3=vec3(0.1,0.8,0.6);
        vec3 c=mix(col1,col2,n1*0.5+0.5);
        c=mix(c,col3,n2*0.3+ripple);
        float vig=1.0-distance(uv,vec2(0.5))*0.8;
        c*=vig;
        gl_FragColor=vec4(c*0.6,1.0);
      }`;

    function mkShader(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, mkShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, mkShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    gl.useProgram(program);

    const posLoc = gl.getAttribLocation(program, "position");
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");
    const clickLoc = gl.getUniformLocation(program, "u_click");

    let mouseX = 0, mouseY = 0, click = 0;
    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = window.innerHeight - e.clientY;
    };
    const onClick = () => { click = 1; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onClick);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    let raf = 0;
    const render = (t: number) => {
      click *= 0.92; // decai o ripple do clique
      gl.uniform1f(timeLoc, t * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform2f(mouseLoc, mouseX, mouseY);
      gl.uniform1f(clickLoc, click);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", zIndex: 0, pointerEvents: "none" }}
    />
  );
}
