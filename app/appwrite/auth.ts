//create a bunch of functions to handle the auth process

import {account, appwriteConfig, database} from "~/appwrite/client";
import { OAuthProvider, Query, ID } from "appwrite";
import { redirect } from "react-router";

export const loginWithGoogle = async() => {
    try{
        account.createOAuth2Session(
            OAuthProvider.Google
        )

    }catch(e){
        console.log('loginWithGoogle ', e);
    }
}

export const getUser = async() => {
    try{
        const user = await account.get();
        if(!user){
            return redirect('/sign-in');
        } 
        const {documents} = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal('accountId', user.$id),
                Query.select(['name', 'email', 'imageUrl','joinedAt','accountId'])
            ]
        )

    }catch(e){
        console.log(e);
    }
}

export const logoutUser = async() => {
    try{
        await account.deleteSession('current');
        return true;
    }catch(e){
        console.log(e);
        return false;
    }
}

export const getGooglePicture = async() => {
    try{
        const session = await account.getSession('current');
        const oAuthToken = session.providerAccessToken = session.providerAccessToken;
        if (!oAuthToken){
            console.log('No OAuth token found');
            return null;
        }
        const response = await fetch(
            'https://people.googleapis.com/v1/people/me?personFields=photos',
            {
                headers: {
                    'Authorization': `Bearer ${oAuthToken}`
                }
            }
        );
        if (!response.ok){
            console.log('Failed to fetch profile photo');
            return null;
        }
        const data = await response.json();
        const photoUrl = data.photos && data.photos.length > 0 
        ? data.photos[0].url 
        : null;
        return photoUrl;
    }catch(e){
        console.log(e);
    }
}

export const storeUserData = async() => {
    try{
        const user = await account.get();
        if(!user){
            return null;
        }
        const {documents} = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal('accountId', user.$id)
            ]
        );
        if(documents.length > 0){
            return documents[0];
        }
        const imageUrl = await getGooglePicture();
        const newUser = await database.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                accountId: user.$id,
                email: user.email,
                name: user.name,
                imageUrl: imageUrl || '',
                joinedAt: new Date().toISOString()
            }
        );
        return newUser;
    }catch(e){
        console.log(e);
        return null;
    }
}

export const getExistingUser = async() => {
    try{
        const user = await account.get();
        if(!user){
            return null;
        }
        const {documents} = await database.listDocuments(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            [
                Query.equal('accountId', user.$id)
            ]
        );
        if(documents.length === 0){
            return null;
        }
        return documents[0];;
    }catch(e){
        console.log(e);
        return null;
    }
}