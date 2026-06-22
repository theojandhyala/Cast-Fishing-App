const { getDefaultConfig } = require('expo/metro-config');
const { withNativewind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Metro's package-exports resolution picks zustand's ESM build (esm/*.mjs),
// which uses bare `import.meta.env` for devtools tree-shaking. That's only
// valid inside an ES module, but Expo's web export emits a classic
// (non-module) <script>, so `import.meta` is a hard SyntaxError that kills
// the whole bundle before anything renders. Redirect to zustand's CJS
// build, which uses `process.env.NODE_ENV` instead.
const { resolveRequest: defaultResolveRequest } = config.resolver;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const resolve = defaultResolveRequest ?? context.resolveRequest;
  const resolved = resolve(context, moduleName, platform);

  if (resolved.type === 'sourceFile' && /[/\\]zustand[/\\]esm[/\\].+\.mjs$/.test(resolved.filePath)) {
    return {
      ...resolved,
      filePath: resolved.filePath.replace(/[/\\]esm[/\\](.+)\.mjs$/, '/$1.js'),
    };
  }

  return resolved;
};

module.exports = withNativewind(config);
