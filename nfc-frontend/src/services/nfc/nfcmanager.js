// src/services/nfc/nfcManager.js
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';

class NFCManager {
  constructor() {
    this.isSupported = false;
    this.isEnabled = false;
    this.hasStarted = false;
  }

  async init() {
    try {
      this.isSupported = await NfcManager.isSupported();
      if (this.isSupported) {
        if (!this.hasStarted) {
          await NfcManager.start();
          this.hasStarted = true;
        }
        this.isEnabled = await NfcManager.isEnabled();
      }
      return this.isSupported;
    } catch (error) {
      console.error('NFC Init Error:', error);
      return false;
    }
  }

  async startScanning() {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Hold your device near an NFC card.',
      });
      const tag = await NfcManager.getTag();
      return tag;
    } catch (error) {
      console.error('NFC Scan Error:', error);
      throw error;
    }
  }

  async stopScanning() {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      console.error('NFC Stop Error:', error);
    }
  }

  async writeToTag(message) {
    try {
      await NfcManager.requestTechnology(NfcTech.Ndef, {
        alertMessage: 'Hold your device near an NFC card.',
      });
      const bytes = Ndef.encodeMessage([Ndef.textRecord(message)]);
      await NfcManager.ndefHandler.writeNdefMessage(bytes);
      return true;
    } catch (error) {
      console.error('NFC Write Error:', error);
      throw error;
    }
  }

  cleanup() {
    NfcManager.cancelTechnologyRequest().catch(() => {});
  }
}

export default new NFCManager();
