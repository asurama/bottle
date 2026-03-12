"use client"

import { useState, useRef, useEffect } from "react"
import { DayPicker } from "react-day-picker"
import { ko } from "date-fns/locale"
import { format, parse, isValid } from "date-fns"
import { CalendarIcon, X } from "lucide-react"
import "react-day-picker/dist/style.css"

interface DatePickerProps {
    value?: string          // YYYY-MM-DD
    onChange?: (value: string) => void
    placeholder?: string
    className?: string
    name?: string
}

export function DatePicker({ value, onChange, placeholder = "날짜 선택", className = "", name }: DatePickerProps) {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Parse value string → Date
    const selectedDate = value && value.length === 10
        ? parse(value, "yyyy-MM-dd", new Date())
        : undefined

    const displayDate = selectedDate && isValid(selectedDate)
        ? format(selectedDate, "yyyy년 M월 d일")
        : undefined

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [])

    const handleSelect = (date: Date | undefined) => {
        if (date && isValid(date)) {
            onChange?.(format(date, "yyyy-MM-dd"))
        }
        setOpen(false)
    }

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation()
        onChange?.("")
    }

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            {/* Hidden input for form submission */}
            {name && <input type="hidden" name={name} value={value || ""} />}

            {/* Trigger button */}
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className={`
                    flex items-center gap-2 w-full h-11 px-3 rounded-md border text-sm text-left
                    transition-colors duration-150
                    ${open
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-primary/10 bg-background/50 hover:border-primary/30"
                    }
                    ${!displayDate ? "text-muted-foreground" : "text-foreground"}
                `}
            >
                <CalendarIcon className={`w-4 h-4 flex-shrink-0 ${open ? "text-primary" : "text-muted-foreground"}`} />
                <span className="flex-1 font-medium">{displayDate || placeholder}</span>
                {displayDate && (
                    <span onClick={handleClear} className="text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded">
                        <X className="w-3 h-3" />
                    </span>
                )}
            </button>

            {/* Calendar popup */}
            {open && (
                <div className="
                    absolute z-50 mt-1 rounded-xl border border-border/60 
                    bg-card shadow-2xl shadow-black/30 backdrop-blur-md
                    animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-150
                ">
                    <DayPicker
                        mode="single"
                        selected={selectedDate && isValid(selectedDate) ? selectedDate : undefined}
                        onSelect={handleSelect}
                        locale={ko}
                        captionLayout="dropdown"
                        fromYear={2020}
                        toYear={2030}
                        classNames={{
                            root: "p-3",
                            months: "flex flex-col",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center gap-2",
                            caption_label: "text-sm font-black uppercase tracking-wider text-primary hidden",
                            caption_dropdowns: "flex gap-2",
                            dropdown: "text-sm font-bold bg-background/80 border border-primary/20 rounded-lg px-2 py-1 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer",
                            dropdown_month: "",
                            dropdown_year: "",
                            vhidden: "hidden",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-border/50 rounded-md hover:bg-primary/10 transition-all flex items-center justify-center",
                            nav_button_previous: "absolute left-1",
                            nav_button_next: "absolute right-1",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell: "text-muted-foreground rounded-md w-9 font-bold text-[0.8rem]",
                            row: "flex w-full mt-2",
                            cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                            day: "h-9 w-9 p-0 font-normal rounded-md hover:bg-primary/10 hover:text-primary transition-colors aria-selected:opacity-100 cursor-pointer",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground font-bold rounded-md",
                            day_today: "bg-accent/60 text-accent-foreground font-bold rounded-md",
                            day_outside: "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_hidden: "invisible",
                        }}
                    />
                </div>
            )}
        </div>
    )
}
