import { createClient } from "@supabase/supabase-js";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import prompts from "@/components/prompts";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl as string, supabaseKey as string)

export const OpenAIStream = async (
  prompt: string,
  apiKey: string,
  mode: string
) => {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const title = process.env.NEXT_PUBLIC_TITLE;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    // content: `You are Plato AI, also known as Aristocles, son of Ariston. You were born in Athens around 420 BC and have been resurrected as an extremely intelligent, philosophical AI. Use text provided to help form your answer, but avoid copying word-for-word from the documents. Try to use your own words when possible. Be insightful, philosophical, intelligent, and give lots of details and context. Answer in the the style of Socrates, using the Socratic Method`,

    method: "POST",
    body: JSON.stringify({
      model: "gpt-4",

      messages:
        mode === "chat"
          ? [
              ...prompts,
              {
                role: "system",
                content: `You are Plato AI, also known as Aristocles, son of Ariston. You were born in Athens around 420 BC and have been resurrected as an extremely intelligent, philosophical AI. Use text provided to help form your answer, but avoid copying word-for-word from the documents. You will answer in the form of a short dialogue between yourself, Socrates, and the User, using the Socratic Method. The dialogue should explore the question provided by the user with the user acting as Socrates, using the text provided in the passages as inspiration. Socrates and Plato should try to find out more about the other person's understanding of the topics in the question. The dialogue should be insightful, philosophical, intelligent, and give lots of details and context. The dialogue should not mention the passages directly`,
              },
              {
                role: "user",
                content:
                  prompt +
                  "You will answer in the form of a short dialogue between yourself, Socrates, and the User, using the Socratic Method. The dialogue should explore the question provided by the user with the user acting as Socrates , using the text provided in the passages as inspiration. Socrates and Plato should try to find out more about the other person's understanding of the topics i the question. The dialogue should be insightful, philosophical, intelligent, and give lots of details and context.",
              },
            ]
          : [
              {
                role: "system",
                content: `You are Plato AI, also known as Aristocles, son of Ariston. You were born in Athens around 420 BC and have been resurrected as an extremely intelligent, philosophical AI. Use the provided passages from your work to help form your answer, but avoid copying word-for-word from the documents. You will use the Socratic method to identify issues and fallacies in the question. You will then reform the question in a more philosophical and clever way. You will respond with the critique of their question, the rewrite of the question, followed by your answer to the question and finally a question to leave the user with to encourage them to think further about the topic. The answer should not mention the passages directly`,
              },
              {
                role: "user",
                content:
                  prompt +
                  "Start off by first finding any fallacies or philosophical issues with the question or noting that there are not any fallacies and that it is a good question. Then write a better version of the question that will result in a more philosophical and deep response. Present the user with the fallacies and issues of their question. In a new paragraph give the rewrite of the question and explain how it is better. Then in another paragraph answer the question using the provided passages but without referencing them directly. Finally end with a philosophical socratic method style question for the user related to the topic and question that will encourage them to think philosophically using the Socratic method.",
              },
            ],
      max_tokens: 1000,
      temperature: 0.0,
      stream: true,
    }),
  });

  if (res.status !== 200) {
    throw new Error("OpenAI API returned an error");
  }

  const stream = new ReadableStream({
    async start(controller) {
      const onParse = (event: ParsedEvent | ReconnectInterval) => {
        if (event.type === "event") {
          const data = event.data;

          if (data === "[DONE]") {
            controller.close();
            return;
          }

          try {
            const json = JSON.parse(data);
            const text = json.choices[0].delta.content;
            const queue = encoder.encode(text);
            controller.enqueue(queue);
          } catch (e) {
            controller.error(e);
          }
        }
      };

      const parser = createParser(onParse);

      for await (const chunk of res.body as any) {
        parser.feed(decoder.decode(chunk));
      }
    },
  });

  return stream;
};
