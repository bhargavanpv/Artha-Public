const sendBugReport = async ({ email, title, screenshot, createdAt }) => {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    const text = `🐛 *Bug Report — Artha*\n\n*From:* ${email}\n*Issue:* ${title}\n*Time:* ${new Date(createdAt).toLocaleString('en-IN')}`;

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'Markdown' })
    });

    if (screenshot) {
        const base64Data = screenshot.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('photo', new Blob([buffer], { type: 'image/png' }), 'screenshot.png');
        await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
            method: 'POST',
            body: form
        });
    }
};

module.exports = { sendBugReport };