import bcrypt from 'bcrypt';
const { genSalt: gensSalt, hash: bcryptHash, compare: bcryptCompare } = bcrypt;

async function saltWithRounds(rounds = 12) {
    const salt = await gensSalt(rounds);
    return salt;
}

async function hashWithSalt(password, salt) {
    const generatedSalt = (!salt || salt.length === 0) ? await saltWithRounds() : salt;
    const hashedPassword = await bcryptHash(password, generatedSalt);
    return hashedPassword;
}

async function compareHashes(candidateHash, knownHash) {
    const isMatch = await bcryptCompare(candidateHash, knownHash);
    return isMatch;
}

async function comparePassword(candidatePassword, knownSalt, hashedPassword) {
    const candidateHash = await hashWithSalt(candidatePassword, knownSalt);
    const isMatch = await compareHashes(candidateHash, hashedPassword);
    return isMatch;
}

export {
    hashWithSalt,
    compareHashes,
    saltWithRounds,
    comparePassword
};
