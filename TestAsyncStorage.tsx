// TestAsyncStorage.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TestAsyncStorage: React.FC = () => {
  const [testValue, setTestValue] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const value = await AsyncStorage.getItem('testKey');
      setTestValue(value);
      console.log('Loaded test value from AsyncStorage:', value);
    };

    loadData();
  }, []);

  const saveData = async () => {
    const value = 'Hello World';
    await AsyncStorage.setItem('testKey', value);
    setTestValue(value);
    console.log('Saved test value to AsyncStorage:', value);
  };

  return (
    <View>
      <Text>Test Value: {testValue}</Text>
      <Button title="Save Data" onPress={saveData} />
    </View>
  );
};

export default TestAsyncStorage;