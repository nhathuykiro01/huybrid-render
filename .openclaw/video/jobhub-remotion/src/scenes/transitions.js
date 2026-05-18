/**
 * Shared animation helpers for TechInsight scenes.
 * All functions operate on frame (0-based within a Sequence).
 */

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }
function easeOutExpo(t)  { return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t); }
function easeInOutQuad(t){ return t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2; }

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function remap(frame, inStart, inEnd, outStart, outEnd, easeFn) {
  const t = clamp((frame - inStart) / Math.max(inEnd - inStart, 1), 0, 1);
  const eased = easeFn ? easeFn(t) : t;
  return outStart + (outEnd - outStart) * eased;
}

function fadeIn(frame, start, dur) {
  return clamp((frame - start) / Math.max(dur, 1), 0, 1);
}

function fadeOut(frame, start, dur) {
  return clamp(1 - (frame - start) / Math.max(dur, 1), 0, 1);
}

// Fade in then optionally fade out near scene end
function presence(frame, inStart, inDur, totalFrames, outDur = 18) {
  const appear = easeOutCubic(clamp((frame - inStart) / Math.max(inDur, 1), 0, 1));
  const disappear = outDur > 0
    ? easeOutCubic(clamp((totalFrames - outDur - frame) / Math.max(outDur, 1), 0, 1))
    : 1;
  return Math.min(appear, disappear);
}

function slideY(frame, start, dur, fromY = 40) {
  const t = easeOutCubic(clamp((frame - start) / Math.max(dur, 1), 0, 1));
  return fromY * (1 - t);
}

function slideX(frame, start, dur, fromX = -60) {
  const t = easeOutExpo(clamp((frame - start) / Math.max(dur, 1), 0, 1));
  return fromX * (1 - t);
}

// Stagger helper: returns opacity+offset for item at index i
function staggerItem(frame, baseStart, staggerFrames, itemIndex, itemDur = 18) {
  const start = baseStart + itemIndex * staggerFrames;
  const alpha = easeOutCubic(clamp((frame - start) / Math.max(itemDur, 1), 0, 1));
  const offsetY = slideY(frame, start, itemDur, 28);
  return { alpha, offsetY };
}

// Counter animation: animates a number from 0 to target
function counter(frame, start, dur, target) {
  const t = easeOutExpo(clamp((frame - start) / Math.max(dur, 1), 0, 1));
  return Math.round(t * target);
}

// Format large numbers: 161344 → "161.3k"
function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

const BG_DARK = 'linear-gradient(135deg, #060614 0%, #0a1828 45%, #080f20 100%)';
const CYAN    = '#00d4ff';
const CYAN2   = '#00ffaa';
const AMBER   = '#ffb300';
const GREEN   = '#3fb950';
const WHITE   = '#ffffff';
const MUTED   = 'rgba(175,210,230,0.75)';

const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';

module.exports = {
  easeOutCubic, easeOutExpo, easeInOutQuad,
  clamp, remap, fadeIn, fadeOut, presence, slideY, slideX, staggerItem, counter, formatNumber,
  BG_DARK, CYAN, CYAN2, AMBER, GREEN, WHITE, MUTED, FONT,
};
