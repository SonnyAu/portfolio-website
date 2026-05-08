import * as THREE from "three"
import { PALETTE } from "./palette"

export type Collider = { x: number; z: number; radius: number }

export type EnvironmentSystem = {
  group: THREE.Group
  ferrisWheel: THREE.Group
  petals: PetalSystem
  colliders: Collider[]
}

export type PetalSystem = {
  mesh: THREE.InstancedMesh
  data: Array<{ pos: THREE.Vector3; vel: THREE.Vector3; rot: number; rotSpeed: number; spawn: THREE.Vector3 }>
  update: (delta: number) => void
}

function buildGround(group: THREE.Group): void {
  const geo = new THREE.PlaneGeometry(1400, 1400, 110, 110)
  geo.rotateX(-Math.PI / 2)

  const positions = geo.attributes.position as THREE.BufferAttribute
  const colors: number[] = []
  const grass = new THREE.Color(PALETTE.grass)
  const grassHill = new THREE.Color(PALETTE.grassHill)
  for (let i = 0; i < positions.count; i += 1) {
    const x = positions.getX(i)
    const z = positions.getZ(i)
    const distFromCenter = Math.hypot(x, z)
    const flatZone = THREE.MathUtils.smoothstep(distFromCenter, 160, 320)
    const noise =
      Math.sin(x * 0.012 + z * 0.016) * 1.4 +
      Math.cos(x * 0.028 - z * 0.02) * 0.8 +
      Math.sin(x * 0.005 + z * 0.0075) * 4.4
    const y = flatZone * Math.max(noise, 0)
    positions.setY(i, y - 0.05)

    const tint = THREE.MathUtils.clamp(y / 5, 0, 1)
    const c = grass.clone().lerp(grassHill, tint)
    colors.push(c.r, c.g, c.b)
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
  geo.computeVertexNormals()

  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0.0, flatShading: true })
  const ground = new THREE.Mesh(geo, mat)
  ground.receiveShadow = true
  group.add(ground)
}

function buildMtFuji(group: THREE.Group, colliders: Collider[]): void {
  const fuji = new THREE.Group()

  const coneGeo = new THREE.ConeGeometry(120, 160, 18, 6)
  const positions = coneGeo.attributes.position as THREE.BufferAttribute
  const colors: number[] = []
  const base = new THREE.Color(PALETTE.fujiBase)
  const snow = new THREE.Color(PALETTE.fujiSnow)
  for (let i = 0; i < positions.count; i += 1) {
    const y = positions.getY(i)
    const t = THREE.MathUtils.smoothstep(y, 40, 75)
    const c = base.clone().lerp(snow, t)
    colors.push(c.r, c.g, c.b)
  }
  coneGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))

  const fujiMat = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 })
  const cone = new THREE.Mesh(coneGeo, fujiMat)
  cone.position.y = 80
  fuji.add(cone)

  const cap = new THREE.Mesh(
    new THREE.ConeGeometry(46, 40, 12, 3),
    new THREE.MeshStandardMaterial({ color: PALETTE.fujiSnow, roughness: 0.85, flatShading: true, emissive: new THREE.Color("#fff0e0"), emissiveIntensity: 0.05 }),
  )
  cap.position.y = 154
  fuji.add(cap)

  const fujiPos = new THREE.Vector3(-450, 0, -680)
  fuji.position.copy(fujiPos)
  group.add(fuji)
  colliders.push({ x: fujiPos.x, z: fujiPos.z, radius: 110 })

  const foothillPos = new THREE.Vector3(-280, 25, -520)
  const foothill = new THREE.Mesh(
    new THREE.ConeGeometry(58, 60, 14, 4),
    new THREE.MeshStandardMaterial({ color: PALETTE.fujiBase, flatShading: true, roughness: 0.95 }),
  )
  foothill.position.copy(foothillPos)
  group.add(foothill)
  colliders.push({ x: foothillPos.x, z: foothillPos.z, radius: 50 })
}

function buildToriiInstance(parent: THREE.Group): THREE.Group {
  const torii = new THREE.Group()
  const red = new THREE.MeshStandardMaterial({ color: PALETTE.toriiRed, roughness: 0.7 })
  const dark = new THREE.MeshStandardMaterial({ color: PALETTE.toriiDark, roughness: 0.6 })

  ;[-3.6, 3.6].forEach((x) => {
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 8.5, 12), red)
    col.position.set(x, 4.25, 0)
    col.castShadow = true
    col.receiveShadow = true
    torii.add(col)
  })

  const lowerBeam = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.45, 0.7), dark)
  lowerBeam.position.set(0, 7.0, 0)
  lowerBeam.castShadow = true
  torii.add(lowerBeam)

  const upperBeam = new THREE.Mesh(new THREE.BoxGeometry(10.5, 0.7, 1.0), red)
  upperBeam.position.set(0, 8.2, 0)
  upperBeam.castShadow = true
  torii.add(upperBeam)

  ;[-5.0, 5.0].forEach((x) => {
    const tip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, 1.2), red)
    tip.position.set(x, 8.3, 0)
    tip.rotation.z = x > 0 ? -0.18 : 0.18
    torii.add(tip)
  })

  const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.8, 0.1), dark)
  plaque.position.set(0, 7.55, 0.4)
  torii.add(plaque)

  parent.add(torii)
  return torii
}

function buildTorii(group: THREE.Group, colliders: Collider[]): void {
  const torii1 = buildToriiInstance(group)
  const t1Pos = new THREE.Vector3(-176, 0, 56)
  torii1.position.copy(t1Pos)
  torii1.rotation.y = Math.PI / 2
  // Pillars are along world X axis but rotated 90deg, so columns are at world (t1Pos.x, t1Pos.z ± 3.6)
  ;[-3.6, 3.6].forEach((off) => {
    colliders.push({ x: t1Pos.x, z: t1Pos.z + off, radius: 1.4 })
  })

  const torii2 = buildToriiInstance(group)
  const t2Pos = new THREE.Vector3(138, 0, 92)
  torii2.position.copy(t2Pos)
  torii2.rotation.y = -Math.PI / 6
  torii2.scale.setScalar(0.7)
  // Apply rotation to local pillar offsets when adding colliders
  const t2Yaw = -Math.PI / 6
  ;[-3.6, 3.6].forEach((off) => {
    const dx = Math.cos(t2Yaw) * off * 0.7
    const dz = Math.sin(t2Yaw) * off * 0.7
    colliders.push({ x: t2Pos.x + dx, z: t2Pos.z + dz, radius: 1.0 })
  })
}

function buildPagoda(group: THREE.Group, colliders: Collider[]): void {
  const pagoda = new THREE.Group()
  const woodMat = new THREE.MeshStandardMaterial({ color: PALETTE.pagodaWood, roughness: 0.8 })
  const roofMat = new THREE.MeshStandardMaterial({ color: PALETTE.pagodaRoof, roughness: 0.65, flatShading: true })
  const trimMat = new THREE.MeshStandardMaterial({ color: PALETTE.pagodaTrim, roughness: 0.7 })

  let baseY = 0
  const baseSize = 4.5
  for (let tier = 0; tier < 5; tier += 1) {
    const size = baseSize * (1 - tier * 0.13)
    const tierHeight = 1.6
    const body = new THREE.Mesh(new THREE.BoxGeometry(size, tierHeight, size), woodMat)
    body.position.y = baseY + tierHeight / 2
    body.castShadow = true
    body.receiveShadow = true
    pagoda.add(body)

    const roofSize = size * 1.35
    const roof = new THREE.Mesh(new THREE.ConeGeometry(roofSize * 0.7, 0.8, 4, 1), roofMat)
    roof.rotation.y = Math.PI / 4
    roof.position.y = baseY + tierHeight + 0.4
    roof.castShadow = true
    pagoda.add(roof)

    const trim = new THREE.Mesh(new THREE.BoxGeometry(size * 1.05, 0.12, size * 1.05), trimMat)
    trim.position.y = baseY + tierHeight + 0.04
    pagoda.add(trim)

    baseY += tierHeight + 0.5
  }

  const spire = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.5, 8), trimMat)
  spire.position.y = baseY + 0.4
  pagoda.add(spire)
  const finial = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), new THREE.MeshStandardMaterial({ color: "#d4a55a", metalness: 0.85, roughness: 0.25 }))
  finial.position.y = baseY + 1.3
  pagoda.add(finial)

  const pagodaPos = new THREE.Vector3(-208, 0, -110)
  pagoda.position.copy(pagodaPos)
  pagoda.scale.setScalar(1.6)
  group.add(pagoda)
  colliders.push({ x: pagodaPos.x, z: pagodaPos.z, radius: 8 })
}

function buildSakuraTrees(group: THREE.Group): void {
  const positions: Array<{ x: number; z: number; scale: number; rot: number; tint: number }> = []
  const seed = 51719
  let s = seed
  const rand = () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }

  for (let i = 0; i < 110; i += 1) {
    const ring = 200 + rand() * 220
    const angle = rand() * Math.PI * 2
    const x = Math.cos(angle) * ring
    const z = Math.sin(angle) * ring * 0.78
    if (Math.hypot(x, z) < 170) continue
    positions.push({ x, z, scale: 0.9 + rand() * 1.4, rot: rand() * Math.PI * 2, tint: rand() })
  }

  const trunkGeo = new THREE.CylinderGeometry(0.18, 0.28, 1.8, 7)
  const trunkMat = new THREE.MeshStandardMaterial({ color: PALETTE.sakuraTrunk, roughness: 0.9 })
  const trunkMesh = new THREE.InstancedMesh(trunkGeo, trunkMat, positions.length)

  const canopyGeo = new THREE.IcosahedronGeometry(1.4, 0)
  const canopyMat = new THREE.MeshStandardMaterial({ color: PALETTE.sakuraPink, roughness: 0.75, flatShading: true, emissive: new THREE.Color(PALETTE.sakuraPink), emissiveIntensity: 0.06 })
  const canopyMesh = new THREE.InstancedMesh(canopyGeo, canopyMat, positions.length * 3)

  const dummy = new THREE.Object3D()
  let canopyIndex = 0
  positions.forEach((p, i) => {
    dummy.position.set(p.x, 0.9 * p.scale, p.z)
    dummy.rotation.set(0, p.rot, 0)
    dummy.scale.setScalar(p.scale)
    dummy.updateMatrix()
    trunkMesh.setMatrixAt(i, dummy.matrix)

    for (let k = 0; k < 3; k += 1) {
      const offX = (Math.cos(p.rot + k * 2.1) * 0.7) * p.scale
      const offZ = (Math.sin(p.rot + k * 2.1) * 0.7) * p.scale
      const offY = 1.8 * p.scale + Math.cos(k) * 0.3 * p.scale
      dummy.position.set(p.x + offX, offY, p.z + offZ)
      dummy.scale.setScalar(p.scale * (0.85 + (k === 0 ? 0.25 : 0)))
      dummy.rotation.set(p.rot + k * 0.7, p.rot + k, k * 0.3)
      dummy.updateMatrix()
      canopyMesh.setMatrixAt(canopyIndex, dummy.matrix)
      canopyIndex += 1
    }
  })

  trunkMesh.instanceMatrix.needsUpdate = true
  canopyMesh.instanceMatrix.needsUpdate = true
  trunkMesh.castShadow = true
  canopyMesh.castShadow = true
  trunkMesh.receiveShadow = true
  canopyMesh.receiveShadow = true
  group.add(trunkMesh)
  group.add(canopyMesh)
}

function buildPaddyTerraces(group: THREE.Group): void {
  const colors = [PALETTE.paddyGreen1, PALETTE.paddyGreen2, PALETTE.paddyGreen3]
  const tiers = [
    { x: 192, z: -130, w: 78, d: 50, tier: 0 },
    { x: 192, z: -130, w: 65, d: 40, tier: 1 },
    { x: 192, z: -130, w: 52, d: 32, tier: 2 },
    { x: -264, z: 156, w: 92, d: 56, tier: 0 },
    { x: -264, z: 156, w: 74, d: 46, tier: 1 },
    { x: 228, z: 208, w: 72, d: 40, tier: 0 },
    { x: 228, z: 208, w: 56, d: 32, tier: 1 },
  ]
  tiers.forEach((t) => {
    const mat = new THREE.MeshStandardMaterial({ color: colors[t.tier % colors.length], roughness: 0.95, flatShading: true })
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(t.w, 0.7 + t.tier * 0.5, t.d), mat)
    mesh.position.set(t.x, 0.35 + t.tier * 0.5, t.z)
    mesh.castShadow = true
    mesh.receiveShadow = true
    group.add(mesh)
  })
}

function buildTokyoSkyline(group: THREE.Group): void {
  const seed = 91337
  let s = seed
  const rand = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 }
  const buildingGeo = new THREE.BoxGeometry(1, 1, 1)
  const cityMat = new THREE.MeshStandardMaterial({ color: PALETTE.cityBlack, emissive: new THREE.Color(PALETTE.cityWindow), emissiveIntensity: 0.18, roughness: 0.6, metalness: 0.4 })
  const count = 130
  const mesh = new THREE.InstancedMesh(buildingGeo, cityMat, count)
  const dummy = new THREE.Object3D()

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + rand() * 0.05
    const radius = 540 + rand() * 180
    const x = Math.cos(angle) * radius
    const z = Math.sin(angle) * radius * 0.9
    if (z < -380 && Math.abs(x) < 480) continue // clear behind Fuji
    const w = 6 + rand() * 12
    const d = 6 + rand() * 12
    const h = 14 + rand() * 64
    dummy.position.set(x, h / 2, z)
    dummy.rotation.set(0, rand() * Math.PI, 0)
    dummy.scale.set(w, h, d)
    dummy.updateMatrix()
    mesh.setMatrixAt(i, dummy.matrix)
  }
  mesh.instanceMatrix.needsUpdate = true
  group.add(mesh)
}

function buildFerrisWheel(group: THREE.Group, colliders: Collider[]): THREE.Group {
  const wheel = new THREE.Group()
  const ringMat = new THREE.MeshStandardMaterial({ color: PALETTE.silver, roughness: 0.4, metalness: 0.7 })
  const cabinMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.4, metalness: 0.5, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.2 })

  const outer = new THREE.Mesh(new THREE.TorusGeometry(11, 0.35, 12, 56), ringMat)
  wheel.add(outer)

  const spokeCount = 16
  for (let i = 0; i < spokeCount; i += 1) {
    const angle = (i / spokeCount) * Math.PI * 2
    const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.18, 22, 0.18), ringMat)
    spoke.rotation.z = angle
    wheel.add(spoke)

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.4, 1.4), cabinMat)
    cabin.position.set(Math.cos(angle) * 11, Math.sin(angle) * 11, 0)
    cabin.userData.spinIndex = i
    wheel.add(cabin)
  }

  wheel.position.set(0, 0, 0)

  const wheelHolder = new THREE.Group()
  wheelHolder.add(wheel)
  const wheelPos = new THREE.Vector3(175, 13, 180)
  wheelHolder.position.copy(wheelPos)

  const legMat = new THREE.MeshStandardMaterial({ color: "#3a3a3e", roughness: 0.5, metalness: 0.6 })
  ;[-1, 1].forEach((side) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.5, 18, 0.5), legMat)
    leg.position.set(side * 6, -9, 0)
    leg.rotation.z = side * 0.3
    wheelHolder.add(leg)
  })

  group.add(wheelHolder)
  // Hitbox covers the base so you can't drive through the legs
  colliders.push({ x: wheelPos.x, z: wheelPos.z, radius: 8 })
  return wheel
}

function buildGrandstands(group: THREE.Group, colliders: Collider[]): void {
  const seatMat = new THREE.MeshStandardMaterial({ color: "#2a2e30", roughness: 0.7 })
  const accentMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.5, metalness: 0.4, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.1 })

  const standCenterX = -54
  const standBaseZ = 78
  const standWidth = 60
  for (let row = 0; row < 6; row += 1) {
    const stand = new THREE.Mesh(new THREE.BoxGeometry(standWidth, 0.7, 1.6), seatMat)
    stand.position.set(standCenterX, 0.6 + row * 0.7, standBaseZ + row * 1.5)
    stand.castShadow = true
    stand.receiveShadow = true
    group.add(stand)
  }
  const roof = new THREE.Mesh(new THREE.BoxGeometry(standWidth + 2, 0.4, 11), accentMat)
  roof.position.set(standCenterX, 6.7, standBaseZ + 5)
  group.add(roof)
  ;[-(standWidth / 2 - 2), standWidth / 2 - 2].forEach((x) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 0.4), seatMat)
    post.position.set(standCenterX + x, 3.5, standBaseZ + 3)
    group.add(post)
  })

  // Hitboxes spaced along the 60-unit length
  for (let i = 0; i < 4; i += 1) {
    const t = (i / 3) - 0.5
    colliders.push({ x: standCenterX + t * (standWidth - 4), z: standBaseZ + 4, radius: 6 })
  }
}

function buildPitBuilding(group: THREE.Group, colliders: Collider[]): void {
  const pit = new THREE.Group()
  const baseMat = new THREE.MeshStandardMaterial({ color: "#1a1d20", roughness: 0.55, metalness: 0.4 })
  const glassMat = new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, roughness: 0.18, metalness: 0.4, transparent: true, opacity: 0.55, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.25 })
  const accentMat = new THREE.MeshStandardMaterial({ color: PALETTE.silver, roughness: 0.3, metalness: 0.8 })

  const buildingLen = 64
  const main = new THREE.Mesh(new THREE.BoxGeometry(buildingLen, 4.6, 6.5), baseMat)
  main.position.y = 2.3
  main.castShadow = true
  main.receiveShadow = true
  pit.add(main)

  const deck = new THREE.Mesh(new THREE.BoxGeometry(buildingLen - 2, 2.6, 5.2), baseMat)
  deck.position.set(0, 5.9, 0)
  pit.add(deck)

  const glass = new THREE.Mesh(new THREE.BoxGeometry(buildingLen - 3, 1.8, 0.18), glassMat)
  glass.position.set(0, 5.9, -2.6)
  pit.add(glass)

  for (let i = 0; i < 11; i += 1) {
    const x = -((11 - 1) / 2) * 5.4 + i * 5.4
    const panel = new THREE.Mesh(new THREE.BoxGeometry(4.4, 3.2, 0.22), accentMat)
    panel.position.set(x, 1.7, -3.35)
    pit.add(panel)
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.2, 0.24), new THREE.MeshStandardMaterial({ color: PALETTE.mercedesTeal, emissive: new THREE.Color(PALETTE.mercedesTeal), emissiveIntensity: 0.4 }))
    stripe.position.set(x, 0.42, -3.46)
    pit.add(stripe)
  }

  const pitPos = new THREE.Vector3(-54, 0, 50)
  pit.position.copy(pitPos)
  group.add(pit)

  // Spread 6 cylindrical hitboxes along the 64-unit pit-building length so you bounce off it like a wall
  for (let i = 0; i < 6; i += 1) {
    const t = i / 5 - 0.5
    colliders.push({ x: pitPos.x + t * (buildingLen - 6), z: pitPos.z, radius: 4.5 })
  }
}

function buildPetals(group: THREE.Group): PetalSystem {
  const COUNT = 320
  const SPAWN_BOX = 360
  const geo = new THREE.PlaneGeometry(0.18, 0.18)
  const mat = new THREE.MeshBasicMaterial({ color: PALETTE.sakuraPink, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false })
  const mesh = new THREE.InstancedMesh(geo, mat, COUNT)
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  group.add(mesh)

  const data: PetalSystem["data"] = []
  for (let i = 0; i < COUNT; i += 1) {
    const spawn = new THREE.Vector3(
      (Math.random() - 0.5) * SPAWN_BOX,
      8 + Math.random() * 22,
      (Math.random() - 0.5) * SPAWN_BOX,
    )
    data.push({
      pos: spawn.clone(),
      vel: new THREE.Vector3((Math.random() - 0.5) * 0.6, -(0.4 + Math.random() * 0.5), (Math.random() - 0.5) * 0.6),
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.6,
      spawn,
    })
  }

  const dummy = new THREE.Object3D()
  let elapsed = 0
  const update = (delta: number) => {
    elapsed += delta
    for (let i = 0; i < COUNT; i += 1) {
      const p = data[i]
      p.pos.x += p.vel.x * delta + Math.sin(elapsed * 1.2 + i) * 0.08 * delta
      p.pos.y += p.vel.y * delta
      p.pos.z += p.vel.z * delta + Math.cos(elapsed * 0.9 + i) * 0.08 * delta
      p.rot += p.rotSpeed * delta
      if (p.pos.y < 0.1) {
        p.pos.x = (Math.random() - 0.5) * SPAWN_BOX
        p.pos.y = 30 + Math.random() * 12
        p.pos.z = (Math.random() - 0.5) * SPAWN_BOX
      }
      dummy.position.copy(p.pos)
      dummy.rotation.set(p.rot * 0.4, p.rot, p.rot * 0.6)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }

  return { mesh, data, update }
}

function buildBannerColliders(colliders: Collider[]): void {
  // Start/finish banner support poles. Curve at t=0.02 with SCALE_X=2.4 lands the
  // banner near (-58 * 2.4, 0, 18 * 2.6) = (-139, 0, 47). Approximate poles ±7.5
  // along the tangent; we add small radii so the car can squeeze past them but not
  // drive through them.
  ;[-7.5, 7.5].forEach((off) => {
    colliders.push({ x: -139 + off, z: 47, radius: 0.7 })
  })
}

export function buildEnvironment(scene: THREE.Scene): EnvironmentSystem {
  const group = new THREE.Group()
  group.name = "JapanEnvironment"

  const colliders: Collider[] = []

  buildGround(group)
  buildMtFuji(group, colliders)
  buildTorii(group, colliders)
  buildPagoda(group, colliders)
  buildSakuraTrees(group)
  buildPaddyTerraces(group)
  buildTokyoSkyline(group)
  const ferrisWheel = buildFerrisWheel(group, colliders)
  buildGrandstands(group, colliders)
  buildPitBuilding(group, colliders)
  buildBannerColliders(colliders)
  const petals = buildPetals(group)

  scene.add(group)

  return { group, ferrisWheel, petals, colliders }
}
