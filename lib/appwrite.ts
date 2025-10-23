import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export interface CreateUserParams {
    email: string;
    password: string;
    name: string;
}

export interface SignInParams {
    email: string;
    password: string;
}

export const appwriteConfig = {
    endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
    projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
    platform: "com.cosmix.beauty",
    databaseId: '68fa82b2003362e4285e',
    bucketId: '68643e170015edaa95d7',
    userCollectionId: 'user',
}

export const client = new Client();

client
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.projectId)
    .setPlatform(appwriteConfig.platform)

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, name)
        if (!newAccount) throw Error;

        await signIn({ email, password });

        const avatarUrl = avatars.getInitialsURL(name);

        return await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            { email, name, accountId: newAccount.$id, avatar: avatarUrl }
        );
    } catch (e: any) {
        console.error('Create user error:', e);
        throw new Error(e.message || 'Failed to create user');
    }
}

export const signIn = async ({ email, password }: SignInParams) => {
    try {
        // Check if there's already an active session
        try {
            const currentSession = await account.get();
            if (currentSession) {
                // User is already logged in, delete the current session first
                await account.deleteSession('current');
            }
        } catch (sessionError) {
            // No active session, continue with sign in
        }

        const session = await account.createEmailPasswordSession(email, password);
        return session;
    } catch (e: any) {
        console.error('Sign in error:', e);
        throw new Error(e.message || 'Failed to sign in');
    }
}

export const signOut = async () => {
    try {
        await account.deleteSession('current');
    } catch (e: any) {
        console.error('Sign out error:', e);
        throw new Error(e.message || 'Failed to sign out');
    }
}

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();
        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [Query.equal('accountId', currentAccount.$id)]
        )

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (e: any) {
        console.log('Get current user error:', e);
        return null;
    }
}
