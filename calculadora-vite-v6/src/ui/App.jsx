import React, {useEffect, useMemo, useState} from 'react'

const RANGOS = {
  'Vivienda de interés social': [0.35, 0.40, 0.45],
  'Vivienda económica': [0.45, 0.525, 0.60],
  'Vivienda social estandarizada': [0.60, 0.675, 0.75],
  'Vivienda unifamiliar': [0.80, 0.90, 1.00],
  'Vivienda unifamiliar premium': [1.10, 1.25, 1.40],
  'Viviendas turísticas / Refugios / Hostales': [1.00, 1.30, 1.60],
  'Interiorismo residencial (proyecto)': [0.50, 1.00, 1.50],
  'Interiorismo comercial básico (proyecto)': [0.50, 1.00, 1.00],
  'Interiorismo comercial alta gama (proyecto)': [1.00, 1.50, 2.00],
  'Regularización (genérica)': [0.33, 0.39, 0.45],
  'Recepción Final – Estándar (proyecto propio)': [0.10, 0.125, 0.15],
  'Recepción Final – Compleja': [0.15, 0.175, 0.20],
  'Recepción Final – Encargo aislado (+recargo)': [0.18, 0.22, 0.26]
}
const TIPOS = Object.keys(RANGOS)

function fmtUF(v){ return `${v.toFixed(3)} UF` }
function fmtCLP(v){ return v.toLocaleString('es-CL', {style:'currency', currency:'CLP', maximumFractionDigits:0}) }

export default function App(){
  const [tipo, setTipo] = useState('Vivienda unifamiliar')
  const [m2, setM2] = useState(100)
  const [ufValor, setUfValor] = useState(39428)
  const [recargo, setRecargo] = useState(0)

  useEffect(()=>{
    const sel = document.getElementById('tipo'); 
    if(sel){
      sel.innerHTML = TIPOS.map(t=>`<option value="${t}">${t}</option>`).join('')
      sel.value = tipo
      sel.onchange = e => setTipo(e.target.value)
    }
    const m2i = document.getElementById('m2'); if(m2i){ m2i.value = m2; m2i.oninput = e=> setM2(Math.max(0, Number(e.target.value))) }
    const ufi = document.getElementById('ufclp'); if(ufi){ ufi.value = ufValor; ufi.oninput = e=> setUfValor(Math.max(1, Number(e.target.value))) }
    const reci = document.getElementById('rec'); if(reci){ reci.value = recargo; reci.oninput = e=> setRecargo(Math.max(0, Number(e.target.value))) }
  }, [])

  const rangoUFm2 = useMemo(()=> RANGOS[tipo] || [0,0,0], [tipo])

  const res = useMemo(()=>{
    const [b,m,a] = rangoUFm2
    const apply = x => x * (1 + recargo/100)
    const calc = (ufm2) => {
      const ufTotal = apply(ufm2 * m2)
      return { ufm2, ufTotal, clpTotal: ufTotal * ufValor }
    }
    return { bajo: calc(b), medio: calc(m), alto: calc(a) }
  }, [rangoUFm2, m2, ufValor, recargo])

  useEffect(()=>{
    const el = document.getElementById('ufm2')
    if(el){ el.textContent = `Rango UF/m²: ${fmtUF(rangoUFm2[0])} · ${fmtUF(rangoUFm2[1])} · ${fmtUF(rangoUFm2[2])}` }

    const cards = document.getElementById('cards')
    if(cards){
      const render = (titulo, r) => (
        `<div class="card">
          <small>${titulo}</small>
          <div class="uf">${r.ufTotal.toLocaleString('es-CL', {maximumFractionDigits:0})} UF</div>
          <div class="clp">${fmtCLP(r.clpTotal)}</div>
          <div class="base">Base: ${fmtUF(r.ufm2)} · m²: ${m2}</div>
        </div>`
      )
      cards.innerHTML = render('BAJO', res.bajo) + render('MEDIO', res.medio) + render('ALTO', res.alto)
    }
    const base = document.getElementById('baseTxt')
    if(base){ base.textContent = `Nota: El recargo (%) permite considerar viajes, urgencia, complejidad, u otras condiciones especiales.` }
  }, [rangoUFm2, res, m2])

  useEffect(()=>{
    const copy = document.getElementById('copiar')
    if(copy){
      copy.onclick = () => {
        const txt = [
          `Tipo: ${tipo}`,
          `Superficie: ${m2} m²`,
          `UF/m²: ${rangoUFm2.map(x=>x.toFixed(3)).join(' / ')}`,
          `Bajo: ${res.bajo.ufTotal.toFixed(2)} UF (${fmtCLP(res.bajo.clpTotal)})`,
          `Medio: ${res.medio.ufTotal.toFixed(2)} UF (${fmtCLP(res.medio.clpTotal)})`,
          `Alto: ${res.alto.ufTotal.toFixed(2)} UF (${fmtCLP(res.alto.clpTotal)})`
        ].join('\n')
        navigator.clipboard.writeText(txt)
      }
    }
    const pdf = document.getElementById('pdf')
    if(pdf){ pdf.onclick = () => window.print() }
  }, [tipo, m2, ufValor, recargo, rangoUFm2, res])

  return null
}
