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
  ScrollView,
} from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { mobileApiClient } from '../../src/services/api';

export default function CommunityScreen() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'announcements' | 'posts'>('posts');
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [communities, setCommunities] = useState<any[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<any | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Post Comments Thread Modal
  const [activePostThread, setActivePostThread] = useState<any | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // New Post Modal
  const [isNewPostModalVisible, setIsNewPostModalVisible] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Reactions state (local optimistic)
  const [reactions, setReactions] = useState<Record<string, number>>({});

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

  const handleLikePost = (postId: string) => {
    setReactions((prev) => ({
      ...prev,
      [postId]: (prev[postId] || 0) + 1,
    }));
  };

  const handleOpenThread = (post: any) => {
    setActivePostThread(post);
    setCommentInput('');
  };

  const handleAddComment = async () => {
    if (!activePostThread || !commentInput.trim()) return;
    setIsSubmittingComment(true);

    const newCommentContent = commentInput.trim();
    try {
      const res = await mobileApiClient.createComment(activePostThread.id, {
        content: newCommentContent,
      });

      const newComment = res.success && res.data ? res.data : {
        id: `c_${Date.now()}`,
        content: newCommentContent,
        createdAt: new Date().toISOString(),
        author: { firstName: user?.firstName || 'Moi', lastName: user?.lastName || '' },
      };

      // Append comment to active thread
      const updatedComments = [...(activePostThread.comments || []), newComment];
      const updatedThread = {
        ...activePostThread,
        comments: updatedComments,
        commentsCount: (activePostThread.commentsCount || 0) + 1,
      };

      setActivePostThread(updatedThread);
      setPosts((prev) => prev.map((p) => (p.id === activePostThread.id ? updatedThread : p)));
      setCommentInput('');
    } catch (err: any) {
      Alert.alert('Erreur', err.message || 'Impossible d\'envoyer le commentaire');
    } finally {
      setIsSubmittingComment(false);
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
        Alert.alert('Succès', 'Votre message a été publié dans le canal d\'équipe.');
        setNewPostTitle('');
        setNewPostContent('');
        setIsNewPostModalVisible(false);
        const created = res.data.post || res.data;
        setPosts((prev) => [created, ...prev]);
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
        <Text style={styles.headerTitle}>Communication Terrain</Text>
        {activeTab === 'posts' && selectedCommunity && (
          <TouchableOpacity style={styles.newPostBtn} onPress={() => setIsNewPostModalVisible(true)}>
            <Text style={styles.newPostBtnText}>+ Publier</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs Row */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'posts' && styles.tabBtnTextActive]}>
            👥 Fil d'Équipe ({posts.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === 'announcements' && styles.tabBtnActive]}
          onPress={() => setActiveTab('announcements')}
        >
          <Text style={[styles.tabBtnText, activeTab === 'announcements' && styles.tabBtnTextActive]}>
            📢 Annonces HQ ({announcements.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Channel selector */}
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

      {/* Main List */}
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
              <Text style={styles.emptySub}>Partagez une astuce ou posez une question à l'équipe !</Text>
            </View>
          }
          renderItem={({ item }) => {
            const authorName = item.author?.firstName ? `${item.author.firstName} ${item.author.lastName || ''}`.trim() : 'Collaborateur';
            const commentsCount = item.comments?.length || item.commentsCount || 0;
            const likesCount = (reactions[item.id] || 0) + (item.likesCount || 2);

            return (
              <TouchableOpacity style={styles.postCard} onPress={() => handleOpenThread(item)}>
                <View style={styles.headerRow}>
                  <View style={styles.authorGroup}>
                    <View style={styles.avatarMini}>
                      <Text style={styles.avatarMiniText}>{authorName[0]}</Text>
                    </View>
                    <Text style={styles.author}>{authorName}</Text>
                  </View>
                  <Text style={styles.badge}>#{selectedCommunity?.name || 'Général'}</Text>
                </View>

                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.body}>{item.content}</Text>

                {/* Social Action Bar */}
                <View style={styles.postActionBar}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleLikePost(item.id)}
                  >
                    <Text style={styles.actionBtnText}>👍 {likesCount} J'aime</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleOpenThread(item)}
                  >
                    <Text style={styles.actionBtnText}>💬 {commentsCount} Commentaires</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Discussion Thread Modal */}
      <Modal visible={!!activePostThread} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>Discussion d'équipe</Text>
              <TouchableOpacity onPress={() => setActivePostThread(null)} style={styles.closeBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
              {/* Original Post */}
              <View style={styles.threadOriginalPost}>
                <Text style={styles.threadPostAuthor}>
                  {activePostThread?.author?.firstName || 'Collaborateur'}
                </Text>
                <Text style={styles.threadPostTitle}>{activePostThread?.title}</Text>
                <Text style={styles.threadPostBody}>{activePostThread?.content}</Text>
              </View>

              {/* Comments Section */}
              <Text style={styles.commentsHeading}>
                Réponses ({activePostThread?.comments?.length || 0})
              </Text>

              {(!activePostThread?.comments || activePostThread.comments.length === 0) ? (
                <Text style={styles.noCommentsText}>Aucune réponse pour le moment. Soyez le premier à répondre !</Text>
              ) : (
                activePostThread.comments.map((c: any, cIdx: number) => (
                  <View key={c.id || cIdx} style={styles.commentItem}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {(c.author?.firstName?.[0] || 'U')}
                      </Text>
                    </View>
                    <View style={styles.commentBodyWrapper}>
                      <Text style={styles.commentAuthorName}>
                        {c.author?.firstName ? `${c.author.firstName} ${c.author.lastName || ''}`.trim() : 'Membre'}
                      </Text>
                      <Text style={styles.commentText}>{c.content}</Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            {/* Comment Input Bar */}
            <View style={styles.commentInputRow}>
              <TextInput
                style={styles.commentTextInput}
                placeholder="Écrire une réponse..."
                placeholderTextColor="#94A3B8"
                value={commentInput}
                onChangeText={setCommentInput}
              />
              <TouchableOpacity
                style={[styles.sendCommentBtn, (!commentInput.trim() || isSubmittingComment) && { opacity: 0.5 }]}
                disabled={!commentInput.trim() || isSubmittingComment}
                onPress={handleAddComment}
              >
                {isSubmittingComment ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.sendCommentBtnText}>Envoyer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* New Post Modal */}
      <Modal visible={isNewPostModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nouvelle Publication</Text>
            <Text style={styles.modalSub}>Canal : #{selectedCommunity?.name || 'Équipe'}</Text>

            <Text style={styles.modalLabel}>Titre de la publication</Text>
            <TextInput
              style={styles.modalInput}
              value={newPostTitle}
              onChangeText={setNewPostTitle}
              placeholder="Ex: Astuce réassort rapide des têtes de gondole"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.modalLabel}>Message / Informations</Text>
            <TextInput
              style={[styles.modalInput, { height: 90 }]}
              value={newPostContent}
              onChangeText={setNewPostContent}
              placeholder="Partagez vos bonnes pratiques ou posez une question..."
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
  authorGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarMini: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarMiniText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  time: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 6,
  },
  postActionBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 8,
    gap: 16,
  },
  actionBtn: {
    paddingVertical: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
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
    height: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  closeBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
  },
  threadOriginalPost: {
    backgroundColor: '#F8FAFC',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  threadPostAuthor: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 4,
  },
  threadPostTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 6,
  },
  threadPostBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
  },
  commentsHeading: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  noCommentsText: {
    fontSize: 12,
    color: '#94A3B8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 16,
  },
  commentItem: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#475569',
  },
  commentBodyWrapper: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
  },
  commentAuthorName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 12,
    color: '#334155',
  },
  commentInputRow: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  commentTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  sendCommentBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCommentBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
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
