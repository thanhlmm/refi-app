var e=Object.assign;import{R as t,l as n,D as a,a as r,b as l,s,c as o,d as c,r as i,e as u,f as d,g as m,h as p,i as h,C as f,T as E,H as g,j as w,k as y,B as b,I as v,m as C,w as k,n as x,u as F,o as j,p as P,q as S,t as _,v as N,W as R,x as D,M as L,y as I,z as O,F as $,A as z,E as M,G as T,N as A,J as B,S as H,K as U,L as W,O as K,P as G,Q as q}from"./vendor.938487e1.js";!function(e=".",t="__import__"){try{self[t]=new Function("u","return import(u)")}catch(n){const a=new URL(e,location),r=e=>{URL.revokeObjectURL(e.src),e.remove()};self[t]=e=>new Promise(((n,l)=>{const s=new URL(e,a);if(self[t].moduleMap[s])return n(self[t].moduleMap[s]);const o=new Blob([`import * as m from '${s}';`,`${t}.moduleMap['${s}']=m;`],{type:"text/javascript"}),c=Object.assign(document.createElement("script"),{type:"module",src:URL.createObjectURL(o),onerror(){l(new Error(`Failed to import: ${e}`)),r(c)},onload(){n(self[t].moduleMap[s]),r(c)}});document.head.appendChild(c)})),self[t].moduleMap={}}}("/assets/");const J=t({key:"navigator.path",default:"/users/Yx41lxY7FleBekLSHZAC/friends/3leZCKrEKUelBP3EEKAw"});var Y="_editableCell_18h6g_1";class Z{constructor(e,t,n){this.exists=!0,this.changedField=[],this.id=t,this.objectData=e,this.ref=new a(n)}static transformFromFirebase(e){return e.map((e=>new Z(e.data(),e.id,`/${e.ref.path}`)))}data(){return this.objectData}changedFields(){return this.changedField}addChange(e){this.changedField.push(e)}}const Q=e=>{const[t,n]=e.split(":");return{path:t,field:n}},V=e=>{const t=e.split("/");return t.pop()||t.pop(),t.join("/")},X=r({key:"FireStore_collection",default:[]}),ee=r({key:"FireStore_doc",default:l({key:"FireStore_doc_parent",get:e=>({get:t})=>{const n=t(X(V(e)));return console.log({path:V(e),docs:n}),n.find((t=>t.ref.path===e))||null}})}),te=l({key:"FireStore_doc_field",get:e=>({get:t})=>{const{path:n,field:a}=Q(e),r=t(ee(n));if(console.log({url:e,doc:r}),r)return r.data()[a]},set:e=>({set:t,get:n},a)=>{const{path:r,field:l}=Q(e),o=n(ee(r));if(o){const e=new Z(s(o.data(),l,a),o.id,r);console.log({newDoc:e}),e.addChange(l),t(ee(r),e)}}}),ne=l({key:"FireStore_doc_field",get:e=>({get:t})=>{const{path:n,field:a}=Q(e),r=t(ee(n));return!!r&&r.changedFields().includes(a)}}),ae=({row:e,column:{id:t}})=>{const n=(({path:e,field:t})=>`${e}:${t}`)({path:e.ref.path,field:t}),[a,r]=o(te(n)),l=c(ne(n)),[s,d]=i.useState(!1),m=e=>{r(e.target.value)},p=()=>{d(!1)};return s?i.createElement("div",{onClick:()=>{d(!0)},className:Y},a):i.createElement("div",{className:"w-full h-full px-px"},i.createElement("input",{className:u("focus:ring-1 focus:ring-blue-400 w-full h-full outline-none ring-inset focus:bg-blue-100 p-1.5",{"bg-red-300":l}),value:a,onChange:m,onBlur:p}))},re=({value:e})=>i.createElement("div",{className:"w-full h-full px-px"},i.createElement("input",{className:"focus:ring-1 focus:ring-blue-400 w-full h-full outline-none ring-inset focus:bg-blue-100 p-1.5",value:e}));function le({columns:t,data:n,renderRowSubComponent:a}){const r=i.useMemo((()=>({minWidth:30,width:150,maxWidth:200})),[]);i.useMemo((()=>(()=>{const e=document.createElement("div");e.setAttribute("style","width: 100px; height: 100px; overflow: scroll; position:absolute; top:-9999px;"),document.body.appendChild(e);const t=e.offsetWidth-e.clientWidth;return document.body.removeChild(e),t})()),[]);const{getTableProps:l,getTableBodyProps:s,headerGroups:o,rows:c,prepareRow:u}=p.useTable({columns:t,data:n,defaultColumn:r},p.useResizeColumns,p.useFlexLayout,p.useExpanded);return i.useCallback((({index:t,style:n})=>{const r=c[t];return u(r),i.createElement(i.Fragment,null,i.createElement(h,e(e({},r.getRowProps({style:n})),{className:"tr"}),r.cells.map((t=>{const n=t.getCellProps();return i.createElement(f,e(e({},n),{key:n.key,isTruncated:!0,className:"td"}),t.render("Cell"))}))),r.isExpanded&&i.createElement(h,{className:"tr"},a({row:r})))}),[u,c]),i.createElement(E,e(e({},l()),{size:"small",className:"table"}),i.createElement(g,null,o.map((t=>i.createElement(w,e(e({},t.getHeaderGroupProps({})),{className:"tr"}),t.headers.map((t=>i.createElement(y,e(e({},t.getHeaderProps()),{className:"th"}),t.render("Header"),"TODO: Integrate column resize"))))))),i.createElement(b,{className:"tbody"},c.map((t=>(u(t),i.createElement(i.Fragment,null,i.createElement(h,e(e({},t.getRowProps()),{className:"tr"}),t.cells.map((t=>i.createElement(f,e(e({},t.getCellProps()),{className:"td"}),t.render("Cell"))))),t.isExpanded&&i.createElement(h,{className:"tr"},a({row:t}))))))))}function se(){const[t,a]=o(J),[r,l]=o(X(t));i.useState([]);const s=i.useMemo((()=>{switch(!0){case r.length>1:const t=(e=>{const t=e.map((e=>Object.keys(e.data()))),a=n.chunk(t,2).map((e=>n.intersection(...e)));return n.flatten(a)})(r);console.log({data:r,sampleColumns:t});return[{Header:()=>"_id",id:"__id",accessor:"id",Cell:({value:e})=>i.createElement(re,{value:e})},{Header:()=>null,id:"expander",Cell:({row:t})=>i.createElement("span",e({},t.getToggleRowExpandedProps()),t.isExpanded?"👇":"👉")},...t.sort(((e,t)=>e.localeCompare(t))).map((e=>({Header:e,accessor:e,Cell:({row:e,column:t})=>i.createElement(ae,{row:e.original,column:t})})))];case 1===r.length:default:return[]}}),[r]);i.useEffect((()=>{const e=`${t}.table`,n=((e="")=>!Boolean(e.split("/").length%2))(t),a=window.listen(e,(e=>{if(n){const t=d.deserializeDocumentSnapshotArray(e,m.firestore.GeoPoint,m.firestore.Timestamp);l(Z.transformFromFirebase(t))}else{const t=d.deserializeDocumentSnapshot(e,m.firestore.GeoPoint,m.firestore.Timestamp);l(Z.transformFromFirebase([t]))}})),r=n?"fs.queryCollection.subscribe":"fs.queryDoc.subscribe",s=window.send(r,{topic:e,path:t}).then((e=>console.log(e)));return()=>{a(),window.send("fs.unsubscribe",{id:s})}}),[t]);const c=i.useCallback((({row:e})=>i.createElement("pre",{style:{fontSize:"10px"}},i.createElement("code",null,JSON.stringify({values:e.values},null,2)))),[]);return i.createElement(le,{columns:s,data:r,renderRowSubComponent:c})}function oe(){const[e,t]=o(J);return i.createElement("div",{className:"h-full p-2 border border-gray-300 rounded shadow-sm main "},i.createElement("div",null,"Filter here"),i.createElement(se,{key:e}))}function ce(){const[e,t]=o(J),[n,a]=i.useState(e);return i.useEffect((()=>{a(e)}),[e]),i.createElement("div",null,i.createElement(v,{isCompact:!0,value:n,onChange:e=>{a(e.target.value)},onKeyDown:e=>{"Enter"===e.key&&t(n)}}))}function ie(e,t,n="",a=!0){return t=Object.keys(e).map((e=>({key:[n,e].join("/"),title:e,children:[],isCollection:a}))),Object.keys(e).forEach((n=>{const r=t.find((e=>e.title===n));r&&(r.children=ie(e[n],[],r.key,!a))})),t}function ue(){const[e,t]=o(J),[n,a]=i.useState([]),r=i.useRef({}),l=e=>{const t=k(r.current);e.forEach((e=>{var n;t.merge(null==(n=null==e?void 0:e.ref)?void 0:n.path.replaceAll("/","."),{})})),r.current=t.value(),a(ie(r.current,[]))};i.useEffect((()=>{const t=e.split("/").reduce(((e,t)=>{const n=e[e.length-1];return[...e,[n,t].join("/").replace("//","/")]}),[]).filter(((e,t)=>t%2)),n=t.map((e=>window.listen(e,(e=>l(e)))));return Promise.all(t.map((e=>window.send("fs.pathExplorer.subscribe",{topic:e,path:e}).then((e=>e.id))))),()=>{n.forEach((e=>e()))}}),[e]);return i.createElement("div",null,i.createElement(C,{showLine:!0,treeData:n,onSelect:e=>{e.length>0&&t(e[0])},height:500}))}const de=x.WidthProvider(x);function me(){const{projectId:e}=F();return i.useEffect((()=>{window.send("fs.init",{projectId:e}).then((()=>{console.log("inited")}))}),[]),i.createElement(de,{className:"layout",layout:[{i:"nav-bar",x:0,y:0,w:12,h:1},{i:"sidebar",x:0,y:0,w:3,h:8},{i:"main",x:3,y:0,w:7,h:8},{i:"property",x:10,y:0,w:2,h:8}],cols:12,rowHeight:64,autoSize:!0,margin:[16,16],isDraggable:!1,isResizable:!1},i.createElement("div",{key:"nav-bar"},i.createElement(ce,null)),i.createElement("div",{key:"sidebar"},i.createElement(ue,null)),i.createElement("div",{key:"main"},i.createElement(oe,null)),i.createElement("div",{key:"property"},"Property"))}const pe=t({key:"certs_query_id",default:0}),he=j({key:"certs",get:async({get:e})=>{e(pe);return await window.send("cert.getKeys",null)}}),fe=()=>{const t=P(he),n=S(pe),[a,r]=i.useState(""),l=_();i.useEffect((()=>{a&&setTimeout((()=>{r("")}),500)}),[a]);const{getRootProps:s,getInputProps:o,isDragActive:c}=N({accept:["application/json"],onDrop:async e=>{if(e.length<=0)return void r("Invalid file");const t=await(a=e[0],new Promise(((e,t)=>{const n=new FileReader;n.readAsDataURL(a),n.onload=()=>e(n.result),n.onerror=e=>t(e)})));var a;window.send("cert.storeKey",{file:t,foo:"bar"}).then((()=>{n((e=>e+1))}))},multiple:!1}),u=i.createElement(A,{type:"error"},i.createElement(D,null,"Error"),a),d=i.useMemo((()=>{if("hasValue"===t.state)return console.log(t.contents),t.contents.map((e=>i.createElement(R,{key:e.projectId,onDoubleClick:()=>{return t=e.projectId,void window.send("fs.init",{projectId:t}).then((()=>{l.push(`/${t}`)}));var t}},i.createElement(D,null,e.projectId),"Lorem ipsum")))}),[t.contents]);return i.createElement("div",null,a&&u,i.createElement(L,{isAnimated:!1,isLarge:!0,focusOnMount:!0,backdropProps:{onClick:e=>{e.preventDefault(),e.stopPropagation()}}},i.createElement(I,null,"Choose your project"),i.createElement(O,null,d,i.createElement($,e(e({},s()),{isDragging:c}),c?i.createElement("span",null,"Drop files here"):i.createElement("span",null,"Choose a certificate file or drag and drop here"),i.createElement(v,e({},o())))),i.createElement(z,null,i.createElement(M,null,i.createElement(T,{size:"small"},"Cancel")),i.createElement(M,null,i.createElement(T,{size:"small",isPrimary:!0},"Confirm")))))};function Ee(){return i.createElement(B,null,i.createElement(H,null,i.createElement(U,{path:"/:projectId"},i.createElement(me,null)),i.createElement(U,{path:"/"},i.createElement(fe,null))))}Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));const ge=e(e({},W),{space:e(e({},W.space),{base:4}),components:{"modals.header":({theme:e})=>({padding:`${3*e.space.base}px ${4*e.space.base}px`}),"tables.cell":()=>({padding:0})}});K.render(i.createElement(B,null,i.createElement(G,{theme:ge},i.createElement(q,null,i.createElement(Ee,null)))),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((e=>{e.unregister()})).catch((e=>{console.error(e.message)}));
