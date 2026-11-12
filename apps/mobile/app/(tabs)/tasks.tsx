import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, Image } from 'react-native';

interface ChecklistItem {
  id: string;
  title: string;
  done: boolean;
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState([
    {
      id: 'task-101',
      title: 'Daily Morning Food Safety & Fridge Check',
      status: 'TODO',
      priority: 'HIGH',
      due: 'Today, 10:00 AM',
      requiresPhoto: true,
      hasSubmittedEvidence: false,
      checklist: [
        { id: '1', title: 'Verify cooler gauge is <= 4°C', done: false },
        { id: '2', title: 'Check expiration date on dairy shelf', done: false },
        { id: '3', title: 'Confirm sanitation bucket test strip pass', done: false },
      ],
    },
    {
      id: 'task-102',
      title: 'Store Entrance Cleaning & Welcome Mat',
      status: 'SUBMITTED',
      priority: 'MEDIUM',
      due: 'Today, 02:00 PM',
      requiresPhoto: true,
      hasSubmittedEvidence: true,
      checklist: [
        { id: '1', title: 'Sweep entrance doorway', done: true },
        { id: '2', title: 'Align shopping carts', done: true },
      ],
    },
  ]);

  const [activeTask, setActiveTask] = useState<any | null>(null);
  const [photoEvidence, setPhotoEvidence] = useState<string | null>(null);

  const toggleChecklistItem = (itemId: string) => {
    if (!activeTask) return;
    const updatedChecklist = activeTask.checklist.map((item: ChecklistItem) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    setActiveTask({ ...activeTask, checklist: updatedChecklist });
  };

  const handleSimulateCameraCapture = () => {
    // Simulates Expo ImagePicker / Camera capture
    setPhotoEvidence('https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80');
    Alert.alert('Camera Capture', 'Evidence photo captured and compressed successfully.');
  };

  const handleSubmitTask = () => {
    if (!activeTask) return;

    const allChecked = activeTask.checklist.every((c: ChecklistItem) => c.done);
    if (!allChecked) {
      Alert.alert('Checklist Incomplete', 'Please check off all required checklist items before submitting.');
      return;
    }

    if (activeTask.requiresPhoto && !photoEvidence) {
      Alert.alert('Evidence Required', 'This operational task requires a photo verification before submission.');
      return;
    }

    setTasks((prev) =>
      prev.map((t) => (t.id === activeTask.id ? { ...t, status: 'SUBMITTED', hasSubmittedEvidence: true } : t))
    );

    Alert.alert('Success', 'Task submitted successfully to store manager for sign-off.');
    setActiveTask(null);
    setPhotoEvidence(null);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.taskCard}
            onPress={() => {
              setActiveTask(item);
              setPhotoEvidence(null);
            }}
          >
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.priorityTag,
                  item.priority === 'HIGH' ? styles.tagHigh : styles.tagMedium,
                ]}
              >
                {item.priority}
              </Text>
              <Text
                style={[
                  styles.statusTag,
                  item.status === 'SUBMITTED' ? styles.statusSubmitted : styles.statusTodo,
                ]}
              >
                {item.status}
              </Text>
            </View>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDue}>Due: {item.due}</Text>
            {item.requiresPhoto && (
              <Text style={styles.evidenceBadge}>📷 Photo Evidence Required</Text>
            )}
          </TouchableOpacity>
        )}
      />

      {/* Task Execution Modal */}
      {activeTask && (
        <Modal visible={true} animationType="slide" transparent={false}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setActiveTask(null)}>
                <Text style={styles.closeBtn}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Checklist Execution</Text>
              <View style={{ width: 40 }} />
            </View>

            <View style={styles.modalContent}>
              <Text style={styles.executionTitle}>{activeTask.title}</Text>
              <Text style={styles.instructionText}>
                Complete each operational point below and capture visual verification.
              </Text>

              {/* Checklist Items */}
              <View style={styles.checklistSection}>
                {activeTask.checklist.map((item: ChecklistItem) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.checkRow}
                    onPress={() => toggleChecklistItem(item.id)}
                  >
                    <Text style={styles.checkboxIcon}>{item.done ? '☑️' : '⬜'}</Text>
                    <Text style={[styles.checkTitle, item.done && styles.checkDone]}>
                      {item.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Evidence Section */}
              <View style={styles.evidenceSection}>
                <Text style={styles.sectionHeader}>Visual Evidence (Camera)</Text>
                {photoEvidence ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: photoEvidence }} style={styles.imagePreview} />
                    <TouchableOpacity onPress={() => setPhotoEvidence(null)}>
                      <Text style={styles.retakeText}>Retake Photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.cameraBtn}
                    onPress={handleSimulateCameraCapture}
                  >
                    <Text style={styles.cameraBtnText}>📷 Open Camera & Take Evidence</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Footer Submission Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmitTask}>
                <Text style={styles.submitBtnText}>Submit Task for Manager Validation</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    padding: 16,
  },
  taskCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priorityTag: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagHigh: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
  },
  tagMedium: {
    backgroundColor: '#DBEAFE',
    color: '#1E40AF',
  },
  statusTag: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  statusTodo: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  statusSubmitted: {
    backgroundColor: '#E0E7FF',
    color: '#3730A3',
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  taskDue: {
    fontSize: 12,
    color: '#64748B',
  },
  evidenceBadge: {
    fontSize: 11,
    color: '#2563EB',
    marginTop: 6,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 48,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
  },
  closeBtn: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  executionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 20,
  },
  checklistSection: {
    marginBottom: 24,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  checkboxIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  checkTitle: {
    fontSize: 14,
    color: '#1E293B',
    flex: 1,
  },
  checkDone: {
    textDecorationLine: 'line-through',
    color: '#94A3B8',
  },
  evidenceSection: {
    marginTop: 8,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 10,
  },
  cameraBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cameraBtnText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 13,
  },
  previewContainer: {
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 8,
  },
  retakeText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: '#E2E8F0',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
