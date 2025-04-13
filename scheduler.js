//THIS JAVASCRIPT FILE MANAGES SCHEDULED TASKS FOR THE DATABASE

//Load in necessary packages
const cron = require ('node-cron');
const db = require('./db');
const emailServices = require('./email');
const Trip = require('./backend/models/tripModel').Trip;
const User = require('./backend/models/userModel').User;

//--------------------------- TASKS BELOW -----------------------------------//
console.log("Running scheduled tasks...");

//Task to update trips to in progress when departure time passes (runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled job to update trip statuses...');
    try {

        //Establish transaction
        const conn = await db.pool.getConnection();
        await conn.beginTransaction();

        //Get all trips that will be updated to be in progress
        const sql = `
        SELECT * FROM tripData
        WHERE date = CURDATE() AND time <= NOW() AND tripStatus <> 'In Progress' AND tripType = 'Providing a ride'
      `;
        const result = await conn.query(sql);
        const trips = result.map(trip => new Trip(trip));

        //Update trip status to in progress
        const sql2 = `
          UPDATE tripData
          SET tripStatus = 'In Progress'
          WHERE date = CURDATE() AND time <= NOW() AND tripStatus <> 'In Progress' AND tripType = 'Providing a ride'
        `;
        const result2 = await conn.query(sql2);
        console.log('Trip statuses updated:', result2.affectedRows);

        //Delete requests to join these trips
        let deleteCount = 0;
        for(const trip of trips){
            const sql3 = "DELETE FROM tripRequests WHERE tripID = ? AND passengerStatus = 'Requesting'";
            const result3 = await conn.query(sql3, [trip.id]);
            deleteCount += result3.affectedRows;
        }
        console.log('Trip requests deleted:', deleteCount);

        //Commit transaction if successful
        await conn.commit();

    } catch (err) {
        if(conn){
            await conn.rollback();
        }
        console.error('Error updating trip statuses:', err);
    }finally{
        if(conn){
            conn.release();
        }
    }
});

//Task to close trip requests that have their departure time passed (runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
    console.log('Running scheduled job to update trip request statuses...');
    try {

        //Establish transaction
        const conn = await db.pool.getConnection();
        await conn.beginTransaction();

        //Get all trips that will be closed
        const sql = `
          SELECT * FROM tripData
          WHERE date = CURDATE() AND time <= NOW() AND tripStatus = 'Open' AND tripType = 'Requesting a ride'
        `;
        const result = await conn.query(sql);
        const trips = result.map(trip => new Trip(trip));

        //Update trip status
        const sql2 = `
          UPDATE tripData
          SET tripStatus = 'Closed'
          WHERE date = CURDATE() AND time <= NOW() AND tripType = 'Requesting a ride'
        `;
        const result2 = await conn.query(sql);
        console.log('Trip requests closed:', result2.affectedRows);

        //Commit Transaction if successful
        await conn.commit();

        //Iterate through trips and send emails to passengers
        let emailCount = 0;
        for (const trip of trips){
            trip.passengers = await Trip.getTripPassengers(trip.id);
            for (const passenger of trip.passengers){

                //Get user details
                const user = await User.getUserByID(passenger.userID);

                if (!user){
                    console.error('User not found for passenger:', passenger.userID);
                    continue;
                }

                //Send email letting them know they have a trip coming up today
                await emailServices.sendRequestClosedEmail(user.email, trip.title);
                emailCount++;
            }
        }

        //Send email to poster letting them know their request has been closed
        console.log('Trip request closed emails sent:', emailCount);
    } catch (err) {
        if(conn){
            await conn.rollback();
        }
        console.error('Error updating trip statuses:', err);
    }finally{
        if(conn){
            conn.release();
        }
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
    console.log('Running scheduled job email users with trip reminders...');
    try {
        //Define SQL query to get all trips which are open and have a departure time today
        const sql = 'SELECT * FROM tripData WHERE tripStatus = "Open" AND date = CURDATE()';
        const result = await db.query(sql);
        const trips = result.map(trip => new Trip(trip));

        //Iterate through trips and send reminder emails
        let emailCount = 0;
        
        for (const trip of trips){
            trip.passengers = await Trip.getTripPassengers(trip.id);
            for (const passenger of trip.passengers){

                //Get user details
                const user = await User.getUserByID(passenger.userID);

                if (!user){
                    console.error('User not found for passenger:', passenger.userID);
                    continue;
                }

                //Send email letting them know they have a trip coming up today
                await emailServices.sendReminderEmail(user.email, trip.title, trip.time);
                emailCount++;

            }
        }

        console.log('Reminder emails sent:', emailCount);
    } catch (err) {
        console.error('Error running scheduled job:', err);
    }
});





