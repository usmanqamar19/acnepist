import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface Props {
  children: React.ReactNode;
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
    // Suppress update-related errors completely
    const errorMessage = error?.message || '';
    if (errorMessage.includes('Failed to download remote update') || 
        errorMessage.includes('java.io.IOException') ||
        errorMessage.includes('expo-updates') ||
        errorMessage.includes('remote update')) {
      // Don't show error UI for update errors
      return { hasError: false, error: null };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Suppress update-related errors - they're not critical
      const errorMessage = this.state.error?.message || '';
      if (errorMessage.includes('Failed to download remote update') || 
          errorMessage.includes('java.io.IOException') ||
          errorMessage.includes('expo-updates')) {
        // Silently recover from update errors
        console.log('Update error suppressed, continuing with app');
        return this.props.children;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.message}>
            {errorMessage || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FAF8F3',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#7A9370',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#9CAF88',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
  },
});

