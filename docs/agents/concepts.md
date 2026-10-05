# Coordinate spaces and direction

`ImagePoint` and `ImageBox` use unsigned pixel coordinates. `NormImagePoint` and `NormImageBox` use Float values conventionally relative to a frame; constructors do not enforce the 0..1 range. Box corners are boundaries: x = width and y = height are accepted boundaries, not valid pixel array indices.

An `ImageSpace` describes width and height plus its relationship to an immediate parent. For each axis:

- Parent to child: `(coordinate - childOffset) * childScale`, then truncate and clamp to the child's extent.
- Child to parent: `coordinate / childScale + childOffset`, validate the result within the parent's extent, then truncate.

The child's scale and offset drive each step. The parent's own scale and offset are not applied in that step. Parent-to-child rejects input beyond the parent extent, even though output is clipped. Child-to-parent validates the computed parent result; it does not separately validate the input against the child dimensions.

## Building spaces

`scale(f)` or `scale(x, y)` computes new dimensions with Float multiplication and UInt conversion. It replaces scale metadata, retaining the receiver's offsets. `crop` clamps requested offsets to source dimensions and sizes to remaining extents; it resets scale to 1 and stores local offsets, without accumulating previous offsets. `cropAtCenter` clamps dimensions and uses integer division for the center offset.

These helpers do not compose an entire transform automatically. Keep each immediate relationship in a chain. In particular, scaling an already-offset space retains its offset: do not accidentally apply that offset twice. For separate crop then scale steps, build the scale node from a zero-offset `ImageSpace(crop.width, crop.height)`.

## Chains

`source.chain(child)` defaults to Child. An appended node's `relationship` says how to move from the previous node to this node. For the reverse traversal, start at the child and append the parent with `SpaceRelationship.Parent`. The first node's relationship is ignored.

`translate` requires at least one node. A singleton returns the original point (boxes are rebuilt from corners). Each step truncates and may clip, so a round trip is not generally reversible. `toParentSpace(chain)` and `toChildSpace(chain)` both follow the chain's explicit directions; their names do not override them.

A plain list converted with `toImageSpaceChain()` uses Child for every node. The point `toParentSpace(List<ImageSpace>)` overload instead reverses a root-to-leaf list. Its empty-list case returns the original point, whereas the child-list overload throws through empty-chain validation.

Chains delegate to the provided list. Do not mutate a retained backing list; pass a snapshot with `toList()` when ownership is shared. Stability annotations do not add validation or deep immutability.
