const express = require("express");
const app = express();
const pipedrive = require("pipedrive");
require("dotenv").config();

//PERSON_EMAIL
//TOTAL_AMOUNT
//PERSON_NAME
//DATA_BY_STEPS_VALUES

const addDealClient = new pipedrive.ApiClient();
const addNotesToDealClient = new pipedrive.ApiClient();
const updatePersonClient = new pipedrive.ApiClient();
addDealClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
updatePersonClient.authentications.api_key.apiKey =
  process.env.PIPEDRIVE_API_KEY;
addNotesToDealClient.authentications.api_key.apiKey =
  process.env.PIPEDRIVE_API_KEY;

async function addDeal() {
  try {
    console.log("Sending request...");

    const api = new pipedrive.DealsApi(addDealClient);

    const data = {
      title: "Deal from MVP calculator",
      person_id: process.env.PERSON_EMAIL || "DealMVPID",
      value: process.env.TOTAL_AMOUNT || "0",
    };
    const response = await api.addDeal(data);

    if (response) {
      addNoteToDeal(response);
      updatePerson(response);
    }

    console.log("Deal was added successfully!", response);
  } catch (err) {
    const errorToLog = err.context?.body || err;

    console.log("Adding failed", errorToLog);
  }
}
async function addNoteToDeal(response) {
  try {
    console.log("Sending request...");

    const api = new pipedrive.NotesApi(addNotesToDealClient);

    const data = {
      content: process.env.DATA_BY_STEPS_VALUES || "Step1 test",
      deal_id: response.data.id,
    };
    const addNoteResponse = await api.addNote(data);

    console.log("Notes was added successfully!", addNoteResponse);
  } catch (err) {
    const errorToLog = err.context?.body || err;

    console.log("Adding failed", errorToLog);
  }
}
async function updatePerson(response) {
  try {
    console.log("Sending updatePerson request...");

    const api = new pipedrive.PersonsApi(updatePersonClient);
    const PERSON_ID = response.data.person_id.value;
    const data = {
      name: process.env.PERSON_NAME || "Client Name Test",
      email: [
        {
          value: process.env.PERSON_EMAIL || "test@test.com",
          primary: true,
          label: "from MVP Calc",
        },
      ],
    };
    const updatePersonResponse = await api.updatePerson(PERSON_ID, data);

    console.log("Person was updated successfully!", updatePersonResponse);
  } catch (err) {
    const errorToLog = err.context?.body || err;

    console.log("Person update failed", errorToLog);
  }
}

addDeal();
