const fs = require('fs');
const path = require('path');
const {bundle} = require('@remotion/bundler');
const {getCompositions, renderStill} = require('@remotion/renderer');

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
  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  const entryPoint = path.join(__dirname, 'src', 'index.js');
  const bundled = await bundle({
    entryPoint,
    publicDir: path.join(__dirname, 'public'),
    onProgress: () => undefined,
  });
  const inputProps = {spec};
  const compositions = await getCompositions(bundled, {
    inputProps,
  });
  const composition = compositions.find((item) => item.id === (spec.template_id || 'jobhub-thumbnail-16x9'));
  if (!composition) {
    throw new Error(`Missing composition: ${spec.template_id || 'jobhub-thumbnail-16x9'}`);
  }

  fs.mkdirSync(path.dirname(outputPath), {recursive: true});
  await renderStill({
    composition,
    serveUrl: bundled,
    output: outputPath,
    inputProps,
    imageFormat: 'png',
  });

  console.log(
    JSON.stringify({
      thumbnail_path: outputPath,
      duration_ms: Date.now() - startedAt,
      composition_id: composition.id,
    })
  );
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});
