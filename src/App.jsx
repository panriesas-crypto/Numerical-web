import React,{useState} from 'react';
import {MathJax} from 'better-react-mathjax';
import {methodGroups} from './domain/algorithms.js';
import {CalculatorService} from './services/CalculatorService.js';
import {getPresets} from './services/api.js';
import ResultPanel from './components/ResultPanel.jsx';
import Graph from './components/Graph.jsx';
const service=new CalculatorService();
const samples={
 'Root of Equation':{fx:'x^2-2',a:1,b:2,x0:1.5,tol:0.000001,maxIter:100,gx:'(x+2/x)/2'},
 'Linear Algebra':{A:[[4,1],[1,3]],b:[1,2],tol:1e-8,maxIter:100},
 'Interpolation':{xs:[1,2,3],ys:[1,4,9],x:2.5},
 'Extrapolation':{xs:[1,2,3,4],ys:[2,3,5,4],x:5,degree:2},
 'Integration':{fx:'x^2',a:0,b:1,n:10},
 'Differentiation':{fx:'x^2',x:2,h:0.01,order:1}
};
export default function App(){const categories=Object.keys(methodGroups);const [category,setCategory]=useState(categories[0]);const [method,setMethod]=useState(methodGroups[categories[0]][0][0]);const [input,setInput]=useState(JSON.stringify(samples[categories[0]],null,2));const [result,setResult]=useState(null);const [error,setError]=useState('');const [presetStatus,setPresetStatus]=useState('');
 const methods=methodGroups[category].map(([name])=>name);const key=`${category}::${method}`;
 const changeCategory=v=>{setCategory(v);setMethod(methodGroups[v][0][0]);setInput(JSON.stringify(samples[v],null,2));setResult(null);setError('');};
 const calculate=()=>{try{const data=JSON.parse(input);setResult(service.calculate(key,data));setError('');}catch(e){setError(e.message);setResult(null);}};
 const fillPreset=async()=>{try{const data=await getPresets(category,method);if(data?.preset?.input){setInput(JSON.stringify(data.preset.input,null,2));setPresetStatus('โหลดข้อมูลตัวอย่างจาก MongoDB สำเร็จ');}else setPresetStatus('API ทำงาน แต่ไม่พบ preset ที่ตรงกัน ใช้ตัวอย่างในฟอร์มแทน');}catch{setPresetStatus('เชื่อมต่อ Backend ไม่ได้ ใช้ข้อมูลตัวอย่างในเครื่องแทน (เปิด backend ก่อนเพื่อใช้ MongoDB)');}};
 const showGraph=category==='Root of Equation'||category==='Integration'||category==='Differentiation';let parsed={};try{parsed=JSON.parse(input)}catch{}
 return <><header className="hero"><div><p className="eyebrow">OBJECT-ORIENTED PROGRAMMING PROJECT</p><h1>Numerical Method Calculator</h1><p>เครื่องมือคำนวณวิธีเชิงตัวเลข พร้อมขั้นตอนและกราฟ</p></div></header><main className="layout"><section className="panel"><h2>1. เลือกวิธีคำนวณ</h2><label>Type of Problem<select value={category} onChange={e=>changeCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Solution / Method<select value={method} onChange={e=>{setMethod(e.target.value);setResult(null)}}>{methods.map(m=><option key={m}>{m}</option>)}</select></label><div className="actions"><button onClick={fillPreset} className="secondary">Fill Form (MongoDB)</button><button onClick={()=>{setInput(JSON.stringify(samples[category],null,2));setResult(null);setError('')}} className="secondary">Reset Example</button></div>{presetStatus&&<p className="muted">{presetStatus}</p>}</section><section className="panel"><h2>2. Input Parameters</h2><p className="muted">กรอกข้อมูลเป็น JSON ตามตัวอย่าง สามารถแก้ไขค่าได้</p><p><MathJax>{`\\( f(x) = ${parsed.fx||'x^2-2'} \\)`}</MathJax></p><textarea spellCheck="false" value={input} onChange={e=>setInput(e.target.value)}/><div className="actions"><button onClick={calculate}>Calculate</button><button className="secondary" onClick={()=>{setInput('');setResult(null);setError('');setPresetStatus('');}}>Clear Form</button></div>{error&&<p className="error">{error}</p>}</section><ResultPanel result={result}/>{showGraph&&<section className="panel"><h2>3. Interactive Graph (Plotly.js)</h2><Graph expression={parsed.fx||'x^2-2'} range={[Number(parsed.a??-5),Number(parsed.b??5)]} result={result}/></section>}<section className="panel"><h2>4. ข้อมูลโครงสร้าง OOP</h2><p>ทุกวิธีคำนวณเป็น Object ที่สืบทอดจากคลาสแม่ตามหมวด และถูกเรียกผ่านเมธอด calculate() เดียวกัน</p><p className="muted">Abstract Class · Interface Contract · Inheritance · Polymorphism · Encapsulation · Composition</p></section></main><footer>Numerical Method Calculator · React + Vite · Express + MongoDB</footer></>}
