/**
 * ShortTitleScene — vertical (1080×1920) intro title card.
 * Mobile-first large typography with category accent glow.
 */
const React = require('react');
const { AbsoluteFill, useCurrentFrame, useVideoConfig } = require('remotion');
const { presence, slideY, staggerItem, BG_DARK, CYAN, FONT } = require('./transitions');

const CATEGORY_ACCENTS = {
  Tech:     { glow: 'rgba(0,212,255,0.08)', accent: '#00d4ff', badge: '⚡' },
  Science:  { glow: 'rgba(168,85,247,0.08)', accent: '#a855f7', badge: '🔬' },
  News:     { glow: 'rgba(239,68,68,0.08)',  accent: '#ef4444', badge: '🌍' },
  Movies:   { glow: 'rgba(245,158,11,0.08)', accent: '#f59e0b', badge: '🎬' },
  Trending: { glow: 'rgba(249,115,22,0.08)', accent: '#f97316', badge: '🔥' },
};

const ShortTitleScene = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = scene || {};
  const totalF = durationInFrames;
  const category = String(s.category || 'Tech');
  const colors = CATEGORY_ACCENTS[category] || CATEGORY_ACCENTS.Tech;

  const title    = String(s.title || 'Breaking News');
  const subtitle = String(s.subtitle || '');
  const badge    = String(s.source_badge || 'HUYBRID TECH');
  const imageUrl = String(s.image_url || '');
  const hasImage = imageUrl.length > 0;
  const tags     = Array.isArray(s.tags) ? s.tags.slice(0, 3) : [];

  const badgeAlpha = presence(frame, 0, 14, totalF, 14);
  const titleAlpha = presence(frame, 12, 22, totalF, 18);
  const titleY     = slideY(frame, 12, 22, 60);
  const subAlpha   = presence(frame, 28, 18, totalF, 16);
  const subY       = slideY(frame, 28, 18, 35);

  const tagAlphas = tags.map((_, i) => staggerItem(frame, 40, 8, i));

  return React.createElement(
    AbsoluteFill,
    { style: { background: BG_DARK, overflow: 'hidden', fontFamily: FONT } },

    // Background image
    hasImage && React.createElement('img', {
      src: imageUrl,
      style: {
        position: 'absolute', inset: 0,
        width: '100%', height: '100%',
        objectFit: 'cover', objectPosition: 'center',
        opacity: titleAlpha * 0.3,
      },
    }),

    // Dark overlay
    hasImage && React.createElement('div', { style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: 'radial-gradient(ellipse at center, rgba(6,6,20,0.5) 0%, rgba(6,6,20,0.85) 70%, rgba(6,6,20,0.95) 100%)',
    }}),

    // Category glow (top)
    React.createElement('div', { style: {
      position: 'absolute', left: '50%', top: '-100px',
      width: '800px', height: '800px', borderRadius: '50%',
      transform: 'translateX(-50%)',
      background: `radial-gradient(ellipse, ${colors.glow} 0%, transparent 60%)`,
      opacity: titleAlpha, pointerEvents: 'none',
    }}),

    // Accent line top
    React.createElement('div', { style: {
      position: 'absolute', top: 0, left: 0, right: 0, height: '5px',
      background: `linear-gradient(90deg, transparent 10%, ${colors.accent} 50%, transparent 90%)`,
      opacity: badgeAlpha,
    }}),

    // Category badge top-center
    React.createElement('div', { style: {
      position: 'absolute', top: '100px', left: 0, right: 0,
      textAlign: 'center',
      opacity: badgeAlpha,
    }},
      React.createElement('span', { style: {
        display: 'inline-block',
        background: `${colors.accent}22`, border: `1px solid ${colors.accent}66`,
        color: colors.accent, padding: '10px 28px', borderRadius: '40px',
        fontSize: '28px', fontWeight: 700, letterSpacing: '3px',
        textTransform: 'uppercase',
      }}, `${colors.badge} ${badge}`)
    ),

    // Main content centered
    React.createElement('div', { style: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      padding: '200px 60px 0', width: '100%', height: '100%',
    }},

      // Title
      React.createElement('h1', { style: {
        color: '#fff', margin: '0 0 36px',
        fontSize: title.length > 35 ? '72px' : '88px',
        fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px',
        textShadow: '0 4px 48px rgba(0,0,0,0.9)',
        maxWidth: '960px',
        opacity: titleAlpha, transform: `translateY(${titleY}px)`,
      }}, title),

      // Subtitle
      subtitle && React.createElement('p', { style: {
        color: 'rgba(175,210,230,0.8)', margin: '0 0 44px',
        fontSize: '36px', fontWeight: 400, lineHeight: 1.4, maxWidth: '900px',
        opacity: subAlpha, transform: `translateY(${subY}px)`,
      }}, subtitle),

      // Tags
      tags.length > 0 && React.createElement('div', { style: {
        display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap',
      }},
        tags.map((tag, i) => {
          const { alpha, offsetY } = tagAlphas[i] || { alpha: 0, offsetY: 20 };
          return React.createElement('span', { key: i, style: {
            background: `${colors.accent}18`, border: `1px solid ${colors.accent}44`,
            color: `${colors.accent}ee`, padding: '10px 24px', borderRadius: '30px',
            fontSize: '26px', fontWeight: 600, letterSpacing: '0.5px',
            opacity: alpha, transform: `translateY(${offsetY}px)`,
          }}, `#${tag}`);
        })
      )
    ),

    // Watermark bottom
    React.createElement('div', { style: {
      position: 'absolute', bottom: '80px', left: 0, right: 0,
      textAlign: 'center',
      color: 'rgba(255,255,255,0.2)', fontSize: '22px',
      fontWeight: 500, letterSpacing: '3px', opacity: badgeAlpha,
    }}, 'HUYBRID')
  );
};

module.exports = { ShortTitleScene };
