import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Modal, ScrollView, TextInput } from 'react-native';

const MemberList = () => {
  const [members, setMembers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [certificateExpiryDate, setCertificateExpiryDate] = useState('');
  const [role, setRole] = useState('');
  const [qrCodes, setQrCodes] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('https://www.alephstaffing.ca/app/get_members.php');
      if (!response.ok) {
        throw new Error(`Failed to fetch members: ${response.status}`);
      }
      const membersData = await response.json();
      setMembers(membersData);
    } catch (error) {
      console.error('Error fetching members:', error);
      Alert.alert('Error', 'Failed to fetch members. Please try again later.');
    }
  };

  const handleUpdatePress = (member) => {
    setSelectedMember(member);
    setUsername(member.username);
    setEmail(member.email);
    setCertificateExpiryDate(member.certificate_expiry_date);
    setRole(member.role);
    setUpdateModalVisible(true);
  };

  const handleDetailPress = async (id) => {
    try {
      const response = await fetch('https://www.alephstaffing.ca/app/get_qr_data.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: id }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch QR codes: ${response.status}`);
      }

      const qrCodesData = await response.json();
      setQrCodes(qrCodesData);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching QR codes:', error.message);
      Alert.alert('Error', 'Failed to fetch QR codes. Please try again later.');
    }
  };

  const renderQrCodes = () => {
    return qrCodes.map((qrCode, index) => (
      <View key={index} style={styles.qrCodeItem}>
        <Text style={styles.qrCodeUrl}>{qrCode.qrCodeURL}</Text>
        <Text style={styles.timestamp}>{qrCode.timestamp}</Text>
        <Text style={styles.etype}>{qrCode.etype}</Text>
        <Text style={styles.timestamp}>{qrCode.user_location}</Text>
      </View>
    ));
  };

  const deleteMember = async (memberId) => {
    try {
      const response = await fetch('https://www.alephstaffing.ca/app/delete_user.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: memberId }),
      });
      const result = await response.json();
      Alert.alert(result.message);
      fetchMembers();
    } catch (error) {
      console.error('Error deleting member:', error);
      Alert.alert('Error', 'Failed to delete member. Please try again later.');
    }
  };

  const saveMemberUpdates = async () => {
    try {
      const response = await fetch('https://www.alephstaffing.ca/app/update_user.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedMember.id,
          username,
          email,
          certificate_expiry_date: certificateExpiryDate,
          role,
        }),
      });
      const result = await response.json();
      Alert.alert(result.message);
      setUpdateModalVisible(false);
      fetchMembers();
    } catch (error) {
      console.error('Error updating member:', error);
      Alert.alert('Error', 'Failed to update member. Please try again later.');
    }
  };

  const renderMemberItem = ({ item }) => (
    <View style={styles.memberItem}>
      <Text>User ID: {item.id}</Text>
      <Text>Role: {item.role}</Text>
      <Text>Username: {item.username}</Text>
      <Text>Email: {item.email}</Text>
      <Text>Register Date: {item.registration_date}</Text>
      <Text>Certificate Expiry Date: {item.certificate_expiry_date}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={() => handleUpdatePress(item)}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => deleteMember(item.id)}>
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.detailButton]} onPress={() => handleDetailPress(item.id)}>
          <Text style={styles.buttonText}>Detail</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={members}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMemberItem}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>QR Codes</Text>
            <ScrollView style={styles.scrollView}>
              {renderQrCodes()}
            </ScrollView>
            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        animationType="slide"
        transparent={true}
        visible={updateModalVisible}
        onRequestClose={() => setUpdateModalVisible(!updateModalVisible)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>Update Member</Text>
            <TextInput
              style={styles.input}
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Certificate Expiry Date"
              value={certificateExpiryDate}
              onChangeText={setCertificateExpiryDate}
            />
            <TextInput
              style={styles.input}
              placeholder="Role"
              value={role}
              onChangeText={setRole}
            />
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveMemberUpdates}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={() => setUpdateModalVisible(!updateModalVisible)}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  memberItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    marginVertical: 8,
    borderRadius: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  button: {
    padding: 10,
    borderRadius: 45,
    width: 100,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#434293',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
  },
  detailButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#FFF',
    textAlign: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    maxHeight: 300,
    width: '100%',
    marginTop: 10,
    marginBottom: 10,
  },
  qrCodeItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  qrCodeUrl: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  timestamp: {
    fontSize: 14,
    color: 'blue',
  },
  etype: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#34C759',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    marginTop: 20,
  },
});

export default MemberList;
