// /backend/models/userModel.js

//Load in database
let db = require('../../db');

// ----------------------- DEFINE USER CLASS ------------------------//
class user {
    constructor({id, name , email, age, gender, has_car}){
        this.id = id;
        this.name = name;
        this.email = email;
        this.age = age;
        this.gender = gender;
        this.has_car = has_car;
    }

//Function to add a user to the database after they have signed up
    static addUser(userData){
        try{

        } 
        catch(error){
            console.log(error in addUser);
            throw error;
    }
    }


}