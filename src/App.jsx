import React, { useState, useEffect } from "react";

const HABITS = [
  { id:"water", icon:"💧", label:"Wasser", unit:"Gläser", goal:8, color:"#3b82f6" },
  { id:"sleep", icon:"😴", label:"Schlafen", unit:"h", goal:8, color:"#8b5cf6" },
  { id:"steps", icon:"👟", label:"Schritte", unit:"k", goal:10, color:"#10b981" },
  { id:"reading", icon:"📚", label:"Lesen", unit:"min", goal:30, color:"#f59e0b" },
  { id:"meditation", icon:"🧘", label:"Meditation", unit:"min", goal:10, color:"#ec4899" },
  { id:"noPhone", icon:"📵", label:"Kein Handy", unit:"h", goal:2, color:"#6366f1" },
];

const WORKOUTS = [
  { id:"run", icon:"🏃", label:"Laufen" },
  { id:"gym", icon:"🏋️", label:"Gym" },
  { id:"bike", icon:"🚴", label:"Radfahren" },
  { id:"swim", icon:"🏊", label:"Schwimmen" },
  { id:"yoga", icon:"🧘", label:"Yoga" },
  { id:"walk", icon:"🚶", label:"Spazieren" },
  { id:"other", icon:"⚡", label:"Anderes" },
];

const MOODS = [
  { id:"great", emoji:"😄", label:"Super", color:"#10b981" },
  { id:"good", emoji:"🙂", label:"Gut", color:"#3b82f6" },
  { id:"okay", emoji:"😐", label:"Ok", color:"#f59e0b" },
  { id:"bad", emoji:"😔", label:"Müde", color:"#f97316" },
  { id:"awful", emoji:"😤", label:"Stress", color:"#ef4444" },
];

const FOODS = [
  { id:"breakfast", icon:"🥐", label:"Frühstück" },
  { id:"lunch", icon:"🥗", label:"Mittagessen" },
  { id:"dinner", icon:"🍽️", label:"Abendessen" },
  { id:"snack", icon:"🍎", label:"Snack" },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800;900&family=Playfair+Display:wght@700;800&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f7f7f5; }
  input, textarea, select { font-family: Nunito,sans-serif; }
  ::-webkit-scrollbar { width: 0; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  .fu { animation: fadeUp 0.4s ease both; }
  textarea::placeholder, input::placeholder { color: #bbb; }
`;

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

const todayKey = new Date().toISOString().slice(0,10);

function RingProgress({ value, max, color, size=64, stroke=6 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f0f0f0" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={circ*(1-pct)}
        strokeLinecap="round" style={{transition:"stroke-dashoffset 0.5s ease"}}/>
    </svg>
  );
}

export default function App() {
  const [tab, setTab] = useState("today");
  const [mood, setMood] = useState(() => load(`mood-${todayKey}`, null));
  const [energy, setEnergy] = useState(() => load(`energy-${todayKey}`, 3));
  const [todos, setTodos] = useState(() => load(`todos-${todayKey}`, [
    { id:1, text:"Morning Routine", done:false, time:"07:00", priority:"high" },
    { id:2, text:"E-Mails beantworten", done:false, time:"09:00", priority:"medium" },
  ]));
  const [newTodo, setNewTodo] = useState("");
  const [newTodoTime, setNewTodoTime] = useState("");
  const [todoPriority, setTodoPriority] = useState("medium");
  const [habitValues, setHabitValues] = useState(() => load(`habits-${todayKey}`, {water:0,sleep:0,steps:0,reading:0,meditation:0,noPhone:0}));
  const [workoutDone, setWorkoutDone] = useState(() => load(`workout-${todayKey}`, null));
  const [workoutDuration, setWorkoutDuration] = useState(() => load(`workoutDur-${todayKey}`, ""));
  const [workoutNotes, setWorkoutNotes] = useState(() => load(`workoutNotes-${todayKey}`, ""));
  const [workoutSaved, setWorkoutSaved] = useState(() => load(`workoutSaved-${todayKey}`, false));
  const [notes, setNotes] = useState(() => load("notes-all", [
    { id:1, title:"Ideen", text:"Mehr Zeit in der Natur verbringen. Morgenspaziergänge einbauen.", color:"#fef9c3", ts:"09:14" },
    { id:2, title:"Ziele diese Woche", text:"3× Sport, 2L Wasser täglich, 8h Schlaf.", color:"#dcfce7", ts:"08:30" },
  ]));
  const [newNote, setNewNote] = useState("");
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [noteColor, setNoteColor] = useState("#fef9c3");
  const [meals, setMeals] = useState(() => load(`meals-${todayKey}`, {}));
  const [mealNote, setMealNote] = useState("");
  const [activeMeal, setActiveMeal] = useState(null);
  const [streak, setStreak] = useState(() => load("streak", 7));
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [showAddNote, setShowAddNote] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHistory, setAiHistory] = useState([
    {role:"assistant", text:"Hey! 👋 Erzähl mir wie dein Tag war – ich fülle alles automatisch aus!\n\nBeispiel: \"Habe 3 Gläser Wasser getrunken, bin 5km gelaufen und mir geht es super!\""}
  ]);

  const sendToAI = async () => {
    if (!aiMsg.trim() || aiLoading) return;
    const userMsg = aiMsg.trim();
    setAiMsg("");
    setAiHistory(prev => [...prev, {role:"user", text:userMsg}]);
    setAiLoading(true);
    try {
      const systemPrompt = `Du bist ein persönlicher Tagesplaner-Assistent. Der Nutzer beschreibt seinen Tag auf Deutsch.
Analysiere den Text und extrahiere folgende Daten als JSON:
{
  "water": Anzahl Gläser Wasser (Zahl, 0-8),
  "sleep": Stunden Schlaf (Zahl),
  "steps": Schritte in km (Zahl),
  "reading": Minuten Lesen (Zahl),
  "meditation": Minuten Meditation (Zahl),
  "mood": eine von: "great","good","okay","bad","awful",
  "energy": Energie 1-5 (Zahl),
  "workout": eine von: "run","gym","bike","swim","yoga","walk","other" oder null,
  "workoutDuration": Dauer als Text z.B. "5km / 30min" oder "",
  "todos": Array von neuen Aufgaben als Strings,
  "meals": {"breakfast":"...","lunch":"...","dinner":"...","snack":"..."} nur wenn erwähnt,
  "summary": kurze freundliche deutsche Zusammenfassung was du eingetragen hast (1-2 Sätze)
}
Antworte NUR mit dem JSON, nichts anderes.`;
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          system: systemPrompt,
          messages: [{role:"user", content:userMsg}]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const clean = text.replace(/```json|```/g,"").trim();
      const parsed = JSON.parse(clean);
      // Apply changes - use != null to handle 0 values correctly
      if (parsed.water != null && parsed.water > 0) setHabitValues(p => ({...p, water: Math.min(8, parsed.water)}));
      if (parsed.sleep != null && parsed.sleep > 0) setHabitValues(p => ({...p, sleep: parsed.sleep}));
      if (parsed.steps != null && parsed.steps > 0) setHabitValues(p => ({...p, steps: parsed.steps}));
      if (parsed.reading != null && parsed.reading > 0) setHabitValues(p => ({...p, reading: parsed.reading}));
      if (parsed.meditation != null && parsed.meditation > 0) setHabitValues(p => ({...p, meditation: parsed.meditation}));
      if (parsed.mood) setMood(parsed.mood);
      if (parsed.energy != null && parsed.energy > 0) setEnergy(parsed.energy);
      if (parsed.workout) { setWorkoutDone(parsed.workout); setWorkoutDuration(parsed.workoutDuration || ""); }
      if (parsed.todos?.length) setTodos(p => [...p, ...parsed.todos.map((t,i) => ({id:Date.now()+i, text:t, done:false, time:"", priority:"medium"}))]);
      if (parsed.meals) setMeals(p => ({...p, ...parsed.meals}));

      // Show what was updated
      const updates = [];
      if (parsed.water > 0) updates.push(parsed.water + " Gläser Wasser 💧");
      if (parsed.sleep > 0) updates.push(parsed.sleep + "h Schlaf 😴");
      if (parsed.steps > 0) updates.push(parsed.steps + "km Schritte 👟");
      if (parsed.reading > 0) updates.push(parsed.reading + "min Lesen 📚");
      if (parsed.meditation > 0) updates.push(parsed.meditation + "min Meditation 🧘");
      if (parsed.mood) updates.push("Stimmung gesetzt 😊");
      if (parsed.energy > 0) updates.push("Energie: " + parsed.energy + "/5 ⚡");
      if (parsed.workout) updates.push("Sport: " + parsed.workout + " 🏋️");
      if (parsed.todos?.length) updates.push(parsed.todos.length + " To-Dos hinzugefügt ✅");

      const summary = parsed.summary || ("Eingetragen:
" + updates.join("
"));
      setAiHistory(prev => [...prev, {role:"assistant", text:"✅ " + summary}]);
    } catch(e) {
      setAiHistory(prev => [...prev, {role:"assistant", text:"Sorry, da ist etwas schiefgelaufen. Versuch es nochmal! 🙏"}]);
    }
    setAiLoading(false);
  };


  // Auto-save everything
  useEffect(() => { save(`mood-${todayKey}`, mood); }, [mood]);
  useEffect(() => { save(`energy-${todayKey}`, energy); }, [energy]);
  useEffect(() => { save(`todos-${todayKey}`, todos); }, [todos]);
  useEffect(() => { save(`habits-${todayKey}`, habitValues); }, [habitValues]);
  useEffect(() => { save(`workout-${todayKey}`, workoutDone); }, [workoutDone]);
  useEffect(() => { save(`workoutDur-${todayKey}`, workoutDuration); }, [workoutDuration]);
  useEffect(() => { save(`workoutNotes-${todayKey}`, workoutNotes); }, [workoutNotes]);
  useEffect(() => { save(`workoutSaved-${todayKey}`, workoutSaved); }, [workoutSaved]);
  useEffect(() => { save("notes-all", notes); }, [notes]);
  useEffect(() => { save(`meals-${todayKey}`, meals); }, [meals]);
  useEffect(() => { save("streak", streak); }, [streak]);

  const completedTodos = todos.filter(t=>t.done).length;
  const totalHabits = Object.entries(habitValues).filter(([k,v]) => {
    const h = HABITS.find(h=>h.id===k); return h && v >= h.goal;
  }).length;

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setTodos(prev=>[...prev,{id:Date.now(),text:newTodo,done:false,time:newTodoTime,priority:todoPriority}]);
    setNewTodo(""); setNewTodoTime(""); setShowAddTodo(false);
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev=>[{id:Date.now(),title:newNoteTitle||"Notiz",text:newNote,color:noteColor,ts:new Date().toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"})},...prev]);
    setNewNote(""); setNewNoteTitle(""); setShowAddNote(false);
  };

  const saveWorkout = () => {
    setWorkoutSaved(true);
    setStreak(s => s+1);
  };

  const priorityColor = p => p==="high"?"#ef4444":p==="medium"?"#f59e0b":"#10b981";
  const priorityLabel = p => p==="high"?"Wichtig":p==="medium"?"Normal":"Niedrig";
  const today = new Date().toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"});
  const greeting = new Date().getHours() < 12 ? "Guten Morgen" : new Date().getHours() < 18 ? "Guten Tag" : "Guten Abend";

  const inp = {fontFamily:"Nunito,sans-serif",background:"#f7f7f5",border:"1.5px solid #e5e5e5",borderRadius:12,padding:"11px 14px",width:"100%",outline:"none",fontSize:14,color:"#1a1a1a"};

  return (
    <div style={{fontFamily:"Nunito,sans-serif",minHeight:"100vh",background:"#f7f7f5",color:"#1a1a1a",paddingBottom:88}}>
      <style>{CSS}</style>

      {/* HEADER */}
      <header style={{background:"white",borderBottom:"1px solid #f0f0f0",padding:"20px 20px 0",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 12px rgba(0,0,0,0.04)"}}>
        <div style={{maxWidth:600,margin:"0 auto"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <p style={{fontSize:11,color:"#aaa",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{today}</p>
              <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:24,fontWeight:800,letterSpacing:"-0.02em",marginTop:2}}>{greeting}! ☀️</h1>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)",borderRadius:12,padding:"6px 12px",display:"inline-flex",alignItems:"center",gap:5}}>
                <span style={{fontSize:13}}>🔥</span>
                <span style={{fontWeight:800,fontSize:13,color:"white"}}>{streak} Tage</span>
              </div>
            </div>
          </div>
          {/* Mood */}
          <div style={{display:"flex",gap:6,marginBottom:14,overflowX:"auto",paddingBottom:2}}>
            {MOODS.map(m=>(
              <button key={m.id} onClick={()=>setMood(m.id)} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"7px 10px",borderRadius:14,border:`2px solid ${mood===m.id?m.color:"transparent"}`,background:mood===m.id?m.color+"15":"#f7f7f5",cursor:"pointer",transition:"all 0.2s"}}>
                <span style={{fontSize:18}}>{m.emoji}</span>
                <span style={{fontSize:9,fontWeight:700,color:mood===m.id?m.color:"#bbb"}}>{m.label}</span>
              </button>
            ))}
          </div>
          {/* Tabs */}
          <div style={{display:"flex",overflowX:"auto"}}>
            {[{id:"today",label:"Heute"},{id:"habits",label:"Habits"},{id:"workout",label:"Sport"},{id:"food",label:"Essen"},{id:"notes",label:"Notizen"},{id:"ai",label:"🤖 KI"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"10px 14px",border:"none",background:"transparent",fontFamily:"Nunito,sans-serif",fontWeight:700,fontSize:12,cursor:"pointer",color:tab===t.id?"#1a1a1a":"#bbb",borderBottom:tab===t.id?"2.5px solid #1a1a1a":"2.5px solid transparent",whiteSpace:"nowrap",transition:"all 0.2s"}}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main style={{maxWidth:600,margin:"0 auto",padding:"20px 16px"}}>

        {/* TODAY */}
        {tab==="today"&&(
          <div className="fu">
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {[
                {label:"To-Dos",val:`${completedTodos}/${todos.length}`,icon:"✅",color:"#10b981",p:completedTodos/Math.max(todos.length,1)},
                {label:"Wasser",val:`${habitValues.water}/8`,icon:"💧",color:"#3b82f6",p:(habitValues.water||0)/8},
                {label:"Habits",val:`${totalHabits}/6`,icon:"⚡",color:"#f59e0b",p:totalHabits/6},
              ].map((s,i)=>(
                <div key={i} style={{background:"white",borderRadius:18,padding:"14px 10px",textAlign:"center",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
                  <div style={{position:"relative",display:"inline-block",marginBottom:4}}>
                    <RingProgress value={s.p*10} max={10} color={s.color} size={50} stroke={5}/>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15}}>{s.icon}</div>
                  </div>
                  <div style={{fontWeight:800,fontSize:12}}>{s.val}</div>
                  <div style={{fontSize:9,color:"#aaa",fontWeight:700}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Energy */}
            <div style={{background:"white",borderRadius:20,padding:"16px 18px",marginBottom:14,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:10}}>⚡ Energie heute</div>
              <div style={{display:"flex",gap:6}}>
                {[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setEnergy(n)} style={{flex:1,height:34,borderRadius:10,border:"none",background:n<=energy?`hsl(${n*22+10},75%,55%)`:"#f0f0f0",cursor:"pointer",fontWeight:800,fontSize:12,color:n<=energy?"white":"#ccc",transition:"all 0.2s"}}>
                    {n}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:5}}>
                <span style={{fontSize:9,color:"#ccc"}}>Erschöpft</span>
                <span style={{fontSize:9,color:"#ccc"}}>Topform</span>
              </div>
            </div>

            {/* Todos */}
            <div style={{background:"white",borderRadius:20,padding:"16px 18px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div style={{fontWeight:800,fontSize:13}}>📋 Mein Tag</div>
                <button onClick={()=>setShowAddTodo(!showAddTodo)} style={{width:26,height:26,borderRadius:"50%",background:"#1a1a1a",border:"none",color:"white",fontSize:17,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
              </div>
              {showAddTodo&&(
                <div style={{background:"#f7f7f5",borderRadius:14,padding:12,marginBottom:12,animation:"slideIn 0.2s ease"}}>
                  <input value={newTodo} onChange={e=>setNewTodo(e.target.value)} placeholder="Aufgabe…" style={{...inp,marginBottom:8}} onKeyDown={e=>e.key==="Enter"&&addTodo()}/>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                    <input type="time" value={newTodoTime} onChange={e=>setNewTodoTime(e.target.value)} style={inp}/>
                    <select value={todoPriority} onChange={e=>setTodoPriority(e.target.value)} style={{...inp,cursor:"pointer"}}>
                      <option value="high">🔴 Wichtig</option>
                      <option value="medium">🟡 Normal</option>
                      <option value="low">🟢 Niedrig</option>
                    </select>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={addTodo} style={{flex:2,padding:"9px",background:"#1a1a1a",border:"none",borderRadius:10,color:"white",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Hinzufügen</button>
                    <button onClick={()=>setShowAddTodo(false)} style={{flex:1,padding:"9px",background:"#f0f0f0",border:"none",borderRadius:10,color:"#888",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Abbruch</button>
                  </div>
                </div>
              )}
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                {todos.sort((a,b)=>a.done-b.done).map(todo=>(
                  <div key={todo.id} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 13px",borderRadius:13,background:todo.done?"#f7f7f5":"white",border:"1.5px solid #f0f0f0",cursor:"pointer",opacity:todo.done?0.6:1,transition:"all 0.2s"}} onClick={()=>setTodos(p=>p.map(t=>t.id===todo.id?{...t,done:!t.done}:t))}>
                    <div style={{width:20,height:20,borderRadius:"50%",border:`2.5px solid ${todo.done?"#10b981":priorityColor(todo.priority)}`,background:todo.done?"#10b981":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                      {todo.done&&<span style={{color:"white",fontSize:10}}>✓</span>}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,fontSize:12,textDecoration:todo.done?"line-through":"none",color:todo.done?"#aaa":"#1a1a1a"}}>{todo.text}</div>
                      {todo.time&&<div style={{fontSize:10,color:"#bbb",marginTop:1}}>🕐 {todo.time}</div>}
                    </div>
                    <div style={{background:priorityColor(todo.priority)+"20",color:priorityColor(todo.priority),fontSize:9,fontWeight:700,borderRadius:7,padding:"2px 7px"}}>{priorityLabel(todo.priority)}</div>
                    <button onClick={e=>{e.stopPropagation();setTodos(p=>p.filter(t=>t.id!==todo.id));}} style={{background:"none",border:"none",color:"#ddd",cursor:"pointer",fontSize:14,padding:0}}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HABITS */}
        {tab==="habits"&&(
          <div className="fu">
            <div style={{background:"white",borderRadius:20,padding:"18px 20px",marginBottom:14,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:4}}>⚡ Heute</div>
              <div style={{fontSize:11,color:"#aaa",marginBottom:16}}>{totalHabits} von 6 Habits erreicht</div>
              <div style={{display:"flex",flexDirection:"column",gap:14}}>
                {HABITS.map(h=>{
                  const val=habitValues[h.id]||0, pct=Math.min(val/h.goal,1);
                  return (
                    <div key={h.id}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{fontSize:18}}>{h.icon}</span>
                          <span style={{fontWeight:700,fontSize:13}}>{h.label}</span>
                          {pct>=1&&<span style={{fontSize:10,background:h.color+"20",color:h.color,borderRadius:8,padding:"1px 6px",fontWeight:700}}>✓ Erreicht!</span>}
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:6}}>
                          <button onClick={()=>setHabitValues(p=>({...p,[h.id]:Math.max(0,(p[h.id]||0)-1)}))} style={{width:24,height:24,borderRadius:"50%",border:"1.5px solid #e5e5e5",background:"white",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
                          <span style={{fontWeight:800,fontSize:12,minWidth:48,textAlign:"center",color:pct>=1?h.color:"#1a1a1a"}}>{val}/{h.goal} {h.unit}</span>
                          <button onClick={()=>setHabitValues(p=>({...p,[h.id]:(p[h.id]||0)+1}))} style={{width:24,height:24,borderRadius:"50%",border:"none",background:h.color,color:"white",cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800}}>+</button>
                        </div>
                      </div>
                      <div style={{height:7,background:"#f0f0f0",borderRadius:8,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${pct*100}%`,background:h.color,borderRadius:8,transition:"width 0.4s ease"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{background:"white",borderRadius:20,padding:"16px 18px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:12}}>🔥 Diese Woche</div>
              <div style={{display:"flex",gap:6}}>
                {["Mo","Di","Mi","Do","Fr","Sa","So"].map((d,i)=>{
                  const done=i<(new Date().getDay()||7)-1;
                  const isToday=i===(new Date().getDay()||7)-1;
                  return (
                    <div key={d} style={{flex:1,textAlign:"center"}}>
                      <div style={{fontSize:9,color:"#aaa",fontWeight:700,marginBottom:5}}>{d}</div>
                      <div style={{aspectRatio:"1",borderRadius:10,background:done?"#1a1a1a":isToday?"#f0f0f0":"#f7f7f5",border:isToday?"2px solid #f59e0b":"2px solid transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white"}}>
                        {done?"✓":""}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* WORKOUT */}
        {tab==="workout"&&(
          <div className="fu">
            <div style={{background:"white",borderRadius:20,padding:"18px 20px",marginBottom:14,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>🏋️ Sport heute</div>
              {workoutSaved?(
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:48,marginBottom:8}}>🎉</div>
                  <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>Workout gespeichert!</div>
                  <div style={{fontSize:13,color:"#888"}}>{WORKOUTS.find(w=>w.id===workoutDone)?.icon} {WORKOUTS.find(w=>w.id===workoutDone)?.label} · {workoutDuration}</div>
                  {workoutNotes&&<div style={{fontSize:12,color:"#aaa",marginTop:6,fontStyle:"italic"}}>{workoutNotes}</div>}
                  <button onClick={()=>{setWorkoutSaved(false);setWorkoutDone(null);setWorkoutDuration("");setWorkoutNotes("");}} style={{marginTop:14,padding:"10px 20px",background:"#f0f0f0",border:"none",borderRadius:12,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Neues Workout</button>
                </div>
              ):(
                <>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:16}}>
                    {WORKOUTS.map(w=>(
                      <button key={w.id} onClick={()=>setWorkoutDone(workoutDone===w.id?null:w.id)} style={{padding:"10px 4px",borderRadius:14,border:`2px solid ${workoutDone===w.id?"#1a1a1a":"#f0f0f0"}`,background:workoutDone===w.id?"#1a1a1a":"white",cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}>
                        <div style={{fontSize:20,marginBottom:3}}>{w.icon}</div>
                        <div style={{fontSize:9,fontWeight:700,color:workoutDone===w.id?"white":"#888"}}>{w.label}</div>
                      </button>
                    ))}
                  </div>
                  {workoutDone&&(
                    <div style={{animation:"slideIn 0.2s ease"}}>
                      <input value={workoutDuration} onChange={e=>setWorkoutDuration(e.target.value)} placeholder="Dauer (z.B. 45 min)" style={{...inp,marginBottom:10}}/>
                      <textarea value={workoutNotes} onChange={e=>setWorkoutNotes(e.target.value)} placeholder="Notizen (z.B. 5km in 28min!)" rows={3} style={{...inp,resize:"none",marginBottom:10}}/>
                      <button onClick={saveWorkout} style={{width:"100%",padding:"13px",background:"#1a1a1a",border:"none",borderRadius:12,color:"white",fontWeight:800,fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>✓ Workout speichern</button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* FOOD */}
        {tab==="food"&&(
          <div className="fu">
            <div style={{background:"white",borderRadius:20,padding:"18px 20px",marginBottom:14,boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div style={{fontWeight:800,fontSize:13}}>💧 Wasser</div>
                <span style={{fontWeight:800,fontSize:18,color:"#3b82f6"}}>{habitValues.water}/8</span>
              </div>
              <div style={{display:"flex",gap:5,marginBottom:12,flexWrap:"wrap"}}>
                {[...Array(8)].map((_,i)=>(
                  <button key={i} onClick={()=>setHabitValues(p=>({...p,water:i<p.water?i:i+1}))} style={{width:34,height:34,borderRadius:10,border:"none",background:i<(habitValues.water||0)?"#3b82f6":"#f0f0f0",cursor:"pointer",fontSize:16,transition:"all 0.2s"}}>
                    {i<(habitValues.water||0)?"💧":"○"}
                  </button>
                ))}
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>setHabitValues(p=>({...p,water:Math.max(0,(p.water||0)-1)}))} style={{flex:1,padding:"10px",background:"#f0f0f0",border:"none",borderRadius:12,fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>−</button>
                <button onClick={()=>setHabitValues(p=>({...p,water:Math.min(8,(p.water||0)+1)}))} style={{flex:2,padding:"10px",background:"#3b82f6",border:"none",borderRadius:12,color:"white",fontWeight:800,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ Glas Wasser</button>
              </div>
            </div>
            <div style={{background:"white",borderRadius:20,padding:"18px 20px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)"}}>
              <div style={{fontWeight:800,fontSize:13,marginBottom:14}}>🥗 Mahlzeiten</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {FOODS.map(f=>(
                  <div key={f.id}>
                    <button onClick={()=>setActiveMeal(activeMeal===f.id?null:f.id)} style={{width:"100%",padding:"12px 14px",borderRadius:13,border:`1.5px solid ${meals[f.id]?"#10b981":"#f0f0f0"}`,background:meals[f.id]?"#f0fdf4":"white",cursor:"pointer",display:"flex",alignItems:"center",gap:10,fontFamily:"inherit"}}>
                      <span style={{fontSize:20}}>{f.icon}</span>
                      <div style={{flex:1,textAlign:"left"}}>
                        <div style={{fontWeight:700,fontSize:12}}>{f.label}</div>
                        {meals[f.id]&&<div style={{fontSize:11,color:"#888",marginTop:1}}>{meals[f.id]}</div>}
                      </div>
                      {meals[f.id]?<span style={{color:"#10b981",fontSize:14}}>✓</span>:<span style={{color:"#ccc",fontSize:11}}>+</span>}
                    </button>
                    {activeMeal===f.id&&(
                      <div style={{padding:"10px",background:"#f7f7f5",borderRadius:"0 0 13px 13px",marginTop:-4,animation:"slideIn 0.2s ease"}}>
                        <input value={mealNote} onChange={e=>setMealNote(e.target.value)} placeholder="Was hast du gegessen?" style={{...inp,marginBottom:7}} onKeyDown={e=>{if(e.key==="Enter"&&mealNote){setMeals(p=>({...p,[f.id]:mealNote}));setMealNote("");setActiveMeal(null);}}}/>
                        <button onClick={()=>{if(mealNote){setMeals(p=>({...p,[f.id]:mealNote}));setMealNote("");setActiveMeal(null);}}} style={{width:"100%",padding:"9px",background:"#1a1a1a",border:"none",borderRadius:10,color:"white",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NOTES */}
        {tab==="notes"&&(
          <div className="fu">
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontWeight:800,fontSize:16}}>📝 Notizen</div>
              <button onClick={()=>setShowAddNote(!showAddNote)} style={{display:"flex",alignItems:"center",gap:5,padding:"8px 14px",background:"#1a1a1a",border:"none",borderRadius:20,color:"white",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>+ Neue Notiz</button>
            </div>
            {showAddNote&&(
              <div style={{background:"white",borderRadius:20,padding:"18px 20px",marginBottom:14,boxShadow:"0 2px 16px rgba(0,0,0,0.08)",animation:"slideIn 0.2s ease"}}>
                <input value={newNoteTitle} onChange={e=>setNewNoteTitle(e.target.value)} placeholder="Titel…" style={{...inp,fontWeight:800,marginBottom:8}}/>
                <textarea value={newNote} onChange={e=>setNewNote(e.target.value)} placeholder="Was denkst du…" rows={4} style={{...inp,resize:"none",marginBottom:10}}/>
                <div style={{display:"flex",gap:7,marginBottom:12}}>
                  {["#fef9c3","#dcfce7","#dbeafe","#fce7f3","#f3f4f6","#ffe4e6"].map(c=>(
                    <button key={c} onClick={()=>setNoteColor(c)} style={{width:26,height:26,borderRadius:"50%",background:c,border:`2.5px solid ${noteColor===c?"#1a1a1a":"transparent"}`,cursor:"pointer"}}/>
                  ))}
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={addNote} style={{flex:2,padding:"10px",background:"#1a1a1a",border:"none",borderRadius:11,color:"white",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Speichern</button>
                  <button onClick={()=>setShowAddNote(false)} style={{flex:1,padding:"10px",background:"#f0f0f0",border:"none",borderRadius:11,color:"#888",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Abbruch</button>
                </div>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {notes.map((n,i)=>(
                <div key={n.id} className="fu" style={{background:n.color,borderRadius:18,padding:"14px",animationDelay:`${i*0.04}s`,gridColumn:i===0?"span 2":"auto"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                    <div style={{fontWeight:800,fontSize:13}}>{n.title}</div>
                    <button onClick={()=>setNotes(p=>p.filter(x=>x.id!==n.id))} style={{background:"none",border:"none",cursor:"pointer",color:"#aaa",fontSize:14,padding:0}}>×</button>
                  </div>
                  <div style={{fontSize:12,color:"#555",lineHeight:1.6}}>{n.text}</div>
                  <div style={{fontSize:9,color:"#aaa",marginTop:8,fontWeight:600}}>{n.ts}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* AI TAB */}
      {tab==="ai"&&(
        <div className="fu" style={{display:"flex",flexDirection:"column",height:"calc(100vh - 180px)"}}>
          <div style={{marginBottom:16}}>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,marginBottom:4}}>KI-Assistent 🤖</h2>
            <p style={{fontSize:12,color:"#aaa"}}>Erzähl mir deinen Tag – ich fülle alles aus!</p>
          </div>
          {/* Chat history */}
          <div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column",gap:10,marginBottom:14,WebkitOverflowScrolling:"touch"}}>
            {aiHistory.map((msg,i)=>(
              <div key={i} style={{display:"flex",justifyContent:msg.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",padding:"12px 16px",borderRadius:msg.role==="user"?"18px 18px 4px 18px":"18px 18px 18px 4px",background:msg.role==="user"?"#1a1a1a":"white",color:msg.role==="user"?"white":"#1a1a1a",fontSize:13,lineHeight:1.6,fontWeight:500,boxShadow:"0 1px 8px rgba(0,0,0,0.06)",whiteSpace:"pre-wrap"}}>
                  {msg.text}
                </div>
              </div>
            ))}
            {aiLoading&&(
              <div style={{display:"flex",justifyContent:"flex-start"}}>
                <div style={{padding:"12px 16px",borderRadius:"18px 18px 18px 4px",background:"white",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",fontSize:13,color:"#aaa"}}>
                  ⏳ Analysiere deinen Tag…
                </div>
              </div>
            )}
          </div>
          {/* Input */}
          <div style={{background:"white",borderRadius:20,padding:"12px 14px",boxShadow:"0 1px 8px rgba(0,0,0,0.06)",display:"flex",gap:10,alignItems:"flex-end",position:"sticky",bottom:90}}>
            <textarea
              value={aiMsg}
              onChange={e=>setAiMsg(e.target.value)}
              placeholder="z.B. Habe 3 Gläser Wasser getrunken, bin 5km gelaufen..."
              rows={3}
              style={{flex:1,border:"none",background:"transparent",fontSize:13,resize:"none",outline:"none",color:"#1a1a1a",fontFamily:"Nunito,sans-serif",lineHeight:1.5}}
              onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();sendToAI();}}}
            />
            <button onClick={sendToAI} disabled={aiLoading||!aiMsg.trim()} style={{width:40,height:40,borderRadius:"50%",background:aiMsg.trim()&&!aiLoading?"#1a1a1a":"#f0f0f0",border:"none",color:aiMsg.trim()&&!aiLoading?"white":"#ccc",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
              ↑
            </button>
          </div>
          {/* Quick examples */}
          <div style={{marginTop:10,display:"flex",gap:6,flexWrap:"wrap"}}>
            {[
              "Habe 8 Gläser Wasser getrunken",
              "Bin 5km gelaufen, 30 Minuten",
              "7h geschlafen, Energie ist hoch",
              "Mir geht es heute super!",
            ].map((ex,i)=>(
              <button key={i} onClick={()=>setAiMsg(ex)} style={{padding:"6px 12px",background:"white",border:"1.5px solid #e5e5e5",borderRadius:20,fontSize:11,fontWeight:600,color:"#888",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM NAV */}
      <nav style={{position:"fixed",bottom:0,left:0,right:0,background:"white",borderTop:"1px solid #f0f0f0",display:"flex",justifyContent:"space-around",padding:"10px 0 20px",zIndex:100,boxShadow:"0 -4px 20px rgba(0,0,0,0.06)"}}>
        {[
          {id:"today",icon:"🏠",label:"Heute"},
          {id:"habits",icon:"⚡",label:"Habits"},
          {id:"workout",icon:"🏋️",label:"Sport"},
          {id:"food",icon:"🥗",label:"Essen"},
          {id:"notes",icon:"📝",label:"Notizen"},
          {id:"ai",icon:"🤖",label:"KI"},
        ].map(item=>(
          <button key={item.id} onClick={()=>setTab(item.id)} style={{background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2,fontFamily:"Nunito,sans-serif",minWidth:55}}>
            <span style={{fontSize:20,filter:tab===item.id?"none":"grayscale(1) opacity(0.35)"}}>{item.icon}</span>
            <span style={{fontSize:9,fontWeight:700,color:tab===item.id?"#1a1a1a":"#ccc"}}>{item.label}</span>
            {tab===item.id&&<div style={{width:4,height:4,borderRadius:"50%",background:"#1a1a1a"}}/>}
          </button>
        ))}
      </nav>
    </div>
  );
}
