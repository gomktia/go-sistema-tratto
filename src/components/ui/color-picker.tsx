"use client"

import { HexColorPicker } from "react-colorful"
import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

interface ColorPickerProps {
    color: string
    onChange: (color: string) => void
    label?: string
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="flex flex-col gap-2">
            {label && <label className="text-sm font-medium">{label}</label>}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-12"
                    >
                        <div
                            className="w-8 h-8 rounded-md border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                        />
                        <span className="font-mono text-sm">{color.toUpperCase()}</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                    <HexColorPicker color={color} onChange={onChange} />
                    <div className="mt-3 flex items-center gap-2">
                        <input
                            type="text"
                            value={color}
                            onChange={(e) => onChange(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border rounded-md font-mono"
                            placeholder="#000000"
                        />
                        <Button size="sm" onClick={() => setIsOpen(false)}>
                            OK
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    )
}
