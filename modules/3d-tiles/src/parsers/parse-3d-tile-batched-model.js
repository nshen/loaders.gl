// This file is derived from the Cesium code base under Apache 2 license
// See LICENSE.md and https://github.com/AnalyticalGraphicsInc/cesium/blob/master/LICENSE.md

import {GL} from '@loaders.gl/math'; // math.gl/geometry;
import Tile3DFeatureTable from '../classes/tile-3d-feature-table';
// import Tile3DBatchTable from '../classes/tile-3d-batch-table';

import {parse3DTileHeaderSync} from './helpers/parse-3d-tile-header';
import {parse3DTileTablesHeaderSync, parse3DTileTablesSync} from './helpers/parse-3d-tile-tables';
import {parse3DTileGLTFViewSync, extractGLTF, GLTF_FORMAT} from './helpers/parse-3d-tile-gltf-view';

export async function parseBatchedModel3DTile(tile, arrayBuffer, byteOffset, options) {
  return parseBatchedModel3DTileSync(tile, arrayBuffer, byteOffset, options);
}

export function parseBatchedModel3DTileSync(tile, arrayBuffer, byteOffset, options) {
  byteOffset = parse3DTileHeaderSync(tile, arrayBuffer, byteOffset, options);

  byteOffset = parse3DTileTablesHeaderSync(tile, arrayBuffer, byteOffset, options);
  byteOffset = parse3DTileTablesSync(tile, arrayBuffer, byteOffset, options);

  byteOffset = parse3DTileGLTFViewSync(tile, arrayBuffer, byteOffset, options);

  const featureTable = new Tile3DFeatureTable(tile.featureTableJson, tile.featureTableBinary);
  tile.rtcCenter = featureTable.getGlobalProperty('RTC_CENTER', GL.FLOAT, 3);

  extractGLTF(tile, GLTF_FORMAT.EMBEDDED, options);

  /* TODO - Remove. This was a shot in the dark, didn't work...
  if (tile.rtcCenter) {
    const instanceTransform = new Matrix4();
    Ellipsoid.WGS84.eastNorthUpToFixedFrame(tile.rtcCenter, instanceTransform);
    const modelMatrix = new Matrix4();
    instanceTransform.getRotationMatrix3(modelMatrix);
    tile.instances = [{modelMatrix: modelMatrix.invert()}];
  }
  */

  return byteOffset;
}
