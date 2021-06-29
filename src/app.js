import express from 'express';
import cors from 'cors';


const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
    res.sendStatus(200)
})

export default app;