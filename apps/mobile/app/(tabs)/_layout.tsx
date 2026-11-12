import { Tabs } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ focused }) => (
            <View
              style={[
                styles.tabPill,
                focused && styles.tabPillActive,
              ]}
            >
              <Text style={[styles.iconText, focused && styles.iconActive]}>🏠</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabPill, focused && styles.tabPillActive]}>
              <Text style={[styles.iconText, focused && styles.iconActive]}>☑️</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabPill, focused && styles.tabPillActive]}>
              <Text style={[styles.iconText, focused && styles.iconActive]}>📰</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="learning"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabPill, focused && styles.tabPillActive]}>
              <Text style={[styles.iconText, focused && styles.iconActive]}>📚</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.tabPill, focused && styles.tabPillActive, { position: 'relative' }]}>
              <Text style={[styles.iconText, focused && styles.iconActive]}>•••</Text>
              <View style={styles.notificationDot} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabPillActive: {
    backgroundColor: '#2563EB',
  },
  iconText: {
    fontSize: 18,
    color: '#64748B',
  },
  iconActive: {
    color: '#FFFFFF',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
});
