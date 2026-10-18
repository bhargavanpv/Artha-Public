const { sendBugReport } = require('../utils/sendTelegram');

const submitBugReport = async ( req, res ) => {
    try {
        const { title, screenshot } = req.body;
        const email = req.user.email;

        if(!title) return res.status(400).json({message: "Title is required"});

        await sendBugReport({
            email,
            title,
            screenshot: screenshot || null,
            createdAt : new Date()
        });

        res.status(200).json({message : "Bug report sent successfully" });

    }
    catch (error) {
        console.error('Bug Report Error : ', error)
        res.status(500).json({message : "Failed to send bug report"});
    }
}

module.exports = {submitBugReport}