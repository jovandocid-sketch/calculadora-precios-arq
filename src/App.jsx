import React, { useMemo, useState } from 'react'

const RANGOS = {
  "Vivienda de interés social": [0.35, 0.40, 0.45],
  "Vivienda económica": [0.45, 0.525, 0.60],
  "Vivienda social estandarizada": [0.60, 0.675, 0.75],
  "Vivienda unifamiliar": [0.80, 0.90, 1.00],
  "Vivienda unifamiliar premium": [1.10, 1.25, 1.40],
  "Viviendas turísticas / Refugios / Hostales": [1.00, 1.30, 1.60],
  "Interiorismo residencial (proyecto)": [0.50, 1.00, 1.50],
  "Interiorismo comercial básico (proyecto)": [0.50, 1.00, 1.00],
  "Interiorismo comercial alta gama (proyecto)": [1.00, 1.50, 2.00],
  "Regularización (genérica)": [0.33, 0.39, 0.45],
  "Recepción Final – Estándar (proyecto propio)": [0.10, 0.125, 0.15],
  "Recepción Final – Compleja": [0.15, 0.175, 0.20],
  "Recepción Final – Encargo aislado (+recargo)": [0.18, 0.22, 0.26],
};

const TIPOS = Object.keys(RANGOS);

function formatUF(val){return `${val.toFixed(3)} UF`}
function formatCLP(val){return val.toLocaleString('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0})}

export default function App(){
  const [tipo,setTipo]=useState('Vivienda unifamiliar')
  const [m2,setM2]=useState(100)
  const [ufValor,setUfValor]=useState(39428)
  const [recargo,setRecargo]=useState(0)

  const rangoUFm2 = useMemo(()=>RANGOS[tipo],[tipo])

  const resultados = useMemo(()=>{
    const [b,m,a] = rangoUFm2
    const r = (x)=> x*(1+recargo/100)
    return {
      bajo:{ ufm2:b, ufTotal:r(b*m2), clpTotal:r(b*m2)*ufValor },
      medio:{ ufm2:m, ufTotal:r(m*m2), clpTotal:r(m*m2)*ufValor },
      alto:{ ufm2:a, ufTotal:r(a*m2), clpTotal:r(a*m2)*ufValor },
    }
  },[rangoUFm2,m2,ufValor,recargo])

  const resumenTexto = useMemo(()=>[
    `Tipo: ${tipo}`,
    `Superficie: ${m2} m²`,
    `UF del día: ${ufValor}`,
    `Recargo: ${recargo}%`,
    `Rango base UF/m²: ${rangoUFm2[0].toFixed(3)} · ${rangoUFm2[1].toFixed(3)} · ${rangoUFm2[2].toFixed(3)}`,
    `— Resultado —`,
    `Bajo: ${resultados.bajo.ufTotal.toFixed(3)} UF (${formatCLP(resultados.bajo.clpTotal)})`,
    `Medio: ${resultados.medio.ufTotal.toFixed(3)} UF (${formatCLP(resultados.medio.clpTotal)})`,
    `Alto: ${resultados.alto.ufTotal.toFixed(3)} UF (${formatCLP(resultados.alto.clpTotal)})`,
  ].join('\n'),[tipo,m2,ufValor,recargo,rangoUFm2,resultados])

  const copiar = async ()=>{ try{ await navigator.clipboard.writeText(resumenTexto); alert('Resumen copiado'); }catch(e){ alert('No se pudo copiar'); } }
  const imprimir = ()=> window.print()

  return (<div style={{fontFamily:'system-ui, sans-serif', padding:'24px', maxWidth:960, margin:'0 auto'}}>
    <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
      <h1>Calculadora de Precios · UF/m² → UF & CLP</h1>
      <small style={{opacity:.7}}>J. Ovando Cid & Arquitectos</small>
    </header>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
      <div style={{border:'1px solid #ddd',borderRadius:12,padding:12}}>
        <label>Tipo / destino</label><br/>
        <select value={tipo} onChange={e=>setTipo(e.target.value)} style={{width:'100%',padding:8,borderRadius:8}}>
          {TIPOS.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
        <p style={{fontSize:12,opacity:.6}}>Rango UF/m²: {formatUF(rangoUFm2[0])} · {formatUF(rangoUFm2[1])} · {formatUF(rangoUFm2[2])}</p>
      </div>
      <div style={{border:'1px solid #ddd',borderRadius:12,padding:12}}>
        <label>Superficie (m²)</label><br/>
        <input type="number" value={m2} min={1} onChange={e=>setM2(Math.max(0, Number(e.target.value)))} style={{width:'100%',padding:8,borderRadius:8}}/>
      </div>
      <div style={{border:'1px solid #ddd',borderRadius:12,padding:12}}>
        <label>Valor UF (CLP)</label><br/>
        <input type="number" value={ufValor} min={1} onChange={e=>setUfValor(Math.max(1, Number(e.target.value)))} style={{width:'100%',padding:8,borderRadius:8}}/>
      </div>
      <div style={{border:'1px solid #ddd',borderRadius:12,padding:12}}>
        <label>Recargo (%)</label><br/>
        <input type="number" value={recargo} min={0} onChange={e=>setRecargo(Math.max(0, Number(e.target.value)))} style={{width:'100%',padding:8,borderRadius:8}}/>
      </div>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12, marginTop:12}}>
      {['bajo','medio','alto'].map(n=>(
        <div key={n} style={{border:'1px solid #ddd',borderRadius:12,padding:16}}>
          <div style={{fontSize:12,opacity:.7,textTransform:'uppercase'}}>{n}</div>
          <div style={{fontSize:22,fontWeight:700,marginTop:6}}>{formatUF(resultados[n].ufTotal)}</div>
          <div style={{fontSize:14,opacity:.8}}>{formatCLP(resultados[n].clpTotal)}</div>
          <div style={{fontSize:12,opacity:.6,marginTop:8}}>Base: {formatUF(resultados[n].ufm2)} · m²: {m2}</div>
        </div>
      ))}
    </div>

    <div style={{display:'flex',gap:8,marginTop:12}}>
      <button onClick={copiar} style={{padding:'8px 12px'}}>Copiar resultado</button>
      <button onClick={imprimir} style={{padding:'8px 12px'}}>Imprimir / PDF</button>
    </div>

    <pre style={{whiteSpace:'pre-wrap',background:'#f7f7f7',padding:12,borderRadius:8,marginTop:12}}>{resumenTexto}</pre>
  </div>)
}
