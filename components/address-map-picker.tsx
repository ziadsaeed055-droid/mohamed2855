"use client"

import type React from "react"

import { useState } from "react"
import { MapPin, Navigation, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"

interface AddressMapPickerProps {
  onConfirm: (latitude: number, longitude: number) => void
  onCancel: () => void
  initialLat?: number
  initialLng?: number
}

export function AddressMapPicker({ onConfirm, onCancel, initialLat, initialLng }: AddressMapPickerProps) {
  const { t, language } = useLanguage()
  const [selectedLat, setSelectedLat] = useState<number>(initialLat || 30.0444)
  const [selectedLng, setSelectedLng] = useState<number>(initialLng || 31.2357)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)

  const handleGetCurrentLocation = () => {
    setIsLoadingLocation(true)
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLat(position.coords.latitude)
          setSelectedLng(position.coords.longitude)
          setIsLoadingLocation(false)
        },
        () => {
          setIsLoadingLocation(false)
        },
      )
    }
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Simple map click handler - in production, use a real map library like Leaflet or Google Maps
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Convert click coordinates to lat/lng (simplified)
    const latDelta = 0.05
    const lngDelta = 0.05
    const newLat = selectedLat - ((y - rect.height / 2) / (rect.height / 2)) * latDelta
    const newLng = selectedLng + ((x - rect.width / 2) / (rect.width / 2)) * lngDelta

    setSelectedLat(newLat)
    setSelectedLng(newLng)
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">{t("اختر موقعك على الخريطة", "Select Your Location")}</h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel} className="rounded-full">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Map Area */}
          <div
            onClick={handleMapClick}
            className="relative w-full h-96 bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg cursor-crosshair overflow-hidden"
          >
            {/* Simplified map visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-sm text-muted-foreground">
                  {t("الخط الطول", "Latitude")}: {selectedLat.toFixed(4)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {t("خط العرض", "Longitude")}: {selectedLng.toFixed(4)}
                </div>
              </div>
            </div>

            {/* Marker */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative">
                <div
                  className="absolute inset-0 bg-primary/20 rounded-full animate-pulse"
                  style={{ width: "40px", height: "40px" }}
                ></div>
                <MapPin className="h-8 w-8 text-primary relative z-10" />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <p className="text-sm text-muted-foreground text-center">
            {t(
              "اضغط على الخريطة لتحديد الموقع أو استخدم زر تحديد الموقع الحالي",
              "Click on the map to select location or use current location",
            )}
          </p>

          {/* Coordinates Display */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("الخط الطول", "Latitude")}</p>
              <p className="font-mono font-semibold">{selectedLat.toFixed(6)}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{t("خط العرض", "Longitude")}</p>
              <p className="font-mono font-semibold">{selectedLng.toFixed(6)}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onCancel} className="flex-1 gap-2 bg-transparent">
              <X className="h-4 w-4" />
              {t("إلغاء", "Cancel")}
            </Button>
            <Button
              onClick={handleGetCurrentLocation}
              disabled={isLoadingLocation}
              variant="outline"
              className="flex-1 gap-2 bg-transparent"
            >
              <Navigation className="h-4 w-4" />
              {t("الموقع الحالي", "Current Location")}
            </Button>
            <Button onClick={() => onConfirm(selectedLat, selectedLng)} className="flex-1 gap-2">
              <Check className="h-4 w-4" />
              {t("تأكيد", "Confirm")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
