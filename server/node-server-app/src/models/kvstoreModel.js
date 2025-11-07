class KVStoreModel {
    constructor() {
        this.id = null;
        this.key = null;
        this.value = null;
    }

    static null() {
        return new KVStoreModel();
    }

    static default() {
        const instance = new KVStoreModel();
        instance.id = 0;
        instance.key = "key";
        instance.value = "value";
        return instance;
    }

    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("KVStoreModel#fromDatabaseRow: Invalid database row.");
        }

        const instance = new KVStoreModel();
        instance.id = row.id;
        instance.key = row.key;
        instance.value = row.value;
        return instance;
    }

    static toDatabaseFormat(model) {
        return {
            key: model.key,
            value: model.value
        };
    }
}

export { KVStoreModel };
