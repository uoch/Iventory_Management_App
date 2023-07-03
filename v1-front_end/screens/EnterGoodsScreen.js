import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';

export default function EnterGoodsScreen() {
  const [store, setStore] = useState('');
  const [productName, setProductName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [dateReceived, setDateReceived] = useState('');

  const handleSave = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/enter-goods/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          store: parseInt(store),
          product: {
            name: productName,
            location_in_store: location,
            description: description,
            price: parseFloat(price),
            category: parseInt(category),
          },
          available_quantity: parseInt(quantity),
          date_received: dateReceived,
          expiration_date: '2024-06-21',
        }),
      });

      if (response.ok) {
        // Goods successfully entered
        setStore('');
        setProductName('');
        setLocation('');
        setDescription('');
        setPrice('');
        setCategory('');
        setQuantity('');
        setDateReceived('');
      } else {
        // Handle error response from the server
        console.log('Error:', response.status);
      }
    } catch (error) {
      // Handle network errors
      console.log('Error:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Enter Goods</Text>
      <TextInput
        style={styles.inputBox}
        value={store}
        onChangeText={setStore}
        placeholder="Store ID"
      />
      <TextInput
        style={styles.inputBox}
        value={productName}
        onChangeText={setProductName}
        placeholder="Product Name"
      />
      <TextInput
        style={styles.inputBox}
        value={location}
        onChangeText={setLocation}
        placeholder="Location in Store"
      />
      <TextInput
        style={styles.inputBox}
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
      />
      <TextInput
        style={styles.inputBox}
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.inputBox}
        value={category}
        onChangeText={setCategory}
        placeholder="Category ID"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.inputBox}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Quantity"
        keyboardType="numeric"
      />
      <TextInput
        style={styles.inputBox}
        value={dateReceived}
        onChangeText={setDateReceived}
        placeholder="Date Received (YYYY-MM-DD)"
      />
      <Pressable style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputBox: {
    width: '80%',
    height: 40,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
