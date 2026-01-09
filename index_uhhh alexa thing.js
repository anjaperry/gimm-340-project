/* *
 * This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
 * Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
 * session persistence, api calls, and more.
 * */
const Alexa = require('ask-sdk-core');
const db = require('./Model/connection');


const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome, you can say Hello or Help. Which would you like to try?';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

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

const PingPongIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'PingPongIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Pong!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const SlotTestIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'SlotTestIntent';
    },
    handle(handlerInput) {
        
        const word = Alexa.getSlotValue(handlerInput.requestEnvelope, 'Word');
        const speakOutput = "You just said " + word;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const timeIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'timeIntent';
    },
    handle(handlerInput) {
        const now = new Date();
        
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        const speakOutput = `the current time is ${hours}:${minutes}:${seconds}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const addIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'addIntent';
    },
    handle(handlerInput) {
        
        const firstNumber = Number(Alexa.getSlotValue(handlerInput.requestEnvelope, 'firstNumber'));
        const secondNumber = Number(Alexa.getSlotValue(handlerInput.requestEnvelope, 'secondNumber'));
        
        const addOutput = firstNumber + secondNumber;
        
        const speakOutput = `${firstNumber} plus ${secondNumber} is ${addOutput}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

const gyroIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'gyroIntent';
    },
    async handle(handlerInput) {
        
        const IDEntry = Number(Alexa.getSlotValue(handlerInput.requestEnvelope, 'IDEntry'));
        // const distanceValue = Number(Alexa.getSlotValue(handlerInput.requestEnvelope, 'distanceValue'));
        
        // const speakOutput = `The entry you requested was ${IDEntry}`;
        
        try {
            // Query to get the distance_id from gyro_main table using the ID
            const gyroData = await db.query('SELECT distance_id FROM gyro_main WHERE id = ?', [IDEntry]);
            
            if (gyroData.length === 0) {
                const speakOutput = `No entry found for ID ${IDEntry}`;
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse();
            }
            
            const distanceId = gyroData[0].distance_id;
            
            // Query to get the distance value from distance table using the distance_id
            const distanceData = await db.query('SELECT distance FROM distance WHERE id = ?', [distanceId]);
            
            if (distanceData.length === 0) {
                const speakOutput = `No distance found for distance ID ${distanceId}`;
                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse();
            }
            
            const distance = distanceData[0].distance;
            const speakOutput = `The distance for entry ${IDEntry} is ${distance}`;

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        } catch (error) {
            console.error('Error fetching gyro data:', error);
            const speakOutput = 'Sorry, I had trouble fetching the data. Please try again.';
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
    }
};

const pickIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'pickIntent';
    },
    handle(handlerInput) {
        
        const startingNumber = Number(Alexa.getSlotValue(handlerInput.requestEnvelope, 'startingNumber'));
        const endingNumber = Number(Alexa.getSlotValue(handlerInput.requestEnvelope, 'endingNumber'));
        
        const min = Math.min(startingNumber, endingNumber);
        const max = Math.max(startingNumber, endingNumber);
        const pickOutput = Math.floor(Math.random() * (max - min + 1)) + min;
        
        const speakOutput = `between ${startingNumber} and ${endingNumber} I randomly choose ${pickOutput}`;

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
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet 
 * */
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
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open 
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not 
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs 
 * */
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
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents 
 * by defining them above, then also adding them to the request handler chain below 
 * */
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
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below 
 * */
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

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom 
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelloWorldIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        PingPongIntentHandler,
        SlotTestIntentHandler,
        timeIntentHandler,
        addIntentHandler,
        gyroIntentHandler,
        pickIntentHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();