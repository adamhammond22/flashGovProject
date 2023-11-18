# ==================== summarizer.py ==================== #
# This will house our summarization class, which will manage the model being used, and have a single worker
import threading
import time
import queue # get a the threadsafe queue

# ========== Summarizer worker manager ========== #
# This allows the starting and stopping of one thread, which takes from the provided queue
class SummarizerWorkManager():
    def __init__(self, summaryQueue: queue.Queue(), delay=0.5):
        self.summaryQueue = summaryQueue
        self.stopWorkerEvent = threading.Event() 
        self.delay = delay
        self.running = False
        # model init goes here

    # Start the worker thread
    def startWorking(self):
        if(not self.running):
            self.running = True
            self.summarizerWorkerThread = threading.Thread(target=summarizerWorkFunction, args=(self.stopWorkerEvent, self.summaryQueue))
            self.summarizerWorkerThread.start()
        
    # Stop and join the worker thread    
    def stopWorking(self):
        self.stopWorkerEvent.set()
        self.summarizerWorkerThread.join()
        self.running=False

    def __del__(self):
        self.stopWorking()


# ========== Summarizer work function ========== #
# This worker is implemented by the worker manager
# This worker will run the model asking for summaries 
def summarizerWorkFunction(stopWorkerEvent: threading.Event() , summaryQueue):

    while (not stopWorkerEvent.is_set()):
        
        # Attempt to grab an item from the summaryQueue (NONBLOCKING)
        try:
            item = summaryQueue.get(block=False)
            item['summary']= f"Yup, this is a summary of {item['text']}"
            time.sleep(5)
            item['event'].set()
            summaryQueue.task_done()
        except queue.Empty:
            # If queue is empty, wait
            time.sleep(1)

        #Tell the queue we're done with this item

        