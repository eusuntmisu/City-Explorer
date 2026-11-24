import express from 'express'
import cors from 'cors'
import { pool } from './db.js'
import { jurnal } from './jurnal.js'
import statistici from './rute/statistici.js'
import raportJurnal from './rute/jurnal.js'

const app = express()

// Fisa, pregatirea: tipareste fiecare cerere primita, in ordinea in care soseste
app.use((req, res, next) => {
  console.log(req.method, req.originalUrl)
  next()
})

// Ex. 4d: jurnalul se inregistreaza INAINTEA lui cors(). cors() raspunde singur
// la cererile OPTIONS de verificare prealabila (204) si nu mai apeleaza next(),
// deci un middleware scris dupa el nu le-ar vedea niciodata.
app.use(jurnal)
app.use(cors()) // permite paginii sa foloseasca raspunsul
app.use(express.json()) // citeste corpul cererilor POST si PATCH

// conversiile cerute de interfata: id ca sir, vizitat ca valoare logica
const pentruClient = (d) => ({ ...d, id: String(d.id), vizitat: Boolean(d.vizitat) })

// Ex. 1b: toate destinatiile, ordonate dupa identificator
app.get('/api/destinatii', async (req, res) => {
  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii ORDER BY id',
  )

  res.json(randuri.map(pentruClient))
})

// Ex. 5a: cautare exacta dupa oras, cu parametru
app.get('/api/destinatii/caut', async (req, res) => {
  const oras = req.query.oras ?? ''

  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii WHERE oras = ?',
    [oras],
  )

  res.json(randuri.map(pentruClient))
})

// Ex. 2: adaugarea unei destinatii, validata din nou pe server
app.post('/api/destinatii', async (req, res) => {
  const { oras, tara, zile } = req.body

  const textValid = (v) => typeof v === 'string' && v.trim() !== ''
  if (!textValid(oras) || !textValid(tara) ||
      !Number.isInteger(zile) || zile < 1 || zile > 30) {
    return res.status(400).json({ eroare: 'Date invalide.' })
  }

  const [rezultat] = await pool.query(
    'INSERT INTO destinatii (oras, tara, zile, vizitat) VALUES (?, ?, ?, ?)',
    [oras.trim(), tara.trim(), zile, false],
  )

  res.status(201).json({
    id: String(rezultat.insertId),
    oras: oras.trim(),
    tara: tara.trim(),
    zile,
    vizitat: false,
  })
})

// Ex. 3a: marcarea ca vizitat; 404 daca nu exista randul
app.patch('/api/destinatii/:id', async (req, res) => {
  const id = Number(req.params.id)
  const vizitat = req.body.vizitat

  if (!Number.isInteger(id) || typeof vizitat !== 'boolean') {
    return res.status(400).json({ eroare: 'Date invalide.' })
  }

  const [rezultat] = await pool.query(
    'UPDATE destinatii SET vizitat = ? WHERE id = ?',
    [vizitat, id],
  )

  if (rezultat.affectedRows === 0) {
    return res.status(404).json({ eroare: 'Destinația nu există.' })
  }

  const [randuri] = await pool.query(
    'SELECT id, oras, tara, zile, vizitat FROM destinatii WHERE id = ?',
    [id],
  )

  res.json(pentruClient(randuri[0]))
})

// Ex. 1c: ruta temporara de ecou, pentru punctul 1 al fisei
app.all('/api/ecou/:id', (req, res) => {
  res.json({ params: req.params, query: req.query, body: req.body })
})

// Ex. 3c si 4b: routerele din fisiere separate
app.use('/api/statistici', statistici)
app.use('/api/jurnal', raportJurnal)

const port = Number(process.env.PORT) || 3000
app.listen(port, () => {
  console.log(`API pornit pe http://localhost:${port}`)
})
