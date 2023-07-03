import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Dashboard = () => {
  const [kpis, setKpis] = useState(null);
  const navigation = useNavigation();

  const checkTokenAndFetchData = async () => {
    try {
      const authToken = await AsyncStorage.getItem('authToken');
      if (authToken) {
        fetchKPIData(authToken);
      } else {
        navigation.navigate('Login');
      }
    } catch (error) {
      console.error('Error checking token:', error);
    }
  };

  const fetchKPIData = (authToken) => {
    fetch('http://127.0.0.1:8000/api/kpis/', {
      headers: {
        Authorization: `Token ${authToken}`,
      },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Error: ' + response.status);
        }
      })
      .then((data) => {
        const kpiData = data[0]; // Assuming the response is an array with a single object
        setKpis(kpiData);
      })
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    checkTokenAndFetchData();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Inventory Management KPIs</Text>
      <View style={styles.kpiContainer}>
        <View style={styles.kpi}>
          <Text style={styles.kpiTitle}>Total Products</Text>
          <Text style={styles.kpiValue}>{kpis?.total_products}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiTitle}>Low Stock Items</Text>
          <Text style={styles.kpiValue}>{kpis?.low_stock_items}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiTitle}>Out of Stock Items</Text>
          <Text style={styles.kpiValue}>{kpis?.out_of_stock_items}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiTitle}>Average Inventory Value</Text>
          <Text style={styles.kpiValue}>${kpis?.average_inventory_value}</Text>
        </View>
        <View style={styles.kpi}>
          <Text style={styles.kpiTitle}>Inventory Turnover</Text>
          <Text style={styles.kpiValue}>{kpis?.inventory_turnover} times</Text>
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('EnterGoodsScreen', { screen: 'EnterGoodsScreen' },{ operationType: 'ENTRY' })}
        >
          <Text style={styles.buttonText}>Enter Goods</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('RetrieveGoodsScreen', { screen: 'RetrieveGoodsScreen' },{ operationType: 'RETRIEVAL' })}
        >
          <Text style={styles.buttonText}>Retrieve Goods</Text>
        </Pressable>
      </View>
    </View>
  );
};

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
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    width: '80%',
    marginBottom: 20,
  },
  kpi: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    width: '45%',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  kpiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '80%',
    flexWrap: 'wrap',
  },
  button: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
});

export default Dashboard;
