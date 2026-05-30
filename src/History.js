import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function History(){

const API = "http://localhost:8080";

const navigate = useNavigate();

const [history,setHistory] = useState([]);

useEffect(()=>{
  axios.get(API + "/history")
  .then(res => setHistory(res.data.reverse()))
  .catch(err => console.log(err));
},[]);

return(

<div className="app">

<h1>📜 History</h1>

<button onClick={()=>navigate("/")}>
⬅ Back
</button>

<div className="card">

{history.length === 0 && <p>No history yet</p>}

{history.map(h => (

<div className="history-item" key={h.id}>

<span className="time">
{new Date(h.time).toLocaleString()}
</span>

<span>

{
h.action==="ADD" && "➕ Added"
}
{
h.action==="SELL" && "🛒 Sold"
}
{
h.action==="RESTOCK" && "🔄 Restocked"
}
{
h.action==="DELETE" && "❌ Deleted"
}

{" "}
{h.itemName} - {h.brand} - {h.variant}
{" "}
(Qty: {h.quantity})

</span>

</div>

))}

</div>

</div>

);

}

export default History;