"use client"

import { useEffect } from "react"
import { useTenant } from "@/contexts/tenant-context"

/**
 * Component that applies tenant branding colors to CSS variables
 */
export function ThemeApplier() {
    const { currentTenant } = useTenant()

    useEffect(() => {
        // Apply custom colors if available
        const primaryColor = currentTenant.customPrimaryColor || currentTenant.primaryColor
        const secondaryColor = currentTenant.customSecondaryColor || currentTenant.secondaryColor

        // Convert hex to HSL for better CSS variable support
        const hexToHSL = (hex: string) => {
            // Remove # if present
            hex = hex.replace('#', '')

            // Convert to RGB
            const r = parseInt(hex.substring(0, 2), 16) / 255
            const g = parseInt(hex.substring(2, 4), 16) / 255
            const b = parseInt(hex.substring(4, 6), 16) / 255

            const max = Math.max(r, g, b)
            const min = Math.min(r, g, b)
            let h = 0, s = 0, l = (max + min) / 2

            if (max !== min) {
                const d = max - min
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

                switch (max) {
                    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
                    case g: h = ((b - r) / d + 2) / 6; break
                    case b: h = ((r - g) / d + 4) / 6; break
                }
            }

            h = Math.round(h * 360)
            s = Math.round(s * 100)
            l = Math.round(l * 100)

            return `${h} ${s}% ${l}%`
        }

        try {
            const primaryHSL = hexToHSL(primaryColor)
            const secondaryHSL = hexToHSL(secondaryColor)

            // Apply to CSS variables
            document.documentElement.style.setProperty('--primary', primaryHSL)
            document.documentElement.style.setProperty('--secondary', secondaryHSL)
        } catch (error) {
            console.error('Error applying theme colors:', error)
        }
    }, [currentTenant])

    return null // This component doesn't render anything
}
