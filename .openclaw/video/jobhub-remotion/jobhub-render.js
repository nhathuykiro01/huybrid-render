const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

// Keep Remotion temp workspaces under the project on Windows to avoid
// intermittent audio-mixing failures in the system temp directory.
const REMOTION_TEMP_ROOT = path.join(__dirname, '.tmp', 'remotion');
fs.mkdirSync(REMOTION_TEMP_ROOT, {recursive: true});
process.env.TMPDIR = REMOTION_TEMP_ROOT;
process.env.TMP = REMOTION_TEMP_ROOT;
process.env.TEMP = REMOTION_TEMP_ROOT;

const {bundle} = require('@remotion/bundler');
const {getCompositions, renderMedia} = require('@remotion/renderer');

const MIRRORED_ASSET_KEYS = ['intro_asset', 'outro_asset', 'bgm_asset', 'voice_audio_path', 'brand_logo_asset'];
const REMOTION_BUNDLE_CACHE_ROOT = path.join(REMOTION_TEMP_ROOT, 'bundle-cache');
const REMOTION_BUNDLE_CACHE_DIR = path.join(REMOTION_BUNDLE_CACHE_ROOT, 'site');
const REMOTION_BUNDLE_MANIFEST_PATH = path.join(REMOTION_BUNDLE_CACHE_ROOT, 'manifest.json');
const SOURCE_TRACK_PATHS = [
  path.join(__dirname, 'jobhub-render.js'),
  path.join(__dirname, 'package.json'),
  path.join(__dirname, 'src'),
];

function readJsonIfExists(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = {};
  for (let index = 2; index < argv.length; index += 1) {
    const current = argv[index];
    if (!current.startsWith('--')) {
      continue;
    }
    const key = current.slice(2);
    const value = argv[index + 1];
    args[key] = value;
    index += 1;
  }
  return args;
}

function resolveConcurrency(args) {
  const override = Number(
    args.concurrency || process.env.JOBHUB_REMOTION_CONCURRENCY || ''
  );
  if (Number.isFinite(override) && override >= 1) {
    return Math.max(1, Math.floor(override));
  }
  const logicalCpus = Math.max(1, (os.cpus() || []).length || 1);
  return Math.max(1, Math.floor(logicalCpus * 0.75));
}

function resolveCrf(args) {
  const override = Number(args.crf || process.env.JOBHUB_REMOTION_CRF || '');
  if (Number.isFinite(override) && override >= 1) {
    return Math.max(1, Math.floor(override));
  }
  return 23;
}

function resolveEncodingMaxRate(args) {
  return String(args.encodingMaxRate || process.env.JOBHUB_REMOTION_ENCODING_MAX_RATE || '5M').trim();
}

function resolveEncodingBufferSize(args) {
  return String(args.encodingBufferSize || process.env.JOBHUB_REMOTION_ENCODING_BUFFER_SIZE || '10M').trim();
}

function resolveFfmpegPreset(args) {
  return String(args.ffmpegPreset || process.env.JOBHUB_REMOTION_FFMPEG_PRESET || 'faster').trim();
}

function collectTrackedFiles(sourcePath, files = []) {
  if (!fs.existsSync(sourcePath)) {
    return files;
  }
  const stats = fs.statSync(sourcePath);
  if (stats.isFile()) {
    files.push(sourcePath);
    return files;
  }
  const entries = fs.readdirSync(sourcePath, {withFileTypes: true});
  for (const entry of entries) {
    if (entry.name === 'runtime-assets' || entry.name === 'node_modules') {
      continue;
    }
    collectTrackedFiles(path.join(sourcePath, entry.name), files);
  }
  return files;
}

function getBundleSourceSignature() {
  const hash = crypto.createHash('sha1');
  const files = SOURCE_TRACK_PATHS
    .flatMap((item) => collectTrackedFiles(item))
    .sort((left, right) => left.localeCompare(right));
  for (const filePath of files) {
    const stats = fs.statSync(filePath);
    hash.update(path.relative(__dirname, filePath));
    hash.update('|');
    hash.update(String(stats.size));
    hash.update('|');
    hash.update(String(Math.floor(stats.mtimeMs)));
    hash.update('\n');
  }
  return {
    signature: hash.digest('hex'),
    files: files.map((item) => path.relative(__dirname, item)),
  };
}

async function resolveBundle(entryPoint, publicDir) {
  fs.mkdirSync(REMOTION_BUNDLE_CACHE_ROOT, {recursive: true});
  const {signature, files} = getBundleSourceSignature();
  const manifest = readJsonIfExists(REMOTION_BUNDLE_MANIFEST_PATH);
  const cacheValid = manifest
    && manifest.signature === signature
    && manifest.bundle_dir === REMOTION_BUNDLE_CACHE_DIR
    && fs.existsSync(path.join(REMOTION_BUNDLE_CACHE_DIR, 'index.html'));
  if (cacheValid) {
    return {
      serveUrl: REMOTION_BUNDLE_CACHE_DIR,
      cacheStatus: 'hit',
      bundleSignature: signature,
      trackedFiles: files,
    };
  }
  fs.rmSync(REMOTION_BUNDLE_CACHE_DIR, {recursive: true, force: true});
  const bundled = await bundle({
    entryPoint,
    publicDir,
    outDir: REMOTION_BUNDLE_CACHE_DIR,
    webpackOverride: (config) => config,
    onProgress: () => undefined,
  });
  fs.writeFileSync(
    REMOTION_BUNDLE_MANIFEST_PATH,
    JSON.stringify(
      {
        signature,
        bundle_dir: bundled,
        generated_at: new Date().toISOString(),
        tracked_files: files,
      },
      null,
      2
    ),
    'utf8'
  );
  return {
    serveUrl: bundled,
    cacheStatus: 'miss',
    bundleSignature: signature,
    trackedFiles: files,
  };
}

function isRemoteAsset(value) {
  const text = String(value || '');
  return text.startsWith('http://') || text.startsWith('https://') || text.startsWith('/');
}

function localizeAssets(spec, runtimePublicDir) {
  const videoId = String(spec.video_id || 'video-runtime');
  const mirrorDir = path.join(runtimePublicDir, 'runtime-assets', videoId);
  fs.mkdirSync(mirrorDir, {recursive: true});
  const localized = JSON.parse(JSON.stringify(spec));
  for (const key of MIRRORED_ASSET_KEYS) {
    const rawValue = String(localized[key] || '').trim();
    if (!rawValue || isRemoteAsset(rawValue)) {
      continue;
    }
    const sourcePath = path.resolve(rawValue);
    if (!fs.existsSync(sourcePath)) {
      continue;
    }
    const targetName = path.basename(sourcePath);
    const targetPath = path.join(mirrorDir, targetName);
    if (!fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
    localized[key] = `/runtime-assets/${videoId}/${targetName}`;
  }
  if (Array.isArray(localized.scenes)) {
    localized.scenes = localized.scenes.map((scene) => {
      const payload = {...scene};
      const rawValue = String(payload.asset_ref || '').trim();
      if (!rawValue || isRemoteAsset(rawValue)) {
        return payload;
      }
      const sourcePath = path.resolve(rawValue);
      if (!fs.existsSync(sourcePath)) {
        return payload;
      }
      const targetName = path.basename(sourcePath);
      const targetPath = path.join(mirrorDir, targetName);
      if (!fs.existsSync(targetPath)) {
        fs.copyFileSync(sourcePath, targetPath);
      }
      payload.asset_ref = `/runtime-assets/${videoId}/${targetName}`;
      return payload;
    });
  }
  if (localized.brand && typeof localized.brand === 'object') {
    const brand = {...localized.brand};
    const rawValue = String(brand.logo_asset || brand.logo_url || '').trim();
    if (rawValue && !isRemoteAsset(rawValue)) {
      const sourcePath = path.resolve(rawValue);
      if (fs.existsSync(sourcePath)) {
        const targetName = path.basename(sourcePath);
        const targetPath = path.join(mirrorDir, targetName);
        if (!fs.existsSync(targetPath)) {
          fs.copyFileSync(sourcePath, targetPath);
        }
        brand.logo_url = `/runtime-assets/${videoId}/${targetName}`;
        brand.logo_asset = `/runtime-assets/${videoId}/${targetName}`;
        localized.brand = brand;
        localized.brand_logo_asset = brand.logo_asset;
        localized.brand_logo_url = brand.logo_url;
      }
    }
  }
  return localized;
}

async function main() {
  const args = parseArgs(process.argv);
  const specPath = path.resolve(args.spec || '');
  const outputPath = path.resolve(args.out || '');
  if (!fs.existsSync(specPath)) {
    throw new Error(`Missing spec file: ${specPath}`);
  }
  if (!outputPath) {
    throw new Error('Missing --out');
  }

  const startedAt = Date.now();
  const concurrency = resolveConcurrency(args);
  const crf = resolveCrf(args);
  const encodingMaxRate = resolveEncodingMaxRate(args);
  const encodingBufferSize = resolveEncodingBufferSize(args);
  const ffmpegPreset = resolveFfmpegPreset(args);
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const publicDir = path.join(__dirname, 'public');
  const videoId = String(spec.video_id || 'video-runtime');
  const assetMirrorDir = path.join(publicDir, 'runtime-assets', videoId);
  fs.mkdirSync(assetMirrorDir, {recursive: true});
  const localizedSpec = localizeAssets(spec, publicDir);
  const entryPoint = path.join(__dirname, 'src', 'index.js');
  let bundledAssetDir = '';
  const targetCompositionId = String(localizedSpec.composition_id || localizedSpec.template_id || 'jobhub-template-a');
  let resolvedCompositionId = targetCompositionId;
  let bundleCacheStatus = 'miss';
  let bundleSignature = '';
  try {
    const bundleResult = await resolveBundle(entryPoint, publicDir);
    const bundled = bundleResult.serveUrl;
    bundleCacheStatus = bundleResult.cacheStatus;
    bundleSignature = bundleResult.bundleSignature;
    bundledAssetDir = path.join(bundled, 'runtime-assets', videoId);
    fs.mkdirSync(path.dirname(bundledAssetDir), {recursive: true});
    fs.cpSync(assetMirrorDir, bundledAssetDir, {recursive: true, force: true});
    const inputProps = {spec: localizedSpec};
    const compositions = await getCompositions(bundled, {
      inputProps,
      chromiumOptions: {
        headless: true,
        disableWebSecurity: true,
      },
    });
    const composition = compositions.find((item) => item.id === targetCompositionId);
    if (!composition) {
      throw new Error(`Missing composition: ${targetCompositionId}`);
    }
    resolvedCompositionId = composition.id;

    fs.mkdirSync(path.dirname(outputPath), {recursive: true});
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: 'h264',
      crf,
      encodingMaxRate,
      encodingBufferSize,
      ffmpegOverride: ({args: ffmpegArgs}) => ([
        ...ffmpegArgs,
        '-preset',
        ffmpegPreset,
      ]),
      outputLocation: outputPath,
      inputProps,
      concurrency,
      chromiumOptions: {
        headless: true,
        disableWebSecurity: true,
      },
    });
  } finally {
    fs.rmSync(assetMirrorDir, {recursive: true, force: true});
    if (bundledAssetDir) {
      fs.rmSync(bundledAssetDir, {recursive: true, force: true});
    }
  }

  console.log(
    JSON.stringify({
      artifact_path: outputPath,
      duration_ms: Date.now() - startedAt,
      composition_id: resolvedCompositionId,
      concurrency,
      crf,
      encoding_max_rate: encodingMaxRate,
      encoding_buffer_size: encodingBufferSize,
      ffmpeg_preset: ffmpegPreset,
      bundle_cache_status: bundleCacheStatus,
      bundle_signature: bundleSignature,
    })
  );
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
