import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { mobileApiClient } from '../../src/services/api';

type Field = {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  max?: number;
  options?: string[];
  url?: string;
  content?: string;
  fileName?: string;
  fileSize?: string;
};

type Page = { id: string; title: string; fields: Field[] };

type MissionData = {
  task: any;
  form: {
    id: string;
    title: string;
    description?: string;
    category?: string;
    pages: Page[];
    estimatedDurationMinutes?: number;
    contentSummary?: { pages: number; photos: number; questions: number };
  } | null;
  progress: {
    startedAt?: string;
    currentPageIndex?: number;
    answers?: Record<string, any>;
    completedPages?: number[];
  } | null;
};

type ViewMode = 'detail' | 'summary' | 'page';

export default function MissionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<MissionData | null>(null);
  const [view, setView] = useState<ViewMode>('detail');
  const [pageIndex, setPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await mobileApiClient.getMission(id);
      if (res.success && res.data) {
        setData(res.data);
        const prog = res.data.progress;
        setAnswers(prog?.answers || {});
        if (prog?.startedAt) {
          setView('summary');
          setPageIndex(prog.currentPageIndex || 0);
        } else {
          setView('detail');
        }
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de charger la mission');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const pages: Page[] = data?.form?.pages || [];
  const task = data?.task;
  const isStarted = !!(data?.progress?.startedAt || task?.status === 'IN_PROGRESS');

  const progressPct = useMemo(() => {
    if (!pages.length) return 0;
    const completed = (data?.progress?.completedPages || []).length;
    return Math.round((completed / pages.length) * 100);
  }, [pages, data?.progress]);

  const setAnswer = (fieldId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleStart = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await mobileApiClient.startMission(id);
      await load();
      setView('summary');
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Impossible de démarrer');
    } finally {
      setSaving(false);
    }
  };

  const handleAbandon = () => {
    Alert.alert('Abandonner', 'Réinitialiser la progression de cette mission ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Abandonner',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          await mobileApiClient.abandonMission(id);
          await load();
          setView('detail');
          setAnswers({});
        },
      },
    ]);
  };

  const saveAndGo = async (nextIndex: number, markCurrentComplete: boolean) => {
    if (!id) return;
    setSaving(true);
    try {
      const completed = new Set(data?.progress?.completedPages || []);
      if (markCurrentComplete) completed.add(pageIndex);
      await mobileApiClient.saveMissionProgress(id, {
        answers,
        currentPageIndex: nextIndex,
        completedPages: Array.from(completed),
      });
      await load();
      if (nextIndex >= pages.length) {
        // final submit via existing task submit if available
        try {
          await mobileApiClient.submitTask?.(id, {
            comment: 'Formulaire mission complété',
            checklistResponses: answers,
          });
        } catch {
          // optional
        }
        Alert.alert('Envoyé', 'Mission envoyée avec succès', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        setPageIndex(nextIndex);
        setView('page');
      }
    } catch (e: any) {
      Alert.alert('Erreur', e.message || 'Sauvegarde impossible');
    } finally {
      setSaving(false);
    }
  };

  const pickPhoto = async (field: Field) => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission', 'Autorisez la caméra pour ajouter des photos');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const uri = result.assets[0].uri;
    const current = Array.isArray(answers[field.id]) ? answers[field.id] : [];
    const max = field.max || 5;
    if (current.length >= max) {
      Alert.alert('Limite', `Maximum ${max} photos`);
      return;
    }
    setAnswer(field.id, [...current, uri]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      </SafeAreaView>
    );
  }

  if (!task) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text>Mission introuvable</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: '#2563EB', marginTop: 12 }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── DETAIL (image 1) ──
  if (view === 'detail') {
    const summary = data?.form?.contentSummary;
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topTitle}>Mission</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={styles.iconBtn}><Ionicons name="download-outline" size={20} color="#2563EB" /></View>
            <View style={styles.iconBtn}><Ionicons name="chatbubble-outline" size={20} color="#64748B" /></View>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.missionTitle}>{task.title}</Text>
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
            </View>
            <Text style={styles.progressPct}>{progressPct}%</Text>
            <View style={styles.badgeBlue}>
              <Ionicons name="document-text-outline" size={12} color="#2563EB" />
              <Text style={styles.badgeBlueText}>Formulaire</Text>
            </View>
            <View style={[styles.badgeSoft, isStarted && styles.badgeOrange]}>
              <Text style={[styles.badgeSoftText, isStarted && { color: '#EA580C' }]}>
                {isStarted ? 'Démarré' : 'À faire'}
              </Text>
            </View>
          </View>

          <TimelineItem icon="pricetag-outline" label="Catégorie">
            <View style={styles.chipPurple}>
              <Text style={styles.chipPurpleText}>{task.category || data?.form?.category || '—'}</Text>
            </View>
          </TimelineItem>
          <TimelineItem icon="calendar-outline" label="Date de réception">
            <View style={styles.chipGray}>
              <Text style={styles.chipGrayText}>
                {task.createdAt ? new Date(task.createdAt).toLocaleString('fr-FR') : '—'}
              </Text>
            </View>
          </TimelineItem>
          <TimelineItem icon="calendar-outline" label="Date limite">
            <View style={styles.chipGray}>
              <Text style={styles.chipGrayText}>
                {task.dueDate ? new Date(task.dueDate).toLocaleString('fr-FR', { weekday: 'long', hour: '2-digit', minute: '2-digit' }) : '—'}
              </Text>
            </View>
          </TimelineItem>
          <TimelineItem icon="location-outline" label="Site">
            <Text style={styles.bodyText}>
              {task.store ? `${task.store.code || ''} - ${task.store.name}` : '—'}
            </Text>
          </TimelineItem>
          <TimelineItem icon="cube-outline" label="Description de la mission">
            <Text style={styles.bodyText}>{task.description || data?.form?.description || '—'}</Text>
          </TimelineItem>
          <TimelineItem icon="attach-outline" label="Contenu">
            <Text style={styles.bodyText}>
              📄 {summary?.pages ?? pages.length} pages{'  '}
              📷 {summary?.photos ?? 0} photos{'  '}
              ❓ {summary?.questions ?? 0} questions
            </Text>
          </TimelineItem>
          <TimelineItem icon="time-outline" label="Durée estimée" last>
            <Text style={styles.bodyText}>{task.estimatedDurationMinutes || data?.form?.estimatedDurationMinutes || '—'} min</Text>
          </TimelineItem>
        </ScrollView>

        <View style={styles.footer}>
          {isStarted ? (
            <>
              <TouchableOpacity style={styles.btnOutline} onPress={handleAbandon}>
                <Text style={styles.btnOutlineText}>Abandonner</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnPrimary}
                onPress={() => setView('summary')}
              >
                <Text style={styles.btnPrimaryText}>Continuer</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={handleStart} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Démarrer</Text>}
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // ── SUMMARY (synthèse) ──
  if (view === 'summary') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setView('detail')} style={styles.iconBtn}>
            <Ionicons name="chevron-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.topTitle} numberOfLines={1}>{task.title}</Text>
          <View style={styles.iconBtn}><Ionicons name="ellipsis-vertical" size={18} color="#64748B" /></View>
        </View>

        <ScrollView contentContainerStyle={styles.pad}>
          <Text style={styles.synthTitle}>Synthèse</Text>
          <View style={styles.progressTrackFull}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressRight}>{progressPct}%</Text>

          {pages.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              style={styles.pageCard}
              onPress={() => {
                setPageIndex(i);
                setView('page');
              }}
            >
              <View style={styles.flagCircle}>
                <Ionicons name="flag" size={18} color="#2563EB" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.pageCardTitle}>Page {i + 1}</Text>
                <Text style={styles.pageCardSub}>{p.title}</Text>
              </View>
              {(data?.progress?.completedPages || []).includes(i) && (
                <Ionicons name="checkmark-circle" size={22} color="#16A34A" />
              )}
            </TouchableOpacity>
          ))}

          {!pages.length && (
            <Text style={styles.bodyText}>
              Aucun formulaire lié. Assignez un modèle de formulaire à cette mission depuis l&apos;admin.
            </Text>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.btnPrimary, { flex: 1 }]}
            onPress={() => {
              if (!pages.length) return;
              setPageIndex(0);
              setView('page');
            }}
            disabled={!pages.length}
          >
            <Text style={styles.btnPrimaryText}>{isStarted && progressPct > 0 ? 'Continuer' : 'Démarrer'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── PAGE RUNNER ──
  const page = pages[pageIndex];
  if (!page) {
    setView('summary');
    return null;
  }

  const isLast = pageIndex >= pages.length - 1;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => setView('summary')} style={styles.iconBtn}>
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.topTitle} numberOfLines={1}>{task.title}</Text>
        <View style={styles.iconBtn}><Ionicons name="ellipsis-vertical" size={18} color="#64748B" /></View>
      </View>

      {/* Stepper */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.stepper} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }}>
        {pages.map((_, i) => (
          <React.Fragment key={i}>
            {i > 0 && <View style={[styles.stepLine, i <= pageIndex && styles.stepLineActive]} />}
            <TouchableOpacity
              style={[styles.stepDot, i === pageIndex && styles.stepDotActive, (data?.progress?.completedPages || []).includes(i) && styles.stepDotDone]}
              onPress={() => setPageIndex(i)}
            >
              <Ionicons name="flag" size={14} color={i === pageIndex ? '#2563EB' : '#94A3B8'} />
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </ScrollView>
      <Text style={styles.stepLabel}>{pageIndex + 1}. {page.title}</Text>

      <ScrollView contentContainerStyle={styles.pad}>
        {page.fields.map((field) => (
          <FieldRenderer
            key={field.id}
            field={field}
            value={answers[field.id]}
            onChange={(v) => setAnswer(field.id, v)}
            onPickPhoto={() => pickPhoto(field)}
          />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btnPrimary, { flex: 1 }, saving && { opacity: 0.7 }]}
          disabled={saving}
          onPress={() => saveAndGo(isLast ? pages.length : pageIndex + 1, true)}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>{isLast ? 'Envoyer' : 'Suivant'}</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function TimelineItem({
  icon,
  label,
  children,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <View style={styles.tlRow}>
      <View style={styles.tlLeft}>
        <View style={styles.tlIcon}>
          <Ionicons name={icon} size={16} color="#2563EB" />
        </View>
        {!last && <View style={styles.tlLine} />}
      </View>
      <View style={styles.tlBody}>
        <Text style={styles.tlLabel}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
  onPickPhoto,
}: {
  field: Field;
  value: any;
  onChange: (v: any) => void;
  onPickPhoto: () => void;
}) {
  if (field.type === 'instruction' || field.type === 'info') {
    return (
      <View style={styles.fieldCard}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
          <Ionicons name="information-circle-outline" size={20} color="#64748B" />
          <View style={{ flex: 1 }}>
            {field.label ? <Text style={styles.fieldLabel}>{field.label}</Text> : null}
            {field.content ? <Text style={styles.infoText}>{field.content}</Text> : null}
          </View>
        </View>
      </View>
    );
  }

  if (field.type === 'image' && field.url) {
    return (
      <View style={styles.fieldCard}>
        {field.label ? <Text style={styles.fieldLabel}>{field.label}</Text> : null}
        <Image source={{ uri: field.url }} style={styles.refImage} resizeMode="cover" />
      </View>
    );
  }

  if (field.type === 'document') {
    return (
      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>{field.label || 'Document'}</Text>
        <TouchableOpacity
          style={styles.docRow}
          onPress={() => field.url && Linking.openURL(field.url)}
        >
          <Ionicons name="document-text" size={22} color="#DC2626" />
          <Text style={styles.docName} numberOfLines={1}>
            {field.fileName || field.url || 'PDF'}
          </Text>
          {field.fileSize ? <Text style={styles.docSize}>{field.fileSize}</Text> : null}
        </TouchableOpacity>
      </View>
    );
  }

  if (field.type === 'photo') {
    const photos: string[] = Array.isArray(value) ? value : [];
    return (
      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        <Text style={styles.hint}>Max: {field.max || 5}</Text>
        <View style={styles.photoGrid}>
          {photos.map((uri, i) => (
            <Image key={i} source={{ uri }} style={styles.photoThumb} />
          ))}
          <TouchableOpacity style={styles.photoAdd} onPress={onPickPhoto}>
            <Ionicons name="camera" size={28} color="#2563EB" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (field.type === 'yes_no') {
    const opts = field.options?.length ? field.options : ['Oui', 'Non'];
    const isPair = opts.length === 2;
    return (
      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        {isPair ? (
          <View style={styles.yesNoRow}>
            {opts.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.yesNoBtn, value === opt && styles.yesNoBtnActive]}
                onPress={() => onChange(opt)}
              >
                <Text style={[styles.yesNoText, value === opt && styles.yesNoTextActive]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          opts.map((opt) => (
            <TouchableOpacity key={opt} style={styles.radioRow} onPress={() => onChange(opt)}>
              <Text style={styles.radioLabel}>{opt}</Text>
              <View style={[styles.radioOuter, value === opt && styles.radioOuterOn]}>
                {value === opt && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    );
  }

  if (field.type === 'select') {
    const opts = field.options || [];
    return (
      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        {opts.map((opt) => (
          <TouchableOpacity key={opt} style={styles.radioRow} onPress={() => onChange(opt)}>
            <Text style={styles.radioLabel}>{opt}</Text>
            <View style={[styles.radioOuter, value === opt && styles.radioOuterOn]}>
              {value === opt && <View style={styles.radioInner} />}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  if (field.type === 'number') {
    return (
      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        <View style={styles.inputRow}>
          <Ionicons name="keypad-outline" size={18} color="#94A3B8" />
          <TextInput
            style={styles.input}
            keyboardType="number-pad"
            value={value != null ? String(value) : ''}
            onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
            placeholder=""
          />
        </View>
      </View>
    );
  }

  if (field.type === 'textarea') {
    return (
      <View style={styles.fieldCard}>
        <Text style={styles.fieldLabel}>{field.label}</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          multiline
          value={value || ''}
          onChangeText={onChange}
        />
      </View>
    );
  }

  // text default
  return (
    <View style={styles.fieldCard}>
      <Text style={styles.fieldLabel}>{field.label}</Text>
      <View style={styles.inputRow}>
        <Ionicons name="create-outline" size={18} color="#94A3B8" />
        <TextInput style={styles.input} value={value || ''} onChangeText={onChange} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F8FAFC' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  topTitle: { flex: 1, fontSize: 17, fontWeight: '600', color: '#0F172A', marginHorizontal: 8 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  pad: { padding: 16, paddingBottom: 32 },
  missionTitle: { fontSize: 22, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  progressTrack: { flex: 1, height: 4, backgroundColor: '#E2E8F0', borderRadius: 2, minWidth: 80 },
  progressTrackFull: { height: 3, backgroundColor: '#E2E8F0', borderRadius: 2, marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 2 },
  progressPct: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  progressRight: { textAlign: 'right', fontSize: 12, color: '#94A3B8', marginBottom: 12 },
  badgeBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeBlueText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },
  badgeSoft: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeOrange: { backgroundColor: '#FFF7ED' },
  badgeSoftText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  chipPurple: { alignSelf: 'flex-start', backgroundColor: '#F3E8FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chipPurpleText: { color: '#7C3AED', fontSize: 13, fontWeight: '600' },
  chipGray: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  chipGrayText: { color: '#475569', fontSize: 13 },
  bodyText: { fontSize: 14, color: '#334155', lineHeight: 20 },
  tlRow: { flexDirection: 'row', marginBottom: 4 },
  tlLeft: { width: 32, alignItems: 'center' },
  tlIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tlLine: { width: 2, flex: 1, backgroundColor: '#E2E8F0', marginVertical: 4 },
  tlBody: { flex: 1, paddingBottom: 16, paddingLeft: 8 },
  tlLabel: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
  },
  btnPrimary: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnPrimaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  btnOutline: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnOutlineText: { color: '#0F172A', fontSize: 16, fontWeight: '600' },
  synthTitle: { fontSize: 28, fontWeight: '700', color: '#0F172A', marginBottom: 12 },
  pageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  flagCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageCardTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A' },
  pageCardSub: { fontSize: 13, color: '#64748B', marginTop: 2 },
  stepper: { maxHeight: 48, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E2E8F0' },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  stepDotActive: { borderColor: '#2563EB', borderWidth: 2 },
  stepDotDone: { backgroundColor: '#EFF6FF' },
  stepLine: { width: 24, height: 2, backgroundColor: '#E2E8F0' },
  stepLineActive: { backgroundColor: '#93C5FD' },
  stepLabel: { textAlign: 'center', fontSize: 13, color: '#64748B', paddingVertical: 8, backgroundColor: '#fff' },
  fieldCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldLabel: { fontSize: 15, fontWeight: '600', color: '#0F172A', marginBottom: 10 },
  infoText: { fontSize: 14, color: '#475569', lineHeight: 20 },
  hint: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  yesNoRow: { flexDirection: 'row', gap: 10 },
  yesNoBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  yesNoBtnActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  yesNoText: { fontSize: 15, fontWeight: '600', color: '#0F172A' },
  yesNoTextActive: { color: '#2563EB' },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F1F5F9',
  },
  radioLabel: { fontSize: 15, color: '#0F172A', flex: 1 },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterOn: { borderColor: '#2563EB' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#2563EB' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, color: '#0F172A' },
  textarea: {
    minHeight: 90,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 12,
    textAlignVertical: 'top',
  },
  photoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  photoThumb: { width: 72, height: 72, borderRadius: 10 },
  photoAdd: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refImage: { width: '100%', height: 200, borderRadius: 12, backgroundColor: '#F1F5F9' },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
  },
  docName: { flex: 1, fontSize: 13, color: '#334155' },
  docSize: { fontSize: 12, color: '#94A3B8' },
});
