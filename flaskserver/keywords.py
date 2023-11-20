# ==================== summarizer.py ==================== #
# This will house our summarization class, which will manage the model being used, and have a single worker
import threading
import time
import queue # get a the threadsafe queue
import yake

# ========== Summarizer worker manager ========== #
# This allows the starting and stopping of one thread, which takes from the provided queue

class KeywordsWorkerManager():
    def __init__(self, keywordsQueue: queue.Queue(), delay=0.5):
        self.keywordsQueue = keywordsQueue
        self.stopWorkerEvent = threading.Event() 
        self.delay = delay
        self.running = False
        #Yake object for keyword extraction
        kw_extractor = yake.KeywordExtractor()
        language = "en"
        max_ngram_size = 1 # The max number of words to include in extraction
        deduplication_threshold = 0.1 # Avoids duplicated keywords
        numOfKeywords = 10 # Number of keywords to pull
        self.custom_kw_extractor = yake.KeywordExtractor(lan=language, n=max_ngram_size, dedupLim=deduplication_threshold, top=numOfKeywords, features=None)
        # model init goes here

    # Start the worker thread
    def startWorking(self):
        if(not self.running):
            self.running = True
            self.keywordWorker = threading.Thread(target=keywordWorker, args=(self.stopWorkerEvent, self.keywordsQueue,self.custom_kw_extractor))
            self.keywordWorker.start()
        
    # Stop and join the worker thread    
    def stopWorking(self):
        self.stopWorkerEvent.set()
        self.keywordWorker.join()
        self.running=False

    def __del__(self):
        self.stopWorking()


# ========== Summarizer work function ========== #
# This worker is implemented by the worker manager
# This worker will run the model asking for summaries 

def summarizerWorkFunction(stopWorkerEvent: threading.Event() , keywordsQueue, extractor):

    while (not stopWorkerEvent.is_set()):
        
        
        try:
            # Attempt to grab an item from the summaryQueue (NONBLOCKING)
            item = keywordsQueue.get(block=False)
            
            
            # ===== Actual summary goes here, this is a placeholder ===== #
            item['keywords']= extractor(item['text'])
            time.sleep(1)
            # ===== Actual summary goes here, this is a placeholder  ===== #
            
            
            # Tell the Flask thread to wake up
            item['event'].set()
            
            #Tell the queue we're done with this item
            keywordsQueue.task_done()

        except queue.Empty:
            # If queue is empty, wait
            time.sleep(1)

        

        