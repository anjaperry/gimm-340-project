//hello????

//Database connection
const buoy = require("./Model/buoy.js");

//Alexa Headers
const Alexa = require('ask-sdk-core');

//Express
const express =  require('express');
const app = express();
const { ExpressAdapter } = require('ask-sdk-express-adapter');

//This is called when the user opens your Alexa app.
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to the Arduino Demo. What would you like to do today?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

//////////////////////////////////
/////////CUSTOM FUNCTIONS/////////
//////////////////////////////////

//A very simple call-and-response intent handler. Responds "Pong!" when the user enters "Ping".
//If you want a good baseline handler with only the necessities, this is a good one to copy.
const PingIntentHandler = {
    canHandle(handlerInput) {
        //If Alexa gets a request...
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            ///And the prompt matches an utterance for the "PingIntent" intent...
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PingIntent';
    },
    //Do stuff
    handle(handlerInput) {
        //Declare a variable called "speakOutput" to hold what we want to say
        const speakOutput = 'Pong!';

        //Alexa starts building a response...
        return handlerInput.responseBuilder
            //And speaks the speakOutput variable
            .speak(speakOutput)
            .getResponse();
    }
};

//This handler adds an item to the database
const InsertIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'InsertIntent';
    },
    handle(handlerInput) {
        const item = Alexa.getSlotValue(handlerInput.requestEnvelope, 'item');

        insertToDatabase(item);

        const speakOutput = "Added " + item + " to the database.";
        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

//This handler gets Alexa to read out every item from the database
const GetAllFromDatabaseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetAllFromDatabaseIntent';
    },
    async handle(handlerInput) {
        try {
            const result = await getFromDatabase();

            let speakOutput;
            //If we don't get a result or the result is empty, make the speakOutput an error
            if (!result || result.length === 0) {
                speakOutput = id ? `No item found with ID ${id}.` : 'The database is empty.';
            } 
            //If we get a result that is an array, make the speakOutput an easy-to-read list
            else if (Array.isArray(result)) {
                speakOutput = result.map(item => item.info || JSON.stringify(item)).join(', ');
            } 
            //If we get a result that is one object (like one item from a database), make speakOutput the result we got from getFromDatabase()
            else if (typeof result === 'object') {
                speakOutput = result.info || JSON.stringify(result);
            } 
            //If we get something else, just make speakOutput a stringified version of it
            else {
                speakOutput = String(result);
            }

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();

        } catch (err) {
            console.error('Database error:', err);
            return handlerInput.responseBuilder
                .speak('Sorry, I could not access the database right now.')
                .getResponse();
        }
    }
};

//This handler gets Alexa to read out a particular item from the database, given its ID
const GetItemFromDatabaseIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'GetItemFromDatabaseIntent';
    },
    async handle(handlerInput) {
        try {
            const id = Alexa.getSlotValue(handlerInput.requestEnvelope, 'id');
            const result = await getFromDatabase(id);

            let speakOutput;
            //If we don't get a result or the result is empty, make the speakOutput an error
            if (!result || result.length === 0) {
                speakOutput = id ? `No item found with ID ${id}.` : 'The database is empty.';
            } 
            //If we get a result that is an array, make the speakOutput an easy-to-read list
            else if (Array.isArray(result)) {
                speakOutput = result.map(item => item.info || JSON.stringify(item)).join(', ');
            } 
            //If we get a result that is one object (like one item from a database), make speakOutput the result we got from getFromDatabase()
            else if (typeof result === 'object') {
                speakOutput = result.info || JSON.stringify(result);
            } 
            //If we get something else, just make speakOutput a stringified version of it
            else {
                speakOutput = String(result);
            }

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();

        } catch (err) {
            console.error('Database error:', err);
            return handlerInput.responseBuilder
                .speak('Sorry, I could not access the database right now.')
                .getResponse();
        }
    }

};

//////////////////////////////////
////////BUILT IN FUNCTIONS////////
//////////////////////////////////
const HelloWorldIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloWorldIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Hello World!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'You can say hello to me! How can I help?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

//////////////////////////////////
////////DATABASE FUNCTIONS////////
//////////////////////////////////
//Adds an item to the database
async function insertToDatabase(info = null) {
    const addResult = await noun.addRow({ info: info });
    console.log('Add Result:', addResult);
}

//If ID is null, it returns all items
//If ID is defined, it returns the item with that ID
async function getFromDatabase(id = null) {
    let result = null;
    if (id == null) result = await noun.selectAllRows();
    else result = await noun.selectById({ id: id });

    console.log('Get Result:', result);
    return result;
}

//////////////////////////////////
////////ARDUINO RECEIVERS/////////
//////////////////////////////////
app.use(express.urlencoded({ extended: true }));
//When your arduino adds something to the database, this is the POST request it should be sending
app.post('/addtodatabase/',
    (req, res) => {
        const { param1 } = req.body;
        insertToDatabase(param1 || "Default Value");
        res.send("POST Request Called")
    });

//////////////////////////////////
////////EXPORT & RUN SERVER///////
//////////////////////////////////
//Build the sill so Alexa can read it
const skillBuilder = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        PingIntentHandler,
        InsertIntentHandler,
        GetAllFromDatabaseIntentHandler,
        GetItemFromDatabaseIntentHandler,
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler
        //If Alexa isn't working when you prompt it, make sure the associated function is added here.
    )
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2');

const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, true, true);

app.post('/', adapter.getRequestHandlers());

//Run Server
const port = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Hello World!')
})
app.listen(port, () => console.log(`Running on port ${port}`));

// GET latest reading (joined gyro_main + distance)
// app.get(
//     '/buoy/',
//     upload.none(),
//     async (request, response) => {
//         try {
//             const sql = `
//                 SELECT g.id, g.x_axis, g.y_axis, g.z_axis, g.gyro_time, d.distance
//                 FROM gyro_main g
//                 JOIN distance d ON d.id = g.distance_id
//                 ORDER BY g.id DESC
//                 LIMIT 1
//             `;
//             const results = await db.query(sql);
//             if (!results || results.length === 0) {
//                 return response.status(404).json({ message: 'No readings found' });
//             }
//             return response.json(results[0]);
//         } catch (err) {
//             console.error('GET /buoy error', err);
//             return response.status(500).json({ error: 'Internal server error' });
//         }
// });

// POST a new reading from the Arduino: { x_axis, y_axis, z_axis, distance, gyro_time? }
// app.post(
//     '/buoy/',
//     async (request, response) => {
//         const { x_axis, y_axis, z_axis, distance, gyro_time } = request.body;
//         if (typeof x_axis === 'undefined' ||
//             typeof y_axis === 'undefined' ||
//             typeof z_axis === 'undefined' ||
//             typeof distance === 'undefined') {
//             return response.status(400).json({ error: 'Missing required fields' });
//         }

//         try {
//             // Insert distance first
//             const insertDistanceSql = 'INSERT INTO distance (distance) VALUES (?)';
//             const resDistance = await db.query(insertDistanceSql, [distance]);
//             const distanceId = resDistance.insertId || (resDistance[0] && resDistance[0].insertId);

//             // Insert gyro_main row. Use provided gyro_time or CURRENT_TIME()
//             const insertGyroSql = `
//                 INSERT INTO gyro_main (x_axis, z_axis, y_axis, distance_id, gyro_time)
//                 VALUES (?, ?, ?, ?, ?)
//             `;
//             const timeValue = gyro_time || new Date().toTimeString().split(' ')[0]; // "HH:MM:SS"
//             await db.query(insertGyroSql, [x_axis, z_axis, y_axis, distanceId, timeValue]);

//             return response.status(201).json({ message: 'Reading stored' });
//         } catch (err) {
//             console.error('POST /buoy error', err);
//             return response.status(500).json({ error: 'Internal server error' });
//         }
//     });

// Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Buoy server listening on port ${PORT}`);
// });