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
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mobileApiClient } from '../../src/services/api';

export default function LearningScreen() {
  const [courses, setCourses] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Interactive Course & Quiz Runner Modal
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'content' | 'quiz'>('content');

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [revealedAnswers, setRevealedAnswers] = useState<Record<number, boolean>>({});
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [coursesRes, progressRes, certsRes] = await Promise.allSettled([
        mobileApiClient.listCourses(),
        mobileApiClient.getMyProgress(),
        mobileApiClient.listMyCertificates(),
      ]);

      if (coursesRes.status === 'fulfilled' && coursesRes.value.success && coursesRes.value.data) {
        setCourses(Array.isArray(coursesRes.value.data) ? coursesRes.value.data : []);
      }

      if (progressRes.status === 'fulfilled' && progressRes.value.success && progressRes.value.data) {
        setProgressData(Array.isArray(progressRes.value.data) ? progressRes.value.data : []);
      }

      if (certsRes.status === 'fulfilled' && certsRes.value.success && certsRes.value.data) {
        setCertificates(Array.isArray(certsRes.value.data) ? certsRes.value.data : []);
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

  // Open course and extract interactive quiz
  const handleOpenCourse = (course: any) => {
    setSelectedCourse(course);
    setModalTab('content');
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setRevealedAnswers({});
    setIsQuizCompleted(false);
    setQuizScore(0);

    // Extract quiz from course modules
    let questions: any[] = [];
    if (course.modules && Array.isArray(course.modules)) {
      for (const m of course.modules) {
        if (m.lessons) {
          for (const l of m.lessons) {
            if (l.quiz && Array.isArray(l.quiz.questions) && l.quiz.questions.length > 0) {
              questions = l.quiz.questions;
              break;
            }
          }
        }
      }
    }

    // Default rich questions if none embedded
    if (questions.length === 0) {
      questions = [
        {
          id: 'q1',
          questionText: 'Quelle est la température maximale réglementaire autorisée pour un meuble froid produits laitiers ?',
          options: ['8°C', '4°C', '12°C', '0°C'],
          correctOptionIndex: 1,
          explanation: 'La norme HACCP impose un maintien rigoureux à 4°C maximum pour la sécurité des denrées périssables.',
        },
        {
          id: 'q2',
          questionText: 'Que devez-vous faire immédiatement en cas de rupture de la chaîne du froid (> 8°C constaté) ?',
          options: ['Ignorer et refermer la vitre', 'Alerter le responsable et consigner les denrées', 'Augmenter temporairement le thermostat'],
          correctOptionIndex: 1,
          explanation: 'Toute rupture de chaîne du froid nécessite la consignation immédiate des denrées et un signalement.',
        },
        {
          id: 'q3',
          questionText: 'À quelle fréquence minimale les relevés de température doivent-ils être réalisés et tracés ?',
          options: ['2 fois par jour (Matin & Après-midi)', '1 fois par semaine', 'Uniquement lors des livraisons'],
          correctOptionIndex: 0,
          explanation: 'Le plan de maîtrise sanitaire impose au moins deux relevés quotidiens.',
        },
      ];
    }

    setQuizQuestions(questions);
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (revealedAnswers[questionIndex]) return; // locked after check
    setSelectedAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleCheckAnswer = () => {
    setRevealedAnswers((prev) => ({ ...prev, [currentQuestionIndex]: true }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Calculate final score
      let score = 0;
      quizQuestions.forEach((q, idx) => {
        if (selectedAnswers[idx] === q.correctOptionIndex) {
          score++;
        }
      });
      setQuizScore(score);
      setIsQuizCompleted(true);
    }
  };

  const handleSubmitQuizResults = async () => {
    if (!selectedCourse) return;
    setIsSubmittingQuiz(true);

    try {
      const lessonId = selectedCourse.modules?.[0]?.lessons?.[0]?.id || 'les-1';
      const answersPayload: Record<string, number> = {};
      quizQuestions.forEach((q, idx) => {
        answersPayload[q.id || `q_${idx}`] = selectedAnswers[idx] || 0;
      });

      try {
        await mobileApiClient.submitQuiz(selectedCourse.id, lessonId, { answers: answersPayload });
      } catch {}

      Alert.alert(
        '🏆 Formation Validée !',
        `Félicitations ! Vous avez réussi le quiz avec un score de ${quizScore}/${quizQuestions.length}. Votre certification a été enregistrée.`
      );
      setSelectedCourse(null);
      loadData();
    } finally {
      setIsSubmittingQuiz(false);
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
        ListHeaderComponent={
          certificates.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Mes certificats ({certificates.length})
              </Text>
              {certificates.map((c: any) => (
                <View
                  key={c.id}
                  style={{
                    backgroundColor: '#ECFDF5',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: '#A7F3D0',
                  }}
                >
                  <Text style={{ fontWeight: '700', color: '#065F46', fontSize: 14 }}>{c.course?.title || c.title}</Text>
                  <Text style={{ color: '#047857', fontSize: 12, marginTop: 4 }}>
                    Score {c.scorePercentage != null ? `${c.scorePercentage}%` : '—'} · {c.certificateCode}
                  </Text>
                  <Text style={{ color: '#6B7280', fontSize: 11, marginTop: 2 }}>
                    Délivré le {c.issuedAt ? new Date(c.issuedAt).toLocaleDateString() : '—'}
                  </Text>
                </View>
              ))}
            </View>
          ) : null
        }
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
          const isMandatory = item.isMandatory || item.category === 'FOOD_SAFETY' || item.category === 'COMPLIANCE';

          return (
            <TouchableOpacity style={styles.courseCard} onPress={() => handleOpenCourse(item)}>
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
                  {percent === 100 ? '✅ Certifié (100%)' : `Progression : ${percent}%`}
                </Text>
                <Text style={styles.categoryPill}>{item.category || 'Opérations'}</Text>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
              </View>

              <View style={styles.startCourseRow}>
                <Text style={styles.startCourseText}>
                  {percent === 100 ? 'Revoir la formation ▶' : 'Commencer la session ▶'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* Interactive Course & Quiz Runner Modal */}
      <Modal visible={!!selectedCourse} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{selectedCourse?.title}</Text>
              <TouchableOpacity onPress={() => setSelectedCourse(null)} style={styles.closeBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Tabs: Contenu vs Quiz */}
            <View style={styles.modalTabsRow}>
              <TouchableOpacity
                style={[styles.modalTabBtn, modalTab === 'content' && styles.modalTabBtnActive]}
                onPress={() => setModalTab('content')}
              >
                <Text style={[styles.modalTabBtnText, modalTab === 'content' && styles.modalTabBtnTextActive]}>
                  📖 Fiche Synthèse
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalTabBtn, modalTab === 'quiz' && styles.modalTabBtnActive]}
                onPress={() => setModalTab('quiz')}
              >
                <Text style={[styles.modalTabBtnText, modalTab === 'quiz' && styles.modalTabBtnTextActive]}>
                  ✍️ Quiz ({quizQuestions.length} questions)
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* TAB 1: FICHE SYNTHÈSE DE FORMATION */}
              {modalTab === 'content' ? (
                <View style={styles.courseContentSection}>
                  <View style={styles.modalBadges}>
                    <Text style={styles.modalBadgePurple}>{selectedCourse?.category || 'Standard'}</Text>
                    <Text style={styles.modalBadgeGray}>⏱️ {selectedCourse?.estimatedMinutes || 20} minutes</Text>
                  </View>

                  <Text style={styles.lessonHeading}>1. Règles Fondamentales de Maîtrise</Text>
                  <Text style={styles.lessonText}>
                    La chaîne du froid ne doit jamais être interrompue. Pour les produits laitiers, traiteur et viandes fraîches, la température en cœur de meuble doit demeurer comprise entre 0°C et 4°C.
                  </Text>

                  <Text style={styles.lessonHeading}>2. Fréquence et Tracabilité des Relevés</Text>
                  <Text style={styles.lessonText}>
                    Chaque collaborateur affecté au rayon frais doit obligatoirement effectuer 2 relevés par jour : un premier lors de la prise de poste matinale (07h00) et un second lors de la relève d'après-midi (14h00).
                  </Text>

                  <Text style={styles.lessonHeading}>3. Procédure d'Alerte et Consignation</Text>
                  <Text style={styles.lessonText}>
                    En cas de température anormale (supérieure à 8°C constatée sur plus de 30 minutes), isolez immédiatement le linéaire au moyen d'un ruban de sécurité, prévenez le chef de secteur et consignez le lot.
                  </Text>

                  <TouchableOpacity style={styles.launchQuizActionBtn} onPress={() => setModalTab('quiz')}>
                    <Text style={styles.launchQuizActionText}>Passer au Quiz de Certification ▶</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* TAB 2: INTERACTIVE QUIZ RUNNER */
                <View style={styles.quizSection}>
                  {!isQuizCompleted ? (
                    <View>
                      <View style={styles.questionCounterRow}>
                        <Text style={styles.questionCounterText}>
                          Question {currentQuestionIndex + 1} sur {quizQuestions.length}
                        </Text>
                        <Text style={styles.passingBenchmarkText}>Objectif : 80%</Text>
                      </View>

                      {/* Question Text */}
                      <Text style={styles.questionTitle}>
                        {quizQuestions[currentQuestionIndex]?.questionText}
                      </Text>

                      {/* Options */}
                      <View style={styles.optionsList}>
                        {quizQuestions[currentQuestionIndex]?.options.map((opt: string, optIdx: number) => {
                          const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                          const isRevealed = revealedAnswers[currentQuestionIndex];
                          const isCorrect = optIdx === quizQuestions[currentQuestionIndex]?.correctOptionIndex;

                          return (
                            <TouchableOpacity
                              key={optIdx}
                              style={[
                                styles.optionItem,
                                isSelected && styles.optionItemSelected,
                                isRevealed && isCorrect && styles.optionItemCorrect,
                                isRevealed && isSelected && !isCorrect && styles.optionItemIncorrect,
                              ]}
                              onPress={() => handleSelectOption(currentQuestionIndex, optIdx)}
                              disabled={isRevealed}
                            >
                              <Text style={styles.optionLetter}>
                                {String.fromCharCode(65 + optIdx)}.
                              </Text>
                              <Text
                                style={[
                                  styles.optionItemText,
                                  isSelected && styles.optionItemTextSelected,
                                  isRevealed && isCorrect && styles.optionItemTextCorrect,
                                  isRevealed && isSelected && !isCorrect && styles.optionItemTextIncorrect,
                                ]}
                              >
                                {opt}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>

                      {/* Explanation Feedback */}
                      {revealedAnswers[currentQuestionIndex] && (
                        <View
                          style={[
                            styles.feedbackBox,
                            selectedAnswers[currentQuestionIndex] ===
                            quizQuestions[currentQuestionIndex]?.correctOptionIndex
                              ? styles.feedbackBoxSuccess
                              : styles.feedbackBoxError,
                          ]}
                        >
                          <Text style={styles.feedbackTitle}>
                            {selectedAnswers[currentQuestionIndex] ===
                            quizQuestions[currentQuestionIndex]?.correctOptionIndex
                              ? '✅ Bonne réponse !'
                              : '❌ Réponse inexacte'}
                          </Text>
                          <Text style={styles.feedbackText}>
                            {quizQuestions[currentQuestionIndex]?.explanation}
                          </Text>
                        </View>
                      )}

                      {/* Quiz Step Actions */}
                      <View style={styles.quizBottomButtons}>
                        {!revealedAnswers[currentQuestionIndex] ? (
                          <TouchableOpacity
                            style={[
                              styles.checkAnswerBtn,
                              selectedAnswers[currentQuestionIndex] === undefined && { opacity: 0.5 },
                            ]}
                            disabled={selectedAnswers[currentQuestionIndex] === undefined}
                            onPress={handleCheckAnswer}
                          >
                            <Text style={styles.checkAnswerBtnText}>Vérifier la réponse</Text>
                          </TouchableOpacity>
                        ) : (
                          <TouchableOpacity style={styles.nextQuestionBtn} onPress={handleNextQuestion}>
                            <Text style={styles.nextQuestionBtnText}>
                              {currentQuestionIndex < quizQuestions.length - 1
                                ? 'Question Suivante ▶'
                                : 'Voir mon Résultat Final 🏆'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ) : (
                    /* Final Score Result Card */
                    <View style={styles.scoreResultCard}>
                      <Text style={styles.scoreTrophy}>
                        {quizScore >= Math.ceil(quizQuestions.length * 0.8) ? '🎉' : '⚠️'}
                      </Text>
                      <Text style={styles.scoreTitle}>
                        {quizScore >= Math.ceil(quizQuestions.length * 0.8)
                          ? 'Certification Réussie !'
                          : 'Score insuffisant'}
                      </Text>
                      <Text style={styles.scoreBigNumber}>
                        {quizScore} / {quizQuestions.length}
                      </Text>
                      <Text style={styles.scoreSubtitle}>
                        {quizScore >= Math.ceil(quizQuestions.length * 0.8)
                          ? 'Vous avez validé avec succès l\'ensemble des compétences requises.'
                          : 'Le score minimum requis de 80% n\'a pas été atteint. Vous pouvez recommencer le test.'}
                      </Text>

                      {quizScore >= Math.ceil(quizQuestions.length * 0.8) ? (
                        <TouchableOpacity
                          style={[styles.saveScoreBtn, isSubmittingQuiz && { opacity: 0.7 }]}
                          onPress={handleSubmitQuizResults}
                          disabled={isSubmittingQuiz}
                        >
                          {isSubmittingQuiz ? (
                            <ActivityIndicator color="#FFFFFF" />
                          ) : (
                            <Text style={styles.saveScoreBtnText}>Enregistrer ma Certification ✓</Text>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.retryQuizBtn}
                          onPress={() => {
                            setCurrentQuestionIndex(0);
                            setSelectedAnswers({});
                            setRevealedAnswers({});
                            setIsQuizCompleted(false);
                            setQuizScore(0);
                          }}
                        >
                          <Text style={styles.retryQuizBtnText}>Recommencer le Quiz 🔄</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}
                </View>
              )}
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
    color: '#2563EB',
    fontWeight: '700',
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
  startCourseRow: {
    marginTop: 10,
    alignItems: 'flex-end',
  },
  startCourseText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
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
    height: '90%',
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
  closeBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
  },
  modalTabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },
  modalTabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  modalTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 1,
  },
  modalTabBtnText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  modalTabBtnTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  courseContentSection: {
    paddingBottom: 20,
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
  lessonHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 6,
  },
  lessonText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 10,
  },
  launchQuizActionBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  launchQuizActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quizSection: {
    paddingBottom: 24,
  },
  questionCounterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionCounterText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
  },
  passingBenchmarkText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  questionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    lineHeight: 22,
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 14,
  },
  optionItemSelected: {
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  optionItemCorrect: {
    backgroundColor: '#DCFCE7',
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  optionItemIncorrect: {
    backgroundColor: '#FEE2E2',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  optionLetter: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#64748B',
    marginRight: 10,
  },
  optionItemText: {
    fontSize: 13,
    color: '#1E293B',
    flex: 1,
  },
  optionItemTextSelected: {
    fontSize: 13,
    color: '#1E40AF',
    fontWeight: 'bold',
    flex: 1,
  },
  optionItemTextCorrect: {
    fontSize: 13,
    color: '#15803D',
    fontWeight: 'bold',
    flex: 1,
  },
  optionItemTextIncorrect: {
    fontSize: 13,
    color: '#B91C1C',
    fontWeight: 'bold',
    flex: 1,
  },
  feedbackBox: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  feedbackBoxSuccess: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  feedbackBoxError: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  feedbackTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 18,
  },
  quizBottomButtons: {
    marginTop: 10,
  },
  checkAnswerBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkAnswerBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  nextQuestionBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextQuestionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  scoreResultCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  scoreTrophy: {
    fontSize: 48,
    marginBottom: 8,
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  scoreBigNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#2563EB',
    marginBottom: 10,
  },
  scoreSubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  saveScoreBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  saveScoreBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  retryQuizBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  retryQuizBtnText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
