"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, Filter, Settings2 } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AdvancedSearchProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: Record<string, any>) => void
  placeholder?: string
}

export function AdminAdvancedSearch({ onSearch, onFilterChange, placeholder }: AdvancedSearchProps) {
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    onSearch(query)
  }

  const handleAddFilter = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value }
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleRemoveFilter = (key: string) => {
    const newFilters = { ...activeFilters }
    delete newFilters[key]
    setActiveFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={handleSearch}
            placeholder={placeholder || t("ابحث عن المنتجات...", "Search products...")}
            className="pl-10"
          />
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => {
                setSearchQuery("")
                onSearch("")
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </motion.button>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2 rounded-lg border transition-colors",
            showFilters ? "bg-primary text-white border-primary" : "hover:bg-gray-100"
          )}
        >
          <Filter className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Active Filters */}
      <AnimatePresence>
        {Object.entries(activeFilters).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {Object.entries(activeFilters).map(([key, value]) => (
              <motion.button
                key={key}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.8 }}
                onClick={() => handleRemoveFilter(key)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm hover:bg-primary/20"
              >
                {value}
                <X className="w-3 h-3" />
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
