import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';

export default function TasksScreen() {
  // Navigation states: 'sites_list' | 'site_profile' | 'mission_detail'
  const [currentView, setCurrentView] = useState<'sites_list' | 'site_profile' | 'mission_detail'>('site_profile');
  const [profileTab, setProfileTab] = useState<'todo' | 'done' | 'analytics' | 'overview'>('todo');
  const [filterAssignee, setFilterAssignee] = useState<'me' | 'all'>('me');
  const [activeMission, setActiveMission] = useState<any | null>({
    id: 'm-1',
    title: 'RDTS - Maintenance - Walmart - Philips',
    category: 'Regular Maintenance',
    receivedDate: '08/11/2026 à 06:02',
    dueDate: 'dimanche à 06:00',
    site: 'WM_3047 - 2075 CHOMDEDY BLVD, H7T0G5, LAVAL, Canada',
    description: 'RDTS - Entretien - Walmart - Philips',
    pagesCount: 7,
    photosCount: 10,
    questionsCount: 130,
    estimatedDuration: 60,
    progress: 97,
  });

  const sitesData = [
    {
      id: 's-1',
      code: 'WM_3047',
      distance: '0.1 m',
      address: '2075 CHOMDEDY BLVD, H7T0G5, LAVAL, Canada',
      lastVisit: 'il y a 7 jrs',
      todo: 4,
      completion: 71,
      overdue: 0,
      completed: 11,
      thumbnail: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 's-2',
      code: 'MAXI6',
      distance: '0.6 m',
      address: '3500, Boul. St-Martin Ouest, Laval, H7T 2W4, QC',
      lastVisit: 'il y a 14 jrs',
      todo: 0,
      completion: 0,
      overdue: 0,
      completed: 0,
      thumbnail: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 's-3',
      code: 'MAXI_8384',
      distance: '0.6 m',
      address: '3500, Boul. St-Martin Ouest, Laval, QC, H7T2W4,...',
      lastVisit: 'il y a 20 jrs',
      todo: 0,
      completion: 0,
      overdue: 0,
      completed: 0,
      thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 's-4',
      code: 'RONA+_41010',
      distance: '0.9 m',
      address: '3065 boul. le Carrefour, H7T1C7, LAVAL, Canada',
      lastVisit: 'il y a 14h',
      todo: 2,
      completion: 100,
      overdue: 0,
      completed: 35,
      thumbnail: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=120&q=80',
    },
  ];

  // -------------------------------------------------------------
  // VIEW 1: SITES DIRECTORY (Screenshot 4)
  // -------------------------------------------------------------
  if (currentView === 'sites_list') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => setCurrentView('site_profile')}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sites</Text>
          <View style={{ width: 20 }} />
        </View>

        {/* Search & Filter Bar */}
        <View style={styles.searchBarRow}>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterIcon}>🌪️</Text>
          </TouchableOpacity>
          <View style={styles.searchField}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Rechercher"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.mapViewBtn}>
            <Text style={styles.mapIcon}>🗺️</Text>
          </TouchableOpacity>
        </View>

        {/* Filter Chips Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          <View style={styles.chipPill}><Text style={styles.chipText}>RDTS_Leviton Audit</Text></View>
          <View style={styles.chipPill}><Text style={styles.chipText}>RDTS_HOME_DEPOT_A</Text></View>
          <View style={styles.chipPill}><Text style={styles.chipText}>RDTS_HOM...</Text></View>
        </ScrollView>

        {/* Sites List */}
        <ScrollView style={styles.bodyScroll}>
          {sitesData.map((site) => (
            <TouchableOpacity
              key={site.id}
              style={styles.siteCard}
              onPress={() => setCurrentView('site_profile')}
            >
              <View style={styles.siteCardTop}>
                <Image source={{ uri: site.thumbnail }} style={styles.siteCardImg} />
                <View style={styles.siteCardMeta}>
                  <View style={styles.siteCodeRow}>
                    <Text style={styles.siteCode}>{site.code}</Text>
                    <Text style={styles.siteDistance}>📍 {site.distance}</Text>
                  </View>
                  <Text style={styles.siteAddr}>{site.address}</Text>
                  {site.lastVisit && (
                    <Text style={styles.siteVisitTime}>Dernière visite {site.lastVisit}</Text>
                  )}
                </View>
              </View>

              <View style={styles.siteCardGrid}>
                <View style={styles.siteCol}>
                  <Text style={styles.siteColLabel}>À faire</Text>
                  <Text style={styles.siteColVal}>{site.todo}</Text>
                </View>
                <View style={styles.siteCol}>
                  <Text style={styles.siteColLabel}>Complétion</Text>
                  <Text style={styles.siteColVal}>{site.completion}%</Text>
                </View>
                <View style={styles.siteCol}>
                  <Text style={styles.siteColLabel}>En retard</Text>
                  <Text style={styles.siteColVal}>{site.overdue}</Text>
                </View>
                <View style={styles.siteCol}>
                  <Text style={styles.siteColLabel}>Complété</Text>
                  <Text style={styles.siteColVal}>{site.completed}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: MISSION DETAILS STEPPER / TIMELINE (Screenshot 2)
  // -------------------------------------------------------------
  if (currentView === 'mission_detail') {
    return (
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.missionHeader}>
          <TouchableOpacity onPress={() => setCurrentView('site_profile')} style={styles.backRow}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.headerTitle}>Mission</Text>
          </TouchableOpacity>
          <View style={styles.missionHeaderIcons}>
            <TouchableOpacity style={styles.iconSquareBtn}>
              <Text style={styles.iconSquareText}>⬇️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconSquareBtn}>
              <Text style={styles.iconSquareText}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconSquareBtn}>
              <Text style={styles.iconSquareText}>⋮</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.missionBody} showsVerticalScrollIndicator={false}>
          {/* Mission Main Title */}
          <Text style={styles.missionTitle}>{activeMission.title}</Text>

          {/* Progress Bar & Badges */}
          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${activeMission.progress}%` }]} />
            </View>
            <Text style={styles.progressPercentText}>{activeMission.progress}%</Text>
            <View style={styles.formBadge}>
              <Text style={styles.formBadgeText}>📋 Formulaire</Text>
            </View>
            <View style={styles.startedBadge}>
              <Text style={styles.startedBadgeText}>Démarré</Text>
            </View>
          </View>

          {/* Stepper Timeline with connected line */}
          <View style={styles.timeline}>
            {/* Step 1: Catégorie */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>🏷️</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Catégorie</Text>
                <View style={styles.purplePill}>
                  <Text style={styles.purplePillText}>{activeMission.category}</Text>
                </View>
              </View>
            </View>

            {/* Step 2: Date de réception */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>📅</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Date de réception</Text>
                <View style={styles.grayPill}>
                  <Text style={styles.grayPillText}>{activeMission.receivedDate}</Text>
                </View>
              </View>
            </View>

            {/* Step 3: Date limite */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>🗓️</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Date limite</Text>
                <View style={styles.grayPill}>
                  <Text style={styles.grayPillText}>{activeMission.dueDate}</Text>
                </View>
              </View>
            </View>

            {/* Step 4: Site */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>📍</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Site</Text>
                <Text style={styles.stepDesc}>{activeMission.site}</Text>
              </View>
            </View>

            {/* Step 5: Description de la mission */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>📦</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Description de la mission</Text>
                <Text style={styles.stepDesc}>{activeMission.description}</Text>
              </View>
            </View>

            {/* Step 6: Contenu */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>📎</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Contenu</Text>
                <Text style={styles.stepDesc}>
                  📄 {activeMission.pagesCount} pages  📷 {activeMission.photosCount} photos  ❓ {activeMission.questionsCount} questions
                </Text>
              </View>
            </View>

            {/* Step 7: Durée estimée */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>⏱️</Text></View>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Durée estimée</Text>
                <Text style={styles.stepDesc}>{activeMission.estimatedDuration}</Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Fixed Action Bar */}
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={styles.abandonBtn}
            onPress={() => setCurrentView('site_profile')}
          >
            <Text style={styles.abandonText}>Abandonner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => Alert.alert('Checklist ouverte', 'Formulaire de vérification Philips prêt à être complété.')}
          >
            <Text style={styles.continueText}>Continuer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: PROFIL DU SITE (Screenshot 3)
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => setCurrentView('sites_list')}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil du site</Text>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView style={styles.bodyScroll} showsVerticalScrollIndicator={false}>
        {/* Site Profile Card */}
        <View style={styles.profileStoreCard}>
          <View style={styles.profileTopRow}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=120&q=80' }}
              style={styles.profileThumbnail}
            />
            <View style={styles.profileMeta}>
              <View style={styles.siteCodeRow}>
                <Text style={styles.profileStoreName}>WM_3047</Text>
                <Text style={styles.profileDistance}>📍 0.1 m</Text>
              </View>
              <Text style={styles.profileAddr}>2075 CHOMDEDY BLVD, H7T0G5, LAVAL, Canada</Text>
              <Text style={styles.profileVisitTime}>Dernière visite 05/11/26 13:52</Text>
              <Text style={styles.profileVisitCount}>Nombre de visites: 11</Text>
            </View>
          </View>
        </View>

        {/* Tabs: À faire (4) | Fait | Analyses | Aperçu */}
        <View style={styles.subTabsRow}>
          <TouchableOpacity
            style={[styles.subTabItem, profileTab === 'todo' && styles.subTabActive]}
            onPress={() => setProfileTab('todo')}
          >
            <Text style={[styles.subTabText, profileTab === 'todo' && styles.subTabActiveText]}>
              À faire 4
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTabItem, profileTab === 'done' && styles.subTabActive]}
            onPress={() => setProfileTab('done')}
          >
            <Text style={[styles.subTabText, profileTab === 'done' && styles.subTabActiveText]}>
              Fait
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTabItem, profileTab === 'analytics' && styles.subTabActive]}
            onPress={() => setProfileTab('analytics')}
          >
            <Text style={[styles.subTabText, profileTab === 'analytics' && styles.subTabActiveText]}>
              Analyses
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTabItem, profileTab === 'overview' && styles.subTabActive]}
            onPress={() => setProfileTab('overview')}
          >
            <Text style={[styles.subTabText, profileTab === 'overview' && styles.subTabActiveText]}>
              Aperçu
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search bar & filter icons */}
        <View style={styles.searchBarRow}>
          <TouchableOpacity style={styles.filterBtn}>
            <Text style={styles.filterIcon}>🌪️</Text>
          </TouchableOpacity>
          <View style={styles.searchField}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Rechercher"
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity style={styles.mapViewBtn}>
            <Text style={styles.mapIcon}>📑</Text>
          </TouchableOpacity>
        </View>

        {/* Segmented Buttons: Par moi (4) | Par tous */}
        <View style={styles.segmentedRow}>
          <TouchableOpacity
            style={[styles.segBtn, filterAssignee === 'me' ? styles.segBtnActive : styles.segBtnInactive]}
            onPress={() => setFilterAssignee('me')}
          >
            <Text style={[styles.segBtnText, filterAssignee === 'me' && styles.segBtnTextActive]}>
              Par moi 4
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, filterAssignee === 'all' ? styles.segBtnActive : styles.segBtnInactive]}
            onPress={() => setFilterAssignee('all')}
          >
            <Text style={[styles.segBtnText, filterAssignee === 'all' && styles.segBtnTextActive]}>
              Par tous 4
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sortBtn}>
            <Text style={styles.sortIcon}>⇅</Text>
          </TouchableOpacity>
        </View>

        {/* Group: Les 7 derniers jours */}
        <View style={styles.groupSection}>
          <Text style={styles.groupHeader}>Les 7 derniers jours</Text>

          {/* Task 1 */}
          <TouchableOpacity
            style={styles.taskCardItem}
            onPress={() => setCurrentView('mission_detail')}
          >
            <View style={styles.taskCardHeader}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80' }}
                style={styles.taskCardAvatar}
              />
              <View style={styles.taskTitleCol}>
                <Text style={styles.taskItemTitle}>Philips Audit des stocks faibles</Text>
                <View style={styles.taskDateRow}>
                  <Text style={styles.dlIcon}>⬇️</Text>
                  <Text style={styles.dlDate}>08/11/2026</Text>
                </View>
              </View>
            </View>

            <View style={styles.badgesWrap}>
              <View style={styles.badgeForm}>
                <Text style={styles.badgeFormText}>📋 Formulaire</Text>
              </View>
              <View style={styles.badgeGray}>
                <Text style={styles.badgeGrayText}>🗓️ Date limite : dimanche à 06:00</Text>
              </View>
              <View style={styles.badgeYellow}>
                <Text style={styles.badgeYellowText}>Task</Text>
              </View>
              <View style={styles.badgePink}>
                <Text style={styles.badgePinkText}>Démarré</Text>
              </View>
            </View>
            <Text style={styles.taskLocText}>📍 WM_3047 - 2075 CHOMDEDY BLVD, H7T0G5,...</Text>
          </TouchableOpacity>

          {/* Task 2 */}
          <TouchableOpacity
            style={styles.taskCardItem}
            onPress={() => setCurrentView('mission_detail')}
          >
            <View style={styles.taskCardHeader}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80' }}
                style={styles.taskCardAvatar}
              />
              <View style={styles.taskTitleCol}>
                <Text style={styles.taskItemTitle}>RDTS - Maintenance - Walmart - Philips</Text>
                <View style={styles.taskDateRow}>
                  <Text style={styles.dlIcon}>⬇️</Text>
                  <Text style={styles.dlDate}>08/11/2026</Text>
                </View>
              </View>
            </View>

            <View style={styles.badgesWrap}>
              <View style={styles.badgeForm}>
                <Text style={styles.badgeFormText}>📋 Formulaire</Text>
              </View>
              <View style={styles.badgeGray}>
                <Text style={styles.badgeGrayText}>🗓️ Date limite : dimanche à 06:00</Text>
              </View>
              <View style={styles.badgePurple}>
                <Text style={styles.badgePurpleText}>Regular Maintenance</Text>
              </View>
              <View style={styles.badgePink}>
                <Text style={styles.badgePinkText}>Démarré</Text>
              </View>
            </View>
            <Text style={styles.taskLocText}>📍 WM_3047 - 2075 CHOMDEDY BLVD, H7T0G5,...</Text>
            <Text style={styles.durationNote}>60 min pour compléter</Text>
          </TouchableOpacity>
        </View>

        {/* Group: Les 30 derniers jours */}
        <View style={styles.groupSection}>
          <Text style={styles.groupHeader}>Les 30 derniers jours</Text>
          <TouchableOpacity
            style={styles.taskCardItem}
            onPress={() => setCurrentView('mission_detail')}
          >
            <View style={styles.taskCardHeader}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80' }}
                style={styles.taskCardAvatar}
              />
              <View style={styles.taskTitleCol}>
                <Text style={styles.taskItemTitle}>Walmart - Philips - Réductions de prix de novembre à...</Text>
                <View style={styles.taskDateRow}>
                  <Text style={styles.dlIcon}>⬇️</Text>
                  <Text style={styles.dlDate}>01/11/2026</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button '+' (Screenshot 3) */}
      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() => Alert.alert('Nouvelle Mission', 'Créer une nouvelle mission de contrôle pour ce site.')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  navHeader: {
    height: 50,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backArrow: {
    fontSize: 26,
    color: '#64748B',
    lineHeight: 28,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  filterBtn: {
    padding: 6,
  },
  filterIcon: {
    fontSize: 18,
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 38,
  },
  searchIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
  },
  mapViewBtn: {
    padding: 6,
  },
  mapIcon: {
    fontSize: 18,
  },
  chipsScroll: {
    paddingHorizontal: 16,
    maxHeight: 36,
    marginBottom: 8,
  },
  chipPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  chipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '500',
  },
  bodyScroll: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  siteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  siteCardTop: {
    flexDirection: 'row',
    gap: 10,
  },
  siteCardImg: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  siteCardMeta: {
    flex: 1,
  },
  siteCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  siteCode: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  siteDistance: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
  },
  siteAddr: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  siteVisitTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  siteCardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  siteCol: {
    alignItems: 'center',
  },
  siteColLabel: {
    fontSize: 10,
    color: '#64748B',
    marginBottom: 2,
  },
  siteColVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  profileStoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  profileTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  profileThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  profileMeta: {
    flex: 1,
  },
  profileStoreName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  profileDistance: {
    fontSize: 11,
    color: '#0F172A',
    fontWeight: '600',
  },
  profileAddr: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  profileVisitTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  profileVisitCount: {
    fontSize: 11,
    color: '#94A3B8',
  },
  subTabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  subTabActive: {
    borderBottomWidth: 2.5,
    borderColor: '#2563EB',
  },
  subTabText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  subTabActiveText: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  segmentedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 10,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segBtnActive: {
    backgroundColor: '#2563EB',
  },
  segBtnInactive: {
    backgroundColor: '#EEF2F6',
  },
  segBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  segBtnTextActive: {
    color: '#FFFFFF',
  },
  sortBtn: {
    padding: 8,
  },
  sortIcon: {
    fontSize: 16,
    color: '#64748B',
  },
  groupSection: {
    marginBottom: 16,
  },
  groupHeader: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  taskCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  taskCardHeader: {
    flexDirection: 'row',
    gap: 10,
  },
  taskCardAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  taskTitleCol: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  taskDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  dlIcon: {
    fontSize: 10,
  },
  dlDate: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '500',
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  badgeForm: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeFormText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '600',
  },
  badgeGray: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeGrayText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '500',
  },
  badgeYellow: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeYellowText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgePurple: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePurpleText: {
    color: '#7E22CE',
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgePink: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePinkText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: 'bold',
  },
  taskLocText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
  },
  durationNote: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  fabBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: -2,
  },
  missionHeader: {
    height: 50,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  missionHeaderIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconSquareBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSquareText: {
    fontSize: 14,
  },
  missionBody: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
  },
  missionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  progressFill: {
    height: 4,
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  formBadgeText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '600',
  },
  startedBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  startedBadgeText: {
    color: '#DC2626',
    fontSize: 10,
    fontWeight: 'bold',
  },
  timeline: {
    marginTop: 6,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  bulletCol: {
    alignItems: 'center',
    width: 36,
  },
  bulletCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulletIcon: {
    fontSize: 12,
  },
  verticalLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginTop: 4,
  },
  stepContent: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 12,
    color: '#475569',
  },
  purplePill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  purplePillText: {
    color: '#7E22CE',
    fontSize: 11,
    fontWeight: 'bold',
  },
  grayPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  grayPillText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '500',
  },
  fixedBottomBar: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  abandonBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  abandonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  continueBtn: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
