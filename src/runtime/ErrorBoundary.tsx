import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {this.props.fallbackMessage ?? 'An error occurred while rendering this component.'}
          </Text>
          {this.state.error && (
            <Text style={styles.errorDetail} numberOfLines={3}>
              {this.state.error.message}
            </Text>
          )}
          <TouchableOpacity onPress={this.handleReset} style={styles.retryBtn}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 32, backgroundColor: '#FEF2F2',
  },
  title: { fontSize: 18, fontWeight: '600', color: '#991B1B', marginBottom: 8 },
  message: { fontSize: 14, color: '#7F1D1D', textAlign: 'center', marginBottom: 12 },
  errorDetail: { fontSize: 12, color: '#B91C1C', backgroundColor: '#FEE2E2', padding: 12, borderRadius: 8, width: '100%', marginBottom: 16 },
  retryBtn: { backgroundColor: '#EF4444', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15 },
});
