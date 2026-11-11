import type { Category } from "../src/types";

// Direct P31 values of qualifying events (no subclass traversal: it exceeds WDQS timeouts).
export const EVENT_CLASSES: Record<string, Category> = {
  Q198: "war", Q178561: "war", Q1261499: "war", Q188055: "war", Q467011: "war", Q1827102: "war",
  Q8465: "war", Q831663: "war", Q1361229: "war", Q19841484: "war", Q103495: "war", Q350604: "war",
  Q645883: "war", Q3199915: "war", Q104212151: "war", Q1006311: "war", Q2223653: "war",
  Q10931: "politics", Q124734: "politics", Q6107280: "politics", Q13427116: "politics", Q45382: "politics",
  Q131569: "diplomacy", Q625298: "diplomacy",
  Q168247: "disaster", Q3839081: "disaster", Q8065: "disaster", Q7944: "disaster", Q8070: "disaster",
  Q8068: "disaster", Q3241045: "disaster", Q12184: "disaster",
  Q12772819: "discovery", Q839954: "discovery", Q15661340: "discovery", Q4989906: "discovery",
  Q8432: "civilization", Q3024240: "civilization", Q836688: "civilization", Q164950: "civilization",
  Q465299: "civilization", Q815962: "civilization",
  Q51645: "religion", Q12716443: "religion",
};

// Classes whose "start" is usually an inception date (P571) rather than an event date.
export const INCEPTION_CLASSES = ["Q839954", "Q15661340", "Q4989906", "Q8432", "Q3024240", "Q836688", "Q164950", "Q465299"];
