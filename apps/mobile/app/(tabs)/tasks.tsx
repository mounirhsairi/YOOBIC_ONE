import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { mobileApiClient } from '../../src/services/api';
import { offlineSyncEngine } from '../../src/services/offlineSync';

export default function TasksScreen() {
  const { user, orgId } = useAuth();

  // Navigation states: 'sites_list' | 'site_profile' | 'mission_detail'
  const [currentView, setCurrentView] = useState<'sites_list' | 'site_profile' | 'mission_detail'>('site_profile');
  const [profileTab, setProfileTab] = useState<'todo' | 'done' | 'analytics' | 'overview'>('todo');
  const [filterAssignee, setFilterAssignee] = useState<'me' | 'all'>('me');
  const [searchQuery, setSearchQuery] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [stores, setStores] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [selectedStore, setSelectedStore] = useState<any | null>(null);
  const [activeMission, setActiveMission] = useState<any | null>(null);

  // Evidence submission modal state
  const [isSubmitModalVisible, setIsSubmitModalVisible] = useState(false);
  const [evidenceNote, setEvidenceNote] = useState('');
  const [evidencePhotoUrl, setEvidencePhotoUrl] = useState('https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [storesRes, tasksRes] = await Promise.allSettled([
        mobileApiClient.getStores(),
        mobileApiClient.getTasks(),
      ]);

      let fetchedStores: any[] = [];
      let fetchedTasks: any[] = [];

      if (storesRes.status === 'fulfilled' && storesRes.value.success && storesRes.value.data) {
        fetchedStores = Array.isArray(storesRes.value.data) ? storesRes.value.data : [];
        setStores(fetchedStores);
        if (!selectedStore && fetchedStores.length > 0) {
          setSelectedStore(fetchedStores[0]);
        }
      }

      if (tasksRes.status === 'fulfilled' && tasksRes.value.success && tasksRes.value.data) {
        fetchedTasks = Array.isArray(tasksRes.value.data) ? tasksRes.value.data : [];
        setTasks(fetchedTasks);
        if (orgId) {
          await offlineSyncEngine.cacheTasks(orgId, fetchedTasks);
        }
      } else if (orgId) {
        // Fallback to SQLite offline cache
        const cached = await offlineSyncEngine.getCachedTasks(orgId);
        if (cached && cached.length > 0) {
          setTasks(cached);
        }
      }
    } catch (err) {
      console.warn('[TasksScreen] Error loading tasks, reading offline cache:', err);
      if (orgId) {
        const cached = await offlineSyncEngine.getCachedTasks(orgId);
        if (cached) setTasks(cached);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orgId, selectedStore]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  // Filter tasks based on store, subTab ('todo' vs 'done'), assignee ('me' vs 'all'), and search
  const filteredTasks = tasks.filter((t) => {
    if (selectedStore && t.storeId && t.storeId !== selectedStore.id) {
      return false;
    }
    if (filterAssignee === 'me' && user?.id) {
      if (t.assignedToUserId && t.assignedToUserId !== user.id) {
        return false;
      }
    }
    if (profileTab === 'todo') {
      if (t.status === 'APPROVED' || t.status === 'COMPLETED') return false;
    } else if (profileTab === 'done') {
      if (t.status !== 'APPROVED' && t.status !== 'COMPLETED' && t.status !== 'SUBMITTED') return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title?.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    return true;
  });

  const todoCount = tasks.filter((t) => (!selectedStore || t.storeId === selectedStore.id) && t.status !== 'APPROVED' && t.status !== 'COMPLETED').length;
  const doneCount = tasks.filter((t) => (!selectedStore || t.storeId === selectedStore.id) && (t.status === 'APPROVED' || t.status === 'COMPLETED' || t.status === 'SUBMITTED')).length;

  const handleStartMission = async () => {
    if (!activeMission) return;
    try {
      const res = await mobileApiClient.startTask(activeMission.id);
      if (res.success) {
        Alert.alert('Mission démarrée', 'La mission est passée en cours d\'exécution.');
        setActiveMission({ ...activeMission, status: 'IN_PROGRESS' });
        setTasks((prev) => prev.map((t) => (t.id === activeMission.id ? { ...t, status: 'IN_PROGRESS' } : t)));
      } else {
        throw new Error(res.error?.message || 'Action impossible');
      }
    } catch {
      // Offline fallback: queue operation
      if (orgId) {
        const opId = `op_${Date.now()}_start`;
        await offlineSyncEngine.queueOperation(opId, orgId, 'TASK_START', activeMission.id, {});
        Alert.alert('Mode Hors-Ligne', 'Démarrage enregistré localement. Synchronisation automatique au rétablissement du réseau.');
        setActiveMission({ ...activeMission, status: 'IN_PROGRESS' });
        setTasks((prev) => prev.map((t) => (t.id === activeMission.id ? { ...t, status: 'IN_PROGRESS' } : t)));
      }
    }
  };

  const handleSubmitMission = async () => {
    if (!activeMission) return;
    setIsSubmittingTask(true);
    const payload = {
      comment: evidenceNote || 'Contrôle effectué et conforme aux exigences opérationnelles.',
      checklistResponses: { completed: true, timestamp: new Date().toISOString() },
      evidence: evidencePhotoUrl ? [{ url: evidencePhotoUrl, type: 'IMAGE' }] : [],
    };

    try {
      const res = await mobileApiClient.submitTask(activeMission.id, payload);
      if (res.success) {
        Alert.alert('Preuve envoyée', 'La mission a été soumise avec succès pour validation par le responsable.');
        setIsSubmitModalVisible(false);
        setActiveMission({ ...activeMission, status: 'SUBMITTED', notes: payload.comment, evidenceUrls: [evidencePhotoUrl] });
        setTasks((prev) => prev.map((t) => (t.id === activeMission.id ? { ...t, status: 'SUBMITTED' } : t)));
        setCurrentView('site_profile');
      } else {
        throw new Error(res.error?.message || 'Erreur');
      }
    } catch {
      // Offline fallback
      if (orgId) {
        const opId = `op_${Date.now()}_submit`;
        await offlineSyncEngine.queueOperation(opId, orgId, 'TASK_SUBMIT', activeMission.id, payload);
        Alert.alert('Mode Hors-Ligne', 'Soumission enregistrée en local (SQLite). Sera synchronisée avec le serveur dès reconnexion.');
        setIsSubmitModalVisible(false);
        setActiveMission({ ...activeMission, status: 'SUBMITTED', notes: payload.comment, evidenceUrls: [evidencePhotoUrl] });
        setTasks((prev) => prev.map((t) => (t.id === activeMission.id ? { ...t, status: 'SUBMITTED' } : t)));
        setCurrentView('site_profile');
      }
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // -------------------------------------------------------------
  // VIEW 1: SITES DIRECTORY
  // -------------------------------------------------------------
  if (currentView === 'sites_list') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => setCurrentView('site_profile')}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sites & Établissements</Text>
          <View style={{ width: 20 }} />
        </View>

        <View style={styles.searchBarRow}>
          <View style={styles.searchField}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Rechercher un magasin..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView
          style={styles.bodyScroll}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        >
          {stores.map((site) => {
            const siteTasks = tasks.filter((t) => t.storeId === site.id);
            const siteTodo = siteTasks.filter((t) => t.status !== 'APPROVED' && t.status !== 'COMPLETED').length;
            const siteDone = siteTasks.filter((t) => t.status === 'APPROVED' || t.status === 'COMPLETED').length;
            const completion = siteTasks.length > 0 ? Math.round((siteDone / siteTasks.length) * 100) : 0;

            return (
              <TouchableOpacity
                key={site.id}
                style={[styles.siteCard, selectedStore?.id === site.id && styles.siteCardSelected]}
                onPress={() => {
                  setSelectedStore(site);
                  setCurrentView('site_profile');
                }}
              >
                <View style={styles.siteCardTop}>
                  <View style={styles.siteIconBox}>
                    <Text style={styles.siteIconEmoji}>🏬</Text>
                  </View>
                  <View style={styles.siteCardMeta}>
                    <View style={styles.siteCodeRow}>
                      <Text style={styles.siteCode}>{site.name}</Text>
                      <Text style={styles.siteDistance}>📍 {site.code || 'SITE'}</Text>
                    </View>
                    <Text style={styles.siteAddr}>{site.address || site.city || 'Adresse non renseignée'}</Text>
                    <Text style={styles.siteVisitTime}>Région: {site.region?.name || 'Standard'}</Text>
                  </View>
                </View>

                <View style={styles.siteCardGrid}>
                  <View style={styles.siteCol}>
                    <Text style={styles.siteColLabel}>À faire</Text>
                    <Text style={styles.siteColVal}>{siteTodo}</Text>
                  </View>
                  <View style={styles.siteCol}>
                    <Text style={styles.siteColLabel}>Complétion</Text>
                    <Text style={styles.siteColVal}>{completion}%</Text>
                  </View>
                  <View style={styles.siteCol}>
                    <Text style={styles.siteColLabel}>Statut</Text>
                    <Text style={styles.siteColVal}>{site.status || 'ACTIF'}</Text>
                  </View>
                  <View style={styles.siteCol}>
                    <Text style={styles.siteColLabel}>Complété</Text>
                    <Text style={styles.siteColVal}>{siteDone}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // VIEW 2: MISSION DETAILS STEPPER / TIMELINE
  // -------------------------------------------------------------
  if (currentView === 'mission_detail' && activeMission) {
    const isStarted = activeMission.status === 'IN_PROGRESS';
    const isSubmitted = activeMission.status === 'SUBMITTED';
    const isApproved = activeMission.status === 'APPROVED' || activeMission.status === 'COMPLETED';

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missionHeader}>
          <TouchableOpacity onPress={() => setCurrentView('site_profile')} style={styles.backRow}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.headerTitle}>Mission</Text>
          </TouchableOpacity>
          <View style={styles.missionHeaderIcons}>
            <TouchableOpacity style={styles.iconSquareBtn} onPress={() => setIsSubmitModalVisible(true)}>
              <Text style={styles.iconSquareText}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.missionBody} showsVerticalScrollIndicator={false}>
          <Text style={styles.missionTitle}>{activeMission.title}</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: isApproved ? '100%' : isSubmitted ? '80%' : isStarted ? '40%' : '10%' },
                ]}
              />
            </View>
            <Text style={styles.progressPercentText}>
              {isApproved ? '100%' : isSubmitted ? 'En attente' : isStarted ? 'En cours' : 'À démarrer'}
            </Text>
            <View style={styles.formBadge}>
              <Text style={styles.formBadgeText}>📋 {activeMission.priority || 'NORMAL'}</Text>
            </View>
            <View
              style={[
                styles.startedBadge,
                isApproved && { backgroundColor: '#DCFCE7' },
                isSubmitted && { backgroundColor: '#FEF3C7' },
              ]}
            >
              <Text
                style={[
                  styles.startedBadgeText,
                  isApproved && { color: '#16A34A' },
                  isSubmitted && { color: '#B45309' },
                ]}
              >
                {activeMission.status}
              </Text>
            </View>
          </View>

          {/* Stepper Timeline */}
          <View style={styles.timeline}>
            {/* Step 1: Catégorie */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>🏷️</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Catégorie & Type</Text>
                <View style={styles.purplePill}>
                  <Text style={styles.purplePillText}>{activeMission.category || 'Opérations Magasin'}</Text>
                </View>
              </View>
            </View>

            {/* Step 2: Date limite */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>🗓️</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Date d'échéance</Text>
                <View style={styles.grayPill}>
                  <Text style={styles.grayPillText}>
                    {activeMission.dueDate ? new Date(activeMission.dueDate).toLocaleDateString('fr-FR') : 'Non définie'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Step 3: Site */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>📍</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Établissement</Text>
                <Text style={styles.stepDesc}>
                  {selectedStore?.name || 'Magasin'} - {selectedStore?.address || 'Site Principal'}
                </Text>
              </View>
            </View>

            {/* Step 4: Description */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>📦</Text></View>
                <View style={styles.verticalLine} />
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Instructions de mission</Text>
                <Text style={styles.stepDesc}>{activeMission.description || 'Suivre les consignes opérationnelles du guide standard.'}</Text>
              </View>
            </View>

            {/* Step 5: Preuves & Soumission */}
            <View style={styles.stepItem}>
              <View style={styles.bulletCol}>
                <View style={styles.bulletCircle}><Text style={styles.bulletIcon}>📷</Text></View>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Preuves & Validation</Text>
                <Text style={styles.stepDesc}>
                  {activeMission.evidenceUrls?.length > 0
                    ? `✅ ${activeMission.evidenceUrls.length} photo(s) jointe(s)`
                    : 'Photo obligatoire requise pour la clôture'}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Actions */}
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={styles.abandonBtn}
            onPress={() => setCurrentView('site_profile')}
          >
            <Text style={styles.abandonText}>Retour</Text>
          </TouchableOpacity>

          {!isStarted && !isSubmitted && !isApproved ? (
            <TouchableOpacity style={styles.continueBtn} onPress={handleStartMission}>
              <Text style={styles.continueText}>Démarrer la mission</Text>
            </TouchableOpacity>
          ) : !isSubmitted && !isApproved ? (
            <TouchableOpacity style={styles.continueBtn} onPress={() => setIsSubmitModalVisible(true)}>
              <Text style={styles.continueText}>Soumettre la preuve 📷</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.continueBtn, { backgroundColor: '#10B981' }]}>
              <Text style={styles.continueText}>Mission Complétée ✓</Text>
            </View>
          )}
        </View>

        {/* Modal Preuve & Clôture */}
        <Modal visible={isSubmitModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Validation de la Mission</Text>
              <Text style={styles.modalSub}>Preuve photo et rapport de fin d'intervention</Text>

              <Text style={styles.modalLabel}>URL / Référence de la photo de preuve</Text>
              <TextInput
                style={styles.modalInput}
                value={evidencePhotoUrl}
                onChangeText={setEvidencePhotoUrl}
                placeholder="https://... photo preuve"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.modalLabel}>Remarques / Observations terrain</Text>
              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                value={evidenceNote}
                onChangeText={setEvidenceNote}
                placeholder="Ex: Rayon réapprovisionné et balisage prix conforme."
                placeholderTextColor="#94A3B8"
                multiline
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsSubmitModalVisible(false)}
                >
                  <Text style={styles.modalCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, isSubmittingTask && { opacity: 0.7 }]}
                  onPress={handleSubmitMission}
                  disabled={isSubmittingTask}
                >
                  {isSubmittingTask ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitText}>Confirmer & Soumettre</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // VIEW 3: PROFIL DU SITE (DEFAULT VIEW)
  // -------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => setCurrentView('sites_list')}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Missions Terrain</Text>
        <TouchableOpacity onPress={() => setCurrentView('sites_list')}>
          <Text style={styles.switchSiteText}>Changer</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.bodyScroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
      >
        {/* Selected Site Header Card */}
        <TouchableOpacity style={styles.profileStoreCard} onPress={() => setCurrentView('sites_list')}>
          <View style={styles.profileTopRow}>
            <View style={styles.profileIconBox}>
              <Text style={styles.profileIconEmoji}>🏢</Text>
            </View>
            <View style={styles.profileMeta}>
              <View style={styles.siteCodeRow}>
                <Text style={styles.profileStoreName}>{selectedStore?.name || 'Établissement Actif'}</Text>
                <Text style={styles.profileDistance}>📍 {selectedStore?.code || 'SITE'}</Text>
              </View>
              <Text style={styles.profileAddr}>{selectedStore?.address || 'Site Opérationnel'}</Text>
              <Text style={styles.profileVisitTime}>Région: {selectedStore?.region?.name || 'Standard'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Sub-tabs: À faire | Fait | Analyses */}
        <View style={styles.subTabsRow}>
          <TouchableOpacity
            style={[styles.subTabItem, profileTab === 'todo' && styles.subTabActive]}
            onPress={() => setProfileTab('todo')}
          >
            <Text style={[styles.subTabText, profileTab === 'todo' && styles.subTabActiveText]}>
              À faire ({todoCount})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.subTabItem, profileTab === 'done' && styles.subTabActive]}
            onPress={() => setProfileTab('done')}
          >
            <Text style={[styles.subTabText, profileTab === 'done' && styles.subTabActiveText]}>
              Fait ({doneCount})
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
        </View>

        {/* Search bar */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchField}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Filtrer les missions..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Filter Me / All */}
        <View style={styles.segmentedRow}>
          <TouchableOpacity
            style={[styles.segBtn, filterAssignee === 'me' ? styles.segBtnActive : styles.segBtnInactive]}
            onPress={() => setFilterAssignee('me')}
          >
            <Text style={[styles.segBtnText, filterAssignee === 'me' && styles.segBtnTextActive]}>
              Par moi
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segBtn, filterAssignee === 'all' ? styles.segBtnActive : styles.segBtnInactive]}
            onPress={() => setFilterAssignee('all')}
          >
            <Text style={[styles.segBtnText, filterAssignee === 'all' && styles.segBtnTextActive]}>
              Par tous ({tasks.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tasks List */}
        <View style={styles.groupSection}>
          <Text style={styles.groupHeader}>
            {profileTab === 'todo' ? 'Missions à exécuter' : 'Missions terminées / soumises'} ({filteredTasks.length})
          </Text>

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: 24 }} color="#2563EB" />
          ) : filteredTasks.length === 0 ? (
            <View style={styles.emptyTasksBox}>
              <Text style={styles.emptyTasksEmoji}>🎉</Text>
              <Text style={styles.emptyTasksTitle}>Aucune mission dans cette vue</Text>
              <Text style={styles.emptyTasksSub}>Toutes les vérifications sont à jour pour cet établissement.</Text>
            </View>
          ) : (
            filteredTasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskCardItem}
                onPress={() => {
                  setActiveMission(task);
                  setCurrentView('mission_detail');
                }}
              >
                <View style={styles.taskCardHeader}>
                  <View style={styles.taskIconBubble}>
                    <Text style={styles.taskIconEmoji}>☑️</Text>
                  </View>
                  <View style={styles.taskTitleCol}>
                    <Text style={styles.taskItemTitle}>{task.title}</Text>
                    <View style={styles.taskDateRow}>
                      <Text style={styles.dlDate}>
                        Échéance: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : 'Immédiate'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.badgesWrap}>
                  <View style={styles.formBadge}>
                    <Text style={styles.formBadgeText}>📋 {task.priority || 'NORMAL'}</Text>
                  </View>
                  <View
                    style={[
                      styles.badgeYellow,
                      task.status === 'APPROVED' && { backgroundColor: '#DCFCE7' },
                      task.status === 'IN_PROGRESS' && { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeYellowText,
                        task.status === 'APPROVED' && { color: '#16A34A' },
                        task.status === 'IN_PROGRESS' && { color: '#B45309' },
                      ]}
                    >
                      {task.status}
                    </Text>
                  </View>
                </View>

                {task.description && (
                  <Text style={styles.taskLocText} numberOfLines={2}>
                    {task.description}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
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
  navHeader: {
    height: 54,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backArrow: {
    fontSize: 28,
    color: '#0F172A',
    fontWeight: '300',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  switchSiteText: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
  },
  searchBarRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
  },
  bodyScroll: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  siteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  siteCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  siteCardTop: {
    flexDirection: 'row',
    gap: 12,
  },
  siteIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteIconEmoji: {
    fontSize: 22,
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
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  siteDistance: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
  },
  siteAddr: {
    fontSize: 12,
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
  missionHeader: {
    height: 54,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  missionHeaderIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconSquareBtn: {
    padding: 6,
  },
  iconSquareText: {
    fontSize: 18,
  },
  missionBody: {
    flex: 1,
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
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#2563EB',
    borderRadius: 3,
  },
  progressPercentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  formBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  formBadgeText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '700',
  },
  startedBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  startedBadgeText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '700',
  },
  timeline: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    lineHeight: 18,
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
    flex: 1.5,
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
  profileStoreCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  profileTopRow: {
    flexDirection: 'row',
    gap: 12,
  },
  profileIconBox: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileIconEmoji: {
    fontSize: 22,
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
    color: '#2563EB',
    fontWeight: '700',
  },
  profileAddr: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  profileVisitTime: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  subTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subTabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  subTabActive: {
    backgroundColor: '#2563EB',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  subTabActiveText: {
    color: '#FFFFFF',
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  segBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  segBtnActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  segBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  segBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  segBtnTextActive: {
    color: '#2563EB',
  },
  groupSection: {
    marginBottom: 24,
  },
  groupHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskCardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  taskCardHeader: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  taskIconBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskIconEmoji: {
    fontSize: 16,
  },
  taskTitleCol: {
    flex: 1,
  },
  taskItemTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  taskDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  dlDate: {
    fontSize: 11,
    color: '#64748B',
  },
  badgesWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  badgeYellow: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeYellowText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '700',
  },
  taskLocText: {
    fontSize: 11,
    color: '#64748B',
  },
  emptyTasksBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTasksEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTasksTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  emptyTasksSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
    marginBottom: 14,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalCancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSubmitBtn: {
    flex: 1.5,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
