/**
 * OutroScene — elegant CTA outro with channel branding.
 */
const React = require('react');
const { AbsoluteFill, useCurrentFrame, useVideoConfig } = require('remotion');
const { presence, slideY, BG_DARK, CYAN, CYAN2, WHITE, FONT } = require('./transitions');

const OutroScene = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = scene || {};
  const totalF = durationInFrames;

  const cta     = String(s.cta || 'Follow for weekly tech insights');
  const channel = String(s.channel || 'Huybrid Tech');
  const tagline = String(s.tagline || 'AI • Code • Innovation');

  const glowAlpha    = presence(frame, 0,  30, totalF, 0);
  const logoAlpha    = presence(frame, 8,  20, totalF, 16);
  const logoY        = slideY(frame, 8, 20, 35);
  const taglineAlpha = presence(frame, 22, 18, totalF, 14);
  const divAlpha     = presence(frame, 32, 16, totalF, 14);
  const ctaAlpha     = presence(frame, 40, 22, totalF, 18);
  const ctaY         = slideY(frame, 40, 22, 30);
  const subAlpha     = presence(frame, 55, 18, totalF, 14);

  return React.createElement(
    AbsoluteFill,
    { style: { background: BG_DARK, overflow: 'hidden', fontFamily: FONT } },

    // Radial center glow
    React.createElement('div', { style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `radial-gradient(ellipse at 50% 50%, rgba(0,212,255,${glowAlpha * 0.12}) 0%, transparent 60%)`,
    }}),

    // Top accent bar
    React.createElement('div', { style: {
      position: 'absolute', top: 0, left: 0, right: 0, height: '6px',
      background: `linear-gradient(90deg, ${CYAN} 0%, #0088cc 55%, ${CYAN2} 100%)`,
      opacity: divAlpha,
    }}),

    // Bottom accent bar
    React.createElement('div', { style: {
      position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
      background: `linear-gradient(90deg, transparent 0%, ${CYAN} 30%, ${CYAN2} 70%, transparent 100%)`,
      opacity: divAlpha,
    }}),

    // Center content
    React.createElement('div', { style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: '0 120px', width: '100%', height: '100%',
    }},

      // Channel name
      React.createElement('div', { style: {
        color: CYAN, fontSize: '58px', fontWeight: 800,
        letterSpacing: '6px', textTransform: 'uppercase',
        textShadow: `0 0 40px rgba(0,212,255,0.5)`,
        marginBottom: '16px',
        opacity: logoAlpha, transform: `translateY(${logoY}px)`,
      }}, channel),

      // Tagline
      React.createElement('div', { style: {
        color: 'rgba(175,210,230,0.55)', fontSize: '26px', fontWeight: 400,
        letterSpacing: '5px', textTransform: 'uppercase',
        marginBottom: '56px',
        opacity: taglineAlpha,
      }}, tagline),

      // Divider
      React.createElement('div', { style: {
        width: '180px', height: '2px',
        background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
        marginBottom: '52px', opacity: divAlpha,
      }}),

      // CTA
      React.createElement('p', { style: {
        color: WHITE, fontSize: cta.length > 45 ? '44px' : '52px',
        fontWeight: 700, lineHeight: 1.35, margin: 0,
        maxWidth: '1300px',
        opacity: ctaAlpha, transform: `translateY(${ctaY}px)`,
      }}, cta),

      // Sub-text
      React.createElement('p', { style: {
        color: 'rgba(175,210,230,0.6)', fontSize: '28px', fontWeight: 400,
        marginTop: '32px', opacity: subAlpha,
      }}, 'Like • Comment • Subscribe')
    )
  );
};

module.exports = { OutroScene };
