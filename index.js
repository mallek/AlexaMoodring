// SkillCode generated code.
// Paste this into an AWS Lambda function based on the Fact blueprint.
var unirest = require('unirest');


const invocationName = "moodring";

const languageStrings = {
    'en': {
        'translation': {
            'WELCOME1': 'Welcome to event moodring! What even do you want to know your mood for?',
            'WELCOME2': 'Greetings!',
            'WELCOME3': 'Hello there!',
            'HELP': 'You can say help, stop, or cancel. ',
            'STOP': 'Goodbye!'
        }
    }
    // , 'de-DE': { 'translation' : { 'WELCOME'   : 'German Welcome etc.' } }
    // , 'jp-JP': { 'translation' : { 'WELCOME'   : 'Japanese Welcome etc.' } }
};
const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

const Alexa = require("alexa-sdk");
const https = require("https");

exports.handler = function (event, context, callback) {
    let alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID; //

    alexa.resources = languageStrings;
    // alexa.dynamoDBTableName = "myTable"; // persistent session attributes
    alexa.registerHandlers(handlers);
    alexa.execute();
}

const handlers = {
    'AMAZON.CancelIntent': function () {

        let say = 'Goodbye.';
        this.response
            .speak(say);

        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {

        var CustomIntents = getCustomIntents();
        var MyIntent = randomPhrase(CustomIntents);
        let say = 'Out of ' + CustomIntents.length + ' intents, here is one called, ' + MyIntent.name + ', just say, ' + MyIntent.samples[0];
        this.response
            .speak(say)
            .listen('try again, ' + say)
            .cardRenderer('Intent List', cardIntents(CustomIntents)); // , welcomeCardImg

        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {

        let say = 'Goodbye.';
        this.response
            .speak(say);

        this.emit(':responseReady');
    },
    'DetermineMoodIntent': function () {

        let filledSlots = delegateSlotCollection.call(this);

        if (!filledSlots) {
            return;
        }

        let slots = getSlotValues(filledSlots);

        //let say = 'Hello from DetermineMoodIntent. '  + slots.event.resolved;
        let say = "when you are doing" + slots.event.resolved + 'you feel ';

        try {
            unirest.post("https://community-sentiment.p.mashape.com/text/")
                .header("X-Mashape-Key", "nWMEhUYzs7mshomIVibg5FDagUrJp1cn728jsnw870TYzbpA1o")
                .header("X-Mashape-Host", "community-sentiment.p.mashape.com")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .send("txt=" + slots.event.resolved)
                .end(function (result) {
                    //console.log(result.status, result.headers, result.body);
                    say += result.body
                   // say += "Your call eas successfull";
                });
        }
        catch (error) {
             //say += "There was an error!" + error
        }



        //let say = 'Hello from DetermineMoodIntent. '  + slots.event.resolved + ' ' + ;

        //say += slotStatus;

        this.response
            .speak(say)
            .listen('try again, ' + say);


        this.emit(':responseReady');
    },
    'LaunchRequest': function () {
        let say = this.t('WELCOME1');
        this.response
            .speak(say)
            .listen('try again, ' + say);

        this.emit(':responseReady');
    },
    'Unhandled': function () {
        let say = 'The skill did not quite understand what you wanted.  Do you want to try something else? ';
        this.response
            .speak(say)
            .listen(say);
    }
};
//  ------ Helper Functions -----------------------------------------------

function randomPhrase(myArray) {
    return (myArray[Math.floor(Math.random() * myArray.length)]);
}

// returns slot resolved to an expected value if possible
function resolveCanonical(slot) {
    try {
        var canonical = slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
    } catch (err) {
        console.log(err.message);
        var canonical = slot.value;
    };
    return canonical;
};



function getCustomIntents() {
    var customIntents = [];
    for (let i = 0; i < intentsReference.length; i++) {
        if (intentsReference[i].name.substring(0, 7) != "AMAZON." && intentsReference[i].name !== "LaunchRequest") {
            customIntents.push(intentsReference[i]);
        }
    }
    return (customIntents);
}
function cardIntents(iArray) {
    var body = ""; for (var i = 0; i < iArray.length; i++) {
        body += iArray[i].name + "\n";
        body += "  '" + iArray[i].samples[0] + "'\n";
    }
    return (body);
}

const welcomeCardImg = {
    smallImageUrl: "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/alexa-devs-skill/cards/skill-builder-720x480._TTH_.png",
    largeImageUrl: "https://m.media-amazon.com/images/G/01/mobile-apps/dex/alexa/alexa-skills-kit/alexa-devs-skill/cards/skill-builder-1200x800._TTH_.png"
};


// ***********************************
// ** Helper functions from
// ** These should not need to be edited
// ** www.github.com/alexa/alexa-cookbook
// ***********************************

// ***********************************
// ** Route to Intent
// ***********************************

// after doing the logic in new session,
// route to the proper intent

function routeToIntent() {

    switch (this.event.request.type) {
        case 'IntentRequest':
            this.emit(this.event.request.intent.name);
            break;
        case 'LaunchRequest':
            this.emit('LaunchRequest');
            break;
        default:
            this.emit('LaunchRequest');
    }
}

// ***********************************
// ** Dialog Management
// ***********************************

function getSlotValues(filledSlots) {
    //given event.request.intent.slots, a slots values object so you have
    //what synonym the person said - .synonym
    //what that resolved to - .resolved
    //and if it's a word that is in your slot values - .isValidated
    let slotValues = {};

    console.log('The filled slots: ' + JSON.stringify(filledSlots));
    Object.keys(filledSlots).forEach(function (item) {
        //console.log("item in filledSlots: "+JSON.stringify(filledSlots[item]));
        var name = filledSlots[item].name;
        //console.log("name: "+name);
        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {

            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case "ER_SUCCESS_MATCH":
                    slotValues[name] = {
                        "synonym": filledSlots[item].value,
                        "resolved": filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        "isValidated": true
                    };
                    break;
                case "ER_SUCCESS_NO_MATCH":
                    slotValues[name] = {
                        "synonym": filledSlots[item].value,
                        "resolved": filledSlots[item].value,
                        "isValidated": false
                    };
                    break;
            }
        } else {
            slotValues[name] = {
                "synonym": filledSlots[item].value,
                "resolved": filledSlots[item].value,
                "isValidated": false
            };
        }
    }, this);
    //console.log("slot values: "+JSON.stringify(slotValues));
    return slotValues;
}
// This function delegates multi-turn dialogs to Alexa.
// For more information about dialog directives see the link below.
// https://developer.amazon.com/docs/custom-skills/dialog-interface-reference.html
function delegateSlotCollection() {
    console.log("in delegateSlotCollection");
    console.log("current dialogState: " + this.event.request.dialogState);

    if (this.event.request.dialogState === "STARTED") {
        console.log("in STARTED");
        console.log(JSON.stringify(this.event));
        var updatedIntent = this.event.request.intent;
        // optionally pre-fill slots: update the intent object with slot values
        // for which you have defaults, then return Dialog.Delegate with this
        // updated intent in the updatedIntent property

        disambiguateSlot.call(this);
        console.log("disambiguated: " + JSON.stringify(this.event));
        this.emit(":delegate", updatedIntent);
    } else if (this.event.request.dialogState !== "COMPLETED") {
        console.log("in not completed");
        //console.log(JSON.stringify(this.event));

        disambiguateSlot.call(this);
        this.emit(":delegate", updatedIntent);
    } else {
        console.log("in completed");
        //console.log("returning: "+ JSON.stringify(this.event.request.intent));
        // Dialog is now complete and all required slots should be filled,
        // so call your normal intent handler.
        return this.event.request.intent.slots;
    }
    return null;
}
// If the user said a synonym that maps to more than one value, we need to ask
// the user for clarification. Disambiguate slot will loop through all slots and
// elicit confirmation for the first slot it sees that resolves to more than
// one value.
function disambiguateSlot() {
    let currentIntent = this.event.request.intent;

    Object.keys(this.event.request.intent.slots).forEach(function (slotName) {
        let currentSlot = this.event.request.intent.slots[slotName];
        let slotValue = slotHasValue(this.event.request, currentSlot.name);
        if (currentSlot.confirmationStatus !== 'CONFIRMED' &&
            currentSlot.resolutions &&
            currentSlot.resolutions.resolutionsPerAuthority[0]) {

            if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_MATCH') {
                // if there's more than one value that means we have a synonym that
                // mapped to more than one value. So we need to ask the user for
                // clarification. For example if the user said "mini dog", and
                // "mini" is a synonym for both "small" and "tiny" then ask "Did you
                // want a small or tiny dog?" to get the user to tell you
                // specifically what type mini dog (small mini or tiny mini).
                if (currentSlot.resolutions.resolutionsPerAuthority[0].values.length > 1) {
                    let prompt = 'Which would you like';
                    let size = currentSlot.resolutions.resolutionsPerAuthority[0].values.length;
                    currentSlot.resolutions.resolutionsPerAuthority[0].values.forEach(function (element, index, arr) {
                        prompt += ` ${(index == size - 1) ? ' or' : ' '} ${element.value.name}`;
                    });

                    prompt += '?';
                    let reprompt = prompt;
                    // In this case we need to disambiguate the value that they
                    // provided to us because it resolved to more than one thing so
                    // we build up our prompts and then emit elicitSlot.
                    this.emit(':elicitSlot', currentSlot.name, prompt, reprompt);
                }
            } else if (currentSlot.resolutions.resolutionsPerAuthority[0].status.code == 'ER_SUCCESS_NO_MATCH') {
                // Here is where you'll want to add instrumentation to your code
                // so you can capture synonyms that you haven't defined.
                console.log("NO MATCH FOR: ", currentSlot.name, " value: ", currentSlot.value);

                if (REQUIRED_SLOTS.indexOf(currentSlot.name) > -1) {
                    let prompt = "What " + currentSlot.name + " are you looking for";
                    this.emit(':elicitSlot', currentSlot.name, prompt, prompt);
                }
            }
        }
    }, this);
}

// Given the request an slot name, slotHasValue returns the slot value if one
// was given for `slotName`. Otherwise returns false.
function slotHasValue(request, slotName) {

    let slot = request.intent.slots[slotName];

    //uncomment if you want to see the request
    //console.log("request = "+JSON.stringify(request));
    let slotValue;

    //if we have a slot, get the text and store it into speechOutput
    if (slot && slot.value) {
        //we have a value in the slot
        slotValue = slot.value.toLowerCase();
        return slotValue;
    } else {
        //we didn't get a value in the slot.
        return false;
    }
}
// End Skill Code
// Language Model  for reference
var interactionModel = [
    {
        "name": "AMAZON.CancelIntent",
        "samples": []
    },
    {
        "name": "AMAZON.HelpIntent",
        "samples": []
    },
    {
        "name": "AMAZON.StopIntent",
        "samples": []
    },
    {
        "name": "DetermineMoodIntent",
        "slots": [
            {
                "name": "event",
                "type": "AMAZON.SearchQuery",
                "samples": [
                    "{event} will be happening",
                    "i will be doing {event}",
                    "{event}"
                ]
            }
        ],
        "samples": [
            "how does {event} make me feel"
        ]
    },
    {
        "name": "LaunchRequest"
    }
];
var intentsReference = [
    {
        "name": "AMAZON.CancelIntent",
        "samples": []
    },
    {
        "name": "AMAZON.HelpIntent",
        "samples": []
    },
    {
        "name": "AMAZON.StopIntent",
        "samples": []
    },
    {
        "name": "DetermineMoodIntent",
        "slots": [
            {
                "name": "event",
                "type": "AMAZON.SearchQuery",
                "samples": [
                    "{event} will be happening",
                    "i will be doing {event}",
                    "{event}"
                ]
            }
        ],
        "samples": [
            "how does {event} make me feel"
        ]
    },
    {
        "name": "LaunchRequest"
    }
];
