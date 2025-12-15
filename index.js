//commands because i keep forgetting them

//Update entry {IDUpdateEntry}  The first axis is {updateXAxis}  The second axis is {updateYAxis}  The thrid axis is {updateZAxis} and the distance is {updateDistance}
//Update entry 1 The first axis is 1 The second axis is 1 The thrid axis is 1 and the distance is 1
//delete entry {IDDeleteEntry}
//What are the values in entry {IDSelectEntry}
//Add entry timestamp



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
    async handle(handlerInput) {
        try {
            const speakOutput = 'Welcome to the Arduino Demo. What would you like to do today?';

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } catch (error) {
            console.error('Launch request error:', error);
            const speakOutput = 'Sorry, there was a problem starting the skill. Please try again later.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
    }
};

//////////////////////////////////
/////////CUSTOM FUNCTIONS/////////
//////////////////////////////////

//A very simple call-and-response intent handler. Responds "Pong!" when the user enters "Ping".
//If you want a good baseline handler with only the necessities, this is a good one to copy.
const PingPongIntentHandler = {
    canHandle(handlerInput) {
        //If Alexa gets a request...
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            ///And the prompt matches an utterance for the "PingIntent" intent...
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PingPongIntent';
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

//Adds a new gyro_main row using the buoy model helper
const buoyAddIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'buoyAddIntent';
    },
    async handle(handlerInput) {
        // const get = (name) => Alexa.getSlotValue(handlerInput.requestEnvelope, name);
        // const x = Number(get('x_axis'));
        // const y = Number(get('y_axis'));
        // const z = Number(get('z_axis'));
        // const distanceId = Number(get('distance_id'));

        // Fixed test values
        const x = 5;
        const y = 10;
        const z = 15;
        const distanceId = 1;
        
        // Generate current time in HH:MM:SS format (Mountain Time)
        const now = new Date();
        const gyroTime = now.toLocaleTimeString('en-US', { 
            timeZone: 'America/Denver',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        // if (![x, y, z, distanceId].every(Number.isFinite)) {
        //     const speakOutput = 'Please provide x, y, z, and distance id.';
        //     return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        // }

        try {
            const result = await buoy.addRow({
                x_axis: x,
                y_axis: y,
                z_axis: z,
                distance_id: distanceId,
                gyro_time: gyroTime,
            });
            const insertedId = result?.insertId ?? (Array.isArray(result) ? result[0]?.insertId : undefined);
            const speakOutput = insertedId
                ? `Added entry with ID ${insertedId}.`
                : 'Added entry successfully.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        } catch (err) {
            console.error('buoyAddIntent error:', err);
            const speakOutput = 'Sorry, I could not add that buoy entry right now.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }
    }
};

//Updates an existing gyro_main row using the buoy model helper
const buoyUpdateIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'buoyUpdateIntent';
    },
    async handle(handlerInput) {
        const get = (name) => Alexa.getSlotValue(handlerInput.requestEnvelope, name);
        const id = Number(get('IDUpdateEntry'));
        const x = Number(get('updateXAxis'));
        const y = Number(get('updateYAxis'));
        const z = Number(get('updateZAxis'));
        const distanceId = Number(get('updateDistance'));
        //const gyroTime = '12:00:00'; // Fixed time for now

        if (!Number.isFinite(id)) {
            const speakOutput = 'Please provide a valid numeric ID to update.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }
        if (![x, y, z, distanceId].every(Number.isFinite)) {
            const speakOutput = 'Please provide valid numbers for x, y, z axes and distance.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }

        try {
            const result = await buoy.updateRow({
                id,
                x_axis: x,
                y_axis: y,
                z_axis: z,
                distance_id: distanceId,
                //gyro_time: gyroTime,
            });
            const affected = result?.affectedRows ?? result?.rowCount ?? 0;
            const speakOutput = affected > 0
                ? `Updated entry with ID ${id}.`
                : `No entry found with ID ${id} to update.`;
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        } catch (err) {
            console.error('buoyUpdateIntent error:', err);
            const speakOutput = 'Sorry, I could not update that buoy entry right now.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }
    }
};

//Deletes a gyro_main row by ID using the buoy model helper
const buoyDeleteIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'buoyDeleteIntent';
    },
    async handle(handlerInput) {
        const idSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'IDDeleteEntry');
        const id = Number(idSlot);

        if (!Number.isFinite(id)) {
            const speakOutput = 'Please provide a valid numeric ID to delete.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }

        try {
            const result = await buoy.deleteRow({ id });
            const affected = result?.affectedRows ?? result?.rowCount ?? 0;
            const speakOutput = affected > 0
                ? `Deleted entry with ID ${id}.`
                : `No entry found with ID ${id} to delete.`;
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        } catch (err) {
            console.error('buoyDeleteIntent error:', err);
            const speakOutput = 'Sorry, I could not delete that buoy entry right now.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }
    }
};

//Reads a gyro_main row by ID using the buoy model helper
const buoySelectIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'buoySelectIntent';
    },
    async handle(handlerInput) {
        const idSlot = Alexa.getSlotValue(handlerInput.requestEnvelope, 'IDSelectEntry');
        const id = Number(idSlot);

        if (!Number.isFinite(id)) {
            const speakOutput = 'Please provide a valid numeric ID to look up.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        }

        try {
            const rows = await buoy.selectById({ id });
            if (!rows || rows.length === 0) {
                const speakOutput = `No entry found for ID ${id}.`;
                return handlerInput.responseBuilder.speak(speakOutput).getResponse();
            }

            const record = rows[0];
            const distance = record.distance_value || record.distance || record.distance_id;
            const speakOutput = `Entry ${id}: distance ${distance}, x ${record.x_axis}, y ${record.y_axis}, z ${record.z_axis}.`;
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
        } catch (err) {
            console.error('buoySelectIntent error:', err);
            const speakOutput = 'Sorry, I could not fetch that buoy entry right now.';
            return handlerInput.responseBuilder.speak(speakOutput).getResponse();
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

// ////////////////////////////////
// //////DATABASE FUNCTIONS////////
// ////////////////////////////////
// // Adds an item to the database
// async function insertToDatabase(info = null) {
//     const addResult = await noun.addRow({ info: info });
//     console.log('Add Result:', addResult);
// }

// // If ID is null, it returns all items
// // If ID is defined, it returns the item with that ID
// async function getFromDatabase(id = null) {
//     let result = null;
//     if (id == null) result = await noun.selectAllRows();
//     else result = await noun.selectById({ id: id });

//     console.log('Get Result:', result);
//     return result;
// }

// ////////////////////////////////
// //////ARDUINO RECEIVERS/////////
// ////////////////////////////////
// app.use(express.urlencoded({ extended: true }));
// //When your arduino adds something to the database, this is the POST request it should be sending
// app.post('/addtodatabase/',
//     (req, res) => {
//         const { param1 } = req.body;
//         insertToDatabase(param1 || "Default Value");
//         res.send("POST Request Called")
//     });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Arduino Data Receiver
app.post('/addtodatabase', async (req, res) => {
    try {
        const { x, y, z, distance } = req.body;
        
        // Generate current time in Mountain Time
        const now = new Date();
        const gyroTime = now.toLocaleTimeString('en-US', { 
            timeZone: 'America/Denver',
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        
        // Insert into database
        const result = await buoy.addRow({
            x_axis: Number(x),
            y_axis: Number(y),
            z_axis: Number(z),
            distance_id: 1, // Or parse from Arduino if needed
            gyro_time: gyroTime,
        });
        
        res.status(200).send('Data received and stored');
        console.log('Arduino data stored:', { x, y, z, distance, gyroTime });
    } catch (err) {
        console.error('Error storing Arduino data:', err);
        res.status(500).send('Error storing data');
    }
});

//////////////////////////////////
////////EXPORT & RUN SERVER///////
//////////////////////////////////
//Build the sill so Alexa can read it
const skillBuilder = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        PingPongIntentHandler,
        buoySelectIntentHandler,
        buoyAddIntentHandler,
        buoyUpdateIntentHandler,
        buoyDeleteIntentHandler,
        IntentReflectorHandler,
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