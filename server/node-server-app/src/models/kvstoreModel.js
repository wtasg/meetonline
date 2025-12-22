/**
 * Model representing a key-value store entry.
 */
class KVStoreModel {
    constructor() {
        this.id = null;
        this.key = null;
        this.value = null;
    }

    /**
     * Creates a null (empty) KVStoreModel.
     * @returns {KVStoreModel} A null model instance.
     */
    static null() {
        return new KVStoreModel();
    }

    /**
     * Creates a default KVStoreModel with sample data.
     * @returns {KVStoreModel} A default model instance.
     */
    static default() {
        const instance = new KVStoreModel();
        instance.id = 0;
        instance.key = "key";
        instance.value = "value";
        return instance;
    }

    /**
     * Creates a KVStoreModel from a database row.
     * @param {Object} row - Database row object.
     * @returns {KVStoreModel} The model instance.
     * @throws {Error} If row is invalid.
     */
    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("KVStoreModel#fromDatabaseRow: Invalid database row.");
        }

        const instance = new KVStoreModel();
        instance.id = row.id;
        instance.key = row.k;
        instance.value = row.v;
        return instance;
    }
}

export { KVStoreModel };
