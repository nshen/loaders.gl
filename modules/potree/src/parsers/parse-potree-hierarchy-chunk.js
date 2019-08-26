// This file is derived from the Cesium code base under BSD 2-clause license
// See LICENSE.md and https://github.com/potree/potree/blob/develop/LICENSE

// Potree Hierarchy Chunk file format
// https://github.com/potree/potree/blob/develop/docs/potree-file-format.md#index-files

/*
### Hierarchy Chunk Files

As mentioned in the former section, the `.hrc` files contain the index structure
meaning a list of all the files stored within the directory tree.

An index file contains a list of tuple values with the first being a `uint8`
"mask" and the second being `uint32` "number of points" of a hierarchy level
in a [breadth first level order][breadth-first].

Per hierarchy level we have 8 possible nodes. To indicate whether a node exists
a simple binary mask is used:

| Position | Mask | [Binary][bin] |
|----------|------|---------------|
| 0        | 1    | 0b00000001    |
| 1        | 2    | 0b00000010    |
| 2        | 4    | 0b00000100    |
| 3        | 8    | 0b00001000    |
| 4        | 16   | 0b00010000    |
| 5        | 32   | 0b00100000    |
| 6        | 64   | 0b01000000    |
| 7        | 128  | 0b10000000    |

So if in a hierarchy the child node 3 and node 7 exist then the hierarchies
mask has to be `0b00001000 | 0b10000000` → `0b10001000` (=136).

_Example:_ A simple, non-realistic tree:

```
|- r1
|  |
|  \- r14 (2 Points)
|
\- r3
   |
   \- r36 (1 Point)
```

Would have an index looking like this:

| name | mask               | points |
|------|--------------------|--------|
| r    | `0b00001010` (=10) | `3`    |
| r1   | `0b00010000` (=16) | `2`    |
| r3   | `0b01000000` (=64) | `1`    |
| r14  | `0b00000000` (=0)  | `2`    |
| r36  | `0b00000000` (=0)  | `1`    |
*/

// load hierarchy
export default function parsePotreeIndex(index, arrayBuffer) {
  const dataView = new DataView(arrayBuffer);

  const stack = [];

  // Get root mask
  const children = dataView.getUint8(0);
  const numPoints = dataView.getUint32(1, true);
  stack.push({children, numPoints});

  const decoded = [];

  let offset = 5;
  while (stack.length > 0) {
    const snode = stack.shift();
    let mask = 1;
    for (let i = 0; i < 8; i++) {
      if ((snode.children & mask) !== 0) {
        const childChildren = dataView.getUint8(offset);
        const childNumPoints = dataView.getUint32(offset + 1, true);

        const childName = snode.name + i;

        stack.push({children: childChildren, numPoints: childNumPoints, name: childName});
        decoded.push({children: childChildren, numPoints: childNumPoints, name: childName});

        offset += 5;
      }

      mask = mask * 2;
    }

    if (offset === dataView.byteLength) {
      break;
    }
  }

  // console.log(decoded);
  return decoded;
}

// TODO - raw code from potree repo, not yet ported
export function notYetPorted(node = {}, decoded) {
  // TODO - hack
  const nodes = {};
  nodes[node.name] = node;
  const pco = node.pcoGeometry;

  for (let i = 0; i < decoded.length; i++) {
    const name = decoded[i].name;
    const decodedNumPoints = decoded[i].numPoints;
    // const index = 0; //  parseInt(name.charAt(name.length - 1));
    const parentName = name.substring(0, name.length - 1);
    const parentNode = nodes[parentName];
    const level = name.length - 1;
    // const boundingBox = {}; // Utils.createChildAABB(parentNode.boundingBox, index);

    const currentNode = {}; // new PointCloudOctreeGeometryNode(name, pco, boundingBox);
    currentNode.level = level;
    currentNode.numPoints = decodedNumPoints;
    currentNode.hasChildren = decoded[i].children > 0;
    currentNode.spacing = pco.spacing / Math.pow(2, level);
    parentNode.addChild(currentNode);
    nodes[name] = currentNode;
  }
}
