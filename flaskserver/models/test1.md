## "facebook/bart-large-cnn"

Goood but can't handle long documents

- House Speaker John A. McCarthy says raising the debt ceiling is the only way to keep his job. He says the alternative is a bill that would slash nondefense discretionary spending by 22 percent. McCarthy: "We have a third option: Do we want to blow up the economy, or do we believe that that is the right choice"
- The third option is that we can let the adults come back in the room. We can pass a clean debt limit bill. Governing is hard, but it is especially hard when you let the clowns drive the car. Please, Mr. Speaker, let the adults take the wheel.

Max input length: 1024, Max Sentence length: 1022, SpecialTokens: 2

## "Stancld/longt5-tglobal-large-16384-pubmed-3k_steps"

Can do one long document but poor summarization

 -the majority of the government is hoping that the adults in the room will prevail and that the adults will be so frightened by that consequence that we will accept their self-destructive alternative. the alternative is a bill that would slash nondefense discretionary spending by 22 percent. the majority would have us believe that our only choice right now is: do we want to blow up the economy or do [[page ] we want to ruin the lives of millions of people?


# Dealing with large inputs
Many models have maximum sequence lengths, and their runtime increases non-linearly with length. This makes throwinng big speeches into one model difficult.
There are some "large" models that (likely use tricks) in order to get around this issue, but they generally have poor performance.
There are also manual tricks like Hierarchical Summarization: Break the input into digestable chunks, summarise each of those chunks, and then summarize those summarizations. This works but it has issues that must be worked through.
- 1: You need tricks to take into account the whole document context. For example, when using facebook/bart-large-cnn, my input was divided into 2 chunks, the first captured the context that it was a speaker saying something then the second 
- 2: Models may get unpredictable if we give them too small of an input. How do we solve this? truncate? cram it into another section? split the second to last chunk up? Again in the facebook/bart-large-cnn example the last input was quite short and the second pass was way worse


## Datasets
- https://paperswithcode.com/dataset/govreport This provides exxactly what we need