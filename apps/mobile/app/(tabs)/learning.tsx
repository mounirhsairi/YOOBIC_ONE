import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

export default function LearningScreen() {
  const courses = [
    {
      id: 'c1',
      title: 'Frontline Food Safety & Cooler Temperature Controls',
      modulesCount: 4,
      completedModules: 3,
      duration: '20 min',
      isMandatory: true,
      progress: 75,
    },
    {
      id: 'c2',
      title: 'Customer Service & De-escalation Techniques',
      modulesCount: 5,
      completedModules: 5,
      duration: '35 min',
      isMandatory: false,
      progress: 100,
    },
    {
      id: 'c3',
      title: 'Emergency Evacuation & OSHA Fire Protocols',
      modulesCount: 3,
      completedModules: 0,
      duration: '15 min',
      isMandatory: true,
      progress: 0,
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.courseCard}>
            <View style={styles.topRow}>
              {item.isMandatory && <Text style={styles.mandatoryBadge}>MANDATORY</Text>}
              <Text style={styles.durationText}>{item.duration}</Text>
            </View>
            <Text style={styles.courseTitle}>{item.title}</Text>
            <Text style={styles.modulesText}>
              {item.completedModules} of {item.modulesCount} modules completed ({item.progress}%)
            </Text>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${item.progress}%` }]} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  courseCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  mandatoryBadge: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  modulesText: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 8,
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563EB',
  },
});
