import {default as parsePotreeHirearchyChunk} from './parsers/parse-potree-index';

function parseSync(arrayBuffer, options, url, loader) {
  const index = {};
  const byteOffset = 0;
  parsePotreeHirearchyChunk(arrayBuffer, byteOffset, options, index);
  return index;
}

export default {
  name: 'potree Hierarchy Chunk',
  extensions: ['hrc'],
  mimeType: 'application/octet-stream',
  // Unfortunately binary potree files have no header bytes, no test possible
  // test: ['...'],
  parseSync,
  binary: true
};
