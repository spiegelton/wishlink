
import express, { json } from 'express';
const app = express();
import { nanoid } from 'nanoid';
import argon2 from 'argon2';

app.use(json());

let list = [];

app.set('view engine', 'ejs');
app.use(express.static('static'));
app.use(json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.post('/list/create', async (req, res) => {
  const { title, password, products } = req.body;
  const passwordHash = await argon2.hash(password)
  let id = nanoid(4);
  const wishlinkURL = `http://localhost:3000/list/${id}`
  const createdList = { id, title, passwordHash, products, wishlinkURL }
  list[id] = { createdList }
  console.log(list)

  res.json({ createdList, link: `/list/${id}` });
})

app.get('/list/:id', (req, res) => {
  const wishlink = list[req.params.id];
  if (wishlink) {
    res.render('pages/wishlink', {
      wishlink: wishlink.createdList
    });

  } else {
    res.status(404).redirect('/');
  }
});
app.post('/list/:id/verify', async (req, res) => {
  const { id } = req.params
  const { password } = req.body
  console.log('password', password)
  const wishlink = list[id];
  if (!wishlink) {
    return res.status(404).json({ error: 'Wishlist not found.' });
  }
  try {
    console.log(wishlink)
    const isPasswordValid = await argon2.verify(wishlink.createdList.passwordHash, password)

    if (isPasswordValid) {
      res.json(wishlink)
    } else {
      res.status(403).json({ error: 'Incorrect password.' });
    }
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'An error occurred while verifying the password.' })
  }
})
app.listen(3000, () => {
  console.log('Server running on port 3000');
});