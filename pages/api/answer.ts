import { OpenAIStream } from "@/utils";

export const config = {
  runtime: "edge",
};

const handler = async (req: Request): Promise<Response> => {
  try {
    const { prompt, mode } = (await req.json()) as {
      prompt: string;
      mode: string;
    };

    const apiKey = process.env.OPENAI_API_KEY;

    const stream = await OpenAIStream(prompt, apiKey as string, mode);

    return new Response(stream);
  } catch (error) {
    console.error(error);
    return new Response("Error", { status: 500 });
  }
};

export default handler;
