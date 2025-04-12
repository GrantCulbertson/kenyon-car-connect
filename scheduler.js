//THIS JAVASCRIPT FILE MANAGES SCHEDULED TASKS FOR THE DATABASE

//Load in necessary packages
const cron = require ('node-cron');
const db = require('./db');
const emailServices = require('./email');
const Trip = require('./backend/models/tripModel').Trip;
const User = require('./backend/models/userModel').User;

//--------------------------- TASKS BELOW -----------------------------------//
console.log("Running scheduled tasks...");

//Task to update trips to in progress when departure time passes
cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled job to update trip statuses...');
    try {
        const sql = `
          UPDATE tripData
          SET tripStatus = 'In Progress'
          WHERE time <= NOW() AND tripStatus <> 'In Progress'
        `;
        const result = await db.query(sql);
        console.log('Trip statuses updated:', result.affectedRows);
    } catch (err) {
        console.error('Error updating trip statuses:', err);
    }
});



//Task to update trip status to closed for trips that have been completed (runs at midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled job to clean up old trips...');
    try {
        const sql = 'UPDATE tripData SET tripStatus = "Closed" WHERE date < CURDATE()';
        const result = await db.query(sql);
        console.log('Old trips cleaned up:', result.affectedRows);
    } catch (err) {
        console.error('Error running scheduled job:', err);
    }
});

//Task to send reminder emails to users with upcoming trips (runs at midnight)
cron.schedule('0 0 * * *', async () => {
    console.log('Running scheduled job to clean up old trips...');
    try {
        const sql = 'SELECT id FROM tripData WHERE tripStatus = "Open" AND date == CURDATE()';
        const result = await db.query(sql);
        const trips = result.map(row => new Trip(row.id));

        //Iterate through trips and send reminder emails
        for (const trip of trips){
            trip.passengers = await Trip.getTripPassengers(trip.id);
            for (const passenger of trip.passengers){
                //Get user details
                const user = await User.getUserByID(passenger.userID);
                //Send email letting them know they have a trip coming up today
                await emailServices.sendReminderEmail(user.email, trip.title, trip.date, trip.time);

            }
        }

        console.log('Old trips cleaned up:', result.affectedRows);
    } catch (err) {
        console.error('Error running scheduled job:', err);
    }
});





