// /backend/models/userModel.js

//Load in database
let db = require('../../db');
let emailServices = require('../../email');

// ----------------------- DEFINE USER CLASS ------------------------//
class User {
    constructor({id, firstName, lastName, email, password, age, gender, has_car, verificationStatus}){
        this.id = id;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.age = age;
        this.gender = gender;
        this.has_car = has_car;
        this.verificationStatus = verificationStatus || "No";
    }

//Function to add a user to the database after they have signed up.
    static async addUser(userData){
        try{

            const emailValidationCode = await User.generateEmailVerificationCode();
            console.log("userModel... addUser... running");
            const sql = 'INSERT INTO userData (firstName, lastName, email, password, age, gender, has_car, emailValidationCode) VALUES (?,?,?,?,?,?,?,?)';
            const params = [userData.firstName, userData.lastName, userData.email, userData.password, userData.age, userData.gender, userData.has_car, emailValidationCode];
            const user = await User.getUserByEmail(userData.email);

            if (user instanceof User){
                console.log("Email:", userData.email,"already exists in database... exiting addUser");
                return null;
            }else{
                const insert = await db.query(sql, params);
                const user = await User.getUserByEmail(userData.email);
                const sendEmail = await emailServices.sendVerificationEmail(userData.email, emailValidationCode); // Send email verification code to user after they sign up.
                console.log("New user:", userData.email, "added to database!");
                return user;
            }
        } 
        catch(error){
            console.log("error in addUser");
            throw error;
    }
    }


    //Function to create a unique random user ID (will not produce an ID already in the database):
    static async createID() {
        while (true) { // Loop until we find a unique ID
            let randomID = Math.floor(Math.random() * 1000000);
            let user = await User.getUserByID(randomID); // Await the database check
            
            if (!user || user.length === 0) { // If no user found, return the ID
                return randomID;
            }
    
            console.log("ID:", randomID, "already exists, generating new ID...");
        }
    }

    //Function to generate email verification code:
    static async generateEmailVerificationCode(){
        let code = Math.floor(Math.random() * 10000);
        return code;
    }

    //Function to get user by unique ID:
    static async getUserByID(ID){
        try{
            const sql = 'SELECT * FROM userData WHERE id = ?';
            const params = [ID];
            const user = await db.query(sql, params);
            return user;
        } catch (error){
            console.log("Error in getUserByID:", error);
            throw error;
        }
    }

    //Function to get user by email:
	static async getUserByEmail(email) {
		try {
            const query = `SELECT * FROM userData WHERE email = ?`;
			const rows = await db.query(query , [email]);
			if (rows.length > 0) {
                console.log("User data fetched... getUserByEmail");
				return new User(rows[0]);
			} else {
				return null;
			}
		} catch (err) {
			console.error(err);
			return false;
		}
    }

    //Function to verify user email:
    static async verifyEmail(email, inputCode){
        try{
            const query = `SELECT emailValidationCode FROM userData WHERE email = ?`;
            const rows = await db.query(query, [email]);
            if (rows[0].emailValidationCode == inputCode){
                //Update user verification status in database
                const sql = "UPDATE userData SET verificationStatus = 'Yes' WHERE email = ?";
                const insert = await db.query(sql, [email]);
                console.log(email,"verified & Database Updated!");
                return true;
        }else{
            return false;
        }
    }catch(error){
        console.log("Error in verifyEmail:", error);
        throw error;
    }
    }


    //Function to login user:
    static async loginUser(email,password){
        try{
            const query = 'SELECT * FROM userData WHERE email = ? AND password =?';
            const params = [email, password];
            const rows = await db.query(query, params);
            if (rows.length > 0){
                return new User(rows[0]); //Return user object if password & email are found in database
            }else{
                return null; //Return null if no user is found (wrong password or email)
            }
        }catch(error){
            console.log("Error in loginUser:", error);
            throw error;
        }
    }
//Bottom of user class here:
}



exports.User = User;