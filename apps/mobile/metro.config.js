// Learn more https://docs.expo.dev/guides/monorepos/
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Next.js apps in this monorepo write build artifacts (.next) that are
// created/deleted while their dev server compiles. Metro's watcher crawls
// the whole workspace root and crashes (ENOENT) if it catches one of those
// directories mid-delete, so keep it out of sibling apps entirely.
const existingBlockList = config.resolver.blockList
  ? [].concat(config.resolver.blockList)
  : [];

config.resolver.blockList = [
  ...existingBlockList,
  /apps\/(admin|salon|marketplace)\/\.next\/.*/,
  /apps\/(admin|salon|marketplace)\/node_modules\/.*/,
];

module.exports = withNativeWind(config, { input: './src/global.css' });
