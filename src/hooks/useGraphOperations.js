import { v4 as uuidv4 } from "uuid";

import React, { useCallback } from "react";
import {
  addToNext,
  cleanupReferences,
  collectSubtree,
  getRootsToConnect,
  getSelectedInStructure,
  removeFromNext,
  splitFloatingStructure,
  toNextArray,
} from "../utils/flowUtils";

export const useGraphOperations = ({
  nodesById,
  roots,
  onChange,
  floatingNodes,
  setFloatingNodes,
  editable,
}) => {
  const findFloatingStructure = useCallback(
    (nodeId) => {
      const index = floatingNodes.findIndex(
        (s) => s?.nodes && nodeId in s.nodes
      );
      return index >= 0 ? { structure: floatingNodes[index], index } : null;
    },
    [floatingNodes]
  );

  const handleCut = useCallback(
    (nodeIds) => {
      if (!editable || !onChange || !nodesById) return;

      const cutSet = new Set(nodeIds);

      const isInMainTree = nodeIds.some((id) => nodesById[id]);
      const isInFloating = nodeIds.some((id) =>
        floatingNodes.some((s) => s.nodes?.[id])
      );

      if (isInMainTree) {
        const updatedNodes = { ...nodesById };
        let updatedRoots = [...(roots || [])];

        nodeIds.forEach((cutId) => {
          const cutNode = updatedNodes[cutId];
          if (!cutNode) return;

          const parentId = cutNode.previous;
          const childIds = toNextArray(cutNode.next);
          const orphanIds = childIds.filter((id) => !cutSet.has(id));

          orphanIds.forEach((orphanId) => {
            const orphan = updatedNodes[orphanId];
            if (!orphan) return;

            const hasValidParent =
              parentId && updatedNodes[parentId] && !cutSet.has(parentId);

            if (hasValidParent) {
              orphan.previous = parentId;
              addToNext(updatedNodes[parentId], [orphanId]);
            } else {
              delete orphan.previous;
              if (!updatedRoots.includes(orphanId)) {
                updatedRoots.push(orphanId);
              }
            }
          });
        });

        nodeIds.forEach((id) => delete updatedNodes[id]);
        updatedRoots = updatedRoots.filter((r) => !cutSet.has(r));

        cleanupReferences(updatedNodes, nodeIds);

        onChange({ nodes: updatedNodes, roots: [...new Set(updatedRoots)] });
      }

      if (isInFloating) {
        setFloatingNodes((prev) =>
          prev
            .map((structure) => {
              const hasAffectedNodes = nodeIds.some(
                (id) => structure.nodes?.[id]
              );
              if (!hasAffectedNodes) return structure;

              const newNodes = { ...structure.nodes };
              const newRoots = [...(structure.roots || [])];

              nodeIds.forEach((id) => {
                if (newNodes[id]) {
                  const node = newNodes[id];
                  const childIds = toNextArray(node.next);
                  const orphanIds = childIds.filter((cid) => !cutSet.has(cid));

                  orphanIds.forEach((orphanId) => {
                    if (newNodes[orphanId]) {
                      const parent = node.previous;
                      if (parent && newNodes[parent] && !cutSet.has(parent)) {
                        newNodes[orphanId].previous = parent;
                        addToNext(newNodes[parent], [orphanId]);
                      } else {
                        delete newNodes[orphanId].previous;
                        if (!newRoots.includes(orphanId)) {
                          newRoots.push(orphanId);
                        }
                      }
                    }
                  });

                  delete newNodes[id];
                }
              });

              const filteredRoots = newRoots.filter(
                (r) => !cutSet.has(r) && newNodes[r]
              );

              cleanupReferences(newNodes, nodeIds);

              if (Object.keys(newNodes).length === 0) return null;

              return {
                ...structure,
                nodes: newNodes,
                roots: [...new Set(filteredRoots)],
              };
            })
            .filter(Boolean)
        );
      }
    },
    [editable, onChange, nodesById, roots, floatingNodes, setFloatingNodes]
  );

  const handlePaste = useCallback(
    (structure) => {
      if (!editable || !structure?.nodes || !structure?.roots?.length) return;

      const mainNodeIds = new Set(Object.keys(nodesById || {}));

      const validNodes = {};
      const validNodeIds = Object.keys(structure.nodes).filter(
        (id) => !mainNodeIds.has(id)
      );

      if (validNodeIds.length === 0) return;

      validNodeIds.forEach((id) => {
        validNodes[id] = structure.nodes[id];
      });

      const internalChildIds = new Set();

      validNodeIds.forEach((id) => {
        const node = validNodes[id];

        const nextIds = toNextArray(node.next || node.raw?.next);
        nextIds.forEach((childId) => internalChildIds.add(childId));
      });

      const validRoots = structure.roots.filter(
        (id) => validNodes[id] && !internalChildIds.has(id)
      );

      if (validRoots.length === 0) return;

      const newPasteItem = {
        ...structure,
        nodes: validNodes,
        roots: [...new Set(validRoots)],
        _pasteId: uuidv4(),
      };

      setFloatingNodes((prev) => {
        const existingFloatingIds = new Set(
          prev.flatMap((item) => Object.keys(item.nodes))
        );

        const hasOverlap = validNodeIds.some((id) =>
          existingFloatingIds.has(id)
        );

        if (hasOverlap) {
          console.log("Paste blocked: Nodes already exist in floating layer.");
          return prev;
        }

        return [...prev, newPasteItem];
      });
    },
    [editable, nodesById, setFloatingNodes]
  );

  const handleConnect = useCallback(
    (targetNodeId, selectedIds) => {
      if (!editable || !onChange || !selectedIds?.length) return;

      const targetInTree = nodesById?.[targetNodeId];
      const targetFloating = findFloatingStructure(targetNodeId);
      const sourceInTree = selectedIds.some((id) => nodesById?.[id]);
      const sourceFloating = selectedIds
        .map((id) => findFloatingStructure(id))
        .find(Boolean);

      if (sourceFloating && targetInTree) {
        const { structure, index } = sourceFloating;
        const selectedInStructure = getSelectedInStructure(
          structure,
          selectedIds
        );
        if (!selectedInStructure.length) return;

        const rootsToConnect = getRootsToConnect(
          structure,
          selectedInStructure
        );
        const connectedNodeIds = collectSubtree(
          structure,
          rootsToConnect,
          selectedInStructure
        );

        const updatedNodes = { ...nodesById };

        connectedNodeIds.forEach((id) => {
          updatedNodes[id] = { ...structure.nodes[id] };
        });

        rootsToConnect.forEach((rootId) => {
          updatedNodes[rootId].previous = targetNodeId;
        });

        addToNext(updatedNodes[targetNodeId], rootsToConnect);

        onChange({ nodes: updatedNodes, roots });

        setFloatingNodes((prev) => {
          if (connectedNodeIds.size === Object.keys(structure.nodes).length) {
            return prev.filter((_, i) => i !== index);
          }

          const updated = [...prev];
          updated[index] = splitFloatingStructure(structure, connectedNodeIds);
          return updated.filter((s) => Object.keys(s.nodes).length > 0);
        });
        return;
      }

      if (sourceInTree && targetFloating) {
        const { structure, index } = targetFloating;
        const updatedNodes = { ...nodesById };
        let updatedRoots = [...(roots || [])];

        selectedIds.forEach((id) => {
          const node = updatedNodes[id];
          if (!node) return;

          if (node.previous) {
            removeFromNext(updatedNodes[node.previous], [id]);
          }

          updatedRoots = updatedRoots.filter((r) => r !== id);
          delete updatedNodes[id];
        });

        onChange({ nodes: updatedNodes, roots: updatedRoots });

        setFloatingNodes((prev) => {
          const updated = [...prev];
          const newStructure = {
            ...structure,
            nodes: { ...structure.nodes },
          };

          selectedIds.forEach((id) => {
            if (nodesById[id]) {
              newStructure.nodes[id] = {
                ...nodesById[id],
                previous: targetNodeId,
                next: undefined,
              };
            }
          });

          addToNext(newStructure.nodes[targetNodeId], selectedIds);
          updated[index] = newStructure;
          return updated;
        });
        return;
      }

      if (sourceFloating && targetFloating) {
        const { structure: sourceStruct, index: sourceIndex } = sourceFloating;
        const { index: targetIndex } = targetFloating;
        if (sourceIndex === targetIndex) return;

        const selectedInStructure = getSelectedInStructure(
          sourceStruct,
          selectedIds
        );
        if (!selectedInStructure.length) return;

        const rootsToConnect = getRootsToConnect(
          sourceStruct,
          selectedInStructure
        );
        const connectedNodeIds = collectSubtree(
          sourceStruct,
          rootsToConnect,
          selectedInStructure
        );

        setFloatingNodes((prev) => {
          const updated = prev.filter((_, i) => i !== sourceIndex);
          const adjustedIndex =
            targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;

          const targetStruct = updated[adjustedIndex];
          const merged = {
            ...targetStruct,
            nodes: { ...targetStruct.nodes },
          };

          connectedNodeIds.forEach((id) => {
            merged.nodes[id] = { ...sourceStruct.nodes[id] };
          });

          rootsToConnect.forEach((rootId) => {
            merged.nodes[rootId].previous = targetNodeId;
          });

          addToNext(merged.nodes[targetNodeId], rootsToConnect);
          updated[adjustedIndex] = merged;

          if (connectedNodeIds.size < Object.keys(sourceStruct.nodes).length) {
            updated.push(
              splitFloatingStructure(sourceStruct, connectedNodeIds)
            );
          }

          return updated.filter((s) => Object.keys(s.nodes).length > 0);
        });
      }
    },
    [
      editable,
      onChange,
      nodesById,
      roots,
      findFloatingStructure,
      setFloatingNodes,
    ]
  );

  return { handleCut, handlePaste, handleConnect };
};
