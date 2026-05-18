/**
 * ShortInsightScene — vertical (1080×1920) content/insight card.
 * Large readable text for mobile, supports background image.
 */
const React = require('react');
const { AbsoluteFill, useCurrentFrame, useVideoConfig } = require('remotion');
const { presence, slideY, staggerItem, BG_DARK, AMBER, WHITE, FONT } = require('./transitions');

const ShortInsightScene = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = scene || {};
  const totalF = durationInFrames;

  const headline   = String(s.headline || 'Key Insight');
  const points     = Array.isArray(s.points) ? s.points.slice(0, 4) : [];
  const sourceNote = String(s.source_note || '');
  const imageUrl   = String(s.image_url || '');
  const hasImage   = imageUrl.length > 0;
  const accent     = String(s.accent || AMBER);

  // Animations
  const headAlpha = presence(frame, 0, 20, totalF, 18);
  const headY     = slideY(frame, 0, 20, 50);
  const lineAlpha = presence(frame, 16, 14, totalF, 16);

  const ptItems = points.map((_, i) => staggerItem(frame, 28, 14, i, 18));
  const noteAlpha = presence(frame, 28 + points.length * 14 + 16, 16, totalF, 14);

  return React.createElement(
    AbsoluteFill,
    { style: { background: BG_DARK, overflow: 'hidden', fontFamily: FONT } },

    // Background image (top half)
    hasImage && React.createElement('img', {
      src: imageUrl,
      style: {
        position: 'absolute', top: 0, left: 0, right: 0,
        width: '100%', height: '55%',
        objectFit: 'cover', objectPosition: 'center',
        opacity: headAlpha * 0.4,
      },
    }),

    // Gradient overlay on image
    hasImage && React.createElement('div', { style: {
      position: 'absolute', top: 0, left: 0, right: 0, height: '60%',
      background: 'linear-gradient(180deg, rgba(6,6,20,0.3) 0%, rgba(6,6,20,0.7) 60%, rgba(6,6,20,1) 100%)',
      pointerEvents: 'none',
    }}),

    // Scan lines
    React.createElement('div', { style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,179,0,0.006) 4px, rgba(255,179,0,0.006) 8px)',
    }}),

    // Accent glow
    React.createElement('div', { style: {
      position: 'absolute', left: '-100px', top: '25%',
      width: '600px', height: '600px', borderRadius: '50%',
      background: `radial-gradient(ellipse, ${accent}12 0%, transparent 60%)`,
      opacity: headAlpha, pointerEvents: 'none',
    }}),

    // Badge
    React.createElement('div', { style: {
      position: 'absolute', top: '80px', left: '60px',
      color: accent, fontSize: '26px', fontWeight: 700,
      letterSpacing: '3px', textTransform: 'uppercase', opacity: headAlpha,
    }}, '💡 INSIGHT'),

    // Content
    React.createElement('div', { style: {
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '180px 60px 120px',
      width: '100%', height: '100%',
    }},

      // Headline
      React.createElement('h1', { style: {
        color: accent, margin: '0 0 24px',
        fontSize: headline.length > 35 ? '56px' : '68px',
        fontWeight: 800, lineHeight: 1.12, letterSpacing: '-0.5px',
        textShadow: `0 0 48px ${accent}44`,
        opacity: headAlpha, transform: `translateY(${headY}px)`,
      }}, headline),

      // Divider
      React.createElement('div', { style: {
        width: '100px', height: '4px',
        background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`,
        marginBottom: '32px', borderRadius: '2px',
        opacity: lineAlpha,
      }}),

      // Bullet points
      React.createElement('div', { style: {
        display: 'flex', flexDirection: 'column', gap: '20px',
      }},
        points.map((point, i) => {
          const { alpha, offsetY } = ptItems[i] || { alpha: 0, offsetY: 30 };
          return React.createElement('div', { key: i, style: {
            display: 'flex', alignItems: 'flex-start', gap: '18px',
            opacity: alpha, transform: `translateY(${offsetY}px)`,
          }},
            React.createElement('div', { style: {
              flexShrink: 0, width: '10px', height: '10px',
              borderRadius: '50%', background: accent,
              marginTop: '14px',
              boxShadow: `0 0 12px ${accent}88`,
            }}),
            React.createElement('p', { style: {
              color: WHITE, fontSize: '36px', fontWeight: 500,
              lineHeight: 1.4, margin: 0, flex: 1,
            }}, point)
          );
        })
      ),

      // Source note
      sourceNote && React.createElement('p', { style: {
        color: 'rgba(175,210,230,0.5)', fontSize: '24px', fontWeight: 400,
        marginTop: '32px', marginBottom: 0, fontStyle: 'italic',
        opacity: noteAlpha,
      }}, `— ${sourceNote}`)
    ),

    // Watermark
    React.createElement('div', { style: {
      position: 'absolute', bottom: '60px', left: 0, right: 0,
      textAlign: 'center',
      color: 'rgba(255,255,255,0.15)', fontSize: '20px',
      fontWeight: 500, letterSpacing: '3px', opacity: headAlpha,
    }}, 'HUYBRID')
  );
};

module.exports = { ShortInsightScene };
