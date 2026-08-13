# Open letter to AI labs on Art. 50 watermarking

**From:** Sara Simeone  
**To:** Anthropic, and the signatories of the EU Code of Practice on Transparency of AI-generated Content, including OpenAI, Google, Meta, Microsoft, Mistral, and Cohere  
**Re:** Machine-readable marking under Article 50(2) and Recital 133

I write as a paying customer, and as someone whose post on this subject has now been read and argued over in public. Lines taken from that public thread are marked LinkedIn user 1, 2, and so on. Names are withheld unless those people ask to be named. See [SOURCES.md](SOURCES.md).

The reaction was not “users hate transparency.” It was more precise than that. People will accept a mark when a model did the work. They will not accept a silent stamp on text they originated, directed, and only asked you to tidy.

You have signed a Code of Practice that is supposed to help you comply with Article 50 of the EU AI Act. Recital 133 is not ambiguous. Machine-readable marking is not required where the AI is only helping with basic editing, or has not substantially changed the meaning of the original content. Blanket-watermarking everything is not a faithful reading of that rule. It is the cheapest way to avoid defending “substantially changed” case by case. *(LinkedIn user 3)*

An invisible watermark also fails the stated goal of the law. Article 50 is about making people aware of AI-generated content. A mark no reader can see does not inform a human. It informs a detector, later, on someone else’s terms. *(LinkedIn user 4)* That is provenance for platforms, not transparency for users.

Your own documentation already admits the problem. A Claude mark can appear on text the user wrote, then asked you to proofread, translate, or convert. If the signal fires on a coriander spelling fix, it is not proving authorship. It is corrupting the record. *(LinkedIn user 1, LinkedIn user 5)*

Paying customers should not have to leave your product, paste into a Google Doc, or invent workarounds to keep ownership of their own thinking. If you ban people for going around a mark you applied too broadly, you are punishing the human in the loop for a design choice you made.

I am not asking you to ignore the law. I am asking you to comply with it properly.

## Recommendations

**1. Stop blanket-marking. Respect Recital 133.**  
Do not treat “the model touched this” as “the model generated this.” If the user brought the draft and asked for grammar, spelling, light edit, or formatting, do not apply a generated-content watermark.

**2. Mark by intent, not by default.**  
You already have the prompt. Use it.

- `/proofread`, “fix grammar,” “tidy this,” “make this clearer”: no generated-content watermark
- `/create`, “write this,” “draft this from scratch”: mark it

If a session mixes both, mark only the spans the model actually generated, or ask the user to confirm the mode before you stamp the file.

**3. Replace a yes/no stamp with provenance states.** *(LinkedIn user 6)*  
A verifier should be able to show one of: human-origin, lightly edited, translated, transformed, fully generated. Include signer, model and version, confidence, and a way to contest the label. Proofreading must not produce the same interpretation as machine-authored content.

**4. Make the credit visible to the user.**  
If you need a machine-readable mark for fully generated output, pair it with a human-readable line the author can keep or edit:

`Ideated by [user], processed by [model]`

That is attribution, the way we credit a colleague. Invisible ownership of someone else’s judgement is not.

**5. Do not degrade the output in order to hide a signal.**  
If marking is done by shifting tokens away from the best candidate, you are no longer completing the customer’s request. *(LinkedIn user 7)* You are biasing the tool toward detectability. For code, synonym-style watermarking is worse: rigid syntax does not survive word swaps. If a mark breaks a build, it is not robust. It is reckless. *(LinkedIn user 8)*

**6. Publish how marking works, and how a user can contest it.**  
State what is marked, on which models and products, from which date, and how a customer can see or challenge a mark on their own text. A secret detector and a silent stamp is not a transparency regime.

**7. Put residual labelling duty where the law already allows it.**  
Where output is published to inform the public, deployers and human editors can disclose AI assistance. That is a different job from branding a private draft as synthetic because a spelling model ran over it. Do not use the difficulty of chasing individuals as a reason to over-mark every customer file.

## What I am not asking

I am not asking you to hide fully generated slop. If I tell a model to write the post, mark it.

I am not asking users to police this alone. We already pay. We already bring the ideas, the research direction, and the selection of what gets kept. That selection is the work. *(LinkedIn user 10)*

The question under the comments was not really about watermarks. It was: who owns the thinking? *(LinkedIn user 9)*

If the original intellectual creation is the user’s, and the model only processed it, the record should say so. If you want to comply, comply with the actual line in Recital 133. Do not outsource the cost of your legal hedge to the people who made your products useful.

I am happy to discuss this with anyone at your policy, product, or trust and safety teams who is willing to treat paying customers as the human in the loop, not as a risk to be stamped.

Sara Simeone

## References

- [How Claude marks AI-generated content](https://support.claude.com/en/articles/16266773-how-claude-marks-ai-generated-content)
- [Code of Practice on Transparency of AI-generated Content](https://digital-strategy.ec.europa.eu/en/news/strong-backing-code-practice-transparency-ai-generated-content)
- Regulation (EU) 2024/1689, Article 50 and Recital 133
- [Crowd-sourced lines](SOURCES.md)
