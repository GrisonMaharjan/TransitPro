const crypto = require('crypto');

// Use a fixed key and IV for consistent encryption/decryption
// Note: In production, the secret should be securely managed
const ALGORITHM = 'aes-256-cbc';
const SECRET_KEY = process.env.NFC_ENCRYPTION_KEY || 'TransitPro_Security_Key_2024';
const KEY = crypto.scryptSync(SECRET_KEY, 'salt', 32);
const IV = Buffer.alloc(16, 0); // Fixed IV for deterministic encryption/decryption of the same ID

/**
 * Encrypts a string (e.g., Passenger NFCID)
 * @param {string} text - The plain text to encrypt
 * @returns {string} - The encrypted string in hex format
 */
const encrypt = (text) => {
    try {
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, IV);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    } catch (error) {
        console.error('Encryption Error:', error.message);
        return null;
    }
};

/**
 * Decrypts an encrypted string
 * @param {string} encryptedText - The hex string to decrypt
 * @returns {string} - The decrypted plain text
 */
const decrypt = (encryptedText) => {
    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, IV);
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    } catch (error) {
        return null;
    }
};

module.exports = { encrypt, decrypt };
