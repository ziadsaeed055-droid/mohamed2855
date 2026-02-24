"use client"

import { motion } from "framer-motion"
import { LayoutGrid, List } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

type ViewMode = "grid" | "list"

interface ViewModeToggleProps {
  mode: ViewMode
  onChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ mode, onChange }: ViewModeToggleProps) {
  const { t } = useLanguage()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg"
    >
      {/* Grid View */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange("grid")}
        className={`p-2 rounded-md transition-all duration-200 ${
          mode === "grid"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title={t("عرض شبكة", "Grid View")}
      >
        <LayoutGrid className="w-4 h-4" />
      </motion.button>

      {/* List View */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange("list")}
        className={`p-2 rounded-md transition-all duration-200 ${
          mode === "list"
            ? "bg-primary text-primary-foreground shadow-md"
            : "text-muted-foreground hover:text-foreground"
        }`}
        title={t("عرض قائمة", "List View")}
      >
        <List className="w-4 h-4" />
      </motion.button>
    </motion.div>
  )
}
