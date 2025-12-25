/**
 * Random Data Generator Utility
 * Generates realistic fake data for testing purposes
 */

interface RandomDataOptions {
    count?: number;
}

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

const locationPrefixes = ['Downtown', 'Central', 'East', 'West', 'North', 'South'];
const locationTypes = ['Cafe', 'Hall', 'Park', 'Center', 'Plaza', 'Library', 'Hub'];

/**
 * Get random element from array
 */
function randomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random username
 */
export function generateUsername(): string {
    const firstName = randomElement(firstNames).toLowerCase();
    const lastName = randomElement(lastNames).toLowerCase();
    const number = randomInt(1, 999);
    return `${firstName}.${lastName}${number}`;
}

/**
 * Generate random email
 */
export function generateEmail(username?: string): string {
    const user = username || generateUsername();
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.com', 'test.com'];
    return `${user}@${randomElement(domains)}`;
}

/**
 * Generate random phone number
 */
export function generatePhoneNumber(): string {
    return `+1-${randomInt(200, 999)}-${randomInt(100, 999)}-${randomInt(1000, 9999)}`;
}

/**
 * Generate random display name
 */
export function generateDisplayName(): string {
    return `${randomElement(firstNames)} ${randomElement(lastNames)}`;
}

/**
 * Generate random event title
 */
export function generateEventTitle(): string {
    return randomElement(eventTitles);
}

/**
 * Generate random event description
 */
export function generateEventDescription(): string {
    return randomElement(eventDescriptions);
}

/**
 * Generate random location
 */
export function generateLocation(): string {
    return `${randomElement(locationPrefixes)} ${randomElement(locationTypes)}`;
}

/**
 * Generate random online meeting URL
 */
export function generateOnlineLocation(): string {
    const platforms = ['zoom.us', 'meet.google.com', 'teams.microsoft.com'];
    const meetingId = Math.random().toString(36).substring(2, 15);
    return `https://${randomElement(platforms)}/${meetingId}`;
}

/**
 * Generate random future date
 */
export function generateFutureDate(daysAhead = 30): Date {
    const now = new Date();
    const daysToAdd = randomInt(1, daysAhead);
    const hoursToAdd = randomInt(0, 23);
    const minutesToAdd = randomInt(0, 59);

    now.setDate(now.getDate() + daysToAdd);
    now.setHours(hoursToAdd, minutesToAdd, 0, 0);
    return now;
}

/**
 * Generate random duration in hours
 */
export function generateDuration(): number {
    const durations = [1, 1.5, 2, 2.5, 3, 4];
    return randomElement(durations);
}

/**
 * Generate random group name
 */
export function generateGroupName(): string {
    return randomElement(groupNames);
}

/**
 * Generate random website URL
 */
export function generateWebsiteUrl(): string {
    const username = generateUsername();
    const tlds = ['.com', '.io', '.net', '.org'];
    return `https://${username}${randomElement(tlds)}`;
}

/**
 * Generate random address
 */
export function generateAddress(): string {
    const streetNumber = randomInt(1, 9999);
    const streets = ['Main St', 'Oak Ave', 'Park Rd', 'Hill Dr', 'Lake Ln'];
    const cities = ['Springfield', 'Riverside', 'Fairview', 'Madison', 'Georgetown'];
    const states = ['CA', 'NY', 'TX', 'FL', 'WA'];

    return `${streetNumber} ${randomElement(streets)}, ${randomElement(cities)}, ${randomElement(states)} ${randomInt(10000, 99999)}`;
}

/**
 * Generate random tags
 */
export function generateTags(): string[] {
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

    return selected;
}

/**
 * Generate random categories
 */
export function generateCategories(): string[] {
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

    return selected;
}

/**
 * Generate complete user data
 */
export function generateUser() {
    const username = generateUsername();
    return {
        username,
        email: generateEmail(username),
        password: 'Test123!@#', // Default test password
    };
}

/**
 * Generate complete user profile data
 */
export function generateUserProfile(userId?: string) {
    const displayName = generateDisplayName();
    return {
        user_id: userId || '1',
        profile_name: displayName.toLowerCase().replace(' ', '_'),
        display_name: displayName,
        phone_number: generatePhoneNumber(),
        email: generateEmail(),
        address: generateAddress(),
        website_url: generateWebsiteUrl(),
    };
}

/**
 * Generate complete event data
 */
export function generateEvent(organiserId?: string) {
    const startAt = generateFutureDate();
    const duration = generateDuration();
    const endAt = new Date(startAt.getTime() + duration * 60 * 60 * 1000);

    return {
        organiser_id: organiserId || '1',
        title: generateEventTitle(),
        description: generateEventDescription(),
        online_location: generateOnlineLocation(),
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
        is_paid: Math.random() > 0.7,
        is_broadcast: Math.random() > 0.8,
        tags: generateTags(),
        categories: generateCategories(),
        is_interactive: true,
        is_anonymous: Math.random() > 0.9,
    };
}

/**
 * Generate complete group data
 */
export function generateGroup(creatorId?: string) {
    return {
        group_name: generateGroupName(),
        description: randomElement(eventDescriptions),
        creator_id: creatorId || '1',
    };
}

/**
 * Generate multiple users
 */
export function generateUsers(options: RandomDataOptions = {}) {
    const count = options.count || 10;
    return Array.from({ length: count }, () => generateUser());
}

/**
 * Generate multiple user profiles
 */
export function generateUserProfiles(userIds: string[], options: RandomDataOptions = {}) {
    const count = Math.min(options.count || userIds.length, userIds.length);
    return Array.from({ length: count }, (_, i) => generateUserProfile(userIds[i]));
}

/**
 * Generate multiple events
 */
export function generateEvents(organiserIds: string[], options: RandomDataOptions = {}) {
    const count = options.count || 20;
    return Array.from({ length: count }, () => {
        const organiserId = randomElement(organiserIds);
        return generateEvent(organiserId);
    });
}

/**
 * Generate multiple groups
 */
export function generateGroups(creatorIds: string[], options: RandomDataOptions = {}) {
    const count = options.count || 5;
    return Array.from({ length: count }, () => {
        const creatorId = randomElement(creatorIds);
        return generateGroup(creatorId);
    });
}
