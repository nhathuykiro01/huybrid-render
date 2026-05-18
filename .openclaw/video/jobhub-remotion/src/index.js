const React = require('react');
const {Composition, registerRoot} = require('remotion');
const {JobHubListicleVideo, JobHubShortVideo, JobHubThumbnail, COMPOSITION_IDS, SHORT_COMPOSITION_IDS, TECH_NEWS_COMPOSITION_IDS, THUMBNAIL_COMPOSITION_ID} = require('./video');
const {TechNewsVideo} = require('./TechNewsVideo');
const {TechInsightVideo, TECH_INSIGHT_COMPOSITION_ID} = require('./TechInsightVideo');
const {ShortInsightVideo, SHORT_INSIGHT_COMPOSITION_ID} = require('./ShortInsightVideo');
const {ApprovedVideoTemplate, ApprovedShortTemplate} = require('./TemplateRenderer');
const {VIDEO_TEMPLATE_IDS, SHORT_TEMPLATE_IDS} = require('./templateStyles');

const DEFAULT_SPEC = {
  template_id: 'jobhub-hero-16x9',
  output: {
    fps: 30,
    width: 1920,
    height: 1080,
    duration_frames: 450,
  },
  jobs: [],
};

const RemotionRoot = () => {
  const spec = DEFAULT_SPEC;
  return React.createElement(
    React.Fragment,
    null,
    React.createElement(Composition, {
      key: THUMBNAIL_COMPOSITION_ID,
      id: THUMBNAIL_COMPOSITION_ID,
      component: JobHubThumbnail,
      width: 1280,
      height: 720,
      fps: 30,
      durationInFrames: 1,
      defaultProps: {
        spec: {
          ...DEFAULT_SPEC,
          template_id: THUMBNAIL_COMPOSITION_ID,
        },
      },
    }),
    COMPOSITION_IDS.map((templateId) =>
      React.createElement(Composition, {
        key: templateId,
        id: templateId,
        component: JobHubListicleVideo,
        width: spec.output.width,
        height: spec.output.height,
        fps: spec.output.fps,
        durationInFrames: spec.output.duration_frames,
        calculateMetadata: ({props}) => ({
          durationInFrames: Number(props?.spec?.output?.duration_frames || spec.output.duration_frames),
          fps: Number(props?.spec?.output?.fps || spec.output.fps),
          width: Number(props?.spec?.output?.width || spec.output.width),
          height: Number(props?.spec?.output?.height || spec.output.height),
        }),
        defaultProps: {
          spec: {
            ...DEFAULT_SPEC,
            template_id: templateId,
          },
        },
      })
    ),
    TECH_NEWS_COMPOSITION_IDS.map((templateId) =>
      React.createElement(Composition, {
        key: templateId,
        id: templateId,
        component: TechNewsVideo,
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 900,
        calculateMetadata: ({props}) => ({
          durationInFrames: Number((props?.spec?.output?.duration_frames) || 900),
          fps: Number((props?.spec?.output?.fps) || 30),
          width: Number((props?.spec?.output?.width) || 1920),
          height: Number((props?.spec?.output?.height) || 1080),
        }),
        defaultProps: {
          spec: {
            composition_id: templateId,
            video_title: 'Tech News Placeholder',
            video_subtitle: 'Powered by Huybrid',
            tags: ['AI', 'Tech'],
            source: 'Hacker News',
            output: {fps: 30, width: 1920, height: 1080, duration_frames: 900},
          },
        },
      })
    ),
    // ── TechInsight multi-scene composition ──────────────────────────────────
    React.createElement(Composition, {
      key: TECH_INSIGHT_COMPOSITION_ID,
      id:  TECH_INSIGHT_COMPOSITION_ID,
      component: TechInsightVideo,
      width: 1920, height: 1080, fps: 30,
      durationInFrames: 900,
      calculateMetadata: ({props}) => ({
        durationInFrames: Number(props?.spec?.output?.duration_frames || 900),
        fps:   Number(props?.spec?.output?.fps   || 30),
        width: Number(props?.spec?.output?.width || 1920),
        height:Number(props?.spec?.output?.height|| 1080),
      }),
      defaultProps: {
        spec: {
          composition_id: TECH_INSIGHT_COMPOSITION_ID,
          video_title: 'Tech Insight Placeholder',
          voice_audio_path: '',
          scenes: [
            { type: 'title',   start_frame: 0,   duration_frames: 150, title: 'Tech Insight', subtitle: 'Powered by Huybrid', tags: ['AI', 'Tech'] },
            { type: 'insight', start_frame: 150, duration_frames: 300, headline: 'Key Findings', points: ['Point 1', 'Point 2', 'Point 3'] },
            { type: 'outro',   start_frame: 450, duration_frames: 150, cta: 'Follow for weekly tech insights' },
          ],
          output: { fps: 30, width: 1920, height: 1080, duration_frames: 600 },
        },
      },
    }),

    // ── ShortInsight 9:16 vertical composition ────────────────────────────
    React.createElement(Composition, {
      key: SHORT_INSIGHT_COMPOSITION_ID,
      id:  SHORT_INSIGHT_COMPOSITION_ID,
      component: ShortInsightVideo,
      width: 1080, height: 1920, fps: 30,
      durationInFrames: 1200,
      calculateMetadata: ({props}) => ({
        durationInFrames: Number(props?.spec?.output?.duration_frames || 1200),
        fps:   Number(props?.spec?.output?.fps   || 30),
        width: Number(props?.spec?.output?.width || 1080),
        height:Number(props?.spec?.output?.height|| 1920),
      }),
      defaultProps: {
        spec: {
          composition_id: SHORT_INSIGHT_COMPOSITION_ID,
          video_title: 'Short Insight Placeholder',
          voice_audio_path: '',
          category: 'Tech',
          scenes: [
            { type: 'title',   start_frame: 0,   duration_frames: 120, title: 'Breaking Tech', subtitle: 'By Huybrid', tags: ['AI'], category: 'Tech' },
            { type: 'insight', start_frame: 120, duration_frames: 240, headline: 'Key Finding', points: ['Point 1', 'Point 2'] },
            { type: 'outro',   start_frame: 360, duration_frames: 90,  cta: 'Follow Huybrid' },
          ],
          output: { fps: 30, width: 1080, height: 1920, duration_frames: 450 },
        },
      },
    }),

    VIDEO_TEMPLATE_IDS.map((templateId) =>
      React.createElement(Composition, {
        key: templateId,
        id: templateId,
        component: ApprovedVideoTemplate,
        width: 1920,
        height: 1080,
        fps: 30,
        durationInFrames: 900,
        calculateMetadata: ({props}) => ({
          durationInFrames: Number(props?.spec?.output?.duration_frames || 900),
          fps: Number(props?.spec?.output?.fps || 30),
          width: Number(props?.spec?.output?.width || 1920),
          height: Number(props?.spec?.output?.height || 1080),
        }),
        defaultProps: {
          spec: {
            composition_id: templateId,
            template_id: templateId,
            style_id: templateId,
            video_title: 'Huybrid Template Placeholder',
            insight_theme: 'Approved Phase 1.2 Remotion template',
            scenes: [
              { type: 'title', start_frame: 0, duration_frames: 150, title: 'Huybrid Template', subtitle: templateId, tags: ['Huybrid', 'SME'] },
              { type: 'insight', start_frame: 150, duration_frames: 300, headline: 'Ready for content', points: ['Scene-based rendering', 'Brand slot reserved', 'GitHub Remotion compatible'] },
              { type: 'outro', start_frame: 450, duration_frames: 150, cta: 'Follow Huybrid', channel: 'Huybrid' },
            ],
            output: { fps: 30, width: 1920, height: 1080, duration_frames: 600 },
          },
        },
      })
    ),

    SHORT_TEMPLATE_IDS.map((templateId) =>
      React.createElement(Composition, {
        key: templateId,
        id: templateId,
        component: ApprovedShortTemplate,
        width: 1080,
        height: 1920,
        fps: 30,
        durationInFrames: 900,
        calculateMetadata: ({props}) => ({
          durationInFrames: Number(props?.spec?.output?.duration_frames || 900),
          fps: Number(props?.spec?.output?.fps || 30),
          width: Number(props?.spec?.output?.width || 1080),
          height: Number(props?.spec?.output?.height || 1920),
        }),
        defaultProps: {
          spec: {
            composition_id: templateId,
            template_id: templateId,
            style_id: templateId,
            video_title: 'Huybrid Short Placeholder',
            insight_theme: 'Approved Phase 1.2 short template',
            scenes: [
              { type: 'title', start_frame: 0, duration_frames: 120, title: 'Huybrid Short', subtitle: templateId, tags: ['Short', 'SME'] },
              { type: 'insight', start_frame: 120, duration_frames: 240, headline: 'Ready for mobile', points: ['9:16 layout', 'Readable captions', 'Brand slot reserved'] },
              { type: 'outro', start_frame: 360, duration_frames: 120, cta: 'Follow Huybrid', channel: 'Huybrid' },
            ],
            output: { fps: 30, width: 1080, height: 1920, duration_frames: 480 },
          },
        },
      })
    ),

    SHORT_COMPOSITION_IDS.map((templateId) =>
      React.createElement(Composition, {
        key: templateId,
        id: templateId,
        component: JobHubShortVideo,
        width: 1080,
        height: 1920,
        fps: 30,
        durationInFrames: 1350,
        calculateMetadata: ({props}) => ({
          durationInFrames: Number(props?.spec?.output?.duration_frames || 1350),
          fps: Number(props?.spec?.output?.fps || 30),
          width: Number(props?.spec?.output?.width || 1080),
          height: Number(props?.spec?.output?.height || 1920),
        }),
        defaultProps: {
          spec: {
            template_id: templateId === 'documentary-insight-short' ? 'documentary_insight_short' : 'documentary_compare_short',
            composition_id: templateId,
            output: {
              fps: 30,
              width: 1080,
              height: 1920,
              duration_frames: 1350,
            },
            scenes: [],
            subtitle_cues: [],
          },
        },
      })
    )
  );
};

registerRoot(RemotionRoot);
