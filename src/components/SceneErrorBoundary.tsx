import {Component,type ReactNode} from "react";
import {StaticHouseIllustration} from "./SceneFallback";
interface Props{children:ReactNode;}interface State{hasError:boolean;}
export class SceneErrorBoundary extends Component<Props,State>{
 state:State={hasError:false};
 static getDerivedStateFromError():State{return {hasError:true};}
 componentDidCatch(error:Error){console.error("The 3D scene failed; showing the 2D fallback.",error);}
 render(){return this.state.hasError?<StaticHouseIllustration/>:this.props.children;}
}
