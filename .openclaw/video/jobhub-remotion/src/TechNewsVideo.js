/**
 * TechNewsVideo — tech-news-16x9 composition with voice audio + multi-scene animation.
 * Scenes: intro (0-45f) → title (45-end-60f) → outro (end-60f to end)
 * Duration is driven by voice_audio_path length (set in renderer.py).
 */
const React = require('react');
const {AbsoluteFill, Audio, interpolate, useCurrentFrame, useVideoConfig} = require('remotion');

const TECH_NEWS_COMPOSITION_ID = 'tech-news-16x9';

function clamp(val, lo, hi) { return Math.max(lo, Math.min(hi, val)); }

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function fadeRange(frame, inStart, inEnd, outStart, outEnd) {
  if (frame < inStart) return 0;
  if (frame < inEnd)   return easeOutCubic((frame - inStart) / (inEnd - inStart));
  if (outStart !== null && frame > outStart)
    return clamp(1 - (frame - outStart) / (outEnd - outStart), 0, 1);
  return 1;
}

const BG = 'linear-gradient(135deg, #060614 0%, #0a1828 45%, #080f20 100%)';
const CYAN = '#00d4ff';
const CYAN2 = '#00ffaa';

const TechNewsVideo = ({spec}) => {
  const frame = useCurrentFrame();
  const {durationInFrames: totalFrames, fps} = useVideoConfig();
  const s = spec || {};

  const title        = String(s.video_title  || 'Tech News');
  const subtitle     = String(s.video_subtitle || '');
  const tags         = Array.isArray(s.tags) ? s.tags.slice(0, 5) : [];
  const source       = String(s.source || 'Hacker News');
  const audioSrc     = String(s.voice_audio_path || '');
  const playbackRate = Number(s.playback_speed || 1.25);

  const INTRO_END   = 45;
  const OUTRO_START = Math.max(INTRO_END + 30, totalFrames - 60);
  const OUTRO_END   = totalFrames;

  // Scene fade values
  const headerAlpha  = fadeRange(frame, 0,   18, OUTRO_START, OUTRO_END);
  const titleAlpha   = fadeRange(frame, 20,  45, OUTRO_START, OUTRO_END);
  const titleSlide   = interpolate(frame, [20, 45], [50, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const subAlpha     = fadeRange(frame, 38,  60, OUTRO_START, OUTRO_END);
  const waterAlpha   = fadeRange(frame, OUTRO_START, OUTRO_END - 10, null, null);

  // Tags stagger in
  function tagAlpha(i) {
    const start = 55 + i * 12;
    return fadeRange(frame, start, start + 18, OUTRO_START, OUTRO_END);
  }

  return React.createElement(
    AbsoluteFill,
    {style: {background: BG, overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif'}},

    // ── Voice audio ──────────────────────────────────────────────────────
    audioSrc && React.createElement(Audio, {src: audioSrc, startFrom: 0, playbackRate}),

    // ── Accent bar ───────────────────────────────────────────────────────
    React.createElement('div', {style: {
      position: 'absolute', top: 0, left: 0, right: 0, height: '7px',
      background: `linear-gradient(90deg, ${CYAN} 0%, #0088cc 55%, ${CYAN2} 100%)`,
      opacity: headerAlpha,
    }}),

    // ── Scan lines overlay ────────────────────────────────────────────────
    React.createElement('div', {style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,212,255,0.015) 4px, rgba(0,212,255,0.015) 8px)',
    }}),

    // ── Source badge ──────────────────────────────────────────────────────
    React.createElement('div', {style: {
      position: 'absolute', top: '68px', left: '90px',
      color: `rgba(0,212,255,0.75)`,
      fontSize: '30px', fontWeight: 700,
      letterSpacing: '4px', textTransform: 'uppercase',
      opacity: headerAlpha,
    }}, `⚡ ${source}`),

    // ── Main content block ────────────────────────────────────────────────
    React.createElement('div', {style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '120px 100px', width: '100%', height: '100%',
    }},

      // Title
      React.createElement('div', {style: {
        color: '#ffffff',
        fontSize: title.length > 60 ? '64px' : '80px',
        fontWeight: 800, lineHeight: 1.15,
        marginBottom: '44px',
        textShadow: '0 4px 48px rgba(0,0,0,0.9)',
        letterSpacing: '-1px',
        maxWidth: '1640px',
        opacity: titleAlpha,
        transform: `translateY(${titleSlide}px)`,
      }}, title),

      // Subtitle
      subtitle && React.createElement('div', {style: {
        color: 'rgba(175,210,230,0.85)',
        fontSize: '34px', fontWeight: 400,
        lineHeight: 1.45, marginBottom: '52px',
        maxWidth: '1400px',
        opacity: subAlpha,
      }}, subtitle),

      // Tags
      tags.length > 0 && React.createElement('div', {style: {
        display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap',
      }},
        tags.map((tag, i) =>
          React.createElement('span', {key: i, style: {
            background: 'rgba(0,212,255,0.1)',
            border: `1px solid rgba(0,212,255,0.4)`,
            color: 'rgba(0,212,255,0.92)',
            padding: '10px 30px', borderRadius: '36px',
            fontSize: '26px', fontWeight: 600, letterSpacing: '0.5px',
            opacity: tagAlpha(i),
            transform: `translateY(${interpolate(frame, [55 + i * 12, 73 + i * 12], [20, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}px)`,
          }}, `#${tag}`)
        )
      )
    ),

    // ── Outro glow pulse ──────────────────────────────────────────────────
    frame > OUTRO_START && React.createElement('div', {style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `radial-gradient(ellipse at 50% 50%, rgba(0,212,255,${waterAlpha * 0.06}) 0%, transparent 70%)`,
    }}),

    // ── Watermark ─────────────────────────────────────────────────────────
    React.createElement('div', {style: {
      position: 'absolute', bottom: '52px', right: '90px',
      color: 'rgba(255,255,255,0.22)', fontSize: '22px',
      fontWeight: 500, letterSpacing: '3px',
      opacity: headerAlpha,
    }}, 'HUYBRID • TECH NEWS')
  );
};

module.exports = {TechNewsVideo, TECH_NEWS_COMPOSITION_ID};
