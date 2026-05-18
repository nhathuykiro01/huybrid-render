/**
 * GitHubRepoScene — animated GitHub repo card.
 * Shows: repo name, description, stars (animated counter), language, topics.
 */
const React = require('react');
const { AbsoluteFill, useCurrentFrame, useVideoConfig } = require('remotion');
const {
  presence, slideY, slideX, staggerItem, counter, formatNumber,
  BG_DARK, CYAN, GREEN, WHITE, MUTED, FONT,
} = require('./transitions');

const LANG_COLORS = {
  Python: '#3572A5', TypeScript: '#2b7489', JavaScript: '#f1e05a',
  HTML: '#e34c26', CSS: '#563d7c', Rust: '#dea584', Go: '#00ADD8',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', Shell: '#89e051',
  Kotlin: '#A97BFF', Swift: '#ffac45', Ruby: '#701516', Scala: '#c22d40',
};

const GitHubRepoScene = ({ scene }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const s = scene || {};
  const totalF = durationInFrames;

  const repoName   = String(s.repo_name || 'owner/repo');
  const description = String(s.description || '');
  const stars      = Number(s.stars || 0);
  const language   = String(s.language || '');
  const topics     = Array.isArray(s.topics) ? s.topics.slice(0, 5) : [];
  const rank       = s.rank ? `#${s.rank} this week` : '';
  const langColor  = LANG_COLORS[language] || '#aaa';

  const [owner, repo] = repoName.includes('/') ? repoName.split('/') : ['', repoName];

  // Timings
  const cardAlpha  = presence(frame, 0,  20, totalF, 20);
  const cardY      = slideY(frame, 0, 20, 50);
  const ownerAlpha = presence(frame, 12, 16, totalF, 16);
  const repoAlpha  = presence(frame, 16, 20, totalF, 18);
  const repoY      = slideY(frame, 16, 20, 30);
  const descAlpha  = presence(frame, 28, 20, totalF, 16);
  const descY      = slideY(frame, 28, 20, 22);
  const statsAlpha = presence(frame, 40, 18, totalF, 14);
  const animStars  = counter(frame, 40, Math.min(totalF - 40, 60), stars);

  const t0 = 56, ts = 10;
  const { alpha: tp0Alpha, offsetY: tp0Y } = staggerItem(frame, t0, ts, 0, 16);
  const { alpha: tp1Alpha, offsetY: tp1Y } = staggerItem(frame, t0, ts, 1, 16);
  const { alpha: tp2Alpha, offsetY: tp2Y } = staggerItem(frame, t0, ts, 2, 16);
  const { alpha: tp3Alpha, offsetY: tp3Y } = staggerItem(frame, t0, ts, 3, 16);
  const { alpha: tp4Alpha, offsetY: tp4Y } = staggerItem(frame, t0, ts, 4, 16);
  const topicAlphas = [tp0Alpha, tp1Alpha, tp2Alpha, tp3Alpha, tp4Alpha];
  const topicYs     = [tp0Y,     tp1Y,     tp2Y,     tp3Y,     tp4Y];

  return React.createElement(
    AbsoluteFill,
    { style: { background: BG_DARK, overflow: 'hidden', fontFamily: FONT } },

    // Scan lines
    React.createElement('div', { style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,212,255,0.01) 4px, rgba(0,212,255,0.01) 8px)',
    }}),

    // Green glow top-right
    React.createElement('div', { style: {
      position: 'absolute', right: '-100px', top: '-100px',
      width: '700px', height: '700px', borderRadius: '50%',
      background: `radial-gradient(ellipse, rgba(63,185,80,0.08) 0%, transparent 65%)`,
      opacity: cardAlpha,
    }}),

    // Source badge
    React.createElement('div', { style: {
      position: 'absolute', top: '68px', left: '90px',
      color: 'rgba(63,185,80,0.9)', fontSize: '28px', fontWeight: 700,
      letterSpacing: '4px', textTransform: 'uppercase', opacity: ownerAlpha,
    }}, '⚡ GITHUB TRENDING'),

    // Rank badge top-right
    rank && React.createElement('div', { style: {
      position: 'absolute', top: '68px', right: '90px',
      background: 'rgba(63,185,80,0.15)', border: '1px solid rgba(63,185,80,0.5)',
      color: GREEN, padding: '8px 28px', borderRadius: '30px',
      fontSize: '26px', fontWeight: 700, opacity: statsAlpha,
    }}, rank),

    // Center content
    React.createElement('div', { style: {
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '120px 100px 100px', height: '100%',
    }},

      // owner/
      owner && React.createElement('div', { style: {
        color: 'rgba(139,200,139,0.7)', fontSize: '34px', fontWeight: 500,
        marginBottom: '8px', letterSpacing: '0.5px',
        opacity: ownerAlpha,
      }}, owner + ' /'),

      // repo name
      React.createElement('h1', { style: {
        color: GREEN, margin: '0 0 36px',
        fontSize: repo.length > 30 ? '64px' : '80px',
        fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1px',
        textShadow: `0 0 40px rgba(63,185,80,0.4)`,
        opacity: repoAlpha, transform: `translateY(${repoY}px)`,
      }}, repo),

      // Description
      description && React.createElement('p', { style: {
        color: MUTED, fontSize: '34px', fontWeight: 400,
        lineHeight: 1.55, margin: '0 0 52px', maxWidth: '1400px',
        opacity: descAlpha, transform: `translateY(${descY}px)`,
      }}, description),

      // Stats row: stars + language
      React.createElement('div', { style: {
        display: 'flex', alignItems: 'center', gap: '48px',
        marginBottom: '44px', opacity: statsAlpha,
      }},
        // Stars
        React.createElement('div', { style: {
          display: 'flex', alignItems: 'center', gap: '14px',
        }},
          React.createElement('span', { style: { fontSize: '40px' }}, '⭐'),
          React.createElement('span', { style: {
            color: WHITE, fontSize: '48px', fontWeight: 800,
            letterSpacing: '-1px',
          }}, formatNumber(animStars)),
          React.createElement('span', { style: {
            color: 'rgba(255,255,255,0.4)', fontSize: '28px', paddingTop: '4px',
          }}, 'stars')
        ),

        // Language
        language && React.createElement('div', { style: {
          display: 'flex', alignItems: 'center', gap: '12px',
        }},
          React.createElement('div', { style: {
            width: '20px', height: '20px', borderRadius: '50%',
            background: langColor, flexShrink: 0,
          }}),
          React.createElement('span', { style: {
            color: WHITE, fontSize: '32px', fontWeight: 600,
          }}, language)
        )
      ),

      // Topics
      topics.length > 0 && React.createElement('div', { style: {
        display: 'flex', gap: '16px', flexWrap: 'wrap',
      }},
        topics.map((t, i) =>
          React.createElement('span', { key: i, style: {
            background: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.35)',
            color: 'rgba(63,185,80,0.9)', padding: '8px 22px', borderRadius: '30px',
            fontSize: '24px', fontWeight: 600,
            opacity: topicAlphas[i], transform: `translateY(${topicYs[i]}px)`,
          }}, `#${t}`)
        )
      )
    ),

    // Watermark
    React.createElement('div', { style: {
      position: 'absolute', bottom: '52px', right: '90px',
      color: 'rgba(255,255,255,0.18)', fontSize: '22px',
      fontWeight: 500, letterSpacing: '3px', opacity: cardAlpha,
    }}, 'HUYBRID • TECH NEWS')
  );
};

module.exports = { GitHubRepoScene };
