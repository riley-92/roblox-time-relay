const express = require("express")
const app = express()
app.use(express.json())
const fs = require("fs")

const WEBHOOK_URL = "https://discord.com/api/webhooks/1498718530970062899/rtt3qUZSLFTgkjkHeTWkMcnVelWdsZYSAMPxNpt6PbCXm4wmk4Or8leAybRVK97QWqyQ"
const ID_FILE = "./messageid.txt"

let messageId = null
if (fs.existsSync(ID_FILE)) {
    messageId = fs.readFileSync(ID_FILE, "utf8").trim()
}

app.post("/time", async (req, res) => {
    const { time, period } = req.body

    const body = JSON.stringify({
        embeds: [{
            title: "🕐 Heure In-Game",
            description: `Il est actuellement **${time}** ${period}`,
            color: period === "☀️" ? 0xFFD54F : 0x3F51B5
        }]
    })

    if (messageId) {
        const patch = await fetch(`${WEBHOOK_URL}/messages/${messageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: body
        })
        if (!patch.ok) {
            messageId = null
            fs.writeFileSync(ID_FILE, "")
        }
    }
    
    if (!messageId) {
        const response = await fetch(`${WEBHOOK_URL}?wait=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body
        })
        const data = await response.json()
        messageId = data.id
        fs.writeFileSync(ID_FILE, messageId)
    }

    res.sendStatus(200)
})

app.listen(3000)
