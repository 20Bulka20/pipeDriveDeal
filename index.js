const express = require("express");
const app = express();
const pipedrive = require("pipedrive");
require("dotenv").config();

//PERSON_EMAIL
//TOTAL_AMOUNT
//PERSON_NAME
//DATA_BY_STEPS_VALUES

const addLeadClient = new pipedrive.ApiClient();
const addNotesToDealClient = new pipedrive.ApiClient();
const addPersonClient = new pipedrive.ApiClient();
const addLeadLabelsClient = new pipedrive.ApiClient();
addLeadClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
addPersonClient.authentications.api_key.apiKey = process.env.PIPEDRIVE_API_KEY;
addNotesToDealClient.authentications.api_key.apiKey =
  process.env.PIPEDRIVE_API_KEY;
addLeadLabelsClient.authentications.api_key.apiKey =
  process.env.PIPEDRIVE_API_KEY;

const isWebForm = process.env.PERSON_NAME.includes("[WebForm]");

async function addPerson() {
  try {
    console.log("Sending request...");

    const api = new pipedrive.PersonsApi(addPersonClient);

    const data = {
      name:
        (isWebForm
          ? process.env.PERSON_NAME.replace("[WebForm]", "")
          : process.env.PERSON_NAME) || "Client Name Test",
      email: [
        {
          value: process.env.PERSON_EMAIL || "test@test.com",
          primary: true,
          label: isWebForm ? "from WebForm" : "from MVP Calc",
        },
      ],
    };
    const response = await api.addPerson(data);

    if (response) {
      addLead(response);
    }

    console.log("Person was added successfully!", response);
  } catch (err) {
    const errorToLog = err.context?.body || err;

    console.log("Adding failed", errorToLog);
  }
}

async function getLeadLabels() {
  try {
    console.log("Sending request...");

    const api = new pipedrive.LeadLabelsApi(addLeadLabelsClient);

    const getLeadLabelsResponse = await api.getLeadLabels();

    console.log("Label to lead was added successfully!", getLeadLabelsResponse);
    const labelID = getLeadLabelsResponse.data.filter((el) =>
      isWebForm ? el.name == "WebForm" : el.name == "MVP"
    )[0].id;
    return labelID;
  } catch (err) {
    const errorToLog = err.context?.body || err;

    console.log("Adding label to lead failed", errorToLog);
  }
}
async function addLead(response) {
  try {
    console.log("Sending request...");
    const labelId = await getLeadLabels();
    const api = new pipedrive.LeadsApi(addLeadClient);

    const data = {
      title: isWebForm
        ? process.env.PERSON_EMAIL
        : `${process.env.PERSON_EMAIL} MVP calc`,
      person_id: response.data.id,
      value: {
        amount: +process.env.TOTAL_AMOUNT || 0,
        currency: "USD",
      },
      label_ids: [labelId],
    };
    const leadResponse = await api.addLead(data);

    if (leadResponse) {
      addNoteToDeal(leadResponse);
    }

    console.log("Lead was added successfully!", leadResponse);
  } catch (err) {
    const errorToLog = err.context?.body || err;

    console.log("Adding lead failed", errorToLog);
  }
}

async function addNoteToDeal(response) {
  try {
    console.log("Sending request...");

    const api = new pipedrive.NotesApi(addNotesToDealClient);

    const data = {
      content: process.env.DATA_BY_STEPS_VALUES || "Step1 test",
      lead_id: response.data.id,
    };
    const addNoteResponse = await api.addNote(data);

    console.log("Notes was added successfully!", addNoteResponse);
  } catch (err) {
    const errorToLog = err.context?.body || err;

    console.log("Adding note failed", errorToLog);
  }
}

addPerson();
