import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { mobileApiClient } from '../../src/services/api';
import { offlineSyncEngine } from '../../src/services/offlineSync';

export default function HomeScreen() {
  const router = useRouter();
  const { user, orgId, currentOrg } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  const [analytics, setAnalytics] = useState<any>({
    totalTasks: 0,
    completionRate: 0,
    overdueTasks: 0,
    byStatus: { PENDING: 0, IN_PROGRESS: 0, SUBMITTED: 0, APPROVED: 0, REJECTED: 0 },
  });
  const [stores, setStores] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch Task Analytics
      const [analyticsRes, tasksRes, storesRes, commRes] = await Promise.allSettled([
        mobileApiClient.getTaskAnalytics(),
        mobileApiClient.getTasks(),
        mobileApiClient.getStores(),
        mobileApiClient.listCommunities(),
      ]);

      let isAnyOnlineSuccess = false;

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.success && analyticsRes.value.data) {
        setAnalytics(analyticsRes.value.data);
        isAnyOnlineSuccess = true;
      }

      if (tasksRes.status === 'fulfilled' && tasksRes.value.success && tasksRes.value.data) {
        const liveTasks = tasksRes.value.data || [];
        if (orgId) {
          await offlineSyncEngine.cacheTasks(orgId, liveTasks);
        }
        isAnyOnlineSuccess = true;
      }

      if (storesRes.status === 'fulfilled' && storesRes.value.success && storesRes.value.data) {
        setStores(storesRes.value.data || []);
        isAnyOnlineSuccess = true;
      }

      if (commRes.status === 'fulfilled' && commRes.value.success && commRes.value.data) {
        setCommunities(commRes.value.data || []);
        isAnyOnlineSuccess = true;
      }

      if (!isAnyOnlineSuccess && orgId) {
        // Fallback to local SQLite cache
        setIsOfflineMode(true);
        const cached = await offlineSyncEngine.getCachedTasks(orgId);
        if (cached && cached.length > 0) {
          const pending = cached.filter((t) => t.status === 'PENDING').length;
          const inProgress = cached.filter((t) => t.status === 'IN_PROGRESS').length;
          const submitted = cached.filter((t) => t.status === 'SUBMITTED').length;
          const approved = cached.filter((t) => t.status === 'APPROVED' || t.status === 'COMPLETED').length;
          const total = cached.length;
          const rate = total > 0 ? Math.round((approved / total) * 100) : 0;

          setAnalytics({
            totalTasks: total,
            completionRate: rate,
            overdueTasks: 0,
            byStatus: { PENDING: pending, IN_PROGRESS: inProgress, SUBMITTED: submitted, APPROVED: approved, REJECTED: 0 },
          });
        }
      } else {
        setIsOfflineMode(false);
      }
    } catch (err) {
      console.warn('[HomeScreen] Data loading error, falling back to cache:', err);
      setIsOfflineMode(true);
      if (orgId) {
        const cached = await offlineSyncEngine.getCachedTasks(orgId);
        if (cached) {
          setAnalytics((prev: any) => ({ ...prev, totalTasks: cached.length }));
        }
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orgId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const todoCount = analytics.byStatus?.PENDING || 0;
  const startedCount = analytics.byStatus?.IN_PROGRESS || 0;
  const doneCount = (analytics.byStatus?.APPROVED || 0) + (analytics.byStatus?.COMPLETED || 0);
  const toValidateCount = analytics.byStatus?.SUBMITTED || 0;
  const totalTasks = analytics.totalTasks || (todoCount + startedCount + doneCount + toValidateCount);
  const overdueCount = analytics.overdueTasks || 0;
  const completionPercent = analytics.completionRate || (totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0);

  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user?.email || 'Collaborateur';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Application Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>
                {(user?.firstName?.[0] || 'U') + (user?.lastName?.[0] || '')}
              </Text>
            </View>
            <View style={[styles.onlineBadge, isOfflineMode && { backgroundColor: '#F59E0B' }]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconCircleButton} onPress={() => router.push('/tasks')}>
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Center Stylized YOOBIC 'y' Logo */}
        <View style={styles.centerLogo}>
          <Text style={styles.yoobicY}>y</Text>
        </View>

        {/* Header Right Actions */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/community')}>
            <Text style={styles.headerActionIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/tasks')}>
            <Text style={styles.headerActionIcon}>📅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} onPress={() => router.push('/community')}>
            <Text style={styles.headerActionIcon}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineBannerText}>⚡ Mode Hors-Ligne • Données chargées depuis SQLite</Text>
        </View>
      )}

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
      >
        {/* User Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>👋 Bonjour, {displayName}</Text>
          <Text style={styles.orgSubtitle}>{currentOrg?.name || 'Organisation Active'}</Text>
        </View>

        {/* 1. ACTIVITY HUB CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Activity Hub</Text>
            <TouchableOpacity onPress={onRefresh}>
              <Text style={styles.menuDots}>🔄</Text>
            </TouchableOpacity>
          </View>

          {/* Donut Progress Centerpiece */}
          <View style={styles.donutWrapper}>
            <Text style={styles.donutDateHeader}>{totalTasks} Missions Totales</Text>
            <View style={styles.donutCircle}>
              <View style={styles.donutInner}>
                <Text style={styles.donutStatGray}>À faire: {todoCount}</Text>
                <Text style={styles.donutStatYellow}>Démarré: {startedCount}</Text>
                <Text style={styles.donutStatGreen}>Fait: {doneCount}</Text>
              </View>
            </View>
          </View>

          {/* Alert Banner */}
          <TouchableOpacity
            style={[styles.redAlertBanner, overdueCount === 0 && { backgroundColor: '#F0FDF4' }]}
            onPress={() => router.push('/tasks')}
          >
            <Text style={[styles.redAlertText, overdueCount === 0 && { color: '#16A34A' }]}>
              {overdueCount > 0 ? `${overdueCount} Missions en retard` : '✅ Aucune mission en retard'}
            </Text>
          </TouchableOpacity>

          {/* Action Pills Row */}
          <View style={styles.actionsPillRow}>
            <TouchableOpacity style={styles.greenPill} onPress={() => router.push('/tasks')}>
              <Text style={styles.greenPillText}>{toValidateCount} À valider</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bluePill} onPress={() => router.push('/tasks')}>
              <Text style={styles.bluePillText}>{todoCount} À traiter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. SITES EN RETARD / STATUT */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Statut d'exécution</Text>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity onPress={() => router.push('/tasks')}>
                <Text style={styles.seeAllText}>Tout voir</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.overdueBigBox, overdueCount === 0 && { backgroundColor: '#F0FDF4', borderColor: '#DCFCE7' }]}>
            <Text style={styles.alarmIcon}>{overdueCount > 0 ? '⏰' : '🎯'}</Text>
            <Text style={[styles.overdueBigNumber, overdueCount === 0 && { color: '#16A34A' }]}>
              {overdueCount > 0 ? overdueCount : `${completionPercent}%`}
            </Text>
            <Text style={[styles.overdueLabel, overdueCount === 0 && { color: '#15803D' }]}>
              {overdueCount > 0 ? 'Missions nécessitant une action immédiate' : 'Taux global de conformité et complétion'}
            </Text>
          </View>
        </View>

        {/* 3. ACTIVITÉS DU JOUR */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.cardTitle}>Activités du jour</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>Live</Text>
              </View>
            </View>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity onPress={() => router.push('/tasks')}>
                <Text style={styles.seeAllText}>Détails</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.activityTodayRow}>
            <View style={styles.activityPillsCol}>
              <View style={styles.pillOverdue}>
                <Text style={styles.pillOverdueIcon}>⏰</Text>
                <Text style={styles.pillOverdueText}>{overdueCount} En retard</Text>
              </View>
              <View style={styles.pillTodo}>
                <Text style={styles.pillTodoIcon}>☑️</Text>
                <Text style={styles.pillTodoText}>{todoCount} À faire</Text>
              </View>
            </View>

            {/* Circular Gauge */}
            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeCircle}>
                <Text style={styles.gaugePercent}>{completionPercent}%</Text>
              </View>
              <Text style={styles.gaugeLabel}>Complétion</Text>
            </View>
          </View>
        </View>

        {/* 4. SITES LIST */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sites & Établissements ({stores.length})</Text>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity onPress={() => router.push('/tasks')}>
                <Text style={styles.seeAllText}>Voir tous</Text>
              </TouchableOpacity>
            </View>
          </View>

          {stores.length === 0 ? (
            <View style={styles.emptyStoreBox}>
              <Text style={styles.emptyStoreText}>Chargement des établissements assignés...</Text>
            </View>
          ) : (
            stores.slice(0, 3).map((st, idx) => (
              <View key={st.id || idx}>
                <TouchableOpacity style={styles.siteItem} onPress={() => router.push('/tasks')}>
                  <View style={styles.siteTopRow}>
                    <View style={styles.siteThumbPlaceholder}>
                      <Text style={styles.siteThumbText}>🏢</Text>
                    </View>
                    <View style={styles.siteMeta}>
                      <View style={styles.siteTitleRow}>
                        <Text style={styles.siteName}>{st.name}</Text>
                        <Text style={styles.siteDistance}>{st.code || 'SITE'}</Text>
                      </View>
                      <Text style={styles.siteAddress}>{st.address || st.city || 'Adresse du magasin'}</Text>
                      <Text style={styles.siteLastVisit}>{st.region?.name || 'Région Standard'}</Text>
                    </View>
                  </View>

                  <View style={styles.siteMetricsGrid}>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Statut</Text>
                      <Text style={styles.metricVal}>{st.status || 'ACTIF'}</Text>
                    </View>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Équipes</Text>
                      <Text style={styles.metricVal}>{st._count?.teams || 1}</Text>
                    </View>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Missions</Text>
                      <Text style={styles.metricVal}>{todoCount}</Text>
                    </View>
                    <View style={styles.metricCol}>
                      <Text style={styles.metricLabel}>Complétion</Text>
                      <Text style={styles.metricVal}>{completionPercent}%</Text>
                    </View>
                  </View>
                </TouchableOpacity>
                {idx < Math.min(stores.length, 3) - 1 && <View style={styles.divider} />}
              </View>
            ))
          )}
        </View>

        {/* 5. COMMUNAUTÉS */}
        <View style={[styles.card, { marginBottom: 30 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Communautés & Équipes</Text>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity onPress={() => router.push('/community')}>
                <Text style={styles.seeAllText}>Tout voir</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.communityRow}>
            {communities.length === 0 ? (
              <TouchableOpacity style={styles.communityCircleItem} onPress={() => router.push('/community')}>
                <View style={styles.communityIconBox}>
                  <Text style={styles.communityEmoji}>📢</Text>
                </View>
                <Text style={styles.communityTitle}>Opérations</Text>
              </TouchableOpacity>
            ) : (
              communities.slice(0, 4).map((c, i) => (
                <TouchableOpacity key={c.id || i} style={styles.communityCircleItem} onPress={() => router.push('/community')}>
                  <View style={styles.communityIconBox}>
                    <Text style={styles.communityEmoji}>{i % 2 === 0 ? '🏬' : '🎯'}</Text>
                  </View>
                  <Text style={styles.communityTitle} numberOfLines={1}>{c.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topHeader: {
    height: 54,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#10B981',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  iconCircleButton: {
    padding: 4,
  },
  headerIcon: {
    fontSize: 16,
  },
  centerLogo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  yoobicY: {
    fontSize: 26,
    fontWeight: '900',
    color: '#2563EB',
    fontStyle: 'italic',
    transform: [{ scaleY: 1.1 }],
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  headerActionBtn: {
    padding: 2,
  },
  headerActionIcon: {
    fontSize: 17,
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FDE68A',
  },
  offlineBannerText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  greetingSection: {
    marginBottom: 14,
  },
  greetingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  orgSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
    shadowColor: '#64748B',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  seeAllText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  menuDots: {
    fontSize: 16,
    color: '#64748B',
    paddingHorizontal: 4,
  },
  donutWrapper: {
    alignItems: 'center',
    marginVertical: 10,
  },
  donutDateHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
    marginBottom: 12,
  },
  donutCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 14,
    borderColor: '#E2E8F0',
    borderTopColor: '#2563EB',
    borderRightColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutStatGray: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  donutStatYellow: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '600',
    marginVertical: 2,
  },
  donutStatGreen: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '500',
  },
  redAlertBanner: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  redAlertText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionsPillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  greenPill: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  greenPillText: {
    color: '#059669',
    fontWeight: 'bold',
    fontSize: 13,
  },
  bluePill: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bluePillText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 13,
  },
  overdueBigBox: {
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  alarmIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  overdueBigNumber: {
    fontSize: 38,
    fontWeight: '900',
    color: '#EF4444',
    marginVertical: 2,
  },
  overdueLabel: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center',
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  newBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newBadgeText: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activityTodayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  activityPillsCol: {
    flex: 1,
    gap: 10,
  },
  pillOverdue: {
    backgroundColor: '#FEE2E2',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  pillOverdueIcon: {
    fontSize: 15,
  },
  pillOverdueText: {
    color: '#DC2626',
    fontWeight: 'bold',
    fontSize: 13,
  },
  pillTodo: {
    backgroundColor: '#EFF6FF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  pillTodoIcon: {
    fontSize: 15,
  },
  pillTodoText: {
    color: '#2563EB',
    fontWeight: 'bold',
    fontSize: 13,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  gaugeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 6,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gaugePercent: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  gaugeLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  siteItem: {
    paddingVertical: 8,
  },
  siteTopRow: {
    flexDirection: 'row',
    gap: 10,
  },
  siteThumbPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteThumbText: {
    fontSize: 20,
  },
  siteMeta: {
    flex: 1,
  },
  siteTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  siteName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  siteDistance: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  siteAddress: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  siteLastVisit: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  siteMetricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  metricCol: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  metricVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  emptyStoreBox: {
    padding: 20,
    alignItems: 'center',
  },
  emptyStoreText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  communityRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 4,
  },
  communityCircleItem: {
    alignItems: 'center',
    width: 76,
  },
  communityIconBox: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  communityEmoji: {
    fontSize: 24,
  },
  communityTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
