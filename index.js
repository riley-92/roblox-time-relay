const express = require("express")
const app = express()
app.use(express.json())

app.post("/time", async (req, res) => {
    const { time, period } = req.body

    await fetch("https://discord.com/api/webhooks/1498718530970062899/rtt3qUZSLFTgkjkHeTWkMcnVelWdsZYSAMPxNpt6PbCXm4wmk4Or8leAybRVK97QWqyQ", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            embeds: [{
                title: "🕐 Heure In-Game",
                description: `Il est actuellement **${time}** ${period}`,
                color: period === "☀️" ? 0xFFD54F : 0x3F51B5
            }]
        })
    })
    res.sendStatus(200)
})

app.listen(3000)
