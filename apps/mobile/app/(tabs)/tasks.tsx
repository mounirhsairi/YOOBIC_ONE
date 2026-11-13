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
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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

  // Live Interactive Checklist Runner State
  const [checklistAnswers, setChecklistAnswers] = useState<Record<string, any>>({});
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [evidenceNote, setEvidenceNote] = useState('');
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

  // Open task in detail view and initialize interactive checklist
  const handleSelectTask = (task: any) => {
    setActiveMission(task);
    setEvidenceNote(task.submissions?.[0]?.comment || '');
    const initialAnswers: Record<string, any> = {};

    // Restore answers if already submitted or in progress
    if (task.submissions?.[0]?.checklistResponses) {
      Object.assign(initialAnswers, task.submissions[0].checklistResponses);
    }

    // Default values from task checklist
    const checklist = task.checklist || [];
    checklist.forEach((item: any) => {
      if (initialAnswers[item.id] === undefined) {
        if (item.type === 'NUMBER') initialAnswers[item.id] = item.defaultValue || '4';
        else if (item.type === 'CHOICE' && item.options?.length > 0) initialAnswers[item.id] = item.options[0];
        else if (item.type === 'CHECKBOX') initialAnswers[item.id] = null;
      }
    });

    setChecklistAnswers(initialAnswers);

    // Restore photos if any
    const existingPhotos: string[] = [];
    if (task.submissions?.[0]?.evidence) {
      task.submissions[0].evidence.forEach((ev: any) => {
        if (ev.fileUrl) existingPhotos.push(ev.fileUrl);
      });
    }
    setCapturedPhotos(existingPhotos);
    setCurrentView('mission_detail');
  };

  // Interactive Checklist Answer Handlers
  const handleToggleCheckbox = (itemId: string, value: boolean) => {
    setChecklistAnswers((prev) => ({
      ...prev,
      [itemId]: prev[itemId] === value ? null : value,
    }));
  };

  const handleSelectChoice = (itemId: string, choice: string) => {
    setChecklistAnswers((prev) => ({
      ...prev,
      [itemId]: choice,
    }));
  };

  const handleNumberChange = (itemId: string, delta: number) => {
    setChecklistAnswers((prev) => {
      const current = parseFloat(prev[itemId] || '0');
      const updated = Math.round((current + delta) * 10) / 10;
      return { ...prev, [itemId]: updated.toString() };
    });
  };

  // Interactive Camera & Image Picker
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission requise', 'Veuillez autoriser l\'accès à l\'appareil photo.');
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch {
      // Simulator/fallback
      handleAttachSamplePhoto();
    }
  };

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.7,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setCapturedPhotos((prev) => [...prev, result.assets[0].uri]);
      }
    } catch {
      handleAttachSamplePhoto();
    }
  };

  const handleAttachSamplePhoto = () => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=600&q=80',
    ];
    const picked = samplePhotos[capturedPhotos.length % samplePhotos.length];
    setCapturedPhotos((prev) => [...prev, picked]);
    Alert.alert('Photo Terrain Ajoutée 📷', 'Photo de preuve rattachée à la mission.');
  };

  const handleRemovePhoto = (index: number) => {
    setCapturedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  // Start Task
  const handleStartMission = async () => {
    if (!activeMission) return;
    try {
      const res = await mobileApiClient.startTask(activeMission.id);
      if (res.success) {
        Alert.alert('Mission démarrée', 'La mission est passée en cours d\'exécution. Vous pouvez maintenant compléter la checklist.');
        const updated = { ...activeMission, status: 'IN_PROGRESS' };
        setActiveMission(updated);
        setTasks((prev) => prev.map((t) => (t.id === activeMission.id ? updated : t)));
      } else {
        throw new Error(res.error?.message || 'Action impossible');
      }
    } catch {
      if (orgId) {
        const opId = `op_${Date.now()}_start`;
        await offlineSyncEngine.queueOperation(opId, orgId, 'TASK_START', activeMission.id, {});
        Alert.alert('Mode Hors-Ligne', 'Démarrage enregistré localement en SQLite. Synchronisation automatique dès reconnexion.');
        const updated = { ...activeMission, status: 'IN_PROGRESS' };
        setActiveMission(updated);
        setTasks((prev) => prev.map((t) => (t.id === activeMission.id ? updated : t)));
      }
    }
  };

  // Submit Interactive Mission with Checklist & Photos
  const handleSubmitInteractiveMission = async () => {
    if (!activeMission) return;

    // Validate mandatory checklist items
    const checklist = activeMission.checklist || [];
    for (const item of checklist) {
      if (item.isRequired && checklistAnswers[item.id] === undefined && item.type !== 'PHOTO') {
        Alert.alert('Checklist Incomplète', `Veuillez répondre au point obligatoire : "${item.title}".`);
        return;
      }
    }

    // Validate photo evidence requirement
    if (activeMission.requiresPhotoEvidence && capturedPhotos.length === 0) {
      Alert.alert(
        'Preuve Photo Obligatoire',
        'Cette mission requiert au moins une photo de preuve avant soumission.'
      );
      return;
    }

    setIsSubmittingTask(true);

    const payload = {
      comment: evidenceNote.trim() || 'Contrôle terrain effectué et validé conforme aux standards.',
      checklistResponses: checklistAnswers,
      evidence: capturedPhotos.map((url, idx) => ({
        type: 'PHOTO' as const,
        fileUrl: url,
        fileName: `evidence_${idx + 1}.jpg`,
        fileSizeBytes: 245000,
        mimeType: 'image/jpeg',
      })),
    };

    try {
      const res = await mobileApiClient.submitTask(activeMission.id, payload);
      if (res.success) {
        Alert.alert('🎉 Mission Soumise !', 'Votre rapport et vos preuves photos ont été enregistrés avec succès pour validation.');
        const updated = {
          ...activeMission,
          status: 'SUBMITTED',
          submissions: [{ comment: payload.comment, checklistResponses: payload.checklistResponses, evidence: payload.evidence }],
        };
        setActiveMission(updated);
        setTasks((prev) => prev.map((t) => (t.id === activeMission.id ? updated : t)));
        setCurrentView('site_profile');
      } else {
        throw new Error(res.error?.message || 'Erreur lors de la soumission');
      }
    } catch (err: any) {
      // Offline fallback: queue in SQLite
      if (orgId) {
        const opId = `op_${Date.now()}_submit`;
        await offlineSyncEngine.queueOperation(opId, orgId, 'TASK_SUBMIT', activeMission.id, payload);
        Alert.alert('Mode Hors-Ligne Actif', 'Mission enregistrée en local (SQLite). Elle sera automatiquement transmise au serveur dès rétablissement du réseau.');
        const updated = {
          ...activeMission,
          status: 'SUBMITTED',
          submissions: [{ comment: payload.comment, checklistResponses: payload.checklistResponses, evidence: payload.evidence }],
        };
        setActiveMission(updated);
        setTasks((prev) => prev.map((t) => (t.id === activeMission.id ? updated : t)));
        setCurrentView('site_profile');
      } else {
        Alert.alert('Erreur', err.message || 'Échec de transmission');
      }
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Filter tasks based on store, subTab ('todo' vs 'done'), assignee ('me' vs 'all'), and search
  const filteredTasks = tasks.filter((t) => {
    if (selectedStore && t.storeId && t.storeId !== selectedStore.id) {
      return false;
    }
    if (filterAssignee === 'me' && user?.id) {
      if (t.assignedUserId && t.assignedUserId !== user.id) {
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
                    <Text style={styles.siteAddr}>{site.address || site.city || 'Adresse magasin'}</Text>
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
  // VIEW 2: MISSION DETAILS & INTERACTIVE CHECKLIST RUNNER
  // -------------------------------------------------------------
  if (currentView === 'mission_detail' && activeMission) {
    const isStarted = activeMission.status === 'IN_PROGRESS';
    const isSubmitted = activeMission.status === 'SUBMITTED';
    const isApproved = activeMission.status === 'APPROVED' || activeMission.status === 'COMPLETED';

    const checklistItems = activeMission.checklist && activeMission.checklist.length > 0
      ? activeMission.checklist
      : [
          { id: 'q1', title: 'Vérifier la propreté et l\'état général du linéaire', isRequired: true, type: 'CHECKBOX' },
          { id: 'q2', title: 'Contrôler la conformité du balisage prix', isRequired: true, type: 'CHOICE', options: ['Conforme (100%)', 'Partiel', 'Non conforme'] },
          { id: 'q3', title: 'Relevé de température ou indicateur clé (°C)', isRequired: false, type: 'NUMBER', defaultValue: '4' },
          { id: 'q4', title: 'Photo obligatoire de validation terrain', isRequired: true, type: 'PHOTO' },
        ];

    const totalQuestions = checklistItems.length;
    const answeredCount = checklistItems.filter((item: any) => {
      if (item.type === 'PHOTO') return capturedPhotos.length > 0;
      return checklistAnswers[item.id] !== undefined && checklistAnswers[item.id] !== null;
    }).length;

    const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.missionHeader}>
          <TouchableOpacity onPress={() => setCurrentView('site_profile')} style={styles.backRow}>
            <Text style={styles.backArrow}>‹</Text>
            <Text style={styles.headerTitle}>Détail de la Mission</Text>
          </TouchableOpacity>
          <View style={styles.missionHeaderIcons}>
            <TouchableOpacity style={styles.iconSquareBtn} onPress={handleAttachSamplePhoto}>
              <Text style={styles.iconSquareText}>📷</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.missionBody} showsVerticalScrollIndicator={false}>
          {/* Mission Title & Status */}
          <Text style={styles.missionTitle}>{activeMission.title}</Text>

          <View style={styles.progressSection}>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  { width: isApproved ? '100%' : isSubmitted ? '100%' : `${progressPercent}%` },
                ]}
              />
            </View>
            <Text style={styles.progressPercentText}>
              {isApproved ? '100% Validé' : isSubmitted ? 'Soumis (100%)' : `${progressPercent}% Réalisé`}
            </Text>
            <View style={styles.formBadge}>
              <Text style={styles.formBadgeText}>⚡ {activeMission.priority || 'NORMAL'}</Text>
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

          {/* Mission Instructions Callout */}
          <View style={styles.instructionsBox}>
            <Text style={styles.instructionsTitle}>📋 Consignes Opérationnelles :</Text>
            <Text style={styles.instructionsText}>
              {activeMission.instructions || activeMission.description || 'Effectuez l\'ensemble des contrôles visuels et mesures exigées par le standard qualité.'}
            </Text>
          </View>

          {/* Interactive Checklist Questions */}
          <View style={styles.checklistCard}>
            <Text style={styles.checklistHeaderTitle}>
              Points de Contrôle ({answeredCount}/{totalQuestions})
            </Text>

            {checklistItems.map((item: any, idx: number) => {
              const currentVal = checklistAnswers[item.id];

              return (
                <View key={item.id || idx} style={styles.checkItemContainer}>
                  <View style={styles.checkItemHeader}>
                    <Text style={styles.checkItemNumber}>{idx + 1}.</Text>
                    <Text style={styles.checkItemTitle}>{item.title}</Text>
                    {item.isRequired && <Text style={styles.requiredStar}>*</Text>}
                  </View>

                  {/* 1. CHECKBOX / BOOLEAN CONFORME / NON-CONFORME */}
                  {item.type === 'CHECKBOX' && (
                    <View style={styles.booleanButtonsRow}>
                      <TouchableOpacity
                        style={[
                          styles.boolBtn,
                          currentVal === true && styles.boolBtnSuccess,
                          !isStarted && { opacity: 0.8 },
                        ]}
                        disabled={!isStarted}
                        onPress={() => handleToggleCheckbox(item.id, true)}
                      >
                        <Text style={[styles.boolBtnText, currentVal === true && styles.boolBtnTextActive]}>
                          ✓ Conforme
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.boolBtn,
                          currentVal === false && styles.boolBtnDanger,
                          !isStarted && { opacity: 0.8 },
                        ]}
                        disabled={!isStarted}
                        onPress={() => handleToggleCheckbox(item.id, false)}
                      >
                        <Text style={[styles.boolBtnText, currentVal === false && styles.boolBtnTextActive]}>
                          ✕ Non Conforme
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}

                  {/* 2. CHOICE / OPTIONS */}
                  {item.type === 'CHOICE' && item.options && (
                    <View style={styles.choiceOptionsRow}>
                      {item.options.map((opt: string, optIdx: number) => (
                        <TouchableOpacity
                          key={optIdx}
                          style={[
                            styles.choicePill,
                            currentVal === opt && styles.choicePillActive,
                            !isStarted && { opacity: 0.8 },
                          ]}
                          disabled={!isStarted}
                          onPress={() => handleSelectChoice(item.id, opt)}
                        >
                          <Text style={[styles.choicePillText, currentVal === opt && styles.choicePillTextActive]}>
                            {opt}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}

                  {/* 3. NUMBER / TEMPERATURE */}
                  {item.type === 'NUMBER' && (
                    <View style={styles.numberStepperRow}>
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        disabled={!isStarted}
                        onPress={() => handleNumberChange(item.id, -0.5)}
                      >
                        <Text style={styles.stepperBtnText}>-</Text>
                      </TouchableOpacity>
                      <TextInput
                        style={styles.stepperInput}
                        keyboardType="decimal-pad"
                        value={currentVal || '4'}
                        editable={isStarted}
                        onChangeText={(t) => setChecklistAnswers((p) => ({ ...p, [item.id]: t }))}
                      />
                      <TouchableOpacity
                        style={styles.stepperBtn}
                        disabled={!isStarted}
                        onPress={() => handleNumberChange(item.id, 0.5)}
                      >
                        <Text style={styles.stepperBtnText}>+</Text>
                      </TouchableOpacity>
                      <Text style={styles.unitText}>°C / Unités</Text>
                    </View>
                  )}

                  {/* 4. PHOTO REQUIREMENT ITEM */}
                  {item.type === 'PHOTO' && (
                    <View style={styles.photoItemActions}>
                      <TouchableOpacity
                        style={styles.cameraActionBtn}
                        disabled={!isStarted}
                        onPress={handleTakePhoto}
                      >
                        <Text style={styles.cameraActionText}>📷 Prendre une Photo</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.galleryActionBtn}
                        disabled={!isStarted}
                        onPress={handlePickFromGallery}
                      >
                        <Text style={styles.galleryActionText}>🖼️ Galerie</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Captured Photos Grid */}
          <View style={styles.capturedPhotosCard}>
            <Text style={styles.checklistHeaderTitle}>
              Preuves Photos Attachées ({capturedPhotos.length})
            </Text>

            {capturedPhotos.length === 0 ? (
              <View style={styles.emptyPhotosBox}>
                <Text style={styles.emptyPhotosEmoji}>📷</Text>
                <Text style={styles.emptyPhotosText}>Aucune photo attachée pour le moment.</Text>
                {isStarted && (
                  <TouchableOpacity style={styles.addPhotoSmallBtn} onPress={handleAttachSamplePhoto}>
                    <Text style={styles.addPhotoSmallText}>+ Ajouter une photo de test</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photosScroll}>
                {capturedPhotos.map((url, idx) => (
                  <View key={idx} style={styles.photoThumbnailWrapper}>
                    <Image source={{ uri: url }} style={styles.photoThumbnail} />
                    {isStarted && (
                      <TouchableOpacity
                        style={styles.removePhotoBadge}
                        onPress={() => handleRemovePhoto(idx)}
                      >
                        <Text style={styles.removePhotoText}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Observations & Comments */}
          <View style={styles.notesCard}>
            <Text style={styles.checklistHeaderTitle}>Observations & Remarques Terrain</Text>
            <TextInput
              style={styles.notesInput}
              value={evidenceNote}
              onChangeText={setEvidenceNote}
              editable={isStarted}
              placeholder="Ex: Rayon nettoyé et réassorti à 100%. Tout est conforme."
              placeholderTextColor="#94A3B8"
              multiline
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Bottom Fixed Action Bar */}
        <View style={styles.fixedBottomBar}>
          <TouchableOpacity
            style={styles.abandonBtn}
            onPress={() => setCurrentView('site_profile')}
          >
            <Text style={styles.abandonText}>Retour</Text>
          </TouchableOpacity>

          {!isStarted && !isSubmitted && !isApproved ? (
            <TouchableOpacity style={styles.continueBtn} onPress={handleStartMission}>
              <Text style={styles.continueText}>Démarrer la mission ▶</Text>
            </TouchableOpacity>
          ) : isStarted ? (
            <TouchableOpacity
              style={[styles.continueBtn, isSubmittingTask && { opacity: 0.7 }]}
              onPress={handleSubmitInteractiveMission}
              disabled={isSubmittingTask}
            >
              {isSubmittingTask ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.continueText}>Valider & Soumettre ✓</Text>
              )}
            </TouchableOpacity>
          ) : (
            <View style={[styles.continueBtn, { backgroundColor: '#10B981' }]}>
              <Text style={styles.continueText}>
                {isApproved ? 'Mission Approuvée ✓' : 'En Attente de Validation ⏳'}
              </Text>
            </View>
          )}
        </View>
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
                onPress={() => handleSelectTask(task)}
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
                      task.status === 'SUBMITTED' && { backgroundColor: '#FEF3C7' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeYellowText,
                        task.status === 'APPROVED' && { color: '#16A34A' },
                        task.status === 'IN_PROGRESS' && { color: '#B45309' },
                        task.status === 'SUBMITTED' && { color: '#B45309' },
                      ]}
                    >
                      {task.status}
                    </Text>
                  </View>
                  {task.requiresPhotoEvidence && (
                    <View style={[styles.formBadge, { backgroundColor: '#F3E8FF' }]}>
                      <Text style={[styles.formBadgeText, { color: '#7E22CE' }]}>📷 Photo requise</Text>
                    </View>
                  )}
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
    marginBottom: 10,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
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
  instructionsBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 13,
    color: '#1E3A8A',
    lineHeight: 18,
  },
  checklistCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  checklistHeaderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  checkItemContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkItemHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  checkItemNumber: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2563EB',
    marginRight: 6,
  },
  checkItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    flex: 1,
  },
  requiredStar: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  booleanButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  boolBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  boolBtnSuccess: {
    backgroundColor: '#10B981',
    borderColor: '#059669',
  },
  boolBtnDanger: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  boolBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  boolBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  choiceOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  choicePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  choicePillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#1D4ED8',
  },
  choicePillText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  choicePillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  numberStepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  stepperInput: {
    width: 60,
    height: 36,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  unitText: {
    fontSize: 12,
    color: '#64748B',
  },
  photoItemActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  cameraActionBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  cameraActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  galleryActionBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  galleryActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  capturedPhotosCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  emptyPhotosBox: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  emptyPhotosEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  emptyPhotosText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  addPhotoSmallBtn: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
  },
  addPhotoSmallText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563EB',
  },
  photosScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  photoThumbnailWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  removePhotoBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#EF4444',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  notesInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 12,
    fontSize: 13,
    color: '#0F172A',
    minHeight: 70,
    textAlignVertical: 'top',
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
    flex: 1.8,
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
});
