import React, { useState, useEffect } from 'react';
import { ScrollView, Text, StyleSheet, TextInput, Pressable, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

export default function SignUp() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [selectedStore, setSelectedStore] = useState(null);
  const [stores, setStores] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/stores/')
      .then(response => response.json())
      .then(data => {
        if (Array.isArray(data)) { // Check if data is an array
          const storesData = data.map(store => ({
            id: store.id,
            name: store.name,
          }));
          setStores(storesData);
        } else {
          throw new Error('Data is not an array.');
        }
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  function handleSignUp() {
    setError('');

    const data = {
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password: password,
      store: selectedStore,
      role: role,
    };

    fetch('http://127.0.0.1:8000/api/auth/users/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => {
        if (response.ok) {
          console.log('Success');
          navigation.navigate('Login');
        } else {
          throw new Error('Error: ' + response.status);
        }
      })
      .catch(error => {
        console.error(error);
      });
  }


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.headerText}>Inventory Management</Text>
      <Text style={styles.regularText}>Sign Up to continue</Text>
      <TextInput
        style={styles.inputBox}
        value={email}
        onChangeText={setEmail}
        placeholder={'Email'}
        keyboardType={'email-address'}
      />
      <TextInput
        style={styles.inputBox}
        value={username}
        onChangeText={setUsername}
        placeholder={'Username'}
      />
      <TextInput
        style={styles.inputBox}
        value={password}
        onChangeText={setPassword}
        placeholder={'Password'}
        secureTextEntry={true}
      />
      {error !== '' && <Text style={styles.errorText}>{error}</Text>}
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Store:</Text>
        <Picker
          style={styles.picker}
          selectedValue={selectedStore}
          onValueChange={itemValue => setSelectedStore(itemValue)}
        >
          <Picker.Item label="Select a store" value="" />
          {stores.map(store => (
            <Picker.Item key={store.id} label={store.name} value={store.id} />
          ))}
        </Picker>
      </View>
      <View style={styles.pickerContainer}>
        <Text style={styles.pickerLabel}>Role:</Text>
        <Picker
          style={styles.picker}
          selectedValue={role}
          onValueChange={itemValue => setRole(itemValue)}
        >
          {['Manager', 'Receiver', 'Retriever'].map((label, index) => (
            <Picker.Item key={index} label={label} value={label.toLowerCase()} />
          ))}
        </Picker>
      </View>
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
    padding: 20,
  },
  headerText: {
    fontSize: 30,
    color: '#333333',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
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
    marginVertical: 12,
    borderWidth: 1,
    paddingHorizontal: 10,
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
    backgroundColor: '#F5F5F5',
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  pickerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 12,
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  picker: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#999999',
    backgroundColor: '#33333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
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
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
});
