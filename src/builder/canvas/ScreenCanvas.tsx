import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ComponentNode } from '../../schema/types';
import { ComponentRegistry } from '../../runtime/registry/ComponentRegistry';

interface ScreenCanvasProps {
  rootComponent: ComponentNode;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScreenCanvas({ rootComponent, selectedId, onSelect, onMoveUp, onMoveDown, onDelete }: ScreenCanvasProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ComponentTreeNode
        node={rootComponent}
        depth={0}
        selectedId={selectedId}
        onSelect={onSelect}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onDelete={onDelete}
        isRoot
      />
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

interface ComponentTreeNodeProps {
  node: ComponentNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  onDelete: (id: string) => void;
  isRoot?: boolean;
}

function ComponentTreeNode({ node, depth, selectedId, onSelect, onMoveUp, onMoveDown, onDelete, isRoot }: ComponentTreeNodeProps) {
  const isSelected = node.id === selectedId;
  const registration = ComponentRegistry.get(node.type);
  const displayName = registration?.displayName ?? node.type;
  const hasChildren = registration?.acceptsChildren && node.children;

  const propSummary = getPropsummary(node);

  return (
    <View style={styles.nodeContainer}>
      <TouchableOpacity
        style={[
          styles.nodeRow,
          { marginLeft: depth * 16 },
          isSelected && styles.nodeRowSelected,
        ]}
        onPress={() => onSelect(node.id)}
        activeOpacity={0.7}
      >
        <View style={styles.nodeInfo}>
          <View style={[styles.typeBadge, isSelected && styles.typeBadgeSelected]}>
            <Text style={[styles.typeText, isSelected && styles.typeTextSelected]}>{displayName}</Text>
          </View>
          {propSummary ? (
            <Text style={styles.propSummary} numberOfLines={1}>{propSummary}</Text>
          ) : null}
        </View>
        {isSelected && !isRoot && (
          <View style={styles.nodeActions}>
            <TouchableOpacity onPress={() => onMoveUp(node.id)} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>↑</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onMoveDown(node.id)} style={styles.actionBtn}>
              <Text style={styles.actionBtnText}>↓</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(node.id)} style={[styles.actionBtn, styles.deleteBtn]}>
              <Text style={[styles.actionBtnText, styles.deleteBtnText]}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
      {hasChildren && node.children && node.children.length > 0 && (
        <View style={styles.childrenContainer}>
          {node.children.map((child) => (
            <ComponentTreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
              onDelete={onDelete}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function getPropsummary(node: ComponentNode): string {
  const props = node.props;
  if (props.text && typeof props.text === 'string') return `"${props.text}"`;
  if (props.title && typeof props.title === 'string') return `"${props.title}"`;
  if (props.placeholder && typeof props.placeholder === 'string') return props.placeholder;
  if (props.label && typeof props.label === 'string') return props.label;
  if (props.source && typeof props.source === 'string') return props.source.slice(0, 30);
  if (node.type === 'view' && node.style?.layout?.flexDirection === 'row') return 'row';
  return '';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  nodeContainer: {
    marginBottom: 2,
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  nodeRowSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#6366F1',
  },
  nodeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeSelected: {
    backgroundColor: '#6366F1',
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  typeTextSelected: {
    color: '#FFFFFF',
  },
  propSummary: {
    fontSize: 12,
    color: '#94A3B8',
    flex: 1,
  },
  nodeActions: {
    flexDirection: 'row',
    gap: 4,
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#FEE2E2',
  },
  deleteBtnText: {
    color: '#EF4444',
  },
  childrenContainer: {
    marginLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#E2E8F0',
    paddingLeft: 4,
  },
});
