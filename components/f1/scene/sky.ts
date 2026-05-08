import * as THREE from "three"
import { HEMI_GROUND, HEMI_SKY, PALETTE, SUNLIGHT_COLOR } from "./palette"

export type SkySystem = {
  skyMesh: THREE.Mesh
  sun: THREE.Group
  sunLight: THREE.DirectionalLight
  hemi: THREE.HemisphereLight
}

const skyVertex = /* glsl */ `
  varying vec3 vWorldPos;
  void main() {
    vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const skyFragment = /* glsl */ `
  varying vec3 vWorldPos;
  uniform vec3 cHorizon;
  uniform vec3 cMid;
  uniform vec3 cDusk;
  uniform vec3 cZenith;
  uniform vec3 sunDir;
  uniform vec3 sunGlow;

  void main() {
    vec3 dir = normalize(vWorldPos);
    float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

    vec3 col;
    if (h < 0.45) {
      col = mix(cHorizon, cMid, smoothstep(0.0, 0.45, h));
    } else if (h < 0.7) {
      col = mix(cMid, cDusk, smoothstep(0.45, 0.7, h));
    } else {
      col = mix(cDusk, cZenith, smoothstep(0.7, 1.0, h));
    }

    float sunDot = max(dot(normalize(dir), normalize(sunDir)), 0.0);
    float glow = pow(sunDot, 6.0) * 0.55 + pow(sunDot, 24.0) * 0.9;
    col += sunGlow * glow;

    float horizonHaze = pow(1.0 - abs(dir.y), 6.0) * 0.35;
    col += sunGlow * horizonHaze * max(dot(normalize(vec3(dir.x, 0.0, dir.z)), normalize(vec3(sunDir.x, 0.0, sunDir.z))), 0.0);

    gl_FragColor = vec4(col, 1.0);
  }
`

export function buildSky(scene: THREE.Scene): SkySystem {
  const sunDirection = new THREE.Vector3(-0.6, 0.18, -0.78).normalize()

  const skyGeo = new THREE.SphereGeometry(900, 32, 16)
  const skyMat = new THREE.ShaderMaterial({
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      cHorizon: { value: new THREE.Color(PALETTE.skyHorizon) },
      cMid: { value: new THREE.Color(PALETTE.skyMid) },
      cDusk: { value: new THREE.Color(PALETTE.skyDusk) },
      cZenith: { value: new THREE.Color(PALETTE.skyZenith) },
      sunDir: { value: sunDirection },
      sunGlow: { value: new THREE.Color(PALETTE.sunGlow).multiplyScalar(0.45) },
    },
  })
  const skyMesh = new THREE.Mesh(skyGeo, skyMat)
  skyMesh.renderOrder = -1
  scene.add(skyMesh)

  const sun = new THREE.Group()
  const sunCore = new THREE.Mesh(
    new THREE.SphereGeometry(28, 32, 24),
    new THREE.MeshBasicMaterial({ color: PALETTE.sunCore, transparent: true, opacity: 0.95, depthWrite: false }),
  )
  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(48, 24, 16),
    new THREE.MeshBasicMaterial({ color: PALETTE.sunGlow, transparent: true, opacity: 0.32, blending: THREE.AdditiveBlending, depthWrite: false }),
  )
  sun.add(sunCore, sunHalo)
  sun.position.copy(sunDirection.clone().multiplyScalar(620))
  scene.add(sun)

  const hemi = new THREE.HemisphereLight(HEMI_SKY, HEMI_GROUND, 0.95)
  hemi.position.set(0, 80, 0)
  scene.add(hemi)

  const sunLight = new THREE.DirectionalLight(SUNLIGHT_COLOR, 2.4)
  sunLight.position.copy(sunDirection.clone().multiplyScalar(120))
  sunLight.target.position.set(0, 0, 0)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.set(2048, 2048)
  sunLight.shadow.camera.left = -120
  sunLight.shadow.camera.right = 120
  sunLight.shadow.camera.top = 120
  sunLight.shadow.camera.bottom = -120
  sunLight.shadow.camera.near = 1
  sunLight.shadow.camera.far = 360
  sunLight.shadow.bias = -0.0008
  sunLight.shadow.normalBias = 0.02
  scene.add(sunLight)
  scene.add(sunLight.target)

  scene.fog = new THREE.FogExp2(PALETTE.fogWarm, 0.0072)

  return { skyMesh, sun, sunLight, hemi }
}
