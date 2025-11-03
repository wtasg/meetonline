import bcrypt from "bcrypt";
const { genSalt: gensSalt, hash: bcryptHash } = bcrypt;

async function saltWithRounds(rounds = 12) {
    const salt = await gensSalt(rounds);
    return salt;
}

async function hashWithSalt(password, salt) {
    const generatedSalt = (!salt || salt.length === 0) ? await saltWithRounds() : salt;
    const hashedPassword = await bcryptHash(password, generatedSalt);
    return hashedPassword;
}

async function comparePassword(candidatePassword, knownSalt, hashedPassword) {
    const candidateHash = await hashWithSalt(candidatePassword, knownSalt);
    return candidateHash === hashedPassword;
}

export {
    hashWithSalt,
    saltWithRounds,
    comparePassword
};
