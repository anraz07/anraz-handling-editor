import React from "react"
import type { HandlingAttributeMeta } from "../config/attributesMeta"

interface TuningSliderProps {
  attrName: string
  meta: HandlingAttributeMeta
  value: number
  onChange: (attrName: string, newValue: number) => void
}

function TuningSliderComponent({
  attrName,
  meta,
  value,
  onChange,
}: TuningSliderProps) {
  const isHex = meta.type === "hex"

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newVal = 0
    if (isHex) {
      newVal = parseInt(e.target.value.replace(/^0x/i, ""), 16) || 0
    } else {
      newVal = parseFloat(e.target.value) || 0
    }

    // Clamp values if min/max are defined (except for hex)
    if (!isHex && meta.min !== undefined && meta.max !== undefined) {
      newVal = Math.max(meta.min, Math.min(meta.max, newVal))
    }
    onChange(attrName, newVal)
  }

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(attrName, parseFloat(e.target.value))
  }

  const displayValue = isHex
    ? "0x" + (value >>> 0).toString(16).toUpperCase().padStart(8, "0")
    : Number(value).toFixed(4)

  return (
    <div className="flex flex-col mb-3 bg-white/5 p-2 border-l-4 border-transparent hover:border-gta-accent transition-colors">
      <div className="flex justify-between items-center mb-1">
        <label
          className="text-sm text-gta-text font-bold tracking-wide uppercase"
          title={meta.desc}
        >
          {attrName}
        </label>
        <input
          type="text"
          value={displayValue}
          onChange={handleInputChange}
          className="bg-black/50 text-white text-xs px-2 py-1 outline-none text-right font-mono w-28 border border-white/10 focus:border-gta-accent"
        />
      </div>

      {!isHex && meta.min !== undefined && meta.max !== undefined && (
        <input
          type="range"
          min={meta.min}
          max={meta.max}
          step={meta.step || 0.01}
          value={value}
          onChange={handleSliderChange}
        />
      )}
      <div className="text-[10px] text-white/50 mt-1 uppercase">
        {meta.desc}
      </div>
    </div>
  )
}

export const TuningSlider = React.memo(TuningSliderComponent)
