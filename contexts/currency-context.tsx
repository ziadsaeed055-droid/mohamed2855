"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { useLanguage } from "./language-context"

export const CURRENCIES = [
  { code: "EGP", nameAr: "جنيه مصري", nameEn: "Egyptian Pound", symbol: "ج.م", flag: "🇪🇬" },
  { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", nameAr: "يورو", nameEn: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", symbol: "ر.س", flag: "🇸🇦" },
  { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "GBP", nameAr: "جنيه إسترليني", nameEn: "British Pound", symbol: "£", flag: "🇬🇧" },
] as const

interface CurrencyContextType {
  currency: typeof CURRENCIES[number]
  setCurrency: (currency: typeof CURRENCIES[number]) => void
  convertPrice: (price: number) => number
  formatPrice: (price: number) => string
  exchangeRates: Record<string, number>
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  const [currency, setCurrencyState] = useState(CURRENCIES[0]) // Default EGP
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({
    EGP: 1,
    USD: 0.032,
    EUR: 0.029,
    SAR: 0.12,
    AED: 0.12,
    GBP: 0.025,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load saved currency from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem("preferred_currency")
    if (savedCurrency) {
      const found = CURRENCIES.find((c) => c.code === savedCurrency)
      if (found) setCurrencyState(found)
    }
  }, [])

  // Fetch live exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setIsLoading(true)
        // Using a free API for exchange rates
        const response = await fetch("https://api.exchangerate-api.com/v4/latest/EGP")
        const data = await response.json()

        if (data && data.rates) {
          setExchangeRates({
            EGP: 1,
            USD: data.rates.USD || 0.032,
            EUR: data.rates.EUR || 0.029,
            SAR: data.rates.SAR || 0.12,
            AED: data.rates.AED || 0.12,
            GBP: data.rates.GBP || 0.025,
          })

          // Cache rates in localStorage with timestamp
          localStorage.setItem("exchange_rates", JSON.stringify(data.rates))
          localStorage.setItem("exchange_rates_timestamp", Date.now().toString())
        }
      } catch (error) {
        console.error("[v0] Failed to fetch exchange rates:", error)
        // Try to load cached rates
        const cachedRates = localStorage.getItem("exchange_rates")
        if (cachedRates) {
          try {
            const rates = JSON.parse(cachedRates)
            setExchangeRates({
              EGP: 1,
              USD: rates.USD || 0.032,
              EUR: rates.EUR || 0.029,
              SAR: rates.SAR || 0.12,
              AED: rates.AED || 0.12,
              GBP: rates.GBP || 0.025,
            })
          } catch (e) {
            console.error("[v0] Failed to parse cached rates", e)
          }
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Check if we need to update rates (once per day)
    const lastUpdate = localStorage.getItem("exchange_rates_timestamp")
    const oneDayInMs = 24 * 60 * 60 * 1000

    if (!lastUpdate || Date.now() - Number.parseInt(lastUpdate) > oneDayInMs) {
      fetchRates()
    } else {
      // Load cached rates
      const cachedRates = localStorage.getItem("exchange_rates")
      if (cachedRates) {
        try {
          const rates = JSON.parse(cachedRates)
          setExchangeRates({
            EGP: 1,
            USD: rates.USD || 0.032,
            EUR: rates.EUR || 0.029,
            SAR: rates.SAR || 0.12,
            AED: rates.AED || 0.12,
            GBP: rates.GBP || 0.025,
          })
        } catch (e) {
          console.error("[v0] Failed to parse cached rates", e)
        }
      }
    }
  }, [])

  const setCurrency = (newCurrency: typeof CURRENCIES[number]) => {
    setCurrencyState(newCurrency)
    localStorage.setItem("preferred_currency", newCurrency.code)
  }

  const convertPrice = (price: number): number => {
    const rate = exchangeRates[currency.code] || 1
    return price * rate
  }

  const formatPrice = (price: number): string => {
    const converted = convertPrice(price)
    const currencyName = language === "ar" ? currency.nameAr : currency.nameEn

    // Format with thousands separator
    const formatted = converted.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")

    return language === "ar" ? `${formatted} ${currency.symbol}` : `${currency.symbol}${formatted}`
  }

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        convertPrice,
        formatPrice,
        exchangeRates,
        isLoading,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}
