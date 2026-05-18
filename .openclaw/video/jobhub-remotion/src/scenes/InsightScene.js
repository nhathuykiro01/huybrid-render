/**
 * InsightScene — animated headline + bullet points with evidence.
 * Supports: headline, points (array of strings), source_note.
 */
const React = require('react');
const { AbsoluteFill, useCurrentFrame, useVideoConfig } = require('remotion');
const { presence, slideY, slideX, staggerItem, BG_DARK, CYAN, AMBER, WHITE, MUTED, FONT } = require('./transitions');

const InsightScene = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = scene || {};
  const totalF = durationInFrames;

  const headline   = String(s.headline || 'Key Insight');
  const points     = Array.isArray(s.points) ? s.points.slice(0, 5) : [];
  const sourceNote = String(s.source_note || '');
  const imageUrl   = String(s.image_url || '');
  const hasImage   = imageUrl.length > 0;

  // Headline
  const headAlpha = presence(frame, 0,  22, totalF, 20);
  const headY     = slideY(frame, 0, 22, 45);

  // Divider line
  const lineAlpha = presence(frame, 20, 16, totalF, 18);

  // Bullet points — stagger from frame 32
  const pt0 = staggerItem(frame, 32, 16, 0, 20);
  const pt1 = staggerItem(frame, 32, 16, 1, 20);
  const pt2 = staggerItem(frame, 32, 16, 2, 20);
  const pt3 = staggerItem(frame, 32, 16, 3, 20);
  const pt4 = staggerItem(frame, 32, 16, 4, 20);
  const ptItems = [pt0, pt1, pt2, pt3, pt4];

  // Source note
  const noteAlpha = presence(frame, 32 + points.length * 16 + 20, 18, totalF, 16);

  return React.createElement(
    AbsoluteFill,
    { style: { background: BG_DARK, overflow: 'hidden', fontFamily: FONT } },

    // Scan lines
    React.createElement('div', { style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(255,179,0,0.008) 4px, rgba(255,179,0,0.008) 8px)',
    }}),

    // Amber glow left
    React.createElement('div', { style: {
      position: 'absolute', left: '-150px', top: '20%',
      width: '700px', height: '700px', borderRadius: '50%',
      background: `radial-gradient(ellipse, rgba(255,179,0,0.07) 0%, transparent 65%)`,
      opacity: headAlpha,
    }}),

    // Source badge
    React.createElement('div', { style: {
      position: 'absolute', top: '68px', left: '90px',
      color: `rgba(255,179,0,0.85)`, fontSize: '28px', fontWeight: 700,
      letterSpacing: '4px', textTransform: 'uppercase', opacity: headAlpha,
    }}, '💡 TECH INSIGHT'),

    // Main content — two-column when image present
    React.createElement('div', { style: {
      display: 'flex', flexDirection: 'row', alignItems: 'stretch',
      height: '100%', width: '100%',
    }},

      // LEFT: text column
      React.createElement('div', { style: {
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '120px 80px 100px 100px',
        flex: hasImage ? '0 0 58%' : '1',
        maxWidth: hasImage ? '58%' : '1680px',
      }},

        // Headline
        React.createElement('h1', { style: {
          color: AMBER, margin: '0 0 28px',
          fontSize: headline.length > 50 ? '56px' : '68px',
          fontWeight: 800, lineHeight: 1.15, letterSpacing: '-0.5px',
          textShadow: `0 0 48px rgba(255,179,0,0.3)`,
          opacity: headAlpha, transform: `translateY(${headY}px)`,
        }}, headline),

        // Divider
        React.createElement('div', { style: {
          width: '120px', height: '4px',
          background: `linear-gradient(90deg, ${AMBER} 0%, transparent 100%)`,
          marginBottom: '36px', borderRadius: '2px',
          opacity: lineAlpha,
        }}),

        // Bullet points
        React.createElement('div', { style: {
          display: 'flex', flexDirection: 'column', gap: '20px',
        }},
          points.map((point, i) => {
            const { alpha, offsetY } = ptItems[i] || { alpha: 0, offsetY: 30 };
            return React.createElement('div', { key: i, style: {
              display: 'flex', alignItems: 'flex-start', gap: '20px',
              opacity: alpha, transform: `translateY(${offsetY}px)`,
            }},
              React.createElement('div', { style: {
                flexShrink: 0, width: '10px', height: '10px',
                borderRadius: '50%', background: AMBER,
                marginTop: '14px',
                boxShadow: `0 0 12px rgba(255,179,0,0.6)`,
              }}),
              React.createElement('p', { style: {
                color: WHITE, fontSize: hasImage ? '32px' : '38px', fontWeight: 500,
                lineHeight: 1.45, margin: 0, flex: 1,
              }}, point)
            );
          })
        ),

        // Source note
        sourceNote && React.createElement('p', { style: {
          color: 'rgba(175,210,230,0.55)', fontSize: '24px', fontWeight: 400,
          marginTop: '36px', marginBottom: 0, fontStyle: 'italic',
          opacity: noteAlpha,
        }}, `— ${sourceNote}`)
      ),

      // RIGHT: image column (only when image_url is set)
      hasImage && React.createElement('div', { style: {
        flex: '0 0 42%', position: 'relative', overflow: 'hidden',
        opacity: headAlpha,
      }},
        // Image
        React.createElement('img', {
          src: imageUrl,
          style: {
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            display: 'block',
          },
        }),
        // Gradient overlay left edge (blends into bg)
        React.createElement('div', { style: {
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(6,6,20,0.85) 0%, rgba(6,6,20,0.1) 35%, transparent 60%)',
          pointerEvents: 'none',
        }}),
        // Gradient overlay bottom
        React.createElement('div', { style: {
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px',
          background: 'linear-gradient(0deg, rgba(6,6,20,0.6) 0%, transparent 100%)',
          pointerEvents: 'none',
        }})
      )
    ),

    // Watermark
    React.createElement('div', { style: {
      position: 'absolute', bottom: '52px', right: '90px',
      color: 'rgba(255,255,255,0.18)', fontSize: '22px',
      fontWeight: 500, letterSpacing: '3px', opacity: headAlpha,
    }}, 'HUYBRID • TECH NEWS')
  );
};

module.exports = { InsightScene };
