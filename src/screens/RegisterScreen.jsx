import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, TouchableOpacity, KeyboardAvoidingView, StyleSheet } from 'react-native';

const RegisterScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
const [certificateExpiryDate, setCertificateExpiryDate] = useState('');
  const handleRegister = async () => {
    try {
      const response = await fetch('https://www.yourwebsite.ca/app/register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password,certificateExpiryDate }) // Değişiklik: JSON.stringify ile veri gönderildi
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Registration Successful', data.message);
        navigation.navigate('Login');
      } else {
        Alert.alert('Registration Failed', data.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while trying to register.');
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS için 'padding', Android için 'height' behavior'ı
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // iOS'ta klavye açıldığında ekranın üst kısmını kaydırma miktarı
      >
    <View style={styles.container}>
    <Image source={require('../assets/logo.png')} style={styles.logo} />
    <Text style={styles.title}>Register</Text>
      <Text style={styles.label}>Username:</Text>
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={setUsername}
      />

      <Text style={styles.label}>Email:</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password:</Text>
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
  {/* Certificate Expiry Date Text Input */}
      <Text style={styles.label}>Certificate Expiry Date:</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={certificateExpiryDate}
        onChangeText={setCertificateExpiryDate}
      />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                   <Text style={styles.registerButtonText}>Register</Text>
                 </TouchableOpacity>
    </View>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
     logo: {
        width: '100%', // Logo genişliği
        height: 80, // Logo yüksekliği
       // marginTop: 0, // Alt boşluk
      },
  label: {
    fontSize: 18,
    marginBottom: 4,
  },
  input: {
    height: 45,
    borderColor: '#434293',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
    title: {
      fontSize: 30,
      margin: 16,
      textAlign: 'center',
      color:'#434293',
      fontWeight: 'bold',
    },
       registerButton: {
          backgroundColor: '#FF9500', // Detail butonu gibi turuncu renk
          padding: 10,
          borderRadius: 50,
          width: '100%',
          alignItems: 'center',
          marginTop: 20,
        },
          registerButtonText: {
            color: '#FFF',
            fontSize: 30,
            fontWeight: 'bold',
          },
});

export default RegisterScreen;
