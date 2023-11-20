/* Summary generation functions */
// Import the pipeline for the transformer
// Pipelines are extremely high level apis that abstract away nearly all the complexity of inputting text into a model
import env from "./validateEnv" // Import pre-validated environment variable
const {default : fetch} = require('node-fetch');
import createHttpError from "http-errors";

/* ===== Custom Typing and Responses for GenerateSummary ===== */


type GenSummaryResponse = SummaryResponse | ErrorResponse;

class SummaryResponse {
    public success: true = true;
    public summary: string = "";
  
    constructor(summary: string) {
      this.summary = summary;
    }
}
class ErrorResponse {
    public success: false = false;
    public error: string = "";
  
    constructor(error: string) {
      this.error = error;
    }
}

// This defines the input to generate Summary. It holds all information needed for our prompt
interface PromptInput {
  speechSpeaker: string;
  speechSection: string;
  speechText: string;
}



/* === Interfaces & typing for the local generator functions === */

interface PipelineQueryItem {
    summary_text: string;
  }
type PipelineQueryResponse = PipelineQueryItem[];

/* ==================== Generate Summary ==================== */
// This is the only exported function. It will generate a summary for the endpoint, how it's done is up to this function.
// The endpoint should not care how it's done, this function will conditionally call it's helpers to worry about this
const generateSummary= async (promptInput: PromptInput): Promise<GenSummaryResponse> => {

  let promptString = `Concisely summarize this speech given by ${promptInput.speechSpeaker} in the ${promptInput.speechSection}`+
  `and present the arguments that they make: \"${promptInput.speechText}\"`;

  // Utilize our chosen summary functionality
  // In this case, try flask then do inference
  const flaskSummaryRes = await generateSummaryFlask(promptString);

  // Attempt inference summary if failed
  if (!flaskSummaryRes.success){
    console.warn("Warning: Flask Server summarization failed.")
    return generateSummaryInference(promptString);
  } else {
    return flaskSummaryRes;
  }


}

// Generates a summary if needed and returns whether or not a new summary was generated
const generateSummaryIfNeeded = async (speech:any): Promise<boolean> => {
  if (!speech.summary)
        {
            // Translate our b64 encoded text into a regular string
            let text = atob(speech.text);
            // Create prompt for Algorithm
            const promptInput: PromptInput = {
                speechSpeaker: speech.speaker,
                speechSection: speech.section,
                speechText: text,
              };
            // Generate a summary using our prompt input and get a response
            const GenSummaryRes = await generateSummary(promptInput);

            if(GenSummaryRes.success) {
                speech.summary = GenSummaryRes.summary;
                return true;
            } else {
                throw createHttpError(500, GenSummaryRes.error);
            }
        }
  return false;
}

/* ==================== Summary Generation sub-Functions ==================== */
// These functions generate summaries according to a certain method. These can be swapped out in the main "generateSummary"
// in order to change behavior of the summarization


// genrateSummaryLocal uses huggingface.js which is a small js package to import local huggingface models
// the models are limted for this
// this is likely an ineffecient way to do it, and we should instead make a python flask server 
const generateSummaryLocal = async (input: string): Promise<GenSummaryResponse> => {

    try {
        
        const TransformersApi = Function('return import("@xenova/transformers")')();
        const { pipeline } = await TransformersApi;
        console.log("finished import");

        console.log("finished pipeline");
        const originalConsoleLog = console.log;
        const originalConsoleWarn = console.warn;
        const originalConsoleError = console.error;
        console.log = console.warn = console.error = () => {};
        let generator = await pipeline('summarization', 'Xenova/bart-large-xsum');
        
        const startTime = new Date();
        let output: PipelineQueryResponse = await generator(input, {
          min_length: 75,
          max_lengt: 150,
        });
        
        console.log("finished generator");
        const endTime = new Date();
        const executionTime = endTime.getTime() - startTime.getTime();
        console.log = originalConsoleLog;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        console.log(`Generation time: ${executionTime} milliseconds`);

    
      if (output.length < 1) {
        throw("Empty Generator Output")
      }
      console.log("given text:", input);
      console.log("output:", output);
      return new SummaryResponse(output[0].summary_text);


    } catch (error) {
        return new ErrorResponse('An error occurred during summary generation: ' + error);
    }
}

// generateSummaryInference uses the free huggingface API called Inference to get a summary there
// There are a range of strong models hosted here, but rate limits will apply
const generateSummaryInference = async (input: string): Promise<GenSummaryResponse> => {

  try {
  
    // Call the Inference Query and await it's response
    const inferenceResponse: PipelineQueryResponse = await InferenceAPIQuery(input);
    
    // If it gave us a correct response, return a SummaryResponse
    if(inferenceResponse.length > 0) {
      return new SummaryResponse(inferenceResponse[0].summary_text);
    } else {
      throw Error("Inference API did not return a valid response");
    }

  } catch (error) {
    return new ErrorResponse('An error occurred during summary generation: ' + error);
  }

}


// genrateSummaryLocal uses huggingface.js which is a small js package to import local huggingface models
// the models are limted for this
// this is likely an ineffecient way to do it, and we should instead make a python flask server 
const generateSummaryFlask = async (input: string): Promise<GenSummaryResponse> => {

  try {

    // Call the Flask API Query and await it's response
    const flaskResponse = await FlaskAPIQuery(input);

    if(typeof flaskResponse === 'undefined') {
      throw Error('Flask Server Error: Flask Response undefined');
    } else if (flaskResponse.summary_text){
      // If summary recieved, pass it up
      return new SummaryResponse(flaskResponse.summary_text);
    } else if (flaskResponse.error) {
      // If we don't have a summary, throw that error
      throw Error('Flask Server Error: ' + flaskResponse.error);
    } else {
      throw Error('Unknown Flask Server Error')
    }
  } catch (error) {
    return new ErrorResponse('An error occurred during summary generation: ' + error);
  }
}



/* ==================== Custom Queries ==================== */
// These are custom query functions to fetch from different locations

// Inference Query definition
// This function queries the inference API for a summarization
async function InferenceAPIQuery(data: string) {
  // Define our abortSignal and timeout
  const abortSignal = Timeout(60, "InferenceAPIQuery Timed Out").signal

  try {
      // Use Inference API token
      const API_TOKEN = env.INFERENCE_CONNECTION_STRING;
      const response = await fetch(
          "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
          {
              headers: { Authorization: `Bearer ${API_TOKEN}` },
              method: "POST",
              body: JSON.stringify(data),
              signal: abortSignal
          }  
      );

      // Return the result, whatever it is.
      const result = await response.json();
      return result;

    // If we encounter an error, check if it's because of the timeout before passing it up
  } catch (error) {

    if (abortSignal.aborted) {
      throw Error("Aborted Request: " + abortSignal.reason)
    } else{
      throw error
    }
  }
}


// Flask Query definition
// This function queries the Flask API for a summarization
// This is modeled after the inference api, which just takes a string of data
async function FlaskAPIQuery(data: string) {
  // Define our abortSignal and timeout
  const abortSignal = Timeout(60, "FlaskAPIQuery Timed Out").signal

  try {
    // Query the flask server
    const response = await fetch('http://localhost:5002/summary',
    {
      method: "POST",
      mode: "cors", // cross origin request
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
      },
      body: data,
      signal: abortSignal
    });

    // Return the result, whatever it is.
    const result = await response.json();
    return result;

  } catch(error) {

    // If we encounter an error, check if it's because of the timeout before passing it up
    if (abortSignal.aborted) {
      throw Error("Aborted Request: " + abortSignal.reason)
    } else{
      throw error
    }
  }
}


/* ==================== General Helpers ==================== */
// These are general helper functions that may eventually be moved out

// Timeout helper function
export const Timeout = (seconds= 130, msg="Request timed out") => {
	let controller = new AbortController();
	setTimeout(() => controller.abort(msg), seconds * 1000);
	return controller;
};

export {generateSummary, generateSummaryIfNeeded, PromptInput};