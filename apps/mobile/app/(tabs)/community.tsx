import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { mobileApiClient } from '../../src/services/api';

export default function CommunityScreen() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'announcements' | 'posts'>('announcements');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // New Post Modal
  const [isNewPostModalVisible, setIsNewPostModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [annRes, commRes] = await Promise.allSettled([
        mobileApiClient.listAnnouncements(),
        mobileApiClient.listCommunities(),
      ]);

      if (annRes.status === 'fulfilled' && annRes.value.success && annRes.value.data) {
        setAnnouncements(Array.isArray(annRes.value.data) ? annRes.value.data : []);
      }

      if (commRes.status === 'fulfilled' && commRes.value.success && commRes.value.data) {
        const commList = Array.isArray(commRes.value.data) ? commRes.value.data : [];
        setCommunities(commList);
        const activeComm = selectedCommunity || commList[0] || null;
        if (activeComm) {
          setSelectedCommunity(activeComm);
          const postsRes = await mobileApiClient.listPosts(activeComm.id);
          if (postsRes.success && postsRes.data) {
            setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
          }
        }
      }
    } catch (err) {
      console.warn('[CommunityScreen] Error loading community feeds:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedCommunity]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const handleSelectCommunity = async (comm: any) => {
    setSelectedCommunity(comm);
    setIsLoading(true);
    try {
      const postsRes = await mobileApiClient.listPosts(comm.id);
      if (postsRes.success && postsRes.data) {
        setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
      }
    } catch (err) {
      console.warn('[CommunityScreen] Failed to load posts for community:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!selectedCommunity) {
      Alert.alert('Erreur', 'Veuillez sélectionner un canal d\'équipe.');
      return;
    }
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      Alert.alert('Champs requis', 'Veuillez renseigner un titre et un message.');
      return;
    }

    setIsSubmittingPost(true);
    try {
      const res = await mobileApiClient.createPost(selectedCommunity.id, {
        title: newPostTitle.trim(),
        content: newPostContent.trim(),
      });

      if (res.success && res.data) {
        Alert.alert('Succès', 'Votre publication a été partagée avec succès.');
        setNewPostTitle('');
        setNewPostContent('');
        setIsNewPostModalVisible(false);
        // Refresh posts list
        setPosts((prev) => [res.data.post || res.data, ...prev]);
      } else {
        Alert.alert('Erreur', res.error?.message || 'Impossible de créer la publication');
      }
    } catch (err: any) {
      Alert.alert('Erreur Réseau', err.message || 'Échec d\'envoi');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topHeader}>
        <Text style={styles.headerTitle}>Communication & Équipes</Text>
        {activeTab === 'posts' && selectedCommunity && (
          <TouchableOpacity style={styles.newPostBtn} onPress={() => setIsNewPostModalVisible(true)}>
            <Text style={styles.newPostBtnText}>+ Publier</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'announcements' && styles.tabBtnActive]}
          onPress={() => setActiveTab('announcements')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'announcements' && styles.tabBtnTextActive]}>
            📢 Annonces ({announcements.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'posts' && styles.tabBtnTextActive]}>
            👥 Échanges d'Équipe ({posts.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Channel selector when posts tab is active */}
      {activeTab === 'posts' && communities.length > 0 && (
        <View style={styles.channelScrollContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={communities}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.channelChip,
                  selectedCommunity?.id === item.id && styles.channelChipActive,
                ]}
                onPress={() => handleSelectCommunity(item)}
              >
                <Text
                  style={[
                    styles.channelChipText,
                    selectedCommunity?.id === item.id && styles.channelChipTextActive,
                  ]}
                >
                  #{item.name}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Main Content Area */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : activeTab === 'announcements' ? (
        <FlatList
          data={announcements}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📢</Text>
              <Text style={styles.emptyTitle}>Aucune annonce officielle</Text>
              <Text style={styles.emptySub}>Les communications de la direction s'afficheront ici.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.headerRow}>
                <Text style={styles.author}>{item.author?.name || 'Direction Opérations'}</Text>
                <Text style={[styles.badge, item.priority === 'HIGH' && { backgroundColor: '#FEE2E2', color: '#DC2626' }]}>
                  {item.priority || 'OFFICIEL'}
                </Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.content}</Text>
              <Text style={styles.time}>
                Publié le {new Date(item.createdAt || Date.now()).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>💬</Text>
              <Text style={styles.emptyTitle}>Aucun message dans ce canal</Text>
              <Text style={styles.emptySub}>Soyez le premier à partager une mise à jour avec l'équipe !</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.headerRow}>
                <Text style={styles.author}>{item.author?.name || user?.firstName || 'Collaborateur'}</Text>
                <Text style={styles.badge}>#{selectedCommunity?.name || 'Général'}</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.content}</Text>
              <Text style={styles.time}>
                {new Date(item.createdAt || Date.now()).toLocaleDateString('fr-FR')}
              </Text>
            </View>
          )}
        />
      )}

      {/* New Post Modal */}
      <Modal visible={isNewPostModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle Publication</Text>
            <Text style={styles.modalSub}>Canal: #{selectedCommunity?.name || 'Équipe'}</Text>

            <Text style={styles.modalLabel}>Titre de la publication</Text>
            <TextInput
              style={styles.modalInput}
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              placeholder="Ex: Mise en place rayon saisonnier terminée"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalLabel}>Message / Informations</Text>
            <TextInput
              style={[styles.modalInput, { height: 90 }]}
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="Décrivez votre avancement ou posez une question à l'équipe..."
              placeholderTextColor="#94A3B8"
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setIsNewPostModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, isSubmittingPost && { opacity: 0.7 }]}
                onPress={handleCreatePost}
                disabled={isSubmittingPost}
              >
                {isSubmittingPost ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSubmitText}>Publier le message</Text>
                )}
              </TouchableOpacity>
            </View>
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
  newPostBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  newPostBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
  },
  tabBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#2563EB',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#2563EB',
  },
  channelScrollContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  channelChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  channelChipActive: {
    backgroundColor: '#2563EB',
  },
  channelChipText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  channelChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  author: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#0F172A',
  },
  badge: {
    fontSize: 10,
    color: '#2563EB',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 6,
  },
  body: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 10,
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
