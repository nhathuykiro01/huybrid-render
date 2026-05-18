/**
 * ShortOutroScene — vertical (1080×1920) CTA / closing card.
 * Minimal, clean, with animated accent line.
 */
const React = require('react');
const { AbsoluteFill, useCurrentFrame, useVideoConfig } = require('remotion');
const { presence, slideY, BG_DARK, CYAN, WHITE, FONT } = require('./transitions');

const ShortOutroScene = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = scene || {};
  const totalF = durationInFrames;

  const cta      = String(s.cta || 'Follow for more');
  const channel  = String(s.channel || 'Huybrid');
  const tagline  = String(s.tagline || 'AI • Code • Innovation');
  const accent   = String(s.accent || CYAN);

  const logoAlpha = presence(frame, 0, 18, totalF, 14);
  const ctaAlpha  = presence(frame, 12, 20, totalF, 16);
  const ctaY      = slideY(frame, 12, 20, 40);
  const tagAlpha  = presence(frame, 28, 16, totalF, 12);
  const lineW     = Math.min(1, frame / 25) * 200;

  return React.createElement(
    AbsoluteFill,
    { style: { background: BG_DARK, overflow: 'hidden', fontFamily: FONT } },

    // Glow center
    React.createElement('div', { style: {
      position: 'absolute', left: '50%', top: '40%',
      width: '700px', height: '700px', borderRadius: '50%',
      transform: 'translate(-50%, -50%)',
      background: `radial-gradient(ellipse, ${accent}0a 0%, transparent 55%)`,
      opacity: logoAlpha, pointerEvents: 'none',
    }}),

    // Content centered
    React.createElement('div', { style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: '0 60px', width: '100%', height: '100%',
    }},

      // Channel name
      React.createElement('div', { style: {
        fontSize: '52px', fontWeight: 800, color: WHITE,
        letterSpacing: '-1px', marginBottom: '20px',
        opacity: logoAlpha,
      }}, channel),

      // Animated accent line
      React.createElement('div', { style: {
        width: `${lineW}px`, height: '4px',
        background: `linear-gradient(90deg, transparent 0%, ${accent} 50%, transparent 100%)`,
        marginBottom: '40px', borderRadius: '2px',
      }}),

      // CTA text
      React.createElement('p', { style: {
        color: 'rgba(200,220,235,0.9)', fontSize: '42px', fontWeight: 500,
        lineHeight: 1.35, margin: '0 0 36px', maxWidth: '860px',
        opacity: ctaAlpha, transform: `translateY(${ctaY}px)`,
      }}, cta),

      // Tagline
      React.createElement('div', { style: {
        color: `${accent}88`, fontSize: '26px', fontWeight: 600,
        letterSpacing: '4px', textTransform: 'uppercase',
        opacity: tagAlpha,
      }}, tagline)
    ),

    // Bottom accent line
    React.createElement('div', { style: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px',
      background: `linear-gradient(90deg, transparent 10%, ${accent} 50%, transparent 90%)`,
      opacity: tagAlpha,
    }})
  );
};

module.exports = { ShortOutroScene };
