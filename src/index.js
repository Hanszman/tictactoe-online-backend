import express from 'express';
import cors from 'cors';
import { StreamChat } from 'stream-chat';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
const app = express();
const api_key = 'b52r7nyk5b8v';
const api_secret = 'md8xy7wj9g36yc72yrkfk23rcquzrpz5y62yp7593w9h7jswxenq7jxujez2bnb5';
const serverClient = StreamChat.getInstance(api_key, api_secret);

app.use(cors());
app.use(express.json());

app.post('/signup', async (req, res) => {
    try {
        const { firstName, lastName, username, password } = req.body;
        const userId = uuidv4();
        const hashedPassword = await bcrypt.hashSync(password, 10);
        const token = serverClient.createToken(userId);
        res.status(201).json({token, userId, firstName, lastName, username, hashedPassword});
    } catch (error) {
        console.log(error);
        res.status(500).json({error, message: 'Internal Server Error'});
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const { users } = await serverClient.queryUsers({ name: username });
        if (users && users.length === 0) return res.status(404).json({ message: 'User not found' });
        const token = serverClient.createToken(users[0].id);
        const passwordMatch = await bcrypt.compare(password, users[0].hashedPassword);
        if (passwordMatch) {
            res.status(201).json({
                token,
                firstName: users[0].firstName,
                lastName: users[0].lastName,
                username,
                userId: users[0].id
            })
        } else return res.status(404).json({ message: 'Wrong password' });
    } catch (error) {
        console.log(error);
        res.status(500).json({error, message: 'Internal Server Error'});
    }
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});