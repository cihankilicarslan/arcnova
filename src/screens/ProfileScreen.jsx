import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { useNavigation, useIsFocused } from '@react-navigation/native';

export default function ProfileScreen({ route, navigation }) {
  const { user } = route.params;
  const [userLocation, setUserLocation] = useState(null);
 const [qrCodes, setQrCodes] = useState([]);
  const [userRole, setUserRole] = useState('');
  const [userMail, setUserMail] = useState('');
     const [userUsername, setUserUsername] = useState('');
const isFocused = useIsFocused();


   useEffect(() => {
       if (isFocused) {
         fetchQrCodes();
          setUserRole(user.role);
       }
     }, [isFocused]);

const fetchQrCodes = async () => {
  try {
    const response = await fetch('https://www.alephstaffing.ca/app/get_qr_data.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId: user.id }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch QR codes: ${response.status}`);
    }

    const qrCodesData = await response.json();
    setQrCodes(qrCodesData);
    console.log(qrCodesData);
  } catch (error) {
    console.error('Error fetching QR codes:', error.message); // Hata mesajını daha ayrıntılı yazdır
    // Handle error, show alert, etc.
    Alert.alert('Error', 'Failed to fetch QR codes. Please try again later.');
  }
};
  const handleMembersNavigation = () => {
    navigation.navigate('Members');
  };
   const handleRegisterNavigation = () => {
      navigation.navigate('Register');
    };


  const handleScannerNavigation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const location = `https://www.google.com/maps?q=${latitude},${longitude}`;
        //Alert.alert(location);
        setUserLocation(location);
        navigation.navigate('Scanner', { userEmail: user.email, userLocation: location, userId: user.id});
      },
      error => {
        console.error('Error getting location:', error);
        Alert.alert('Error', 'Failed to get user location');
        navigation.navigate('Scanner', { userEmail: user.email, userLocation: null });
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };
     const renderQrCodes = () => {
       return qrCodes.map((qrCode, index) => (
         <View key={index} style={styles.qrCodeItem}>
           <Text style={styles.qrCodeUrl}>QR Location:  {qrCode.qrCodeURL}</Text>
           <Text style={styles.timestamp}>{qrCode.timestamp}</Text>
           <Text style={[styles.etype, getEtypeStyle(qrCode.etype)]}>Scan Type:  {qrCode.etype}</Text>
           <Text style={styles.user_location}>User Location:  {qrCode.user_location}</Text>
           {/* Add more fields as needed */}
         </View>
       ));
     };
       const getEtypeStyle = (etype) => {
         switch (etype) {
           case 'ENTRY':
             return {
             color: 'green',
              fontWeight: 'bold',
              fontSize: 18,
              };
           case 'EXIT':
             return { color: 'red',
                fontWeight: 'bold',
                fontSize: 18,
                };
           default:
             return { color: '#FF9500' };
         }
       };
  return (
    <View style={styles.container}>

      <Text style={styles.text}>Email: {user.email}</Text>
       <Text style={styles.text}>User Name: {user.username}</Text>
      {userRole === 'admin' && ( // Eğer kullanıcı admin ise
        <View>
          <TouchableOpacity onPress={handleMembersNavigation} style={styles.button}>
            <Text style={styles.buttonText}>Members</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleRegisterNavigation} style={styles.button}>
            <Text style={styles.buttonText}>Register</Text>
          </TouchableOpacity>
        </View>
      )}
      <ScrollView style={styles.scrollView}>
        {renderQrCodes()}
      </ScrollView>
      <TouchableOpacity onPress={handleScannerNavigation} style={styles.button}>
        <Text style={styles.buttonText}>Start Scanner</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  qrCodeItem: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  qrCodeUrl: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color:'#FF9500',
  },
    user_location: {
      fontSize: 14,
      fontWeight:400,
      marginBottom: 5,
      color:'#434293',
    },

  timestamp: {
    fontSize: 24,
    color: '#434293',
    fontWeight:'bold',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  text: {
    fontSize: 18,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#434293',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 45,
    alignSelf: 'center',
    marginBottom: 20,
    width:'100%',
     textAlign: 'center',
     height:60,
  },
  buttonText: {
    color: '#FF9500',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
   text: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#333',
      marginVertical: 8, // Dikeyde biraz boşluk bırakır
      padding: 10, // İçeride biraz boşluk bırakır
      borderWidth: 1,
      borderColor: '#ddd',
      borderRadius: 10, // Kenarları yuvarlatır
      width: '100%',
      textAlign: 'left', // Metni ortalar

    },
});
