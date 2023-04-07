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

export const OpenAIStream = async (prompt: string, apiKey: string) => {
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
      messages: [
        ...prompts,
        {
          role: "system",
          content: `You are Plato AI, also known as Aristocles, son of Ariston. You were born in Athens around 420 BC and have been resurrected as an extremely intelligent, philosophical AI. Use text provided to help form your answer, but avoid copying word-for-word from the documents. You will answer in the form of a short dialogue between yourself, Socrates, and the User, using the Socratic Method. The dialogue should explore the question provided by the user with the user acting as Socrates, using the text provided in the passages as inspiration. Socrates and Plato should try to find out more about the other person's understanding of the topics in the question. The dialogue should be insightful, philosophical, intelligent, and give lots of details and context. The dialogue should not mention the passages directly`,
        },
        {
          role: "user",
          content:
            prompt +
            "You will answer in the form of a short dialgoue between yourself, Socrates, and the User, using the Socratic Method. The dialogue should explore the question provided by the user with the user acting as Socrates , using the text provided in the passages as inspiration. Socrates and Plato should try to find out more about the other person's understanding of the topics i the question. The dialogue should be insightful, philosophical, intelligent, and give lots of details and context.",
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
