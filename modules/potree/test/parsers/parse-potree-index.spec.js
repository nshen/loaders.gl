import test from 'tape-promise/tape';
import {parse} from '@loaders.gl/core';
import {PotreeHierarchyChunkLoader} from '@loaders.gl/potree';

const POTREE_HIERARCHY_CHUNK_URL = '@loaders.gl/potree/test/data/lion_takanawa/data/r/r.hrc';

test('potree#hieararchy chunk#parse', async t => {
  const hierarchyChunk = await parse(POTREE_HIERARCHY_CHUNK_URL, PotreeHierarchyChunkLoader);
  t.ok(hierarchyChunk);
  t.end();
});
