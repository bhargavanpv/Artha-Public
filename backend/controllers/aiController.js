const OpenAI = require("openai");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const HISTORY_DAYS = { free: 20, plus: 30, pro: 90, power: 365 }
const HISTORY_LIMIT = { free: 30, plus: 60, pro: 150, power: 365 }

const DAILY_LIMITS = {
    free:  2,
    plus:  10,
    pro:   25,
    power: 50
};

// Model scales with plan — free/plus get mini, pro gets 4o, power gets o4-mini (reasoning)
const AI_MODEL = {
    free:  "gpt-4o-mini",
    plus:  "gpt-4o-mini",
    pro:   "gpt-4o",
    power: "o4-mini"
};

// Response depth scales with plan
const SYSTEM_PROMPT = {
    free: `You are Artha AI — a personal finance assistant for Indians.
Answer concisely. Use the transaction data provided. No investment or tax advice.
Always end with 3 follow-up questions under ## You may also ask.`,

    plus: `You are Artha AI — a sharp personal finance assistant embedded inside Artha, a premium app for Indians.
Be direct and specific. Use real numbers from the data. Write like a smart friend, not a banker.
Use markdown formatting. Always end with 3 follow-up questions under ## You may also ask.`,

    pro: `You are Artha AI — an advanced personal finance co-pilot inside Artha, built for Indians who take their money seriously.
Go deep. Identify patterns, flag anomalies, compare month-over-month where relevant.
Use real numbers, real merchants, real categories. Be specific and insightful.
Use markdown: ## headings, **bold** amounts, bullet points.
Always end with 3 follow-up questions under ## You may also ask.`,

    power: `You are Artha AI — the most capable version of Artha's financial intelligence, reserved for Power users.
Think deeply before responding. You are a financial coach, not just an assistant.
Go beyond surface-level — identify behavioral patterns, spending traps, optimization opportunities.
Cross-reference multiple months of data where available. Be bold with your insights.
Write in a premium, confident tone. Use markdown extensively.
Always end with 3 highly personalized follow-up questions under ## You may also ask.`
};

const MAX_TOKENS = {
    free:  600,
    plus:  1000,
    pro:   2000,
    power: 4000
};

const chat = async (req, res) => {
    const { question } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const plan  = user.plan || 'free';
        const limit = DAILY_LIMITS[plan] ?? 3;
        const today = new Date().toDateString();
        const lastDate = user.lastMessageDate
            ? new Date(user.lastMessageDate).toDateString()
            : null;

        if (lastDate !== today) {
            user.dailyMessageCount = 0;
        }

        if (user.dailyMessageCount >= limit) {
            return res.status(429).json({
                message: `You've used all ${limit} messages for today. Upgrade your plan or come back tomorrow.`,
                limit,
                plan,
                creditsLeft: 0
            });
        }

        if (!question?.trim()) {
            return res.status(400).json({ message: "Question is required." });
        }

        user.dailyMessageCount += 1;
        user.lastMessageDate = new Date();
        await user.save();

        const daysBack = HISTORY_DAYS[plan] || 20
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - daysBack )

        const transactions = await Transaction
            .find({ userId: req.user.id , date : { $gte : cutoff} })
            .sort({ date: -1 })
            .limit(HISTORY_LIMIT[plan] || 30);

        if (transactions.length === 0) {
            return res.status(400).json({
                message: `No transactions found in the last ${daysBack} days. Add transactions or upload a bank statement first.`
            })
        }

        const context = transactions.map(t =>
            `${new Date(t.date).toISOString().split('T')[0]} | ${t.description} | ₹${t.amount} | ${t.type} | ${t.category}`
        ).join('\n');

        const userPrompt = `
            TRANSACTION HISTORY (Last ${daysBack} days — ${transactions.length} transactions):
            
            ${context}

            USER QUESTION:
            ${question}

            USE THE BELOW FORMAT ONLY WHEN RESPONDING TO A FINANCIAL BREAKDOWN OR ANALYSIS. DO NOT REPEAT THE QUESTION OR TRANSACTION DATA IN YOUR RESPONSE. 
            ELSE JUST ANSWER THE QUESTION DIRECTLY or PROVIDE A CONCISE RESPONSE.
            
            Format your response as:
            ## Answer
            ...

            ---

            ## Evidence
            ...

            ---

            ## Insight
            ...

            ---

            ## Recommendation
            ...

            ---

            ## You may also ask
            - ...
            - ...
            - ...
            `;

        const model = AI_MODEL[plan];
        const isReasoning = plan === 'power'; // o4-mini uses different param

        const requestPayload = {
            model,
            messages: [
                { role: "system", content: SYSTEM_PROMPT[plan] },
                { role: "user",   content: userPrompt }
            ],
            max_completion_tokens: MAX_TOKENS[plan]
        };

        // o4-mini doesn't support system role the same way — flatten for reasoning models
        if (isReasoning) {
            requestPayload.messages = [
                { role: "user", content: SYSTEM_PROMPT[plan] + "\n\n" + userPrompt }
            ];
        }

        const result = await client.chat.completions.create(requestPayload);
        const answer = result.choices[0].message.content.trim();

        res.status(200).json({
            answer,
            creditsLeft: limit - user.dailyMessageCount,
            plan
        });

    } catch (error) {
        console.error("OpenAI Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { chat };