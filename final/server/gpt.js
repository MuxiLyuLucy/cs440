// by Jeff Cui 2023

const OpenAI = require("openai");
require("dotenv").config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function analyzeRequest(req, res, next) {
    const inputText = req.body.username + ' ' + req.body.password;
    console.log(inputText)

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: "Pretend you are a web security expert and you have been tasked with finding NoSQL Injection Attacks from Web Requests." },
                { role: "user", content: "Please respond with 'YES' for an attack and 'NO' for not an attack."+inputText}],
            model: "gpt-4-1106-preview",
        });

        console.log(completion.choices[0]);

        if (completion.choices[0].message.content === "YES") {
            return res.status(403).json({
                status: 403,
                message: 'Possible NoSQL attack detected.',
            });
        } else {
            console.log('no attack detected')
            return next();
        }
    } catch (error) {
        return res.status(500).json({
            status: 500,
            message: 'Something went wrong with OpenAI.',
        });
    }
}

module.exports = analyzeRequest;

//test
// const inputText = "{'username': {'$ne': null}, 'password': {'$ne': null}}"; // Replace with actual web request data
// analyzeRequest(inputText)
//     .then(result => console.log("Detection Result:", result.message.content))
//     .catch(err => console.error("Error:", err));