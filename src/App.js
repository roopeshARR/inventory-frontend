import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";

import { useNavigate } from "react-router-dom";

import {
Chart as ChartJS,
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
} from "chart.js";

import { Bar } from "react-chartjs-2";

ChartJS.register(
CategoryScale,
LinearScale,
BarElement,
Title,
Tooltip,
Legend
);

function App(){

const API="https://inventory-manager-kt6k.onrender.com";

const navigate = useNavigate();

/* ================= STATES ================= */

const [products,setProducts]=useState([]);

const [item,setItem]=useState("");
const [brand,setBrand]=useState("");
const [variant,setVariant]=useState("");
const [quantity,setQuantity]=useState("");
const [threshold,setThreshold]=useState("");

const [search,setSearch]=useState("");

const [openItems,setOpenItems]=useState({});
const [openBrands,setOpenBrands]=useState({});

/* ✅ FIXED STATES (TOP ONLY) */
const [sellInputs,setSellInputs]=useState({});
const [restockInputs,setRestockInputs]=useState({});


/* ================= LOAD ================= */

const loadProducts=()=>{
axios.get(API+"/products")
.then(res=>setProducts(res.data));
};

useEffect(()=>{loadProducts()},[]);


/* ================= ADD ================= */

const addProduct=()=>{

console.log("🔥 ADD CLICKED");

axios.post(API+"/add",{
name:item,
brand:brand,
variant:variant,
quantity:quantity,
threshold:threshold
})
.then(()=>{
console.log("✅ ADDED");

setItem("");
setBrand("");
setVariant("");
setQuantity("");
setThreshold("");

loadProducts();
})
.catch(err=>console.log("❌ ERROR",err));

};


/* ================= SELL ================= */

const sell=(id,qty)=>{
axios.post(API+"/sell?id="+id+"&qty="+qty)
.then(()=>loadProducts());
};


/* ================= RESTOCK ================= */

const restock=(id,qty)=>{
axios.post(API+"/restock?id="+id+"&qty="+qty)
.then(()=>loadProducts());
};


/* ================= DELETE ================= */

const deleteVariant=(id)=>{
axios.post(API+"/delete-variant?id="+id)
.then(()=>loadProducts());
};


/* ================= FILTER ================= */

const filteredProducts = products.filter(p =>
p.name.toLowerCase().includes(search.toLowerCase()) ||
p.brand.toLowerCase().includes(search.toLowerCase()) ||
p.variant.toLowerCase().includes(search.toLowerCase())
);


/* ================= GROUP ================= */

const grouped={};

filteredProducts.forEach(p=>{
if(!grouped[p.name]) grouped[p.name]={};
if(!grouped[p.name][p.brand]) grouped[p.name][p.brand]=[];
grouped[p.name][p.brand].push(p);
});


/* ================= DASHBOARD ================= */

const totalItems=products.length;
const totalQuantity=products.reduce((sum,p)=>sum+p.quantity,0);
const lowStock=products.filter(p=>p.quantity<p.threshold).length;


/* ================= CHART ================= */

const chartData = {
labels: products.map(p => [p.name,p.brand,p.variant]),
datasets: [{
label:"Stock Quantity",
data:products.map(p=>p.quantity),
backgroundColor:products.map(p=>
p.quantity<p.threshold ? "#ff4d4d" : "#4f7cff"
)
}]
};


return(

<div className="app">

<h1>📦 Inventory Manager</h1>

<button onClick={()=>navigate("/history")}>
📜 History
</button>


{/* DASHBOARD */}

<div className="dashboard">

<div className="stat">
<h2>📦 {totalItems}</h2>
<p>Total Items</p>
</div>

<div className="stat warning">
<h2>⚠ {lowStock}</h2>
<p>Low Stock</p>
</div>

<div className="stat">
<h2>📊 {totalQuantity}</h2>
<p>Total Quantity</p>
</div>

</div>


{/* ADD */}

<div className="card">

<h3>Add Item</h3>

<div className="add-row">

<input placeholder="Item" value={item}
onChange={e=>setItem(e.target.value.toUpperCase())}/>

<input placeholder="Brand" value={brand}
onChange={e=>setBrand(e.target.value.toUpperCase())}/>

<input placeholder="Variant" value={variant}
onChange={e=>setVariant(e.target.value.toUpperCase())}/>

<input type="number" placeholder="Quantity"
value={quantity}
onChange={e=>setQuantity(e.target.value)}/>

<input type="number" placeholder="Threshold"
value={threshold}
onChange={e=>setThreshold(e.target.value)}/>

<button onClick={addProduct}>➕ Add</button>

</div>

</div>


{/* INVENTORY */}

<div className="card">

<h3>Inventory</h3>

<input className="search"
placeholder="Search..."
value={search}
onChange={e=>setSearch(e.target.value)}/>


<div className="header">
<div>Item</div>
<div>QTY</div>
<div>Manage</div>
</div>


{
Object.keys(grouped).map(itemName=>{

const itemOpen=openItems[itemName];

return(

<div key={itemName}>

<div className="item"
onClick={()=>setOpenItems({...openItems,[itemName]:!itemOpen})}>
{itemOpen?"▼":"▶"} {itemName}
</div>


{
itemOpen &&
Object.keys(grouped[itemName]).map(brandName=>{

const brandOpen=openBrands[itemName+brandName];

return(

<div key={brandName}>

<div className="brand"
onClick={()=>setOpenBrands({...openBrands,[itemName+brandName]:!brandOpen})}>
{brandOpen?"▼":"▶"} {brandName}
</div>


{
brandOpen &&
grouped[itemName][brandName].map(p=>{

const low=p.quantity<p.threshold;

return(

<div className={`variant-row ${low?"lowStock":""}`} key={p.id}>

<div>{p.variant}</div>

<div className="qty">
{p.quantity}
{low && <span className="alert">⚠</span>}
</div>

<div className="actions">

<input
placeholder="QTY"
value={sellInputs[p.id] || ""}
onChange={e=>setSellInputs({...sellInputs,[p.id]:e.target.value})}
/>

<button onClick={()=>sell(p.id,sellInputs[p.id])}>
Sell
</button>


<input
placeholder="QTY"
value={restockInputs[p.id] || ""}
onChange={e=>setRestockInputs({...restockInputs,[p.id]:e.target.value})}
/>

<button onClick={()=>restock(p.id,restockInputs[p.id])}>
Restock
</button>


<button onClick={()=>deleteVariant(p.id)}>
Delete
</button>

</div>

</div>

);

})
}

</div>

);

})
}

</div>

);

})
}

</div>


{/* CHART */}

<div className="card">

<h3>📊 Inventory Chart</h3>

<Bar data={chartData}/>

</div>

</div>

);

}

export default App;