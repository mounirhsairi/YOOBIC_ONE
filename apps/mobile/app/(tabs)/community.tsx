import React from 'react';
import { View, Text, StyleSheet, FlatList, Image } from 'react-native';

export default function CommunityScreen() {
  const posts = [
    {
      id: '1',
      author: 'Operations Director',
      badge: 'Headquarters Announcement',
      title: '🌟 Q2 National Visual Merchandising Winners Announced!',
      body: 'Congratulations to Store #12 and Store #04 for achieving a 100% compliance rate during the seasonal launch inspection.',
      time: '2 hours ago',
    },
    {
      id: '2',
      author: 'Health & Safety Lead',
      badge: 'Policy Update',
      title: 'Updated Cold Chain Temperature Protocols',
      body: 'Please review the updated guidelines in the Learning module regarding dairy cooler checks during summer months.',
      time: 'Yesterday',
    },
  ];

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <View style={styles.headerRow}>
              <Text style={styles.author}>{item.author}</Text>
              <Text style={styles.badge}>{item.badge}</Text>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.body}>{item.body}</Text>
            <Text style={styles.time}>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 16,
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
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '600',
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
});
