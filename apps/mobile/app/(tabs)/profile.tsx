import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Alert } from 'react-native';

export default function ProfileScreen() {
  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);

  const handleManualSync = () => {
    Alert.alert('Offline Synchronization', 'Local queue synced. All operations are up-to-date with server.');
  };

  return (
    <View style={styles.container}>
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>AF</Text>
        </View>
        <Text style={styles.userName}>Alex Frontline</Text>
        <Text style={styles.roleText}>Frontline Associate • Store #12</Text>
        <Text style={styles.tenantText}>Global Supermarket Corp</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline & Storage Settings</Text>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingLabel}>Offline-First Mode</Text>
            <Text style={styles.settingSub}>Cache tasks & checklists locally in SQLite</Text>
          </View>
          <Switch
            value={offlineSyncEnabled}
            onValueChange={setOfflineSyncEnabled}
            thumbColor={offlineSyncEnabled ? '#2563EB' : '#94A3B8'}
          />
        </View>

        <TouchableOpacity style={styles.syncBtn} onPress={handleManualSync}>
          <Text style={styles.syncBtnText}>🔄 Trigger Manual Cloud Sync Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Application Information</Text>
        <Text style={styles.infoText}>YOOBIC ONE Enterprise Client v1.0.0</Text>
        <Text style={styles.infoText}>Architecture: Modular SaaS Multi-Tenant</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  roleText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  tenantText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 12,
    color: '#64748B',
  },
  syncBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  syncBtnText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
});
