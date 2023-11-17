/* Summary generation functions */
// Import the pipeline for the transformer
// Pipelines are extremely high level apis that abstract away nearly all the complexity of inputting text into a model
import env from "./validateEnv" // Import pre-validated environment variable
const {default : fetch} = require('node-fetch');

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
  documentSpeaker: string;
  documentSection: string;
  documentText: string;
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

  let promptString = `Concisely summarize this speech given by ${promptInput.documentSpeaker} in the ${promptInput.documentSection}`+
  `and present the arguments that they make: \"${promptInput.documentText}\"`;

  return generateSummaryInference(promptString);
}



/* ==================== Helper Functions ==================== */

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
    // Use Inference API token
    const API_TOKEN = env.INFERENCE_CONNECTION_STRING;
  
    // Inference Query Def
    async function query(data: string) {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            {
                headers: { Authorization: `Bearer ${API_TOKEN}` },
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        const result = await response.json();
        return result;
    }

  // Call the Inference Query and await it's response
  const inferenceResponse: PipelineQueryResponse = await query(input);
  
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


export {generateSummary, PromptInput};