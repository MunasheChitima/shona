import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationProps } from '../types';

export default function PronunciationScreen({ navigation }: NavigationProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pronunciation Practice</Text>
      <Text style={styles.subtitle}>Voice exercises will be displayed here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});