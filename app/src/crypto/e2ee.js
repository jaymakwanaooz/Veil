import nacl from 'tweetnacl';
import {
    decodeUTF8,
    encodeUTF8,
    encodeBase64,
    decodeBase64,
} from 'tweetnacl-util';

/**
 * Veil E2EE Cryptography Module
 *
 * Uses NaCl (tweetnacl) box for asymmetric authenticated encryption.
 * - Each user generates a keypair on registration
 * - Messages are encrypted with the sender's secret key + receiver's public key
 * - Only the intended recipient can decrypt with their secret key + sender's public key
 */

/**
 * Generate a new NaCl Box keypair
 * @returns {{ publicKey: string, secretKey: string }} Base64-encoded keys
 */
export function generateKeyPair() {
    const keyPair = nacl.box.keyPair();
    return {
        publicKey: encodeBase64(keyPair.publicKey),
        secretKey: encodeBase64(keyPair.secretKey),
    };
}

/**
 * Encrypt a plaintext message
 * @param {string} plaintext - The message to encrypt
 * @param {string} recipientPublicKey - Recipient's base64 public key
 * @param {string} senderSecretKey - Sender's base64 secret key
 * @returns {{ ciphertext: string, nonce: string }} Base64-encoded ciphertext and nonce
 */
export function encryptMessage(plaintext, recipientPublicKey, senderSecretKey) {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const messageBytes = decodeUTF8(plaintext);
    const pubKey = decodeBase64(recipientPublicKey);
    const secKey = decodeBase64(senderSecretKey);

    const encrypted = nacl.box(messageBytes, nonce, pubKey, secKey);

    if (!encrypted) {
        throw new Error('Encryption failed');
    }

    return {
        ciphertext: encodeBase64(encrypted),
        nonce: encodeBase64(nonce),
    };
}

/**
 * Decrypt a ciphertext message
 * @param {string} ciphertext - Base64-encoded ciphertext
 * @param {string} nonce - Base64-encoded nonce
 * @param {string} senderPublicKey - Sender's base64 public key
 * @param {string} recipientSecretKey - Recipient's base64 secret key
 * @returns {string} Decrypted plaintext
 */
export function decryptMessage(ciphertext, nonce, senderPublicKey, recipientSecretKey) {
    const cipherBytes = decodeBase64(ciphertext);
    const nonceBytes = decodeBase64(nonce);
    const pubKey = decodeBase64(senderPublicKey);
    const secKey = decodeBase64(recipientSecretKey);

    const decrypted = nacl.box.open(cipherBytes, nonceBytes, pubKey, secKey);

    if (!decrypted) {
        throw new Error('Decryption failed — invalid key or corrupted message');
    }

    return encodeUTF8(decrypted);
}

export default {
    generateKeyPair,
    encryptMessage,
    decryptMessage,
};
