/**
 * DialekKita — language list and dialect-aware translation prompt.
 *
 * Each language entry:
 *   code     unique id used by the UI
 *   name     full name shown in the result drawer and given to the model
 *   label    short upper-case label for the lane "revolver" (keep <= 9 chars)
 *   sttLang  speech-to-text language sent to /api/stt
 *            (Moonshine: en/zh/... ; Whisper fallback: ms, ta)
 *   ttsLang  voice language sent to /api/tts
 *            (Moonshine voices: en/zh/... ; espeak-ng fallback: ms, ta)
 *   dialect  optional key into dialects.json — turns on the dialect layer
 */

import DIALECTS from "./dialects.json"

export const AVAILABLE_LANGUAGES = [
  { code: "ms", name: "Bahasa Malaysia", label: "MELAYU", sttLang: "ms", ttsLang: "ms" },
  { code: "kel", name: "Kelantanese Malay", label: "KELANTAN", sttLang: "ms", ttsLang: "ms", dialect: "kelantan" },
  { code: "utr", name: "Northern Malay", label: "UTARA", sttLang: "ms", ttsLang: "ms", dialect: "utara" },
  { code: "sab", name: "Sabah Malay", label: "SABAH", sttLang: "ms", ttsLang: "ms", dialect: "sabah" },
  { code: "swk", name: "Sarawak Malay", label: "SARAWAK", sttLang: "ms", ttsLang: "ms", dialect: "sarawak" },
  { code: "mgl", name: "Manglish", label: "MANGLISH", sttLang: "en", ttsLang: "en", dialect: "manglish" },
  { code: "en", name: "English", label: "ENGLISH", sttLang: "en", ttsLang: "en" },
  { code: "zh", name: "Chinese (Mandarin)", label: "CHINESE", sttLang: "zh", ttsLang: "zh" },
  { code: "ta", name: "Tamil", label: "TAMIL", sttLang: "ta", ttsLang: "ta" },
]

// Default lanes for the township counter demo: resident speaks Kelantanese,
// staff speaks Bahasa Malaysia.
export const DEFAULT_LANE_1 = 1 // Kelantanese
export const DEFAULT_LANE_2 = 0 // Bahasa Malaysia

function dialectBlock(lang, role) {
  const d = lang.dialect && DIALECTS[lang.dialect]
  if (!d) return ""
  const gloss = d.glossary.map(([a, b]) => `  ${a} = ${b}`).join("\n")
  const ex = d.examples.map(([a, b]) => `  "${a}" => "${b}"`).join("\n")
  return (
    `\n${role} language is ${d.name}. ${d.style}\n` +
    `Glossary (${d.name} = standard Bahasa Malaysia):\n${gloss}\n` +
    `Example pairs (${d.name} => standard Bahasa Malaysia):\n${ex}\n`
  )
}

/**
 * Build the system prompt for one translation turn.
 * Strategy ("normalise, then translate"):
 *   1. If the source is a dialect, first rewrite it into standard Bahasa Malaysia.
 *   2. Translate into the target. If the target is a dialect, write it the way
 *      speakers of that dialect actually talk, using the glossary and examples.
 * The model must answer with JSON: {"standard_malay": "...", "translation": "..."}
 */
export function buildTranslationPrompt(src, dst) {
  const srcName = src.name
  const dstName = dst.name
  const steps = []
  if (src.dialect) {
    steps.push(
      `1. Read the input, which is spoken ${srcName}. Rewrite its meaning in clear standard Bahasa Malaysia and put that in "standard_malay".`,
    )
  } else if (src.code === "ms") {
    steps.push(`1. The input is already Bahasa Malaysia. Copy it, lightly corrected, into "standard_malay".`)
  } else {
    steps.push(`1. Translate the input (${srcName}) into standard Bahasa Malaysia and put that in "standard_malay".`)
  }
  if (dst.code === "ms") {
    steps.push(`2. Put the same standard Bahasa Malaysia sentence in "translation".`)
  } else if (dst.dialect) {
    steps.push(
      `2. Translate into spoken ${dstName}, the way a local would really say it, using the glossary and examples. Put it in "translation".`,
    )
  } else {
    steps.push(`2. Translate into natural ${dstName}. Put it in "translation".`)
  }

  return (
    `You are DialekKita, a translator at a Malaysian township service counter. ` +
    `You help residents and staff who speak different Malaysian dialects and languages understand each other. ` +
    `Keep names, numbers, unit and block numbers, and times exactly as given. Be polite and concise.\n` +
    dialectBlock(src, "The source") +
    dialectBlock(dst, "The target") +
    `\nSteps:\n${steps.join("\n")}\n\n` +
    `You MUST reply with only a valid JSON object of this form:\n` +
    `{"standard_malay": "...", "translation": "..."}\n` +
    `No Markdown, no code fences, no explanation. Start with "{" and end with "}".`
  )
}
