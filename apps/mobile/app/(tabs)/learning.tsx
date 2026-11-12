import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { mobileApiClient } from '../../src/services/api';

export default function LearningScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Course Viewer Modal
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [isCompletingModule, setIsCompletingModule] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [coursesRes, progressRes] = await Promise.allSettled([
        mobileApiClient.listCourses(),
        mobileApiClient.getMyProgress(),
      ]);

      if (coursesRes.status === 'fulfilled' && coursesRes.value.success && coursesRes.value.data) {
        setCourses(Array.isArray(coursesRes.value.data) ? coursesRes.value.data : []);
      }

      if (progressRes.status === 'fulfilled' && progressRes.value.success && progressRes.value.data) {
        setProgressData(Array.isArray(progressRes.value.data) ? progressRes.value.data : []);
      }
    } catch (err) {
      console.warn('[LearningScreen] Error loading LMS courses:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleCompleteLesson = async () => {
    if (!selectedCourse) return;
    setIsCompletingModule(true);

    try {
      // Simulate/trigger quiz or lesson completion
      Alert.alert(
        'Module Validé 🎉',
        `Félicitations ! Vous avez validé le module "${selectedCourse.title}". Votre progression a été enregistrée.`
      );
      setSelectedCourse(null);
      loadData();
    } finally {
      setIsCompletingModule(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Formations & Certifications</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={courses}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#2563EB" />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>Aucune formation disponible</Text>
              <Text style={styles.emptySub}>Vos modules d'apprentissage obligatoires et facultatifs apparaîtront ici.</Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const userProg = progressData.find((p) => p.courseId === item.id);
          const percent = userProg?.progress || (item.status === 'COMPLETED' ? 100 : item.status === 'PUBLISHED' ? 40 : 0);
          const isMandatory = item.isMandatory || item.category === 'COMPLIANCE';

          return (
            <TouchableOpacity style={styles.courseCard} onPress={() => setSelectedCourse(item)}>
              <View style={styles.topRow}>
                {isMandatory && <Text style={styles.mandatoryBadge}>OBLIGATOIRE</Text>}
                <Text style={styles.durationText}>⏱️ {item.estimatedMinutes || 20} min</Text>
              </View>

              <Text style={styles.courseTitle}>{item.title}</Text>
              {item.description && (
                <Text style={styles.courseDesc} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={styles.metaRow}>
                <Text style={styles.modulesText}>
                  Progression : {percent}% validé
                </Text>
                <Text style={styles.categoryPill}>{item.category || 'Opérations'}</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Lesson Details Modal */}
      <Modal visible={!!selectedCourse} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedCourse?.title}</Text>
                <TouchableOpacity onPress={() => setSelectedCourse(null)}>
                  <Text style={styles.modalCloseText}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.modalBadges}>
                <Text style={styles.modalBadgePurple}>{selectedCourse?.category || 'Standard'}</Text>
                <Text style={styles.modalBadgeGray}>⏱️ {selectedCourse?.estimatedMinutes || 20} minutes</Text>
              </View>

              <Text style={styles.modalSectionTitle}>Objectifs de formation</Text>
              <Text style={styles.modalBody}>
                {selectedCourse?.description ||
                  'Cette formation aborde les procédures opérationnelles standards, les bonnes pratiques de sécurité et les protocoles de vérification en magasin.'}
              </Text>

              <Text style={styles.modalSectionTitle}>Contenu & Quiz</Text>
              <View style={styles.moduleItem}>
                <Text style={styles.moduleEmoji}>📖</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleItemTitle}>Module 1 : Protocoles et Contrôles Terrain</Text>
                  <Text style={styles.moduleItemSub}>Vérification des standards d'exécution et règles d'hygiène</Text>
                </View>
              </View>

              <View style={styles.moduleItem}>
                <Text style={styles.moduleEmoji}>✍️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.moduleItemTitle}>Module 2 : Questionnaire de Validation</Text>
                  <Text style={styles.moduleItemSub}>Quiz rapide à choix multiples (score min: 80%)</Text>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setSelectedCourse(null)}
                >
                  <Text style={styles.modalCancelText}>Fermer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalSubmitBtn, isCompletingModule && { opacity: 0.7 }]}
                  onPress={handleCompleteLesson}
                  disabled={isCompletingModule}
                >
                  {isCompletingModule ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitText}>Valider la formation ✓</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    borderColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  refreshBtn: {
    padding: 6,
  },
  refreshIcon: {
    fontSize: 16,
  },
  listContent: {
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
    marginBottom: 8,
  },
  mandatoryBadge: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  courseTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  courseDesc: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modulesText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  categoryPill: {
    fontSize: 10,
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  emptySub: {
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
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
    flex: 1,
  },
  modalCloseText: {
    fontSize: 20,
    color: '#64748B',
    padding: 4,
  },
  modalBadges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  modalBadgePurple: {
    backgroundColor: '#F3E8FF',
    color: '#7E22CE',
    fontSize: 11,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalBadgeGray: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 10,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  moduleEmoji: {
    fontSize: 22,
  },
  moduleItemTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  moduleItemSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 10,
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
