import {PlatformImageLoader} from '../image-utils/image-loader';

/*
 * Loads images asynchronously
 * image.crossOrigin can be set via opts.crossOrigin, default to 'anonymous'
 * returns a promise tracking the load
 */
export function loadImage(url, options) {
  return PlatformImageLoader.readAndParseImage(url, options);
}
