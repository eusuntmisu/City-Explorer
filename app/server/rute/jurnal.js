// Ex. 4b: raportul jurnalului, montat in index.js la /api/jurnal
import { Router } from 'express'
import { pool } from '../db.js'

const router = Router()

router.get('/raport', async (req, res) => {
  const metoda = req.query.metoda ?? ''

  let sql = `SELECT metoda, cale, COUNT(*) AS cereri, ROUND(AVG(durata_ms), 1) AS medie_ms
             FROM jurnal`
  const valori = []

  if (metoda !== '') {
    // Ex. 4c, varianta GRESITA, folosita doar pentru masuratoarea din fisa:
    //   sql += ` WHERE metoda = '${metoda}'`
    // Varianta corecta, cu parametru:
    sql += ' WHERE metoda = ?'
    valori.push(metoda)
  }

  sql += ' GROUP BY metoda, cale ORDER BY cereri DESC LIMIT 10'

  const [randuri] = await pool.query(sql, valori)

  // COUNT vine ca numar, AVG ca sir (DECIMAL): se convertesc amandoua
  res.json(randuri.map((r) => ({
    ...r,
    cereri: Number(r.cereri),
    medie_ms: Number(r.medie_ms),
  })))
})

export default router
