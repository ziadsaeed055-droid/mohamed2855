"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, Trash2, Edit2 } from "lucide-react"
import type { ColorSizeStock } from "@/lib/types"
import { getStockStatus, getStockMessage } from "@/lib/stock-utils"

interface StockManagementDashboardProps {
  stock: ColorSizeStock[] | undefined
  productName: string
  onStockUpdate?: (stock: ColorSizeStock[]) => void
}

export function StockManagementDashboard({ stock, productName, onStockUpdate }: StockManagementDashboardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({})

  if (!stock || stock.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            لم يتم تعيين مخزون
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-800">يرجى إضافة مخزون للمنتج قبل نشره</p>
        </CardContent>
      </Card>
    )
  }

  const handleQuantityChange = (index: number, value: string) => {
    setQuantities((prev) => ({
      ...prev,
      [`${stock[index].shadeId}-${stock[index].size}`]: parseInt(value) || 0,
    }))
  }

  const handleUpdate = (index: number) => {
    const key = `${stock[index].shadeId}-${stock[index].size}`
    const newQuantity = quantities[key] || stock[index].quantity
    const updatedStock = [...stock]
    updatedStock[index].quantity = newQuantity
    updatedStock[index].isLowStock = newQuantity <= 5
    if (onStockUpdate) onStockUpdate(updatedStock)
    setEditingIndex(null)
  }

  const handleDelete = (index: number) => {
    const updatedStock = stock.filter((_, i) => i !== index)
    if (onStockUpdate) onStockUpdate(updatedStock)
  }

  const totalStock = stock.reduce((sum, s) => sum + s.quantity, 0)
  const lowStockCount = stock.filter((s) => s.isLowStock).length
  const outOfStock = stock.filter((s) => s.quantity === 0).length

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>إدارة المخزون: {productName}</CardTitle>
          <CardDescription>إجمالي المخزون: {totalStock} وحدة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium text-blue-900">إجمالي المخزون</p>
              <p className="text-2xl font-bold text-blue-600">{totalStock}</p>
            </div>
            <div className="rounded-lg bg-yellow-50 p-3">
              <p className="text-sm font-medium text-yellow-900">مخزون محدود</p>
              <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <p className="text-sm font-medium text-red-900">غير متوفر</p>
              <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        {stock.map((item, index) => {
          const status = getStockStatus(
            { colorSizeStock: stock } as any,
            item.shadeId,
            item.size,
          )
          const message = getStockMessage(status)

          return (
            <Card key={`${item.shadeId}-${item.size}`}>
              <CardContent className="flex items-center justify-between pt-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">
                      {item.shadeId} - المقاس: {item.size}
                    </h4>
                    <Badge
                      variant={status === "available" ? "default" : status === "low" ? "secondary" : "destructive"}
                    >
                      {message.ar}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">الكمية المتاحة: {item.quantity} وحدة</p>
                  {item.reservedQuantity ? (
                    <p className="text-sm text-amber-600">محجوز: {item.reservedQuantity} وحدة</p>
                  ) : null}
                </div>

                {editingIndex === index ? (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={quantities[`${item.shadeId}-${item.size}`] ?? item.quantity}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      className="w-24"
                    />
                    <Button size="sm" onClick={() => handleUpdate(index)}>
                      حفظ
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                      إلغاء
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingIndex(index)
                        setQuantities((prev) => ({
                          ...prev,
                          [`${item.shadeId}-${item.size}`]: item.quantity,
                        }))
                      }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
