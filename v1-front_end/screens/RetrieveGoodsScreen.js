import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Picker, FlatList, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RetrieveGoodsScreen({ route }) {
  const { operationType } = route.params;
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [goodsData, setGoodsData] = useState([]);
  const [selectedGoods, setSelectedGoods] = useState([]);
  const [userQuantity, setUserQuantity] = useState("");
  const navigation = useNavigation();

  useEffect(() => {
    fetchStoresData();
  }, []);

  const fetchStoresData = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/stores/');
      const data = await response.json();
      if (Array.isArray(data)) {
        const storesData = data.map((store) => ({
          id: store.store_id,
          name: store.store_name,
        }));
        setStores(storesData);
      } else {
        throw new Error('Data is not an array.');
      }
    } catch (error) {
      console.error('Error fetching stores data:', error);
    }
  };

  const fetchGoodsData = async () => {
    if (selectedStore) {
      try {
        const authToken = await AsyncStorage.getItem('authToken');
        if (!authToken) {
          navigation.navigate('Login');
          return;
        }

        const response = await fetch(`http://127.0.0.1:8000/api/retrieve-goods/?store=${selectedStore}`, {
          headers: {
            Authorization: `Token ${authToken}`,
          },
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setGoodsData(data);
        } else {
          throw new Error('Goods data is not an array.');
        }
      } catch (error) {
        console.error('Error fetching goods data:', error);
      }
    }
  };

  useEffect(() => {
    fetchGoodsData();
  }, [selectedStore]);

  const handleSelectStore = (store) => {
    setSelectedStore(store);
    setGoodsData([]);
    setSelectedGoods([]);
  };

  const handleSelectGoods = (item) => {
    const isSelected = selectedGoods.some((selectedItem) => selectedItem.id === item.id);

    if (isSelected) {
      const updatedGoods = selectedGoods.filter((selectedItem) => selectedItem.id !== item.id);
      setSelectedGoods(updatedGoods);
    } else {
      setUserQuantity(""); // Reset the user quantity input

      // Show the available quantity and prompt the user to enter their desired quantity
      const availableQuantity = item.quantity;

      // Update the selected goods with user quantity
      const selectedWithQuantity = {
        id: item.id,
        name: item.name,
        quantity: 0,
      };

      // Update the selected goods with user quantity
      setSelectedGoods([...selectedGoods, selectedWithQuantity]);
    }
  };

  const handleQuantityChange = (quantity, itemId) => {
    const updatedGoods = selectedGoods.map((selectedItem) => {
      if (selectedItem.id === itemId) {
        return {
          ...selectedItem,
          quantity,
        };
      }
      return selectedItem;
    });

    setSelectedGoods(updatedGoods);
  };

  const handleShipping = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (!authToken) {
        navigation.navigate('Login');
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/shipping/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Token ${authToken}`,
        },
        body: JSON.stringify(selectedGoods),
      });

      if (response.ok) {
        // Shipping successful
        setSelectedGoods([]);
        fetchGoodsData(); // Refresh the goods data after shipping
      } else {
        throw new Error('Error: ' + response.status);
      }
    } catch (error) {
      console.error('Error shipping goods:', error);
    }
  };

  return (
    <View style={styles.container}>
      {operationType === 'RETRIEVAL' ? (
        <Text style={styles.headerText}>Retrieve Goods</Text>
      ) : (
        <Text style={styles.headerText}>Enter Goods</Text>
      )}

      <Text style={styles.subHeaderText}>Select a Store</Text>
      <Picker
        selectedValue={selectedStore}
        onValueChange={(itemValue) => handleSelectStore(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select a store" value="" />
        {stores.map((store) => (
          <Picker.Item key={store.id} label={store.name} value={store.id} />
        ))}
      </Picker>

      {selectedStore && (
        <>
          <Text style={styles.subHeaderText}>Select Goods</Text>
          <FlatList
            data={goodsData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.goodsItem,
                  selectedGoods.some((selectedItem) => selectedItem.id === item.id) && styles.selectedGoodsItem,
                ]}
              >
                <Text style={styles.goodsName}>{item.name}</Text>
                {selectedGoods.some((selectedItem) => selectedItem.id === item.id) ? (
                  <TextInput
                    style={styles.quantityInput}
                    placeholder="Enter quantity"
                    keyboardType="numeric"
                    value={selectedGoods.find((selectedItem) => selectedItem.id === item.id)?.quantity.toString()}
                    onChangeText={(text) => handleQuantityChange(text, item.id)}
                  />
                ) : (
                  <Text style={styles.goodsQuantity}>{item.quantity}</Text>
                )}
              </View>
            )}
          />
          <Pressable
            style={styles.shipButton}
            onPress={handleShipping}
            disabled={selectedGoods.length === 0}
          >
            <Text style={styles.shipButtonText}>Ship</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  picker: {
    width: '100%',
    marginBottom: 20,
    elevation: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  goodsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  selectedGoodsItem: {
    backgroundColor: '#DDDDDD',
  },
  goodsName: {
    fontSize: 16,
  },
  goodsQuantity: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityInput: {
    width: 100,
    height: 40,
    borderColor: '#DDDDDD',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  shipButton: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginTop: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  shipButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});
