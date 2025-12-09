import { pojo } from "@wtasnorg/node-lib";

const updateEvent = (event, updates) => {
    return {
        ...event,
        ...updates,
        modifiedAt: new Date().toISOString(),
    };
};

const eventKeyMap = {
    id: "id",
    organiserId: "organiser_id",
    organiser_id: "organiserId",
    organisers: "organisers",
    title: "title",
    description: "description",
    onlineLocation: "online_location",
    online_location: "onlineLocation",
    startAt: "start_at",
    start_at: "startAt",
    endAt: "end_at",
    end_at: "endAt",
    isPaid: "is_paid",
    is_paid: "isPaid",
    isBroadcast: "is_broadcast",
    is_broadcast: "isBroadcast",
    broadcastType: "broadcast_type",
    broadcast_type: "broadcastType",
    tags: "tags",
    categories: "categories",
    isInteractive: "is_interactive",
    is_interactive: "isInteractive",
    isAnonymous: "is_anonymous",
    is_anonymous: "isAnonymous",
    interested: "interested",
    attachedDocuments: "attached_documents",
    attached_documents: "attachedDocuments",
    groupId: "group_id",
    group_id: "groupId",
    createdAt: "created_at",
    created_at: "createdAt",
    modifiedAt: "modified_at",
    modified_at: "modifiedAt",
    isDeleted: "is_deleted",
    is_deleted: "isDeleted",
    isHidden: "is_hidden",
    is_hidden: "isHidden",
    isArchived: "is_archived",
    is_archived: "isArchived",
};

class EventModel {
    constructor() {
        this.id = null;
        this.organiserId = null;
        this.organisers = null;
        this.title = null;
        this.description = null;
        this.onlineLocation = null;
        this.startAt = null;
        this.endAt = null;
        this.isPaid = false;
        this.isBroadcast = false;
        this.broadcastType = null;
        this.tags = null;
        this.categories = null;
        this.isInteractive = true;
        this.isAnonymous = false;
        this.interested = null;
        this.attachedDocuments = null;
        this.groupId = null;
        this.createdAt = null;
        this.modifiedAt = null;
        this.isDeleted = false;
        this.isHidden = false;
        this.isArchived = false;
        this.__isNull = true;
        this.__isDefault = false;
    }

    static fromDatabaseRow(row) {
        if (!row) {
            throw new Error("Invalid database row.");
        }
        const instance = new EventModel();

        instance.id = row.id ?? null;
        instance.organiserId = row.organiser_id ?? null;
        instance.organisers = row.organisers ?? null;
        instance.title = row.title ?? null;
        instance.description = row.description ?? null;
        instance.onlineLocation = row.online_location ?? null;
        instance.startAt = row.start_at ? new Date(row.start_at).toISOString() : null;
        instance.endAt = row.end_at ? new Date(row.end_at).toISOString() : null;
        instance.isPaid = Boolean(row.is_paid);
        instance.isBroadcast = Boolean(row.is_broadcast);
        instance.broadcastType = row.broadcast_type ?? null;
        instance.tags = row.tags ?? null;
        instance.categories = row.categories ?? null;
        instance.isInteractive = Boolean(row.is_interactive);
        instance.isAnonymous = Boolean(row.is_anonymous);
        instance.interested = row.interested ?? null;
        instance.attachedDocuments = row.attached_documents ?? null;
        instance.groupId = row.group_id ?? null;
        instance.createdAt = row.created_at ? (new Date(row.created_at)).toISOString() : null;
        instance.modifiedAt = row.modified_at ? (new Date(row.modified_at)).toISOString() : null;
        instance.isDeleted = Boolean(row.is_deleted);
        instance.isHidden = Boolean(row.is_hidden);
        instance.isArchived = Boolean(row.is_archived);
        instance.__isNull = false;
        instance.__isDefault = false;
        return instance;
    }

    static null() {
        return new EventModel();
    }

    static default() {
        const instance = new EventModel();
        instance.id = 0;
        instance.organiserId = 0;
        instance.organisers = "";
        instance.title = "default event";
        instance.description = "";
        instance.onlineLocation = "";
        instance.startAt = new Date().toISOString();
        instance.endAt = new Date(Date.now() + 3600 * 1000).toISOString();
        instance.isPaid = false;
        instance.isBroadcast = false;
        instance.broadcastType = "";
        instance.tags = "";
        instance.categories = "";
        instance.isInteractive = true;
        instance.isAnonymous = false;
        instance.interested = "";
        instance.attachedDocuments = "";
        instance.groupId = "";
        instance.createdAt = new Date().toISOString();
        instance.modifiedAt = new Date().toISOString();
        instance.isDeleted = false;
        instance.isHidden = false;
        instance.isArchived = false;
        instance.__isNull = false;
        instance.__isDefault = true;
        return instance;
    }

    toClient() {
        const obj = pojo(this);
        delete obj.__isDefault;
        delete obj.__isNull;
        return obj;
    }
}

export { updateEvent, EventModel, eventKeyMap };
