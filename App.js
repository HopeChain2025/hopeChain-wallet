import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { ethers } from 'ethers';

const App = () => {
  const [wallet, setWallet] = useState(null);
  const [privateKey, setPrivateKey] = useState('');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [signedTx, setSignedTx] = useState('');

  // Generate new wallet
  const generateWallet = async () => {
    try {
      const newWallet = ethers.Wallet.createRandom();
      setWallet(newWallet);
      setPrivateKey(newWallet.privateKey);

      await EncryptedStorage.setItem('privateKey', newWallet.privateKey);
      Alert.alert('Wallet Generated', Address: ${newWallet.address});
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // Load wallet from storage
  const loadWallet = async () => {
    try {
      const storedKey = await EncryptedStorage.getItem('privateKey');
      if (storedKey) {
        const loadedWallet = new ethers.Wallet(storedKey);
        setWallet(loadedWallet);
        setPrivateKey(loadedWallet.privateKey);
        Alert.alert('Wallet Loaded', Address: ${loadedWallet.address});
      } else {
        Alert.alert('No Wallet Found', 'Please generate a wallet first.');
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  // Sign transaction offline
  const signTransaction = async () => {
    if (!wallet) {
      Alert.alert('No Wallet', 'Generate or load a wallet first.');
      return;
    }

    if (!recipient || !amount) {
      Alert.alert('Missing Input', 'Enter recipient and amount.');
      return;
    }

    try {
      const tx = {
        to: recipient,
        value: ethers.utils.parseEther(amount),
        nonce: 0, // For demo; use correct nonce in production
        gasLimit: 21000,
        gasPrice: ethers.utils.parseUnits('10', 'gwei'),
        chainId: 1, // Mainnet (use 5 for Goerli)
      };

      const signed = await wallet.signTransaction(tx);
      setSignedTx(signed);
      Alert.alert('Success', 'Transaction signed offline.');
    } catch (err) {
      Alert.alert('Signing Error', err.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.header}>Ethereum Cold Wallet</Text>

        <View style={styles.section}>
          <Button title="Generate New Wallet" onPress={generateWallet} />
        </View>

        <View style={styles.section}>
          <Button title="Load Existing Wallet" onPress={loadWallet} />
        </View>

        {wallet && (
          <>
            <Text style={styles.label}>Wallet Address:</Text>
            <Text style={styles.value}>{wallet.address}</Text>

            <Text style={styles.label}>Private Key:</Text>
            <Text selectable style={styles.value}>{privateKey}</Text>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.subheader}>Sign Transaction</Text>
          <TextInput
            style={styles.input}
            placeholder="Recipient Address"
            value={recipient}
            onChangeText={setRecipient}
          />
          <TextInput
            style={styles.input}
            placeholder="Amount in ETH"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
          <Button title="Sign Transaction" onPress={signTransaction} />
        </View>

        {signedTx ? (
          <View style={styles.section}>
            <Text style={styles.subheader}>Signed Transaction:</Text>
            <Text selectable style={styles.signedTx}>{signedTx}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, alignSelf: 'center' },
  section: { marginVertical: 10 },
  label: { fontWeight: 'bold', marginTop: 10 },
  value: { backgroundColor: '#f0f0f0', padding: 8, borderRadius: 4 },
  subheader: { fontSize: 16, fontWeight: '600', marginVertical: 10 },
  input: { borderColor: '#ccc', borderWidth: 1, padding: 8, marginVertical: 5, borderRadius: 4 },
  signedTx: { fontFamily: 'monospace', backgroundColor: '#f0f0f0', padding: 8, borderRadius: 4 },
});

export default App;
