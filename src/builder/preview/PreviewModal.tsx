import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import { AppDefinition } from '../../schema/types';
import { MetaAppRuntime } from '../../runtime/MetaAppRuntime';

interface PreviewModalProps {
  appDefinition: AppDefinition;
  onClose: () => void;
}

export function PreviewModal({ appDefinition, onClose }: PreviewModalProps) {
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>Exit Preview</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{appDefinition.app.displayName}</Text>
        <View style={styles.placeholder} />
      </SafeAreaView>
      <View style={styles.runtime}>
        <MetaAppRuntime appDefinition={appDefinition} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    backgroundColor: '#1E293B', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8,
  },
  closeButton: { paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#334155', borderRadius: 8 },
  closeText: { color: '#F8FAFC', fontSize: 14, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '600', color: '#F8FAFC' },
  placeholder: { width: 80 },
  runtime: { flex: 1, backgroundColor: '#F8FAFC' },
});
