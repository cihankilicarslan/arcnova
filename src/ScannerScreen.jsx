import React, { useEffect, useState } from 'react';
    import {
      Alert,
      Image,
      StyleSheet,
      Text,
      TouchableOpacity,
      View,
      Linking,
    } from 'react-native';
    import { SafeAreaView } from 'react-native-safe-area-context';
    import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';

    export function ScannerScreen({ navigation, route }) {
      const [torchOn, setTorchOn] = useState(false);
      const [enableOnCodeScanned, setEnableOnCodeScanned] = useState(true);
      const [scannedValue, setScannedValue] = useState('');
      const [isCameraActive, setIsCameraActive] = useState(false);
      const [entryButtonDisabled, setEntryButtonDisabled] = useState(false);
      const [exitButtonDisabled, setExitButtonDisabled] = useState(false);
      const { userEmail, userLocation, userId } = route.params;
      const [etype, setEtype] = useState('');

      const {
        hasPermission: cameraHasPermission,
        requestPermission: requestCameraPermission,
      } = useCameraPermission();
      const device = useCameraDevice('back');

      useEffect(() => {
         handleCameraPermission();
         const timer = setTimeout(() => {
            navigation.goBack(); // 20 saniye sonra profil sayfasına yönlendirme
         }, 60000);

         // Zamanlayıcıyı temizleme (cleanup) fonksiyonu
         return () => clearTimeout(timer);
       }, []);

       const handleCameraPermission = async () => {
         const granted = await requestCameraPermission();

         if (!granted) {
           alert(
             'Camera permission is required to use the camera. Please grant permission in your device settings.',
           );
         }
       };

      const handleEntryPress = () => {
        setEtype('EXIT');
        setIsCameraActive(true);
      };

      const handleEntryPress1 = () => {
        setEtype('ENTRY');
        setIsCameraActive(true);
      };

      const handleBackPress = () => {
        navigation.goBack(); // Geri gitme işlemi
      };

      const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: codes => {
          if (enableOnCodeScanned) {
            let value = codes[0]?.value;

            console.log(codes[0]);
          //  showAlert('QR Code Scanned', `Scanned Value: ${value}`, false);

            setEnableOnCodeScanned(false);

            // Set scanned value to state for label display
            setScannedValue(value);

            // Send QR code value to the server if it's in expected format
            if (value && value.includes('?q=')) {
              const parts = value.split('?q=');
              if (parts.length === 2) {
                const [latitude, longitude] = parts[1].split(',');
                sendToServer(latitude, longitude, value, userLocation, userEmail, userId);
              } else {
                console.error('QR code value format is not as expected');
              }
            } else {
              console.error('QR code value format is not as expected');
            }

            // Close the camera after scanning
            setIsCameraActive(false);
          }
        },
      });

      const sendToServer = async (latitude, longitude, qrCodeURL, userLocation, userEmail, userId) => {
        try {
          // Şu anki tarih ve saat bilgisi
          let date = new Date();
          // 4 saat geri al
          date.setHours(date.getHours() - 4);
          const timestamp = date.toISOString(); // Tarih ve saat bilgisini al
          const response = await fetch('https://www.alephstaffing.ca/app/save_qr_data.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              latitude,
              longitude,
              qrCodeURL,
              timestamp,
              userLocation,
              userEmail,
              etype,
              userId,
            }),
          });

          const responseData = await response.json();

          if (!response.ok) {
            throw new Error(`Network request failed with status ${response.status} (${response.statusText})`);
          }

          console.log('Server Response:', responseData);

          if (responseData.status === 'success') {
            Alert.alert('Success', responseData.message);
            if (etype === 'ENTRY') {   navigation.goBack();
              setEntryButtonDisabled(true);
            } else if (etype === 'EXIT') {
            navigation.goBack();
              setExitButtonDisabled(true);
            }

          } else {
            Alert.alert('Error', responseData.message || 'Unknown error occurred');
          }
        } catch (error) {
          console.error('Error sending data to server:', error);
          Alert.alert('Error', 'Failed to send QR code data to server');
        }
      };

      const showAlert = (title = '', message = '', showMoreBtn = true) => {
        Alert.alert(
          title,
          message,
          showMoreBtn
            ? [
                {
                  text: 'Cancel',
                  onPress: () => {

                    setEnableOnCodeScanned(true); // Yeniden QR kod taratılabilir hale getir
                  },
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: () => {
                    // Profil sayfasına yönlendirme
                    setEnableOnCodeScanned(true); // Yeniden QR kod taratılabilir hale getir
                  },
                },
              ]
            : [
                {
                  text: 'OK',
                  onPress: () => {

                    setEnableOnCodeScanned(true); // Yeniden QR kod taratılabilir hale getir
                  },
                },
              ],
          { cancelable: false },
        );
      };

      const RoundButtonWithImage = () => {
        return (
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={() => setTorchOn(prev => !prev)} style={styles.flashButton}>
              <View style={styles.button}>
                <Image
                  source={
                    torchOn
                      ? require('./assets/flashlight_on.png')
                      : require('./assets/torch_off.png')
                  }
                  style={styles.buttonImage}
                />

              </View>
            </TouchableOpacity>
          </View>
        );
      };

      if (device == null)
        return (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ margin: 10 }}>Camera Not Found</Text>
          </View>
        );

      return (
        <SafeAreaView style={{ height: 620, margin: 40 }}>
          <RoundButtonWithImage />

          {isCameraActive && (
            <Camera
              codeScanner={codeScanner}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              torch={torchOn ? 'on' : 'off'}
              onTouchEnd={() => setEnableOnCodeScanned(true)}
            />
          )}
            <Image source={require('./assets/logo.png')} style={styles.logo} />
          <Text style={styles.labelText}>{scannedValue}</Text>
          {isCameraActive && (
            <TouchableOpacity onPress={() => setIsCameraActive(false)} style={styles.closeButton}>
              <Text style={{ color: 'white', fontSize: 30, left: 12, margin: 10, padding: 10 }}>X</Text>
            </TouchableOpacity>
          )}
          {!isCameraActive && (
            <TouchableOpacity onPress={handleEntryPress1} style={[styles.entryButton, entryButtonDisabled && { backgroundColor: '#aaa' }]} disabled={entryButtonDisabled}>
              <Text style={styles.entryText}>ENTRY</Text>
            </TouchableOpacity>
          )}
          {!isCameraActive && (
            <TouchableOpacity onPress={handleEntryPress} style={[styles.exitButton, exitButtonDisabled && { backgroundColor: '#aaa' }]} disabled={exitButtonDisabled}>
              <Text style={styles.exitText}>EXIT</Text>
            </TouchableOpacity>
          )}
        </SafeAreaView>
      );
    }


const styles = StyleSheet.create({
   logo: {
      width: '100%', // Logo genişliği
      height: 80, // Logo yüksekliği
      marginTop: 0, // Alt boşluk
      top: 55,
    },
  closeButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    padding: 0,
    borderRadius: 50,
    width: 80,
    height: 80,
    backgroundColor: 'red', // Buton rengini istediğiniz gibi ayarlayabilirsiniz
  },
  buttonContainer: {
    alignItems: 'center',
    position: 'absolute',
    zIndex: 1,
    right: 20,
    top: 20,
  },
  button: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonImage: {
    width: 50,
    height: 50,
  },
  labelText: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    backgroundColor: 'white',
    color: 'blue',
    padding: 5,
    borderRadius: 5,
    width: 330,
  },
  entryButton: {
    width: 300,
    height: 100,
    alignSelf: 'center',
    top: 360,
    backgroundColor: '#434293', //#4CAF50
    paddingVertical: 15,
    paddingHorizontal: 30,
 borderRadius: 50,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  exitButton: {
    width: 300,
    height: 100,
    alignSelf: 'center',
    top: 100,
    backgroundColor: '#FF9500', //#FF5252
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 50,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  entryText: {
    color: '#FF9500',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center', // Yazının içeriğini de ortala
    marginTop: 'auto', // Yazıyı ekranın ortasına getirmek için kullanılan bir stil
    marginBottom: 'auto', // Yazıyı ekranın ortasına getirmek için kullanılan bir stil
  },
  exitText: {
    color: '#434293',
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center', // Yazının içeriğini de ortala
    marginTop: 'auto', // Yazıyı ekranın ortasına getirmek için kullanılan bir stil
    marginBottom: 'auto', // Yazıyı ekranın ortasına getirmek için kullanılan bir stil
  },
});

export default ScannerScreen;
