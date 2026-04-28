const express = require("express")
const app = express()
app.use(express.json())
const fs = require("fs")

const WEBHOOK_URL = "TON_WEBHOOK_ICI"
const ID_FILE = "./messageid.txt"

let messageId = null
let lastReceived = Date.now()

if (fs.existsSync(ID_FILE)) {
    messageId = fs.readFileSync(ID_FILE, "utf8").trim()
}

async function sendToDiscord(body) {
    const bodyStr = JSON.stringify(body)

    if (messageId) {
        const patch = await fetch(`${WEBHOOK_URL}/messages/${messageId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: bodyStr
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
            body: bodyStr
        })
        const data = await response.json()
        messageId = data.id
        fs.writeFileSync(ID_FILE, messageId)
    }
}

// Vérifie toutes les 30 secondes si Roblox envoie encore
setInterval(async () => {
    const elapsed = Date.now() - lastReceived
    if (elapsed > 30000) {
        await sendToDiscord({
            embeds: [{
                title: "🕐 Heure In-Game",
                description: "⚫ Aucun serveur actif",
                color: 0x333333
            }]
        })
    }
}, 30000)

app.post("/time", async (req, res) => {
    const { time, period } = req.body
    lastReceived = Date.now()

    await sendToDiscord({
        embeds: [{
            title: "🕐 Heure In-Game",
            description: `Il est actuellement **${time}** ${period}`,
            color: period === "☀️" ? 0xFFD54F : 0x3F51B5
        }]
    })

    res.sendStatus(200)
})

app.listen(3000)
