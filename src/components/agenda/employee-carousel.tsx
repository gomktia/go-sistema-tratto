"use client"

import { memo, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { EmployeeRecord } from "@/types/catalog"

interface EmployeeCarouselProps {
    employees: EmployeeRecord[]
    selectedEmployeeId: string | null
    onSelectEmployee: (employeeId: string) => void
}

export const EmployeeCarousel = memo(function EmployeeCarousel({
    employees,
    selectedEmployeeId,
    onSelectEmployee,
}: EmployeeCarouselProps) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const scrollAmount = 100
        scrollRef.current.scrollBy({
            left: direction === 'right' ? scrollAmount : -scrollAmount,
            behavior: 'smooth'
        })
    }

    return (
        <div className="relative flex items-center gap-2 px-3 py-3 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll('left')}
                className="h-8 w-8 flex-shrink-0 text-[#FF7A00]"
            >
                <ChevronLeft className="h-5 w-5" />
            </Button>

            <div
                ref={scrollRef}
                className="flex-1 flex items-center gap-4 overflow-x-auto scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {employees.map((employee) => {
                    const isSelected = selectedEmployeeId === employee.id
                    return (
                        <button
                            key={employee.id}
                            onClick={() => onSelectEmployee(employee.id)}
                            className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
                        >
                            <div
                                className={cn(
                                    "relative rounded-full transition-all",
                                    isSelected && "ring-2 ring-[#FF7A00] ring-offset-2"
                                )}
                            >
                                {employee.avatarUrl ? (
                                    <img
                                        src={employee.avatarUrl}
                                        alt={employee.fullName}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center font-bold text-lg text-white">
                                        {employee.fullName.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "text-xs font-medium truncate max-w-[70px] transition-colors",
                                    isSelected
                                        ? "text-[#FF7A00] font-bold"
                                        : "text-muted-foreground"
                                )}
                            >
                                {employee.fullName.split(' ')[0]}
                            </span>
                        </button>
                    )
                })}
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={() => scroll('right')}
                className="h-8 w-8 flex-shrink-0 text-[#FF7A00]"
            >
                <ChevronRight className="h-5 w-5" />
            </Button>

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
})
