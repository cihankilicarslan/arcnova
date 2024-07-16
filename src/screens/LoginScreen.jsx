import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert,TouchableOpacity, Image, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Switch } from 'react-native';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // AsyncStorage key'i
  const rememberKey = '@remember_me';

  // Component yüklendiğinde hatırlama durumunu kontrol et
  useEffect(() => {
    retrieveRememberMeStatus();
  }, []);

  // AsyncStorage'den hatırlama durumunu al
  const retrieveRememberMeStatus = async () => {
    try {
      const value = await AsyncStorage.getItem(rememberKey);
      if (value !== null) {
        setRememberMe(value === 'true');
      }
    } catch (error) {
      console.error('Error retrieving remember me status:', error);
    }
  };

  // Hatırlama durumu değiştiğinde AsyncStorage'e kaydet
  useEffect(() => {
    AsyncStorage.setItem(rememberKey, rememberMe.toString());
  }, [rememberMe]);

  const handleLogin = async () => {
    try {
      const response = await fetch('https://www.alephstaffing.ca/app/login.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();
      if (json.success) {
        // Kullanıcı başarılı şekilde giriş yaptığında ve hatırlama işaretlendiğinde
        if (rememberMe) {
          AsyncStorage.setItem('@user_email', email); // Kullanıcı adını AsyncStorage'e kaydet
        }
        // Profil ekranına kullanıcı ve rol bilgilerini iletmek için navigate edin
        navigation.navigate('Profile', { user: json.user });
      } else {
        Alert.alert('Error', json.message);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // iOS için 'padding', Android için 'height' behavior'ı
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} // iOS'ta klavye açıldığında ekranın üst kısmını kaydırma miktarı
    >
      <View style={styles.inner}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.rememberMeContainer}>
          <Text>Remember Me</Text>
          <Switch value={rememberMe} onValueChange={newValue => setRememberMe(newValue)} />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
             <Text style={styles.loginButtonText}>Login</Text>
           </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
    loginButton: {
      backgroundColor: '#FF9500', // Detail butonu gibi turuncu renk
      padding: 10,
      borderRadius: 50,
      width: '75%',
      alignItems: 'center',
      marginTop: 20,
    },
      loginButtonText: {
        color: '#FFF',
        fontSize: 30,
        fontWeight: 'bold',
      },
    logo: {
      width: '100%', // Logo genişliği
      height: 80, // Logo yüksekliği
      marginTop: 0, // Alt boşluk
    },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    margin: 16,
    textAlign: 'center',
    color:'#434293',
    fontWeight: 'bold',
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderColor: '#434293', // Gri rengi daha açık ve modern bir gri ile değiştirdim
    marginBottom: 10,
    paddingHorizontal: 10, // Daha geniş bir padding
    borderRadius: 8, // Köşeleri yuvarlak hale getirdim
    width: '100%',
    maxWidth: 360,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
    maxWidth: 300,
  },
});
