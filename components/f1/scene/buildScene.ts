import * as THREE from "three"
import { buildSky, type SkySystem } from "./sky"
import { buildSuzukaTrack, type TrackSystem } from "./track"
import { buildEnvironment, type EnvironmentSystem } from "./environment"
import { buildStations, type Station } from "./stations"
import { buildW15Car, type CarRig } from "./car"

export type RenderQuality = "full" | "stable"

export type SceneRig = {
  scene: THREE.Scene
  renderer: THREE.WebGLRenderer
  camera: THREE.PerspectiveCamera
  sky: SkySystem
  track: TrackSystem
  environment: EnvironmentSystem
  stations: Station[]
  car: CarRig
  carGlow: THREE.PointLight
  renderQuality: RenderQuality
  applyRenderQuality: (quality: RenderQuality) => void
  dispose: () => void
}

export function buildScene(mount: HTMLDivElement, initialQuality: RenderQuality = "full"): SceneRig {
  const scene = new THREE.Scene()

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75))
  renderer.setSize(mount.clientWidth, mount.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.18
  mount.appendChild(renderer.domElement)

  const camera = new THREE.PerspectiveCamera(46, mount.clientWidth / Math.max(mount.clientHeight, 1), 0.1, 2200)
  camera.position.set(-90, 50, 140)

  const sky = buildSky(scene)
  const track = buildSuzukaTrack()
  scene.add(track.group)

  const environment = buildEnvironment(scene)
  const { stations } = buildStations(scene)

  const car = buildW15Car()
  scene.add(car.root)

  const carGlow = new THREE.PointLight("#00D2BE", 1.6, 32)
  carGlow.position.set(0, 6, 0)
  scene.add(carGlow)

  let renderQuality: RenderQuality = "full"
  const shadowState = new WeakMap<THREE.Mesh, { castShadow: boolean; receiveShadow: boolean }>()

  const applyRenderQuality = (quality: RenderQuality) => {
    if (quality === renderQuality) return
    renderQuality = quality

    if (quality === "full") {
      renderer.shadowMap.enabled = true
      renderer.shadowMap.type = THREE.PCFSoftShadowMap
      sky.sunLight.castShadow = true
      sky.sunLight.intensity = 2.4
      sky.hemi.intensity = 0.95
      carGlow.intensity = 1.6
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        const saved = shadowState.get(mesh)
        if (!mesh.isMesh || !saved) return
        mesh.castShadow = saved.castShadow
        mesh.receiveShadow = saved.receiveShadow
      })
      return
    }

    renderer.shadowMap.enabled = false
    sky.sunLight.castShadow = false
    sky.sunLight.intensity = 1.85
    sky.hemi.intensity = 1.08
    carGlow.intensity = 1.0

    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh
      if (!mesh.isMesh) return
      if (!shadowState.has(mesh)) {
        shadowState.set(mesh, { castShadow: mesh.castShadow, receiveShadow: mesh.receiveShadow })
      }
      mesh.castShadow = false
      mesh.receiveShadow = false
    })
  }

  applyRenderQuality(initialQuality)

  const dispose = () => {
    renderer.dispose()
    scene.traverse((obj) => {
      const mesh = obj as unknown as { geometry?: { dispose: () => void }; material?: { dispose?: () => void } | Array<{ dispose?: () => void }> }
      mesh.geometry?.dispose()
      if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose?.())
      else mesh.material?.dispose?.()
    })
    if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
  }

  return {
    scene,
    renderer,
    camera,
    sky,
    track,
    environment,
    stations,
    car,
    carGlow,
    get renderQuality() {
      return renderQuality
    },
    applyRenderQuality,
    dispose,
  }
}
