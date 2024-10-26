

export default async function handler(req, res) {
    await fetch("/api/testQA", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: 'test', answer: 'test' }), // Use the local variable
    })

    res.status(200).end('Cron completed');
}