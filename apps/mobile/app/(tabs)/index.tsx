import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Top Application Header Bar */}
      <View style={styles.topHeader}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80' }}
              style={styles.avatarImg}
            />
            <View style={styles.onlineBadge} />
          </View>
          <TouchableOpacity style={styles.iconCircleButton}>
            <Text style={styles.headerIcon}>🔍</Text>
          </TouchableOpacity>
        </View>

        {/* Center Stylized YOOBIC 'y' Logo */}
        <View style={styles.centerLogo}>
          <Text style={styles.yoobicY}>y</Text>
        </View>

        {/* Header Right Actions: Bell, Calendar, Chat */}
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Text style={styles.headerActionIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Text style={styles.headerActionIcon}>📅</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn}>
            <Text style={styles.headerActionIcon}>💬</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* User Greeting */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>👋 Bonjour, Mahrsi</Text>
        </View>

        {/* 1. ACTIVITY HUB CARD (Screenshot 5) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Activity Hub</Text>
            <TouchableOpacity>
              <Text style={styles.menuDots}>⋮</Text>
            </TouchableOpacity>
          </View>

          {/* Donut Progress Centerpiece */}
          <View style={styles.donutWrapper}>
            <Text style={styles.donutDateHeader}>146 Aujourd'hui</Text>
            <View style={styles.donutCircle}>
              <View style={styles.donutInner}>
                <Text style={styles.donutStatGray}>À faire: 140</Text>
                <Text style={styles.donutStatYellow}>Démarré: 6</Text>
                <Text style={styles.donutStatGreen}>Fait: 0</Text>
              </View>
            </View>
          </View>

          {/* Red Alert Banner */}
          <TouchableOpacity
            style={styles.redAlertBanner}
            onPress={() => router.push('/tasks')}
          >
            <Text style={styles.redAlertText}>90 Sites en retard</Text>
          </TouchableOpacity>

          {/* Action Pills Row */}
          <View style={styles.actionsPillRow}>
            <TouchableOpacity style={styles.greenPill} onPress={() => router.push('/tasks')}>
              <Text style={styles.greenPillText}>183 À valider</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bluePill} onPress={() => router.push('/tasks')}>
              <Text style={styles.bluePillText}>0 Nouvelle tâche</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. SITES EN RETARD (Screenshot 1) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sites en retard</Text>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity onPress={() => router.push('/tasks')}>
                <Text style={styles.seeAllText}>Tout voir</Text>
              </TouchableOpacity>
              <Text style={styles.menuDots}>⋮</Text>
            </View>
          </View>

          <View style={styles.overdueBigBox}>
            <Text style={styles.alarmIcon}>⏰</Text>
            <Text style={styles.overdueBigNumber}>115</Text>
            <Text style={styles.overdueLabel}>Sites avec des missions en retard</Text>
          </View>
        </View>

        {/* 3. ACTIVITÉS DU JOUR (Screenshot 1) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.titleWithBadge}>
              <Text style={styles.cardTitle}>Activités du jour</Text>
              <View style={styles.newBadge}>
                <Text style={styles.newBadgeText}>New</Text>
              </View>
            </View>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity onPress={() => router.push('/tasks')}>
                <Text style={styles.seeAllText}>Tout voir</Text>
              </TouchableOpacity>
              <Text style={styles.menuDots}>⋮</Text>
            </View>
          </View>

          <View style={styles.activityTodayRow}>
            <View style={styles.activityPillsCol}>
              <View style={styles.pillOverdue}>
                <Text style={styles.pillOverdueIcon}>⏰</Text>
                <Text style={styles.pillOverdueText}>100 En retard</Text>
              </View>
              <View style={styles.pillTodo}>
                <Text style={styles.pillTodoIcon}>☑️</Text>
                <Text style={styles.pillTodoText}>101 À faire</Text>
              </View>
            </View>

            {/* Circular Gauge */}
            <View style={styles.gaugeContainer}>
              <View style={styles.gaugeCircle}>
                <Text style={styles.gaugePercent}>0%</Text>
              </View>
              <Text style={styles.gaugeLabel}>Ok</Text>
            </View>
          </View>
        </View>

        {/* 4. SITES LIST (Screenshots 1 & 4) */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sites</Text>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity onPress={() => router.push('/tasks')}>
                <Text style={styles.seeAllText}>Tout voir</Text>
              </TouchableOpacity>
              <Text style={styles.menuDots}>⋮</Text>
            </View>
          </View>

          {/* Site 1: WM_3047 */}
          <TouchableOpacity
            style={styles.siteItem}
            onPress={() => router.push('/tasks')}
          >
            <View style={styles.siteTopRow}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=120&q=80' }}
                style={styles.siteThumbnail}
              />
              <View style={styles.siteMeta}>
                <View style={styles.siteTitleRow}>
                  <Text style={styles.siteName}>WM_3047</Text>
                  <Text style={styles.siteDistance}>📍 0.1 m</Text>
                </View>
                <Text style={styles.siteAddress}>2075 CHOMDEDY BLVD, H7T0G5, LAVAL, Canada</Text>
                <Text style={styles.siteLastVisit}>Dernière visite il y a 7 jrs</Text>
              </View>
            </View>

            {/* 4 Metric Columns */}
            <View style={styles.siteMetricsGrid}>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>À faire</Text>
                <Text style={styles.metricVal}>4</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Complétion</Text>
                <Text style={styles.metricVal}>71%</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>En retard</Text>
                <Text style={styles.metricVal}>0</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Complété</Text>
                <Text style={styles.metricVal}>11</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Site 2: MAXI6 */}
          <TouchableOpacity
            style={styles.siteItem}
            onPress={() => router.push('/tasks')}
          >
            <View style={styles.siteTopRow}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=120&q=80' }}
                style={styles.siteThumbnail}
              />
              <View style={styles.siteMeta}>
                <View style={styles.siteTitleRow}>
                  <Text style={styles.siteName}>MAXI6</Text>
                  <Text style={styles.siteDistance}>📍 0.6 m</Text>
                </View>
                <Text style={styles.siteAddress}>3500, Boul. St-Martin Ouest, Laval, H7T 2W4, QC</Text>
              </View>
            </View>

            <View style={styles.siteMetricsGrid}>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>À faire</Text>
                <Text style={styles.metricVal}>0</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Complétion</Text>
                <Text style={styles.metricVal}>0%</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>En retard</Text>
                <Text style={styles.metricVal}>0</Text>
              </View>
              <View style={styles.metricCol}>
                <Text style={styles.metricLabel}>Complété</Text>
                <Text style={styles.metricVal}>0</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* 5. COMMUNAUTÉS CARD (Screenshot 5) */}
        <View style={[styles.card, { marginBottom: 30 }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Communautés</Text>
            <View style={styles.cardHeaderRight}>
              <TouchableOpacity onPress={() => router.push('/community')}>
                <Text style={styles.seeAllText}>Tout voir</Text>
              </TouchableOpacity>
              <Text style={styles.menuDots}>⋮</Text>
            </View>
          </View>

          <View style={styles.communityRow}>
            <TouchableOpacity style={styles.communityCircleItem} onPress={() => router.push('/community')}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=120&q=80' }}
                style={styles.communityImg}
              />
              <Text style={styles.communityTitle}>Merchandising</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.communityCircleItem} onPress={() => router.push('/community')}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80' }}
                style={styles.communityImg}
              />
              <Text style={styles.communityTitle}>Opérations</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.communityCircleItem} onPress={() => router.push('/community')}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=120&q=80' }}
                style={styles.communityImg}
              />
              <Text style={styles.communityTitle}>Sécurité</Text>
            </TouchableOpacity>
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
  avatarImg: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    color: '#3B82F6',
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
    borderTopColor: '#EAB308',
    borderRightColor: '#E2E8F0',
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
    borderColor: '#E2E8F0',
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
  siteThumbnail: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
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
    color: '#0F172A',
    fontWeight: '600',
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
  communityRow: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 4,
  },
  communityCircleItem: {
    alignItems: 'center',
    width: 80,
  },
  communityImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 6,
  },
  communityTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    textAlign: 'center',
  },
});
