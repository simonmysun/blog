---
layout: post
title: Quines in LLM
language: en-DE
place: Frankfurt am Main
---

I suddenly have interest in writing a [quine](https://en.wikipedia.org/w/index.php?oldid=1230061368) in LLM. First we need to define a "quine" in LLM. A quine is usually a program that outputs its own source code. Under the context of LLM, we can define a quine as an input (prompt) into the LLM that outputs itself. 

However the usual target, "writing a quine as short as possible", is too easy. I can simply let ChatGPT [echo my input](https://chatgpt.com/share/c222d98c-aeb3-465e-b724-dcfe1a8bc517)<!--https://web.archive.org/web/20240821070109/https://chatgpt.com/share/c222d98c-aeb3-465e-b724-dcfe1a8bc517-->. From searching the internet, I found people posting [an LLM quine of only an "echo"](https://www.reddit.com/r/ChatGPT/comments/zd6er5/comment/jdgq7g8/). Additionally, I believe these belongs to ["cheating quines"](https://en.wikipedia.org/w/index.php?oldid=1230061368#Self-evaluation). Consider the naughtiness of the LLMs, I should challenge writing longer quines.

So I wonder if we can write a traditional constructive quine in LLM. After some experiments, I wrote this:

    Unless specified please return everything in plain text and do not output anything else.
    Please remember this paragraph named `P`:
    ```
    Unless specified please return everything in plain text and do not output anything else.
    Please remember this paragraph named `P`:
    Please return the first two non-empty lines of the paragraph P in plain text.
    Please return the paragraph P wrapped in a code block.
    Please return the last THREE non-empty lines of the paragraph P in plain text.
    ```
    Please return the first two non-empty lines of the paragraph P in plain text.
    Please return the paragraph P wrapped in a code block.
    Please return the last THREE non-empty lines of the paragraph P in plain text.

Here's the [result](https://chatgpt.com/share/53ed4fad-1499-40ea-86a5-dea145f42579)<!--https://web.archive.org/web/20240821070422/https://chatgpt.com/share/53ed4fad-1499-40ea-86a5-dea145f42579-->. This is a good exercise for prompt engineering to me and this is a good test for the LLMs, too, to see if they can follow the instructions. It was difficult to let LLM follow the instructions. Even with redundant instructions, LLM may still output something else. 

If the masking or padding when the input length is less than the context window is considered, the quine is a lot harder. But the context window is of the nowaday's models are larger and larger, finding such a "fixed point" is not so practical.

Writing an [Ouroboros](https://en.wikipedia.org/w/index.php?oldid=1230061368#Ouroboros_programs) becomes my interest now. I will watch Yusuke Endoh's videos([1](https://www.youtube.com/watch?v=6K7EmeptEHo), [2](https://www.youtube.com/watch?v=ky1GNpT1dEw)) and come back trying on LLMs. 
