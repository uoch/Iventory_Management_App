import React, { useState } from 'react';
import { Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import KpiScreen from './screens/KpiScreen';
import SignUpScreen from './screens/SignUpScreen';
import RetrieveGoodsScreen from './screens/RetrieveGoodsScreen';
import EnterGoodsScreen from './screens/EnterGoodsScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = (status) => {
    setIsLoggedIn(status);
    if (status) {
      Alert.alert('You are in');
    }
  };

  return (
    <Stack.Navigator>
      {!isLoggedIn ? (
        <>
          <Stack.Screen
            name="Login"
            options={{ headerShown: false }}
          >
            {props => <LoginScreen {...props} handleLogin={handleLogin} />}
          </Stack.Screen>
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </>
      ) : (
        <>
          <Stack.Screen
            name="KPI"
            component={KpiScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="EnterGoodsScreen"
            component={EnterGoodsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="RetrieveGoodsScreen"
            component={RetrieveGoodsScreen}
            options={{ headerShown: false }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};
const App = () => {
  return (
    <NavigationContainer>
      <AuthNavigator />
    </NavigationContainer>
  );
};

export default App;