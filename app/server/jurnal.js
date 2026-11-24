// Ex. 4a: scrie in tabela jurnal un rand pentru fiecare cerere terminata
import { pool } from './db.js'

export function jurnal(req, res, next) {
  const inceput = process.hrtime.bigint()
  // calea se retine aici, inainte de next(): req.path se schimba in routere
  const metoda = req.method
  const cale = req.originalUrl

  res.on('finish', async () => {
    const durata = Number(process.hrtime.bigint() - inceput) / 1e6

    // eroarea de aici nu mai poate deveni raspuns, deci se prinde
    try {
      await pool.query(
        'INSERT INTO jurnal (metoda, cale, status, durata_ms) VALUES (?, ?, ?, ?)',
        [metoda, cale.slice(0, 255), res.statusCode, Math.round(durata)],
      )
    } catch (error) {
      console.error('Jurnal: nu am putut scrie randul:', error.message)
    }
  })

  next()
}
