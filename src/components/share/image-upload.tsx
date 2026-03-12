"use client"

import { useState, useCallback } from "react"
import type { Area } from "react-easy-crop/types"
import { getCroppedImg } from "@/lib/image-utils"
import { supabase } from "@/lib/supabase"
import Cropper from "react-easy-crop"
import imageCompression from "browser-image-compression"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ImagePlus, X, Scissors, Loader2, Check, ZoomIn, ZoomOut } from "lucide-react"

const ASPECT_RATIOS = [
    { label: "1:1", value: 1 / 1 },
    { label: "4:3", value: 4 / 3 },
    { label: "3:4", value: 3 / 4 },
    { label: "16:9", value: 16 / 9 },
]

interface ImageUploadProps {
    onUploadComplete: (url: string) => void
    defaultValue?: string
}

export default function ImageUpload({ onUploadComplete, defaultValue }: ImageUploadProps) {
    const [image, setImage] = useState<string | null>(defaultValue || null)
    const [isCompressing, setIsCompressing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [cropMode, setCropMode] = useState(false)
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [aspect, setAspect] = useState(4 / 3)
    const [tempImage, setTempImage] = useState<string | null>(null)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onSelectFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]
            setIsCompressing(true)

            try {
                const options = {
                    maxSizeMB: 0.5,
                    maxWidthOrHeight: 1200,
                    useWebWorker: true
                }
                const compressedFile = await imageCompression(file, options)
                const reader = new FileReader()
                reader.addEventListener("load", () => {
                    setTempImage(reader.result as string)
                    setZoom(1)
                    setCrop({ x: 0, y: 0 })
                    setCropMode(true)
                })
                reader.readAsDataURL(compressedFile)
            } catch (error) {
                console.error("Compression failed", error)
            } finally {
                setIsCompressing(false)
            }
        }
    }

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleCropSave = async () => {
        if (!tempImage || !croppedAreaPixels) return

        setIsUploading(true)
        try {
            const croppedImage = await getCroppedImg(tempImage, croppedAreaPixels)

            const response = await fetch(croppedImage)
            const blob = await response.blob()

            const fileName = `bottle-${Date.now()}.jpg`
            const { error } = await supabase.storage
                .from("bottleshare")
                .upload(fileName, blob, {
                    contentType: "image/jpeg",
                    upsert: true
                })

            if (error) {
                console.error("Supabase upload error:", error)
                setImage(croppedImage)
                onUploadComplete(croppedImage)
            } else {
                const { data: { publicUrl } } = supabase.storage
                    .from("bottleshare")
                    .getPublicUrl(fileName)
                setImage(publicUrl)
                onUploadComplete(publicUrl)
            }

            setCropMode(false)
        } catch (error) {
            console.error(error)
        } finally {
            setIsUploading(false)
        }
    }

    return (
        <div className="space-y-3">
            {!image && !cropMode && (
                <div className="relative group border-2 border-dashed border-primary/20 hover:border-primary/50 transition-colors rounded-xl h-48 flex flex-col items-center justify-center bg-primary/5 cursor-pointer overflow-hidden">
                    {isCompressing ? (
                        <div className="flex flex-col items-center gap-2 text-primary/60">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <p className="text-xs font-black uppercase tracking-widest">압축 중...</p>
                        </div>
                    ) : (
                        <>
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                onChange={onSelectFile}
                            />
                            <div className="text-center space-y-2 group-hover:scale-110 transition-transform duration-300">
                                <ImagePlus className="w-10 h-10 text-primary/40 mx-auto" />
                                <p className="text-xs font-black uppercase tracking-widest text-primary/60">Upload Whisky Image</p>
                            </div>
                        </>
                    )}
                </div>
            )}

            {cropMode && tempImage && (
                <div className="space-y-3 rounded-xl border border-primary/20 bg-black/60 p-3 shadow-2xl">
                    {/* Aspect ratio selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 w-10 flex-shrink-0">비율</span>
                        <div className="flex gap-1.5 flex-wrap">
                            {ASPECT_RATIOS.map((r) => (
                                <button
                                    key={r.label}
                                    type="button"
                                    onClick={() => { setAspect(r.value); setCrop({ x: 0, y: 0 }); setZoom(1) }}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border transition-all ${aspect === r.value
                                            ? "bg-primary text-primary-foreground border-primary shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                                            : "border-white/10 text-white/50 hover:border-primary/40 hover:text-white/80"
                                        }`}
                                >
                                    {r.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Crop canvas */}
                    <div className="relative h-64 rounded-lg overflow-hidden bg-black">
                        <Cropper
                            image={tempImage}
                            crop={crop}
                            zoom={zoom}
                            aspect={aspect}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            showGrid={true}
                            style={{
                                containerStyle: { borderRadius: "8px" },
                                cropAreaStyle: {
                                    border: "2px solid rgba(234,179,8,0.9)",
                                    boxShadow: "0 0 0 9999em rgba(0,0,0,0.6)"
                                }
                            }}
                        />
                    </div>

                    {/* Zoom slider */}
                    <div className="flex items-center gap-3 px-1">
                        <button type="button" onClick={() => setZoom(z => Math.max(1, z - 0.1))} className="text-white/50 hover:text-primary transition-colors">
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.05}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-1 rounded-full appearance-none bg-white/20 accent-yellow-400 cursor-pointer"
                        />
                        <button type="button" onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="text-white/50 hover:text-primary transition-colors">
                            <ZoomIn className="w-4 h-4" />
                        </button>
                        <span className="text-[11px] font-bold text-white/40 w-10 text-right">{zoom.toFixed(1)}×</span>
                    </div>
                    <p className="text-center text-[10px] text-white/30 font-medium">이미지를 드래그해서 위치 조정 · 슬라이더로 크기 조절</p>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <Button type="button" variant="secondary" size="sm" onClick={() => setCropMode(false)} className="flex-1 font-black">
                            <X className="w-4 h-4 mr-1.5" /> 취소
                        </Button>
                        <Button type="button" size="sm" onClick={handleCropSave} disabled={isUploading} className="flex-1 font-black">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <Scissors className="w-4 h-4 mr-1.5" />}
                            크롭 & 저장
                        </Button>
                    </div>
                </div>
            )}

            {image && !cropMode && (
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] group shadow-xl ring-1 ring-primary/20">
                    <Image src={image} alt="Whisky" fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-[2px]">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => { setImage(null); onUploadComplete("") }}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                        <div className="bg-emerald-500 text-white p-2 rounded-full shadow-lg">
                            <Check className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            )}

            <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest text-center">
                Recommended: 800x600px · Max 5MB
            </p>
        </div>
    )
}
