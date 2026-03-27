const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the entire monorepo so Metro can resolve workspace packages
config.watchFolders = [monorepoRoot];

// Resolve modules from the app first, then the monorepo root
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Force ALL react / react-dom requires (including those from inside
// node_modules/react-native) to the app-local react@19.1.0.
// Without this, react-native's internal require('react') falls back to the
// monorepo-root react@19.2.4 (hoisted by apps/web), which mismatches
// react-native-renderer@19.1.0 and throws the incompatible-versions error.
const localNodeModules = path.resolve(projectRoot, 'node_modules');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react' || moduleName.startsWith('react/')) {
    try {
      const filePath = require.resolve(moduleName, { paths: [localNodeModules] });
      return { filePath, type: 'sourceFile' };
    } catch {
      // fall through to default resolution
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
