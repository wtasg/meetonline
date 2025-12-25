/**
 * Server-side Random Data Generator
 * Generates and inserts realistic fake data into the database
 */

import type { Pool } from 'pg';
import type { RandomDataConfig } from '../types.js';
import bcrypt from 'bcrypt';


// Sample data pools
const firstNames = [
    'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry',
    'Iris', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Peter',
    'Quinn', 'Ruby', 'Sam', 'Tina', 'Uma', 'Victor', 'Wendy', 'Xavier',
    'Yara', 'Zack', 'Aria', 'Blake', 'Chloe', 'David'
];

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
    'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
    'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
];

const eventTitles = [
    'Tech Meetup', 'Book Club', 'Coffee Chat', 'Startup Pitch', 'Gaming Night',
    'Movie Marathon', 'Coding Workshop', 'Design Sprint', 'Hackathon',
    'Networking Event', 'Music Jam', 'Art Exhibition', 'Food Festival',
    'Yoga Session', 'Running Club', 'Photography Walk', 'Debate Night',
    'Language Exchange', 'Board Game Evening', 'Karaoke Party'
];

const eventDescriptions = [
    'Join us for an exciting event where we explore new ideas and connect with like-minded people.',
    'A great opportunity to learn, share, and grow together in a friendly environment.',
    'Bring your enthusiasm and creativity to this amazing gathering of passionate individuals.',
    'Network with professionals and enthusiasts while enjoying great discussions and activities.',
    'Experience something unique and memorable with our community of awesome people.'
];

const groupNames = [
    'Tech Enthusiasts', 'Book Lovers', 'Fitness Fanatics', 'Foodies United',
    'Creative Minds', 'Outdoor Adventurers', 'Music Makers', 'Film Buffs',
    'Language Learners', 'Startup Founders', 'Gamers Guild', 'Art Collective',
    'Sports Club', 'Photography Society', 'Science Geeks', 'History Buffs'
];

function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateUsername(): string {
    const firstName = randomElement(firstNames).toLowerCase();
    const lastName = randomElement(lastNames).toLowerCase();
    const number = randomInt(1, 999);
    return `${firstName}.${lastName}${number}`;
}

function generateEmail(username: string): string {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.com'];
    return `${username}@${randomElement(domains)}`;
}

function generatePhoneNumber(): string {
    return `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
}

function generateDisplayName(): string {
    return `${randomElement(firstNames)} ${randomElement(lastNames)}`;
}

function generateOnlineLocation(): string {
    const platforms = ['zoom.us', 'meet.google.com', 'teams.microsoft.com'];
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://${randomElement(platforms)}/${meetingId}`;
}

function generateFutureDate(daysAhead = 30): Date {
    const now = new Date();
    const daysToAdd = randomInt(1, daysAhead);
    const hoursToAdd = randomInt(0, 23);
    const minutesToAdd = randomInt(0, 59);

    now.setDate(now.getDate() + daysToAdd);
    now.setHours(hoursToAdd, minutesToAdd, 0, 0);
    return now;
}

function generateDuration(): number {
    const durations = [1, 1.5, 2, 2.5, 3, 4];
    return randomElement(durations);
}

function generateAddress(): string {
    const streetNumber = randomInt(1, 9999);
    const streets = ['Main St', 'Oak Ave', 'Park Rd', 'Hill Dr', 'Lake Ln'];
    const cities = ['Springfield', 'Riverside', 'Fairview', 'Madison', 'Georgetown'];
    const states = ['CA', 'NY', 'TX', 'FL', 'WA'];

    return `${streetNumber} ${randomElement(streets)}, ${randomElement(cities)}, ${randomElement(states)} ${randomInt(10000, 99999)}`;
}

function generateWebsiteUrl(): string {
    const username = generateUsername();
    const tlds = ['.com', '.io', '.net', '.org'];
    return `https://${username}${randomElement(tlds)}`;
}

function generateTags(): string {
    const allTags = [
        'technology', 'social', 'learning', 'networking', 'fun',
        'professional', 'casual', 'outdoor', 'indoor', 'creative',
        'educational', 'entertainment', 'sports', 'arts', 'music'
    ];

    const count = randomInt(2, 5);
    const selected: string[] = [];

    while (selected.length < count) {
        const tag = randomElement(allTags);
        if (!selected.includes(tag)) {
            selected.push(tag);
        }
    }

    return JSON.stringify(selected);
}

function generateCategories(): string {
    const allCategories = [
        'Tech & Innovation', 'Arts & Culture', 'Sports & Fitness',
        'Food & Drink', 'Business & Career', 'Health & Wellness',
        'Education & Learning', 'Entertainment', 'Community & Environment'
    ];

    const count = randomInt(1, 3);
    const selected: string[] = [];

    while (selected.length < count) {
        const category = randomElement(allCategories);
        if (!selected.includes(category)) {
            selected.push(category);
        }
    }

    return JSON.stringify(selected);
}

/**
 * Generate random users in the database
 */
export async function generateUsers(pool: Pool, count: number, cfg: RandomDataConfig): Promise<string[]> {
    const userIds: string[] = [];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test123!@#', salt);

    for (let i = 0; i < count; i++) {
        const username = generateUsername();

        try {
            const t = cfg.tables.userAccount;
            const result = await pool.query(
                `INSERT INTO ${t.table} (${t.username}, ${t.salt}, ${t.password})
                 VALUES ($1, $2, $3)
                 RETURNING ${t.id}`,
                [username, salt, hashedPassword]
            );
            userIds.push(result.rows[0][t.id].toString());
        } catch (error) {
            console.error(`Failed to create user ${username}:`, error);
        }
    }

    return userIds;
}

/**
 * Generate random user profiles in the database
 */
export async function generateUserProfiles(pool: Pool, userIds: string[], cfg: RandomDataConfig): Promise<string[]> {
    const profileIds: string[] = [];

    for (const userId of userIds) {
        const displayName = generateDisplayName();
        const profileName = displayName.toLowerCase().replace(' ', '_');

        try {
            const t = cfg.tables.userProfile;
            const cols = [
                t.userId,
                t.profileName,
                t.displayName,
                t.phoneNumber ?? 'phone_number',
                t.email ?? 'email',
                t.address ?? 'address',
                t.websiteUrl ?? 'website_url'
            ];
            const result = await pool.query(
                `INSERT INTO ${t.table} (${cols.join(', ')})
                 VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING ${t.id}`,
                [
                    userId,
                    profileName,
                    displayName,
                    generatePhoneNumber(),
                    generateEmail(profileName),
                    generateAddress(),
                    generateWebsiteUrl()
                ]
            );
            profileIds.push(result.rows[0][t.id].toString());
        } catch (error) {
            console.error(`Failed to create profile for user ${userId}:`, error);
        }
    }

    return profileIds;
}

/**
 * Generate random events in the database
 */
export async function generateEvents(pool: Pool, organiserProfileIds: string[], count: number, cfg: RandomDataConfig): Promise<number> {
    let created = 0;

    for (let i = 0; i < count; i++) {
        const organiserId = randomElement(organiserProfileIds);
        const startAt = generateFutureDate();
        const duration = generateDuration();
        const endAt = new Date(startAt.getTime() + duration * 60 * 60 * 1000);

        try {
            const t = cfg.tables.event;
            const cols = [
                t.organiserProfileId,
                t.title,
                t.description ?? 'description',
                t.onlineLocation ?? 'online_location',
                t.startAt,
                t.endAt,
                t.isPaid ?? 'is_paid',
                t.isBroadcast ?? 'is_broadcast',
                t.tags ?? 'tags',
                t.categories ?? 'categories',
                t.isInteractive ?? 'is_interactive',
                t.isAnonymous ?? 'is_anonymous'
            ];
            await pool.query(
                `INSERT INTO ${t.table} (${cols.join(', ')})
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
                [
                    organiserId,
                    randomElement(eventTitles),
                    randomElement(eventDescriptions),
                    generateOnlineLocation(),
                    startAt,
                    endAt,
                    Math.random() > 0.7,
                    Math.random() > 0.8,
                    generateTags(),
                    generateCategories(),
                    true,
                    Math.random() > 0.9
                ]
            );
            created++;
        } catch (error) {
            console.error(`Failed to create event ${i}:`, error);
        }
    }

    return created;
}

/**
 * Generate random groups in the database
 */
export async function generateGroups(pool: Pool, creatorProfileIds: string[], count: number, cfg: RandomDataConfig): Promise<number> {
    let created = 0;

    for (let i = 0; i < count; i++) {
        const creatorProfileId = randomElement(creatorProfileIds);

        try {
            const t = cfg.tables.group;
            const cols = [t.userProfileId, t.groupName, t.description ?? 'description', t.isPublic ?? 'is_public'];
            await pool.query(
                `INSERT INTO ${t.table} (${cols.join(', ')}) VALUES ($1, $2, $3, $4)`,
                [
                    creatorProfileId,
                    randomElement(groupNames),
                    randomElement(eventDescriptions),
                    true
                ]
            );
            created++;
        } catch (error) {
            console.error(`Failed to create group ${i}:`, error);
        }
    }

    return created;
}

/**
 * Clear all test data from database
 */
export async function clearAllData(pool: Pool, cfg: RandomDataConfig): Promise<void> {
    await pool.query(`TRUNCATE TABLE ${cfg.tables.event.table} CASCADE`);
    await pool.query(`TRUNCATE TABLE ${cfg.tables.group.table} CASCADE`);
    await pool.query(`TRUNCATE TABLE ${cfg.tables.userProfile.table} CASCADE`);
    await pool.query(`TRUNCATE TABLE ${cfg.tables.userAccount.table} CASCADE`);
}
