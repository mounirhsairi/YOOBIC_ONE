import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Greeting Banner */}
      <View style={styles.banner}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>Alex Frontline 👋</Text>
        <Text style={styles.locationTag}>Store: Downtown Supermarket #12 • Morning Shift</Text>
      </View>

      {/* Sync Badge */}
      <View style={styles.syncBanner}>
        <Text style={styles.syncIcon}>🟢</Text>
        <Text style={styles.syncText}>Offline Engine Ready: All checklists cached locally</Text>
      </View>

      {/* Quick Metrics */}
      <View style={styles.metricsRow}>
        <View style={[styles.metricCard, { borderLeftColor: '#2563EB' }]}>
          <Text style={styles.metricNumber}>3</Text>
          <Text style={styles.metricLabel}>Tasks Today</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: '#F59E0B' }]}>
          <Text style={styles.metricNumber}>1</Text>
          <Text style={styles.metricLabel}>Pending Approval</Text>
        </View>
        <View style={[styles.metricCard, { borderLeftColor: '#10B981' }]}>
          <Text style={styles.metricNumber}>95%</Text>
          <Text style={styles.metricLabel}>Store Score</Text>
        </View>
      </View>

      {/* Urgent Operations Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>High Priority Actions</Text>
      </View>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push('/tasks')}
      >
        <View style={styles.actionCardHeader}>
          <Text style={styles.priorityBadge}>HIGH PRIORITY</Text>
          <Text style={styles.durationBadge}>Est: 15 min</Text>
        </View>
        <Text style={styles.cardTitle}>Daily Morning Food Safety & Fridge Check</Text>
        <Text style={styles.cardSubtitle}>
          Complete temperature verification checklist and attach photographic proof of produce display.
        </Text>
        <View style={styles.actionCardFooter}>
          <Text style={styles.actionButtonText}>Start Checklist →</Text>
        </View>
      </TouchableOpacity>

      {/* Mandatory Training Card */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Assigned Learning</Text>
      </View>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => router.push('/learning')}
      >
        <View style={styles.actionCardHeader}>
          <Text style={[styles.priorityBadge, { backgroundColor: '#E0E7FF', color: '#4338CA' }]}>
            COURSE MANDATORY
          </Text>
          <Text style={styles.durationBadge}>Due Tomorrow</Text>
        </View>
        <Text style={styles.cardTitle}>Frontline Hygiene & Hazard Prevention 2026</Text>
        <Text style={styles.cardSubtitle}>3 of 4 interactive modules completed (85%).</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  banner: {
    backgroundColor: '#1E3A8A',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
  },
  welcomeText: {
    color: '#93C5FD',
    fontSize: 14,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 2,
  },
  locationTag: {
    color: '#E0E7FF',
    fontSize: 12,
    marginTop: 8,
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  syncIcon: {
    fontSize: 10,
    marginRight: 6,
  },
  syncText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '500',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  metricNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  actionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationBadge: {
    fontSize: 11,
    color: '#64748B',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  actionCardFooter: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  actionButtonText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
