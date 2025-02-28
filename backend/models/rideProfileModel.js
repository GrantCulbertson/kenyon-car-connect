// /backend/models/rideProfileModel.js

//Load in database
const e = require('express');
let db = require('../../db');

// ----------------------- DEFINE ride profile CLASS ------------------------//
class rideProfile{
    constructor({userID, name, pronouns, preferredMusic, conversationPreference, bio}){
        this.userID = userID;
        this.name = name;
        this.pronouns = pronouns;
        this.preferredMusic = preferredMusic;
        this.conversationPreference = conversationPreference;
        this.bio = bio;
    }

//Function to grab a ride profile by user ID:
static async getRideProfileByUserID(userID){
    try{
        console.log("rideProfileModel... getRideProfileByUserID... running for userID:", userID);
        const query = 'SELECT * FROM rideProfileData WHERE userID = ?';
        const params = [userID];
        const rows = await db.query(query, params);
        if (rows.length === 0){ //If nothing is returned they don't have a ride profile.
            console.log("No ride profile found for user ID:", userID);
            return null; //Return null if no ride profile is found
        }
        console.log("Ride Profile found for user ID:", userID);
        return new rideProfile(rows[0]); //Return ride profile object if ride profile is found attached to user.
    }catch(error){
        console.log("error in getRideProfileByUserID");
        throw error;
    }
};

static async addRideProfileToDatabase(userData){
    try{
        console.log("rideProfileModel... addRideProfileToDatabase... running");
        const query = 'INSERT INTO rideProfileData (userID, name, pronouns, preferredMusic, conversationPreference, bio) VALUES (?,?,?,?,?,?)';
        const params = [userData.userID, userData.name, userData.pronouns, userData.preferredMusic, userData.conversationPreference, userData.bio];
        const insert = await db.query(query, params); //Insert ride profile into database
        const profile = await rideProfile.getRideProfileByUserID(userData.userID); //Grab ride profile from database to verify it was added correctly
        console.log("Ride Profile added to database for user:", userData.userID);
        console.log("Ride Profile object received:", profile);
        return profile;
    }catch(error){
        console.log("error in addride profileToDatabase");
        throw error;
    }
};

static async updateRideProfile(userID, userData){
    try{
        console.log("ride profileModel... updateride profile... running for userID:", userID);
        const query = 'UPDATE rideProfileData SET pronouns = ?, preferredMusic = ?, conversationPreference = ?, bio = ? WHERE userID = ?';
        const params = [userData.pronouns, userData.preferredMusic, userData.conversationPreference, userData.bio, userID];
        const update = db.query(query, params); //Update ride profile info in database
        if(update.affectedRows > 0){
            return true; //Return true if update is successful
        }else{
            return false; //Return false if update is unsuccessful
        }
    }catch(error){
        console.log("error in updateRideProfile", error);
        throw error;
    }
}

//END OF CLASS DEFINITION
}

//export ride profile model
exports.rideProfile = rideProfile;