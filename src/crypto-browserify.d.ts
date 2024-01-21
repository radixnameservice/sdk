declare module 'crypto-browserify' {

    import { Hash, Cipher, Decipher, Sign, Verify, DiffieHellman } from 'crypto';

    const crypto: {
        createHash(algorithm: string): Hash;
        createCipher(algorithm: string, password: string | Buffer): Cipher;
        createDecipher(algorithm: string, password: string | Buffer): Decipher;
        createSign(algorithm: string): Sign;
        createVerify(algorithm: string): Verify;
        createDiffieHellman(prime_length: number, generator?: number | Buffer): DiffieHellman;
    };

    export = crypto;
    
}