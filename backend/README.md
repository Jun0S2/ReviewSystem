```
pip install -r requirements.txt
uvicorn main:app --reload
```

### Requirements

- fastapi
- uvicorn
- pydantic

version1.1
INFO: Application startup complete.
{'summary': "The paper discusses Retrieval-Augmented Generation (RAG), a novel approach that integrates parametric and non-parametric memory to enhance the performance of knowledge-intensive natural language processing (NLP) tasks. Traditional large pre-trained language models, while effective, struggle with accessing and manipulating factual knowledge, leading to limitations in performance on specific tasks. RAG addresses this by combining a pre-trained sequence-to-sequence (seq2seq) model with a retrieval mechanism that accesses a dense vector index of Wikipedia. This hybrid architecture allows the model to generate more accurate and diverse responses in various tasks, significantly outperforming both pure parametric models and specialized architectures in open-domain question answering, abstractive text generation, and fact verification.\n\nThe authors present two formulations of RAG: RAG-Sequence, which uses the same retrieved passage for generating the entire output sequence, and RAG-Token, which can utilize different passages for each token generated. The results showcase that RAG models achieve state-of-the-art performance on multiple benchmarks, including open-domain QA tasks, and demonstrate the ability to produce more factual and specific language outputs compared to traditional models. Additionally, RAG's retrieval component can be easily updated with new information, making it adaptable to changes in knowledge over time. Overall, RAG represents a significant advancement in the field of NLP, providing a powerful tool for tasks that require extensive factual knowledge.", 'highlighted_sentences': ['Retrieval-Augmented Generation for\nKnowledge-Intensive NLP Tasks\nPatrick Lewis†‡, Ethan Perez⋆,\nAleksandra Piktus†, Fabio Petroni†, Vladimir Karpukhin†, Naman Goyal†, Heinrich Küttler†,\nMike Lewis†, Wen-tau Yih†, Tim Rocktäschel†‡, Sebastian Riedel†‡, Douwe Kiela†\n†Facebook AI Research;‡University College London;⋆New York University;\nplewis@fb.com\nAbstract\nLarge pre-trained language models have been shown to store factual knowledge\nin their parameters, and achieve state-of-the-art results when ﬁne-tuned on down-\nstream NLP tasks.', 'However, their ability to access and precisely manipulate knowl-\nedge is still limited, and hence on knowledge-intensive tasks, their performance\nlags behind task-speciﬁc architectures.', 'Additionally, providing provenance for their\ndecisions and updating their world knowledge remain open research problems.', 'Pre-\ntrained models with a differentiable access mechanism to explicit non-parametric\nmemory have so far been only investigated for extractive downstream tasks.', 'We\nexplore a general-purpose ﬁne-tuning recipe for retrieval-augmented generation\n(RAG) — models which combine pre-trained parametric and non-parametric mem-\nory for language generation.'], 'title': 'Retrieval-Augmented Generation for', 'authors': ['both the generator and retriever are jointly learned.']}
INFO: 127.0.0.1:53442 - "POST /process-pdf HTTP/1.1" 200 OK

author 와 title 을 제대로 못가져 오고 있음.
