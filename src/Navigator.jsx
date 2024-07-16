// AppNavigator.jsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ProfileScreen from './screens/ProfileScreen';
import ScannerScreen from './ScannerScreen';
import DetailScreen from './DetailScreen';
import { Image, TouchableOpacity } from 'react-native';
import { openExternalLink } from './utils';
import MembersScreen from './screens/MemberList';
const Stack = createStackNavigator();

const TabNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Members" component={MembersScreen} />
      <Stack.Screen
        name="Scanner"
        component={ScannerScreen}
        options={({ navigation }) => ({
          headerTitle: 'Scanner',
          headerLeft: () => (
            <TouchableOpacity
              style={{ marginLeft: 16 }}
              onPress={() => navigation.goBack()}>
              <Image
                source={require('./assets/back_arrow.png')}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 16 }}
             onPress={() => navigation.goBack()}>
              <Image
                source={require('./assets/information.png')}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity>
          ),
        })}
      />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
};

export default TabNavigator;
