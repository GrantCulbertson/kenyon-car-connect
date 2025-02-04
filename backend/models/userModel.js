// /backend/models/userModel.js

//Load in database
let db = require('../../db');

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
            const sql = 'INSERT INTO userData (firstName, lastName, Email, Password, Age, Gender, has_car, emailValidationCode) VALUES (?,?,?,?,?,?,?,?)';
            const params = [userData.firstName, userData.lastName, userData.email, userData.password, userData.age, userData.gender, userData.has_car, emailValidationCode];
            const user = await User.getUserByEmail(userData.email);
            console.log(userData);

            if (user instanceof User){
                console.log("Email:", userData.email,"already exists in database... exiting addUser");
                return null;
            }else{
                const insert = await db.query(sql, params);
                const user = await User.getUserByEmail(userData.email);
                console.log(user)
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

    static async verifyEmail(email, inputCode){
        try{
            const query = `SELECT emailValidationCode FROM userData WHERE email = ?`;
            const emailValidationCode = await db.query(query, [email]);
            console.log(emailValidationCode);
            if (emailValidationCode === inputCode){
                console.log("Email verified!");
                return true;
        }else{
            return false;
        }
    }catch(error){
        console.log("Error in verifyEmail:", error);
        throw error;
    }
    }


//Bottom of user class here:
}



exports.User = User;