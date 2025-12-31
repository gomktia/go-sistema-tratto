import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getInitials(value: string, maxCharacters = 2) {
    if (!value) return ""
    const parts = value.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return value.slice(0, maxCharacters).toUpperCase()
    const initials = parts.map((part) => part[0]?.toUpperCase() ?? "")
    const joined = initials.join("")
    return joined.slice(0, maxCharacters) || value.slice(0, maxCharacters).toUpperCase()
}

export function hexToHsl(hex: string): string | null {
    // Remove # if present
    hex = hex.replace(/^#/, '')

    // Parse 3-digit hex
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('')
    }

    if (hex.length !== 6) return null

    const r = parseInt(hex.substring(0, 2), 16) / 255
    const g = parseInt(hex.substring(2, 4), 16) / 255
    const b = parseInt(hex.substring(4, 6), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    let l = (max + min) / 2

    if (max !== min) {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }

    // Return in "H S% L%" format matching Tailwind globals
    return `${(h * 360).toFixed(1)} ${(s * 100).toFixed(1)}% ${(l * 100).toFixed(1)}%`
}
