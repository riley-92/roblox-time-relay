const express = require("express")
const app = express()
app.use(express.json())

const WEBHOOK_URL = "https://discord.com/api/webhooks/1498718530970062899/rtt3qUZSLFTgkjkHeTWkMcnVelWdsZYSAMPxNpt6PbCXm4wmk4Or8leAybRVK97QWqyQ"

let messageId = null
let lastReceived = Date.now()

async function sendToDiscord(body) {
    try {
        const bodyStr = JSON.stringify(body)

        if (messageId) {
            const patch = await fetch(`${WEBHOOK_URL}/messages/${messageId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: bodyStr
            })
            if (patch.ok) return
            messageId = null
        }

        const response = await fetch(`${WEBHOOK_URL}?wait=true`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: bodyStr
        })
        const data = await response.json()
        if (data.id) messageId = data.id

    } catch (err) {
        console.error("Erreur Discord:", err)
    }
}

setInterval(async () => {
    if (Date.now() - lastReceived > 30000) {
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
    try {
        const { time, period } = req.body
        lastReceived = Date.now()

        await sendToDiscord({
            embeds: [{
                title: "🕐 Heure In-Game",
                description: `Il est actuellement **${time}** ${period === "jour" ? "☀️" : "🌙"}`,
                color: period === "jour" ? 0xFFD54F : 0x3F51B5
            }]
        })

        res.sendStatus(200)
    } catch (err) {
        console.error("Erreur route /time:", err)
        res.sendStatus(500)
    }
})

app.listen(3000)
