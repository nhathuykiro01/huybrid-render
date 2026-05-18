/**
 * TechInsightVideo — multi-scene composition for tech insight videos.
 *
 * Spec structure (passed as `spec` prop):
 * {
 *   video_title: string,
 *   voice_audio_path: string,
 *   scenes: [
 *     { type: "title",       start_frame, duration_frames, title, subtitle, tags, source_badge }
 *     { type: "github_repo", start_frame, duration_frames, repo_name, description, stars, language, topics, rank }
 *     { type: "insight",     start_frame, duration_frames, headline, points, source_note }
 *     { type: "outro",       start_frame, duration_frames, cta, channel, tagline }
 *   ],
 *   output: { fps, width, height, duration_frames }
 * }
 */
const React = require('react');
const { AbsoluteFill, Audio, Sequence } = require('remotion');
const { TitleScene }     = require('./scenes/TitleScene');
const { GitHubRepoScene } = require('./scenes/GitHubRepoScene');
const { InsightScene }   = require('./scenes/InsightScene');
const { OutroScene }     = require('./scenes/OutroScene');

const TECH_INSIGHT_COMPOSITION_ID = 'tech-insight-16x9';

const SCENE_COMPONENTS = {
  title:       TitleScene,
  github_repo: GitHubRepoScene,
  insight:     InsightScene,
  outro:       OutroScene,
};

// Cross-dissolve overlay: fades white briefly at scene boundary
function SceneDivider({ frame, atFrame, halfDur = 6 }) {
  const dist = Math.abs(frame - atFrame);
  if (dist > halfDur) return null;
  const alpha = Math.max(0, 1 - dist / halfDur) * 0.18;
  return React.createElement('div', {
    style: {
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: `rgba(0,212,255,${alpha})`,
      zIndex: 100,
    },
  });
}

const TechInsightVideo = ({ spec }) => {
  const s = spec || {};
  const scenes       = Array.isArray(s.scenes) ? s.scenes : [];
  const audioSrc     = String(s.voice_audio_path || '');
  const playbackRate = Number(s.playback_speed || 1.25);

  return React.createElement(
    AbsoluteFill,
    { style: { background: '#060614', overflow: 'hidden' } },

    // ── Global voice audio ────────────────────────────────────────────────────
    audioSrc && React.createElement(Audio, { src: audioSrc, startFrom: 0, playbackRate }),

    // ── Scene sequences ───────────────────────────────────────────────────────
    ...scenes.map((scene, idx) => {
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

module.exports = { TechInsightVideo, TECH_INSIGHT_COMPOSITION_ID };
