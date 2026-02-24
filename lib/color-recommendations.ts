import { COLORS, type ColorSelection, type ColorVariant } from "@/lib/types"

/**
 * نظام التوصيات الذكية للألوان
 * يوصي بألوان متناسقة بناءً على اللون المختار
 */

// خريطة الألوان المتناسقة (Complementary Colors)
const colorHarmonyMap: Record<string, string[]> = {
  // الأزرق والتدرجات
  "blue": ["navy", "sky-blue", "gray", "white"],
  "navy": ["blue", "white", "gray", "beige"],
  "sky-blue": ["blue", "white", "teal", "gray"],

  // الأحمر والتدرجات
  "red": ["brown", "white", "gray", "beige"],
  "dark-red": ["red", "brown", "white", "gray"],

  // الأخضر والتدرجات
  "green": ["teal", "white", "gray", "brown"],
  "dark-green": ["green", "brown", "white", "gray"],

  // الأزرق المخضر
  "teal": ["blue", "green", "white", "gray"],

  // الحيادية
  "gray": ["black", "white", "blue", "red", "pink"],
  "light-gray": ["any", "any", "any"],
  "white": ["any", "any", "any"],
  "black": ["any", "any", "any"],

  // البني والبيج
  "brown": ["red", "green", "white", "beige"],
  "beige": ["brown", "white", "gray", "pink"],

  // الوردي والبنفسجي
  "pink": ["gray", "white", "black", "blue"],
  "magenta": ["gray", "white", "teal"],

  // البرتقالي والذهبي
  "orange": ["brown", "white", "gray", "black"],
  "gold": ["brown", "white", "black", "red"],
}

/**
 * احصل على الألوان الموصى بها بناءً على اللون المختار
 */
export function getRecommendedColors(
  selectedColor: ColorSelection,
  allColors: ColorSelection[],
  limit: number = 3
): ColorSelection[] {
  const baseColorId = selectedColor.colorId
  const complementaryIds = colorHarmonyMap[baseColorId] || []

  if (complementaryIds.includes("any")) {
    // If any color works, return random selection
    return allColors
      .filter(c => c.colorId !== baseColorId)
      .sort(() => Math.random() - 0.5)
      .slice(0, limit)
  }

  // Otherwise, return colors from harmony map
  const recommended = allColors.filter(
    color => complementaryIds.includes(color.colorId) && color.colorId !== baseColorId
  )

  return recommended.slice(0, limit)
}

/**
 * احسب درجة التناسق بين لونين (0-100)
 */
export function calculateColorHarmonyScore(
  color1: ColorSelection,
  color2: ColorSelection
): number {
  if (color1.colorId === color2.colorId) {
    // نفس اللون = 90
    return 90 - Math.abs(
      parseInt(color1.shadeId.split("-")[1] || "500") -
      parseInt(color2.shadeId.split("-")[1] || "500")
    ) / 10
  }

  const harmony = colorHarmonyMap[color1.colorId] || []
  const score = harmony.includes(color2.colorId) ? 75 : 40

  // إضافة نقاط إذا كانت الدرجات متقاربة
  const shade1 = parseInt(color1.shadeId.split("-")[1] || "500")
  const shade2 = parseInt(color2.shadeId.split("-")[1] || "500")
  const shadeDifference = Math.abs(shade1 - shade2)

  return score + Math.max(0, 20 - shadeDifference / 25)
}

/**
 * احصل على أفضل مجموعة ألوان متناسقة
 */
export function getBestColorCombinations(
  allColors: ColorSelection[],
  limit: number = 3
): ColorSelection[][] {
  const combinations: Array<{ colors: ColorSelection[]; score: number }> = []

  for (let i = 0; i < allColors.length; i++) {
    for (let j = i + 1; j < allColors.length; j++) {
      const score = calculateColorHarmonyScore(allColors[i], allColors[j])
      combinations.push({
        colors: [allColors[i], allColors[j]],
        score,
      })
    }
  }

  return combinations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(c => c.colors)
}

/**
 * ألوان "الأكثر رواجاً" - تُستخدم لتسليط الضوء على الخيارات الشعبية
 */
export function getPopularColorShades(
  allColors: ColorSelection[],
  salesData?: Record<string, number>
): ColorSelection[] {
  if (!salesData) {
    // إذا لم تكن هناك بيانات مبيعات، أرجع الدرجات الوسطية
    return allColors.filter(c => c.shadeId.endsWith("-500"))
  }

  return allColors
    .map(color => ({
      color,
      sales: salesData[color.shadeId] || 0,
    }))
    .sort((a, b) => b.sales - a.sales)
    .map(item => item.color)
    .slice(0, 5)
}
