"use client"

import { useEffect, useRef, useState } from "react"
import * as skinview3d from "skinview3d"

interface SkinViewerProps {
    username?: string
    uuid?: string
    className?: string
    width?: number
    height?: number
    autoRotate?: boolean
    animation?: 'walk' | 'run' | 'idle' | 'fly' | 'wave' | 'crouch' | 'hit' | 'idle'
    rotation?: number // in degrees
    rotationX?: number // in degrees
    rotationZ?: number // in degrees
    headRotationY?: number // in radians
    capeRotation?: number // in radians
    zoom?: number
    mouseTracking?: boolean
    offsetY?: number // Shift model vertically
    headOnly?: boolean
    onReady?: () => void
}

export function SkinViewer({
    username,
    uuid,
    className = "",
    width,
    height,
    autoRotate = false,
    animation = 'idle',
    rotation = 150,
    rotationX = 0,
    rotationZ = 0,
    headRotationY = 0,
    capeRotation = 0,
    zoom = 0.8,
    mouseTracking = false,
    offsetY = 0,
    headOnly = false,
    onReady
}: SkinViewerProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [viewer, setViewer] = useState<skinview3d.SkinViewer | null>(null)

    // Refs to track latest rotation values for async callbacks
    const rotationYRef = useRef(rotation)
    const rotationXRef = useRef(rotationX)
    const rotationZRef = useRef(rotationZ)
    const headRotationYRef = useRef(headRotationY)
    const capeRotationRef = useRef(capeRotation)
    const offsetYRef = useRef(offsetY)

    // Keep rotation refs in sync
    useEffect(() => {
        rotationYRef.current = rotation
        rotationXRef.current = rotationX
        rotationZRef.current = rotationZ
        headRotationYRef.current = headRotationY
        capeRotationRef.current = capeRotation
        offsetYRef.current = offsetY
    }, [rotation, rotationX, rotationZ, headRotationY, capeRotation, offsetY])


    // 1. Initialize Viewer
    useEffect(() => {
        if (!canvasRef.current) return

        const newViewer = new skinview3d.SkinViewer({
            canvas: canvasRef.current,
            width: width || 300,
            height: height || 400,
            // @ts-ignore
            alpha: true
        })

        newViewer.background = null
        newViewer.zoom = zoom
        newViewer.controls.enableRotate = true
        newViewer.controls.enableZoom = false
        newViewer.controls.enablePan = false

        setViewer(newViewer)

        return () => {
            newViewer.dispose()
            setViewer(null)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Run once on mount

    // 2. Handle Resize (Responsive)
    useEffect(() => {
        if (!viewer || !containerRef.current) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width: newWidth, height: newHeight } = entry.contentRect
                if (newWidth > 0 && newHeight > 0) {
                    viewer.width = newWidth
                    viewer.height = newHeight
                }
            }
        })

        resizeObserver.observe(containerRef.current)

        return () => resizeObserver.disconnect()
    }, [viewer])

    // Handle dynamic zoom updates
    useEffect(() => {
        if (!viewer) return
        viewer.zoom = zoom
    }, [viewer, zoom])

    // 3. Load Skin
    useEffect(() => {
        if (!viewer) return

        const identifier = uuid || username || 'Steve'
        const skinUrl = `https://mc-heads.net/skin/${identifier}`

        viewer.loadSkin(skinUrl, {
            model: "auto-detect"
        }).then(() => {
            // Apply rotations after skin loads to ensure they stick
            // Use refs to get latest values
            viewer.playerObject.rotation.y = (rotationYRef.current * Math.PI) / 180
            viewer.playerObject.rotation.x = (rotationXRef.current * Math.PI) / 180
            viewer.playerObject.rotation.z = (rotationZRef.current * Math.PI) / 180
            viewer.playerObject.position.y = offsetYRef.current

            // Apply Head Rotation
            viewer.playerObject.skin.head.rotation.y = headRotationYRef.current
            // Apply Cape Rotation if cape exists (not guaranteed on base load but good to set)
            if (viewer.playerObject.cape.cape) {
                viewer.playerObject.cape.rotation.x = capeRotationRef.current
            }
            requestAnimationFrame(() => {
                onReady?.()
            })
        })
    }, [viewer, username, uuid, onReady])

    // 4. Handle Animation
    useEffect(() => {
        if (!viewer) return

        if (animation === 'walk') {
            viewer.animation = new skinview3d.WalkingAnimation()
        } else if (animation === 'run') {
            viewer.animation = new skinview3d.RunningAnimation()
        } else if (animation === 'idle') {
            viewer.animation = new skinview3d.IdleAnimation()
        } else if (animation === 'fly') {
            viewer.animation = new skinview3d.FlyingAnimation()
        } else if (animation === 'wave') {
            viewer.animation = new skinview3d.WaveAnimation()
        } else if (animation === 'crouch') {
            viewer.animation = new skinview3d.CrouchAnimation()
        } else if (animation === 'hit') {
            viewer.animation = new skinview3d.HitAnimation()
        } else {
            // Includes 'none' and null/undefined
            viewer.animation = null
        }
    }, [viewer, animation])

    // 5. Update Rotation settings
    useEffect(() => {
        if (!viewer) return

        viewer.autoRotate = autoRotate
        viewer.autoRotateSpeed = 0.5

        // Convert degrees to radians for 3D rotation
        viewer.playerObject.rotation.y = (rotation * Math.PI) / 180
        viewer.playerObject.rotation.x = (rotationX * Math.PI) / 180
        viewer.playerObject.rotation.z = (rotationZ * Math.PI) / 180
        viewer.playerObject.position.y = offsetY

        // Apply Head Rotation (only if not mouse tracking)
        if (!mouseTracking) {
            viewer.playerObject.skin.head.rotation.y = headRotationY
        }
    }, [viewer, autoRotate, rotation, rotationX, rotationZ, headRotationY, mouseTracking, offsetY])

    // 6. Mouse Tracking
    useEffect(() => {
        if (!viewer || !mouseTracking) return

        const handleMouseMove = (event: MouseEvent) => {
            const canvas = canvasRef.current
            if (!canvas) return

            const rect = canvas.getBoundingClientRect()
            const centerX = rect.left + rect.width / 2
            const centerY = rect.top + rect.height / 2

            const mouseX = event.clientX - centerX
            const mouseY = event.clientY - centerY

            // Calculate rotation limits (60 degrees)
            const maxRotation = Math.PI / 3

            // Y rotation follows X mouse movement (left/right)
            const rotY = (mouseX / window.innerWidth) * Math.PI
            // X rotation follows Y mouse movement (up/down)
            const rotX = (mouseY / window.innerHeight) * Math.PI

            viewer.playerObject.skin.head.rotation.y = Math.min(Math.max(rotY, -maxRotation), maxRotation)
            viewer.playerObject.skin.head.rotation.x = Math.min(Math.max(rotX, -maxRotation), maxRotation)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [viewer, mouseTracking])

    // 7. Handle Head Only Mode
    useEffect(() => {
        if (!viewer) return

        const skin = viewer.playerObject.skin
        const bodyParts = [
            skin.body,
            skin.leftArm,
            skin.rightArm,
            skin.leftLeg,
            skin.rightLeg
        ]

        bodyParts.forEach(part => {
            if (part) part.visible = !headOnly
        })
    }, [viewer, headOnly])

    return (
        <div
            ref={containerRef}
            className={`relative flex items-center justify-center ${className}`}
            style={{ width: '100%', height: '100%' }}
        >
            <canvas
                ref={canvasRef}
                className="cursor-grab active:cursor-grabbing max-w-full max-h-full"
                style={{ width: '100%', height: '100%', background: 'transparent' }}
            />
        </div>
    )
}
