import {useEffect,useState} from "react";
export function useReducedMotion():boolean {
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{
  const query=window.matchMedia("(prefers-reduced-motion: reduce)");
  const update=(event?:MediaQueryListEvent)=>setReduced(event?event.matches:query.matches);
  update();query.addEventListener("change",update);
  return ()=>query.removeEventListener("change",update);
 },[]);
 return reduced;
}
