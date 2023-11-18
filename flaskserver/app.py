# ==================== app.py ==================== #
# This holds the main application of our flask server
from flask import Flask, request, jsonify, abort
import base64
import json
import time
import threading # to check thread ids
import queue # get a threadsafe queue
import asyncio
# import our custom summarizer worker
from summarizer import SummarizerWorkManager


# Application instance
app = Flask(__name__)

# Threadsafe Queue
queue_maximum_size = 1
queue_timeout = 2


# ========== Custom Error Handlers ========== #
@app.errorhandler(400)
def bad_request(error):
    description = error.description
    return jsonify({"error": f"Bad Request: {description}"}), 400


@app.route('/summary', methods=['GET'])
def summary():
    # Check if it's json
    if (request.is_json):
        try:
            # we can't trust is_json fully, so parsw within the try-catch block
            # if this is removed, you can intentionlly break the server
            data = request.get_json()
            text = data.get('text')
        except AttributeError as e:
            abort(400, description="Invalid request body. Expected JSON")

        
        # Only attempt to summarize if we have text to work with
        if text is not None and isinstance(text, str):
    

            try:
                # Create a wake event for this thread to wake once completed
                wakeThreadEvent = threading.Event() 
                # Create request data for the worker
                requestData = {
                    'text': text,
                    'summary': '',
                    'event': wakeThreadEvent,
                    'error': ''
                }
                # Attempt passing this request to the queue
                summaryQueue.put(requestData, timeout=queue_timeout)
                
            except queue.Full:
                abort(501, description="Queue is full, server overloaded, sorry :(")
            
            # ===== Wait for summarization to be returned (BLOCKING) ===== #
            wakeThreadEvent.wait()
            
            if(not requestData):
                abort(500, description="Summary Generation returned no response")
            elif (requestData.summary == ''):
                errorMessage = requestData.error if requestData.error != '' else "Unknown"
                abort(500, description=f"Summary Generation Failure Error: {errorMessage}")
            
            # Return summary as JSON
            return jsonify({'summary': requestData.summary})

        else:
            # Throw missing text error
            abort(400, description="Invalid or missing 'text' field in request body")
    
    else:
        # Throw invalid request error
        abort(400, description="Invalid request body. Expected JSON")



print("name:", __name__)
# This allows the flask server to be activated by "python app.py" rather than through flask run.
if (__name__ == '__main__'):
    port = 5002
    
    # Start our summary queue
    summaryQueue = queue.Queue(maxsize=queue_maximum_size)
    

    print(f"Starting manager t:{threading.get_ident()}")
    # Setup and begin our summarizer worker
    sumarizerWorkerManager = SummarizerWorkManager(summaryQueue)
    sumarizerWorkerManager.startWorking()
    print(f"we are past the starting of the thread t:{threading.get_ident()}")
    print(f"there is no reason there should be 2 threads... t:{threading.get_ident()}")
    # Once the worker is ready, we'll open the port
    print(f"starting on port: {port}")
    app.run(debug=True, port=port, threaded=True)
    
    
    print(f"shutting down server... t: {threading.get_ident()}")
    sumarizerWorkerManager.stopWorking()
    

async def summarizer(summary: str):
    return 5