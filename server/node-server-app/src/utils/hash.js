import bcrypt from "bcrypt";
const { genSalt: gensSalt, hash: bcryptHash } = bcrypt;

/**
 * Generates salt
 * @param {number} rounds - number of salt rounds
 * @returns {string}
 */
async function saltWithRounds(rounds = 12) {
    return await gensSalt(rounds);
}

/**
 * Generate hash
 * @param {string} password - cleartext password
 * @param {string} salt - generated salt
 * @returns {string} generated hash
 */
async function hashWithSalt(password, salt) {
    const generatedSalt = (!salt || salt.length === 0) ? await saltWithRounds() : salt;
    return await bcryptHash(password, generatedSalt);
}

/**
 *
 * @param {string} cleartext
 * @param {string} storedSalt
 * @param {string} storedHash
 * @returns {true|false}
 */
async function comparePassword(cleartext, storedSalt, storedHash) {
    const generatedHash = await hashWithSalt(cleartext, storedSalt);
    return generatedHash === storedHash;
}

export {
    hashWithSalt,
    saltWithRounds,
    comparePassword
};
