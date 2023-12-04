# ==================== app.py ==================== #
# This holds the main application of our flask server
from flask import Flask, request, jsonify, abort
import threading # to check thread ids
import time
import queue # get a threadsafe queue
# import our custom summarizer worker
from summarizer import SummarizerWorkManager


# Application instance
app = Flask(__name__)

# Threadsafe Queue params
queue_maximum_size = 1
queue_timeout = 2
wait_in_queue_timeout = 30


# ========== Custom Error Handlers ========== #
@app.errorhandler(400)
def bad_request(error):
    description = error.description
    return jsonify({"error": f"Bad Request: {description}"}), 400
@app.errorhandler(503)
def bad_request(error):
    description = error.description
    return jsonify({"error": f"Service Unavailable: {description}"}), 504
@app.errorhandler(500)
def bad_request(error):
    description = error.description
    return jsonify({"error": f"Internal Service Error: {description}"}), 500
def handle_exception(e):
    #Return JSON instead of HTML for HTTP errors.
    # start with the correct headers and status code from the error
    response = e.get_response()
    # replace the body with JSON
    response.data = json.dumps({
        "code": e.code,
        "name": e.name,
        "description": e.description,
    })
    response.content_type = "application/json"
    return response

# ========== All Routes ========== #


# POST summary route will generate a summary on the fly provided the server isn't overloaded
@app.route('/summary', methods=['POST'])
def summary():
    
    # ===== ALWAYS THROW ERROR ===== #
    abort(501, description="Local ML Not Implemented")
    # ===== LOCAL ML NOT COMPLETE ===== #
    
    
    # Check if the input is JSON json
    try:
        data_string = request.data.decode('utf-8')
    except AttributeError as e:
        abort(400, description="Invalid request body. Expected utf-8")
    

    # Only attempt to summarize if we have text to work with
    if data_string is not None and isinstance(data_string, str) and data_string != "":

        try:
            # Create a wake event for this thread to wake once completed
            wakeThreadEvent = threading.Event() 

            # Create request data for the worker
            requestData = {
                'text': data_string,
                'summary': '',
                'event': wakeThreadEvent,
                'error': ''
            }

            # Attempt passing this request to the queue
            summaryQueue.put(requestData, timeout=queue_timeout)
            
        except queue.Full:
            # If the queue is full, the server is overloaded. Provide a good error message
            abort(503, description="Server overloaded: Queue full")
        
        
        
        # ===== Wait for summarization to be returned (BLOCKING) ===== #
        summaryFinished = wakeThreadEvent.wait(wait_in_queue_timeout)
        
        # Handle cases of summary not finishing, data not being sent, and summary being empty
        if(not summaryFinished):
            abort(503, description="Server overloaded: Timed out waiting for summary")

        elif(not requestData):
            abort(500, description="Summary Generation returned no response")
    
        elif (requestData['summary'] == ''):
            errorMessage = requestData['error'] if requestData['error'] != '' else "Unknown"
            abort(500, description=f"Summary Generation Failure Error: {errorMessage}")
        
        
        # ===== Return summary as JSON ===== #
        return jsonify({'summary_text': requestData['summary']})

    else:
        # Throw body error if we were given a bad body.
        abort(400, description="Invalid or missing string field in request body")



# This allows the flask server to be activated by "python app.py" rather than through flask run.
if (__name__ == '__main__'):
    port = 5002
    
    # Start our summary queue
    summaryQueue = queue.Queue(maxsize=queue_maximum_size)
    
    # Setup and begin our summarizer worker
    sumarizerWorkerManager = SummarizerWorkManager(summaryQueue)
    sumarizerWorkerManager.startWorking()

    # Once the worker is ready, we'll begin the server (BLOCKING)
    print(f"Starting Flask server on port: {port}")
    app.run(port=port, threaded=True)
    
    # After CTRL+C is pressed, join the worker thread
    print("Shutting down Flask server...")
    sumarizerWorkerManager.stopWorking()
