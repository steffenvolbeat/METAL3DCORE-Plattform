// React-Three-Fiber JSX Type Declarations
import { Object3DNode, extend } from '@react-three/fiber'
import * as THREE from 'three'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Basic Three.js elements
      group: Object3DNode<THREE.Group, typeof THREE.Group>
      mesh: Object3DNode<THREE.Mesh, typeof THREE.Mesh>
      
      // Geometries  
      boxGeometry: Object3DNode<THREE.BoxGeometry, typeof THREE.BoxGeometry>
      planeGeometry: Object3DNode<THREE.PlaneGeometry, typeof THREE.PlaneGeometry>
      cylinderGeometry: Object3DNode<THREE.CylinderGeometry, typeof THREE.CylinderGeometry>
      sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
      
      // Materials
      meshPhysicalMaterial: Object3DNode<THREE.MeshPhysicalMaterial, typeof THREE.MeshPhysicalMaterial>
      meshStandardMaterial: Object3DNode<THREE.MeshStandardMaterial, typeof THREE.MeshStandardMaterial>
      meshBasicMaterial: Object3DNode<THREE.MeshBasicMaterial, typeof THREE.MeshBasicMaterial>
      
      // Lights
      ambientLight: Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
      pointLight: Object3DNode<THREE.PointLight, typeof THREE.PointLight>
      directionalLight: Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
      spotLight: Object3DNode<THREE.SpotLight, typeof THREE.SpotLight>
    }
  }
}

export {}