// /backend/models/userModel.js

//Load in database
let db = require('../../db');

// ----------------------- DEFINE USER CLASS ------------------------//
class User {
    constructor({id, firstName, lastName, email, password, age, gender, has_car, verficationStatus}){
        this.id = id;
        this.password = password;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.age = age;
        this.gender = gender;
        this.has_car = has_car;
        this.verificationStatus = verificationStatus;
    }

//Function to add a user to the database after they have signed up
    static async addUser(userData){
        try{
            const ID = User.createID();
            const emailValidationCode = User.generateEmailVerificationCode();
            console.log("userModel... addUser... running");
            const sql = 'INSERT INTO userData (ID, firstName, lastName, Email, Password, Age, Gender, has_car, emailValidationCode) VALUES (?,?,?,?,?,?,?,?,?)';
            const params = [ID, userData.firstName, userData.lastName, userData.email, userData.password, userData.age, userData.gender, userData.has_car, emailValidationCode];
            if (User.getUserByEmail(userData.email) != null){
                console.log("Email already exists in database... exiting addUser");
                return;
            }else{
                const insert = await db.query(sql, params);
            }
        } 
        catch(error){
            console.log("error in addUser");
            throw error;
    }
    }


    //Function to create a unique random user ID:
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
            const sql = 'SELECT * FROM userData WHERE ID = ?';
            const params = [ID];
            const user = await db.query(sql, params);
            return user;
        } catch (error){
            console.log("Error in getUserByID:", error);
            throw error;
        }
    }

    //Function to get user by email:
    static async getUserByEmail(email){
        try{
            const sql = 'SELECT * FROM userData WHERE Email = ?';
            const params = [email];
            const user = await db.query(sql, params);
            return user;
        } catch (error){
            console.log("Error in getUserByEmail:", error);
            throw error;
        }
    }

}




exports.User = User;