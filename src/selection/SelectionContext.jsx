import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

const SelectionContext = createContext(null);

const DEFAULT_CONTEXT = {
  selectedIds: new Set(),
  selectNode: () => {},
  deselectNode: () => {},
  toggleSelection: () => {},
  clearSelection: () => {},
  selectMultiple: () => {},
  addToSelection: () => {},
  isSelected: () => false,
  registerNodeHandlers: () => () => {},
  moveSelectedNodes: () => {},
  cutSelectedNodes: () => {},
  pasteNodes: () => {},
  hasClipboard: false,
};

const filterNextToSelection = (next, selectedSet) => {
  if (!next) return undefined;

  if (Array.isArray(next)) {
    const filtered = next.filter((id) => selectedSet.has(id));
    return filtered.length > 0 ? filtered : undefined;
  }

  return selectedSet.has(next) ? next : undefined;
};

const buildClipboardNode = (id, node, selectedSet) => {
  const filteredNext = filterNextToSelection(node.next, selectedSet);
  const hasPreviousInSelection =
    node.previous && selectedSet.has(node.previous);

  return {
    ...node,
    id,
    _originalId: id,
    next: filteredNext,
    previous: hasPreviousInSelection ? node.previous : undefined,
  };
};

const buildPasteStructure = (clipboardNodes, position) => {
  if (!clipboardNodes?.length) return null;

  const seenIds = new Set();
  const nodes = {};

  clipboardNodes.forEach((clipNode) => {
    const nodeId = clipNode._originalId || clipNode.id;
    if (!nodeId || seenIds.has(nodeId)) return;

    seenIds.add(nodeId);

    nodes[nodeId] = {
      id: nodeId,
      label: clipNode.label,
      next: clipNode.next,
      previous: clipNode.previous,
    };

    Object.keys(clipNode).forEach((key) => {
      if (!["_originalId", "id", "next", "previous", "label"].includes(key)) {
        nodes[nodeId][key] = clipNode[key];
      }
    });
  });

  const rootIds = Object.keys(nodes).filter((id) => !nodes[id].previous);
  const uniqueRoots = [...new Set(rootIds)];
  const finalRoots =
    uniqueRoots.length > 0 ? uniqueRoots : [Object.keys(nodes)[0]];

  return {
    nodes,
    roots: finalRoots,
    _pastePosition: position,
  };
};

export const SelectionProvider = ({ children }) => {
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [clipboard, setClipboard] = useState([]);
  const nodeHandlersRef = useRef(new Map());
  const isPastingRef = useRef(false);

  const selectNode = useCallback((id, addToSelection = false) => {
    setSelectedIds((prev) => {
      const next = new Set(addToSelection ? prev : []);
      next.add(id);
      return next;
    });
  }, []);

  const deselectNode = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleSelection = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => setSelectedIds(new Set()), []);

  const selectMultiple = useCallback((ids) => setSelectedIds(new Set(ids)), []);

  const addToSelection = useCallback(
    (ids) => setSelectedIds((prev) => new Set([...prev, ...ids])),
    []
  );

  const isSelected = useCallback((id) => selectedIds.has(id), [selectedIds]);

  const registerNodeHandlers = useCallback((id, handlers) => {
    nodeHandlersRef.current.set(id, handlers);
    return () => nodeHandlersRef.current.delete(id);
  }, []);

  const moveSelectedNodes = useCallback(
    (deltaX, deltaY, excludeId = null) => {
      selectedIds.forEach((id) => {
        if (id === excludeId) return;

        const handlers = nodeHandlersRef.current.get(id);
        if (!handlers) return;

        handlers.setOffset?.((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        handlers.onDrag?.();
      });
    },
    [selectedIds]
  );

  const cutSelectedNodes = useCallback(
    (nodesById, onCut) => {
      if (!nodesById || selectedIds.size === 0) return;

      const selectedSet = new Set(selectedIds);
      const seenIds = new Set();
      const cutNodes = [];

      [...selectedIds].forEach((id) => {
        if (!nodesById[id] || seenIds.has(id)) return;
        seenIds.add(id);
        cutNodes.push(buildClipboardNode(id, nodesById[id], selectedSet));
      });

      setClipboard(cutNodes);
      onCut?.([...selectedIds]);
      setSelectedIds(new Set());
    },
    [selectedIds]
  );

  const pasteNodes = useCallback(
    (callback, x = 0, y = 0) => {
      if (!clipboard.length || !callback || isPastingRef.current) return;

      isPastingRef.current = true;
      const nodesToPaste = [...clipboard];

      const pasteData = buildPasteStructure(nodesToPaste, { x, y });
      if (!pasteData) {
        isPastingRef.current = false;
        return;
      }

      let result;
      try {
        result = callback(pasteData, { x, y });
      } catch (error) {
        isPastingRef.current = false;
        throw error;
      }

      if (result && typeof result.then === "function") {
        return result
          .then(() => {
            setClipboard([]);
          })
          .finally(() => {
            isPastingRef.current = false;
          });
      }

      setClipboard([]);
      isPastingRef.current = false;
      return result;
    },
    [clipboard]
  );

  const hasClipboard = clipboard.length > 0;

  const contextValue = useMemo(
    () => ({
      selectedIds,
      selectNode,
      deselectNode,
      toggleSelection,
      clearSelection,
      selectMultiple,
      addToSelection,
      isSelected,
      registerNodeHandlers,
      moveSelectedNodes,
      cutSelectedNodes,
      pasteNodes,
      hasClipboard,
    }),
    [
      selectedIds,
      selectNode,
      deselectNode,
      toggleSelection,
      clearSelection,
      selectMultiple,
      addToSelection,
      isSelected,
      registerNodeHandlers,
      moveSelectedNodes,
      cutSelectedNodes,
      pasteNodes,
      hasClipboard,
    ]
  );

  return (
    <SelectionContext.Provider value={contextValue}>
      {children}
    </SelectionContext.Provider>
  );
};

export const useSelection = () =>
  useContext(SelectionContext) || DEFAULT_CONTEXT;

export default SelectionContext;
