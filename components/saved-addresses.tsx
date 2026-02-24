"use client"

import { useState } from "react"
import { MapPin, Plus, Edit2, Trash2, Check, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import type { Address } from "@/lib/types"

interface SavedAddressesProps {
  addresses: Address[]
  onAddAddress: (address: Address) => Promise<void>
  onUpdateAddress: (id: string, address: Partial<Address>) => Promise<void>
  onDeleteAddress: (id: string) => Promise<void>
  onSelectDefault: (id: string) => Promise<void>
  isLoading?: boolean
}

export function SavedAddresses({
  addresses = [],
  onAddAddress,
  onUpdateAddress,
  onDeleteAddress,
  onSelectDefault,
  isLoading = false,
}: SavedAddressesProps) {
  const { t, language } = useLanguage()
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showMap, setShowMap] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<Address>>({
    label: "Home",
    street: "",
    city: "",
    phone: "",
    secondPhone: "",
    isDefault: false,
  })

  const handleAddNew = () => {
    setFormData({
      label: "Home",
      street: "",
      city: "",
      phone: "",
      secondPhone: "",
      isDefault: addresses.length === 0,
    })
    setIsAddingNew(true)
    setEditingId(null)
  }

  const handleEdit = (address: Address) => {
    setFormData(address)
    setEditingId(address.id)
    setIsAddingNew(false)
  }

  const handleSaveNew = async () => {
    if (!formData.street || !formData.city || !formData.phone) {
      return
    }
    setSavingId("new")
    try {
      const newAddress: Address = {
        id: Date.now().toString(),
        label: formData.label || "Home",
        street: formData.street,
        city: formData.city,
        phone: formData.phone,
        secondPhone: formData.secondPhone,
        isDefault: formData.isDefault || addresses.length === 0,
        createdAt: new Date(),
      }
      await onAddAddress(newAddress)
      setIsAddingNew(false)
      setFormData({
        label: "Home",
        street: "",
        city: "",
        phone: "",
        secondPhone: "",
        isDefault: false,
      })
    } finally {
      setSavingId(null)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingId || !formData.street || !formData.city || !formData.phone) {
      return
    }
    setSavingId(editingId)
    try {
      await onUpdateAddress(editingId, formData)
      setEditingId(null)
    } finally {
      setSavingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await onDeleteAddress(id)
    } finally {
      setDeletingId(null)
    }
  }

  const addressLabels = {
    Home: { ar: "المنزل", en: "Home" },
    Work: { ar: "العمل", en: "Work" },
    Other: { ar: "آخر", en: "Other" },
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">{t("العناوين المحفوظة", "Saved Addresses")}</h3>
        </div>
        {!isAddingNew && !editingId && (
          <Button size="sm" onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            {t("إضافة عنوان", "Add Address")}
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAddingNew || editingId) && (
        <Card className="border-2 border-primary/20 p-6 bg-primary/5 animate-scale-in">
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("نوع العنوان", "Address Label")}</Label>
                <select
                  value={formData.label || "Home"}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg bg-background"
                >
                  <option value="Home">{addressLabels.Home[language]}</option>
                  <option value="Work">{addressLabels.Work[language]}</option>
                  <option value="Other">{addressLabels.Other[language]}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t("رقم الهاتف الرئيسي", "Primary Phone")} *</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+20 123 456 7890"
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("رقم الهاتف الثاني", "Secondary Phone")}</Label>
                <Input
                  value={formData.secondPhone || ""}
                  onChange={(e) => setFormData({ ...formData, secondPhone: e.target.value })}
                  placeholder="+20 123 456 7890"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("المدينة", "City")} *</Label>
                <Input
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder={t("القاهرة", "Cairo")}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t("العنوان التفصيلي", "Full Address")} *</Label>
              <Textarea
                value={formData.street || ""}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder={t("الشارع، المبنى، الشقة", "Street, Building, Apartment")}
                rows={2}
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isDefault || false}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                id="isDefault"
                className="rounded"
              />
              <label htmlFor="isDefault" className="text-sm cursor-pointer">
                {t("تعيين كعنوان افتراضي", "Set as default address")}
              </label>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddingNew(false)
                  setEditingId(null)
                }}
              >
                <X className="h-4 w-4 me-2" />
                {t("إلغاء", "Cancel")}
              </Button>
              <Button
                onClick={isAddingNew ? handleSaveNew : handleSaveEdit}
                disabled={savingId !== null}
                className="gap-2"
              >
                {savingId !== null ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("جاري الحفظ...", "Saving...")}
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    {t("حفظ العنوان", "Save Address")}
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Addresses List */}
      {addresses.length === 0 && !isAddingNew && !editingId && (
        <div className="text-center py-12 bg-muted/30 rounded-xl">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-4">{t("لا توجد عناوين محفوظة", "No saved addresses")}</p>
          <Button onClick={handleAddNew} variant="outline">
            {t("إضافة أول عنوان", "Add Your First Address")}
          </Button>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {addresses.map((address) => (
          <Card
            key={address.id}
            className={`p-4 border-2 transition-all ${
              address.isDefault ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30"
            }`}
          >
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">
                      {addressLabels[address.label as keyof typeof addressLabels][language]}
                    </p>
                    {address.isDefault && (
                      <p className="text-xs text-primary font-medium">{t("العنوان الافتراضي", "Default")}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-2 text-sm">
                <p className="text-foreground">{address.street}</p>
                <p className="text-muted-foreground">{address.city}</p>
                <div className="space-y-1">
                  <p className="text-muted-foreground">{address.phone}</p>
                  {address.secondPhone && <p className="text-muted-foreground">{address.secondPhone}</p>}
                </div>
              </div>

              {/* Actions */}
              {editingId !== address.id && (
                <div className="flex gap-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(address)}
                    disabled={savingId !== null}
                    className="flex-1 gap-1"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {t("تعديل", "Edit")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(address.id)}
                    disabled={deletingId !== null || addresses.length === 1}
                    className="flex-1 gap-1 text-destructive hover:text-destructive"
                  >
                    {deletingId === address.id ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("حذف", "Delete")}
                      </>
                    )}
                  </Button>
                  {!address.isDefault && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelectDefault(address.id)}
                      disabled={savingId !== null}
                      className="flex-1 gap-1"
                    >
                      {t("افتراضي", "Default")}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
