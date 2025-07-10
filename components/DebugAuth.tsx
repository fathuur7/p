import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const baseUrl = 'http://192.168.1.52:3000';

export const DebugAuth: React.FC = () => {
  const [step, setStep] = useState(0);
  const [authUrl, setAuthUrl] = useState('');
  const [code, setCode] = useState('');
  const [result, setResult] = useState<any>(null);

  const testStep1 = async () => {
    try {
      console.log('Testing step 1: Get auth URL');
      const response = await fetch(`${baseUrl}/api/auth/discord/url`);
      const data = await response.json();
      setAuthUrl(data.authUrl);
      setStep(1);
      console.log('Step 1 success:', data);
    } catch (error) {
      console.error('Step 1 error:', error);
    }
  };

  const testStep2 = async () => {
    try {
      console.log('Testing step 2: Health check');
      const response = await fetch(`${baseUrl}/health`);
      const data = await response.json();
      console.log('Health check:', data);
      setStep(2);
    } catch (error) {
      console.error('Health check error:', error);
    }
  };

  const testStep3 = async () => {
    try {
      console.log('Testing step 3: Manual code exchange');
      // You need to manually get the code from Discord OAuth
      const testCode = 'paste_your_code_here';
      const response = await fetch(`${baseUrl}/api/auth/discord/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: testCode }),
      });
      const data = await response.json();
      setResult(data);
      console.log('Step 3 result:', data);
    } catch (error) {
      console.error('Step 3 error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Debug Discord Auth</Text>
      
      <TouchableOpacity style={styles.button} onPress={testStep2}>
        <Text style={styles.buttonText}>Test Health Check</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testStep1}>
        <Text style={styles.buttonText}>Test Get Auth URL</Text>
      </TouchableOpacity>
      
      {authUrl && (
        <Text style={styles.result}>Auth URL: {authUrl.substring(0, 50)}...</Text>
      )}
      
      <TouchableOpacity style={styles.button} onPress={testStep3}>
        <Text style={styles.buttonText}>Test Manual Code Exchange</Text>
      </TouchableOpacity>
      
      {result && (
        <Text style={styles.result}>Result: {JSON.stringify(result, null, 2)}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5865F2',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  result: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e9ecef',
    borderRadius: 5,
    fontSize: 12,
  },
});