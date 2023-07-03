import React, { useState } from 'react';
import { ScrollView, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';



function LoginScreen({ handleLogin }) {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleLoginPress() {
    setError('');

    let body = new URLSearchParams();
    body.append('username', email.toLowerCase());
    body.append('password', password);

    fetch('http://127.0.0.1:8000/api/auth/token/login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })
      .then(response => {
        if (response.ok) {
          console.log('Login successful');
          handleLogin(true); // Call handleLogin with true to update isLoggedIn
          return response.json();
        } else {
          throw new Error('Error: ' + response.status);
        }
      })
      .then(data => {
        AsyncStorage.setItem('authToken', data.auth_token)
          .then(() => {
            console.log('Token stored successfully');
          })
          .catch(error => {
            console.error('Error storing token:', error);
          });
      })
      .catch(error => {
        console.error(error);
      });
  }

  function handleSignUp() {
    navigation.navigate('SignUp', { screen: 'SignUp' });
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Inventory Management</Text>
      <Text style={styles.regularText}>Login to continue</Text>
      <TextInput
        style={styles.inputBox}
        value={email}
        onChangeText={setEmail}
        placeholder={'Email'}
        keyboardType={'email-address'}
      />
      <TextInput
        style={styles.inputBox}
        value={password}
        onChangeText={setPassword}
        placeholder={'Password'}
        secureTextEntry={true}
      />
      <Pressable style={styles.button} onPress={handleLoginPress}>
        <Text style={styles.buttonText}>Login</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerText: {
    padding: 40,
    fontSize: 30,
    color: '#333333',
    textAlign: 'center',
  },
  regularText: {
    fontSize: 24,
    padding: 20,
    marginVertical: 8,
    color: '#333333',
    textAlign: 'center',
  },
  inputBox: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    fontSize: 16,
    borderColor: '#333333',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});


export default LoginScreen;