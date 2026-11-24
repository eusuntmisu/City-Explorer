import { useEffect, useState } from 'react'
import { getStatistici } from '../api/statistici.js'

// Cifrele se calculeaza pe server, in SQL (COUNT si SUM): o cerere la fiecare tastare.
export default function PanouStatistici() {
  const [prag, setPrag] = useState('3')
  const [tara, setTara] = useState('')
  const [date, setDate] = useState(null)
  const [eroare, setEroare] = useState(null)

  useEffect(() => {
    let anulat = false

    async function incarca() {
      try {
        const rezultat = await getStatistici(prag, tara.trim())
        if (!anulat) {
          setDate(rezultat)
          setEroare(null)
        }
      } catch (err) {
        if (!anulat) {
          setEroare(err.message)
        }
      }
    }

    incarca()
    return () => {
      anulat = true
    }
  }, [prag, tara])

  return (
    <section className="panou">
      <h2>Statistici</h2>
      <label>
        Cel puțin{' '}
        <input
          type="number"
          value={prag}
          onChange={(event) => setPrag(event.target.value)}
        />{' '}
        zile
      </label>{' '}
      <label>
        Țara{' '}
        <input
          placeholder="toate"
          value={tara}
          onChange={(event) => setTara(event.target.value)}
        />
      </label>

      {eroare && <p className="stare eroare">Statistici indisponibile: {eroare}</p>}
      {!eroare && date === null && <p className="stare">Se încarcă statisticile...</p>}
      {!eroare && date !== null && date.destinatii === 0 && (
        <p className="gol">Nicio destinație cu cel puțin {prag} zile.</p>
      )}
      {!eroare && date !== null && date.destinatii > 0 && (
        <ul>
          <li>Destinații: {date.destinatii}</li>
          <li>Total zile: {date.zile}</li>
          <li>Media: {date.medie} zile</li>
        </ul>
      )}
    </section>
  )
}
