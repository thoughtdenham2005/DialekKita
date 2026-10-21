/**
 * DialekKita — type-to-text fallback.
 * Lets a resident or staff member type instead of speaking (useful when
 * dialect speech recognition struggles, or in a noisy guardhouse).
 * Enter = translate, Tab = switch person, Esc = close.
 */

import React, { useEffect, useRef, useState } from "react"

export default function TypeBar({
  laneName,
  personLabel,
  onSubmit,
  onSwitchPerson,
  onClose,
}) {
  const [text, setText] = useState("")
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onClose()
    } else if (e.key === "Tab") {
      e.preventDefault()
      onSwitchPerson()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const t = text.trim()
    if (t) onSubmit(t)
  }

  return (
    <form className="type-bar" onSubmit={handleSubmit}>
      <div className="type-bar-label">
        PERSON {personLabel} · {laneName.toUpperCase()}
        <span className="type-bar-hint"> · Enter translate · Tab switch · Esc close</span>
      </div>
      <input
        ref={inputRef}
        className="type-bar-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Taip di sini / Type here…"
        aria-label={`Type in ${laneName}`}
      />
    </form>
  )
}
