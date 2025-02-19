import {normalizeLoader} from './loader-utils/normalize-loader';

let registeredLoaders = {};

export function registerLoaders(loaders) {
  loaders = Array.isArray(loaders) ? loaders : [loaders];
  for (const loader of loaders) {
    const normalizedLoader = normalizeLoader(loader);
    for (const extension of normalizedLoader.extensions) {
      registeredLoaders[extension] = normalizedLoader;
    }
  }
}

export function getRegisteredLoaders() {
  return Object.values(registeredLoaders);
}

// For testing
export function _unregisterLoaders() {
  registeredLoaders = {};
}
