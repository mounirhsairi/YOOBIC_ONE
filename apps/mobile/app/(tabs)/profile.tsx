import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { offlineSyncEngine, QueueItem } from '../../src/services/offlineSync';
import { mobileApiClient } from '../../src/services/api';

export default function ProfileScreen() {
  const { user, orgId, currentOrg, organizations, logout, switchOrganization } = useAuth();

  const [offlineSyncEnabled, setOfflineSyncEnabled] = useState(true);
  const [pendingOps, setPendingOps] = useState<QueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const checkPendingQueue = async () => {
    try {
      const ops = await offlineSyncEngine.getPendingOperations();
      setPendingOps(ops);
    } catch {}
  };

  useEffect(() => {
    checkPendingQueue();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await offlineSyncEngine.syncPendingQueue(mobileApiClient);
      await checkPendingQueue();
      Alert.alert(
        'Synchronisation Terminée',
        `${res.synced} opération(s) synchronisée(s) avec succès. ${res.failed > 0 ? `(${res.failed} échec(s))` : 'Tout est à jour.'}`
      );
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Échec de synchronisation');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearCache = async () => {
    if (!orgId) return;
    Alert.alert(
      'Vider le cache hors-ligne',
      'Voulez-vous supprimer toutes les tâches et files d\'attente enregistrées localement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            await offlineSyncEngine.clearOrganizationData(orgId);
            await checkPendingQueue();
            Alert.alert('Succès', 'Le cache local a été nettoyé.');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déconnexion',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const userInitials =
    (user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || '');
  const userFullName =
    user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'Utilisateur';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userInitials}</Text>
          </View>
          <Text style={styles.userName}>{userFullName}</Text>
          <Text style={styles.roleText}>{user?.email}</Text>
          <Text style={styles.tenantText}>🏢 {currentOrg?.name || 'Organisation Active'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{user?.role || 'MEMBRE'}</Text>
          </View>
        </View>

        {/* Multi-Tenant Switcher */}
        {organizations && organizations.length > 1 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Changer d'Entreprise</Text>
            {organizations.map((org) => (
              <TouchableOpacity
                key={org.id}
                style={[
                  styles.orgItem,
                  org.id === orgId && styles.orgItemActive,
                ]}
                onPress={() => switchOrganization(org.id)}
              >
                <Text
                  style={[
                    styles.orgName,
                    org.id === orgId && styles.orgNameActive,
                  ]}
                >
                  {org.name}
                </Text>
                {org.id === orgId && <Text style={styles.activeCheck}>✓ Actif</Text>}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Offline & Storage Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode Hors-Ligne & Données SQLite</Text>
          <View style={styles.settingRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Persistance Locale</Text>
              <Text style={styles.settingSub}>Mettre en cache les missions & preuves hors connexion</Text>
            </View>
            <Switch
              value={offlineSyncEnabled}
              onValueChange={setOfflineSyncEnabled}
              thumbColor={offlineSyncEnabled ? '#2563EB' : '#94A3B8'}
            />
          </View>

          <View style={styles.queueStatusRow}>
            <Text style={styles.queueStatusLabel}>File d'attente d'actions en attente :</Text>
            <Text style={styles.queueStatusVal}>{pendingOps.length} opération(s)</Text>
          </View>

          <TouchableOpacity
            style={[styles.syncBtn, isSyncing && { opacity: 0.7 }]}
            onPress={handleManualSync}
            disabled={isSyncing}
          >
            {isSyncing ? (
              <ActivityIndicator color="#2563EB" />
            ) : (
              <Text style={styles.syncBtnText}>🔄 Déclencher la synchronisation cloud maintenant</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.clearCacheBtn} onPress={handleClearCache}>
            <Text style={styles.clearCacheText}>🗑️ Vider le cache local SQLite</Text>
          </TouchableOpacity>
        </View>

        {/* Application Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations Système</Text>
          <Text style={styles.infoText}>Plateforme : YOOBIC ONE Mobile App</Text>
          <Text style={styles.infoText}>Moteur de Stockage : Expo SQLite (WAL Mode)</Text>
          <Text style={styles.infoText}>Isolation Multi-Tenant : Stricte par Tenant ID</Text>
          <Text style={styles.infoText}>Org ID : {orgId || 'Non défini'}</Text>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutBtnText}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
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
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginTop: 4,
  },
  roleBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  roleBadgeText: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '700',
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
  orgItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  orgItemActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  orgName: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '500',
  },
  orgNameActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  activeCheck: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '700',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  settingSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  queueStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  queueStatusLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  queueStatusVal: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  syncBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  syncBtnText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
  },
  clearCacheBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  clearCacheText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '500',
  },
  infoText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 20,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
