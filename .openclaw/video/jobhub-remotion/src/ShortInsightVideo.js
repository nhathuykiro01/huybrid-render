/**
 * ShortInsightVideo — multi-scene vertical (1080×1920) composition for short videos.
 *
 * Spec structure (passed as `spec` prop):
 * {
 *   video_title: string,
 *   voice_audio_path: string,
 *   category: "Tech"|"Science"|"News"|"Movies"|"Trending",
 *   playback_speed: number (default 1.25),
 *   scenes: [
 *     { type: "title",   start_frame, duration_frames, title, subtitle, tags, source_badge, category }
 *     { type: "insight", start_frame, duration_frames, headline, points, source_note, image_url }
 *     { type: "outro",   start_frame, duration_frames, cta, channel, tagline }
 *   ],
 *   output: { fps: 30, width: 1080, height: 1920, duration_frames }
 * }
 */
const React = require('react');
const { AbsoluteFill, Audio, Sequence } = require('remotion');
const { ShortTitleScene }   = require('./scenes/ShortTitleScene');
const { ShortInsightScene } = require('./scenes/ShortInsightScene');
const { ShortOutroScene }   = require('./scenes/ShortOutroScene');

const SHORT_INSIGHT_COMPOSITION_ID = 'short-insight-9x16';

const SCENE_COMPONENTS = {
  title:       ShortTitleScene,
  insight:     ShortInsightScene,
  github_repo: ShortInsightScene,
  outro:       ShortOutroScene,
};

const CATEGORY_ACCENTS = {
  Tech:     '#00d4ff',
  Science:  '#a855f7',
  News:     '#ef4444',
  Movies:   '#f59e0b',
  Trending: '#f97316',
};

// Cross-dissolve overlay at scene boundaries
function SceneDivider({ frame, atFrame, halfDur = 5 }) {
  const dist = Math.abs(frame - atFrame);
  if (dist > halfDur) return null;
  const alpha = Math.max(0, 1 - dist / halfDur) * 0.15;
  return React.createElement('div', {
    style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `rgba(0,0,0,${alpha})`,
      zIndex: 100,
    },
  });
}

const ShortInsightVideo = ({ spec }) => {
  const s = spec || {};
  const scenes       = Array.isArray(s.scenes) ? s.scenes : [];
  const audioSrc     = String(s.voice_audio_path || '');
  const playbackRate = Number(s.playback_speed || 1.25);
  const category     = String(s.category || 'Tech');
  const accent       = CATEGORY_ACCENTS[category] || CATEGORY_ACCENTS.Tech;

  // Inject category + accent into each scene
  const enrichedScenes = scenes.map(scene => ({
    ...scene,
    category: scene.category || category,
    accent: scene.accent || accent,
  }));

  return React.createElement(
    AbsoluteFill,
    { style: { background: '#060614', overflow: 'hidden' } },

    // Global voice audio
    audioSrc && React.createElement(Audio, { src: audioSrc, startFrom: 0, playbackRate }),

    // Scene sequences
    ...enrichedScenes.map((scene, idx) => {
      const SceneComp = SCENE_COMPONENTS[scene.type];
      if (!SceneComp) return null;

      const from     = Number(scene.start_frame || 0);
      const duration = Number(scene.duration_frames || 90);

      return React.createElement(
        Sequence,
        { key: idx, from, durationInFrames: duration },
        React.createElement(SceneComp, { scene })
      );
    })
  );
};

module.exports = { ShortInsightVideo, SHORT_INSIGHT_COMPOSITION_ID };
