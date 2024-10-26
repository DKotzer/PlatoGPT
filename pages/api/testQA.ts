import { NextApiRequest, NextApiResponse } from "next"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey: string | undefined =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase URL or Key")
}

const supabase = createClient(supabaseUrl, supabaseKey)

const saveQAHistory = async (ip: string) => {
  const { data, error } = await supabase
    .from("qa_history")
    .insert({
      question: "test question",
      answer: "test answer",
      ip,
      app: "plato",
    })
    .select("*")

  if (error) {
    console.log("error", error)
    throw new Error("Error saving QA history")
  } else {
    console.log("QA history saved", data)
  }
}

//function to delete the saved qa-history test post
const deleteQAHistory = async () => {
  const { data, error } = await supabase
    .from("qa_history")
    .delete()
    .eq("question", "test question") // Add a condition to match 'test question'

  if (error) {
    console.log("error", error)
    throw new Error("Error deleting QA history")
  } else {
    console.log("QA history deleted", data)
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress
    try {
      if (!ip) {
        ip = ""
      }
      await saveQAHistory(ip as string)
      await deleteQAHistory()
      res.status(200).json({ message: "QA create/delete test successful" })
    } catch (error) {
      console.error("Error saving QA history:", error)
      res.status(500).json({ error: "Error testing QA history" })
    }
  } else {
    res.status(405).json({ error: "Method not allowed" })
  }
}
