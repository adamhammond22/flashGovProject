/* Summary generation functions */
// Import the pipeline for the transformer
// Pipelines are extremely high level apis that abstract away nearly all the complecxity of inputting text into a model

const {default : fetch} = require('node-fetch');

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

interface GeneratorOutputItem {
    summary_text: string;
  }
  
type GeneratorOutput = GeneratorOutputItem[];

const generateSummaryLocal = async (input: string): Promise<SummaryResponse | ErrorResponse> => {
    
    

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
        let output: GeneratorOutput = await generator(input, {
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


const generateSummaryInference = async (input: string) => {
    const API_TOKEN = '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';
    // const nodeFetch = Function('return import("node-fetch")')();
    // const { fetch } = await nodeFetch;
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
    query(input).then((response) => {
        console.log(JSON.stringify(response));
    });
    // [{"generated_text":"Can you please let us know more details about your ids as a subscriber or other related project? Be sure to update your username and password or it will be stolen via email. Our information is only accessible through our website, and the payment support services"}]
}


export  {generateSummaryLocal, generateSummaryInference}