var Hi=Object.defineProperty,Ii=Object.defineProperties;var Ui=Object.getOwnPropertyDescriptors;var ue=Object.getOwnPropertySymbols;var Fi=Object.prototype.hasOwnProperty,Bi=Object.prototype.propertyIsEnumerable;var de=(i,t,r)=>t in i?Hi(i,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):i[t]=r,he=(i,t)=>{for(var r in t||(t={}))Fi.call(t,r)&&de(i,r,t[r]);if(ue)for(var r of ue(t))Bi.call(t,r)&&de(i,r,t[r]);return i},pe=(i,t)=>Ii(i,Ui(t));import{S as Vi,i as ji,s as Yi,e as xt,f as Ji,g as qi,h as Ki,j as Et,n as At,k as Wi}from"./vendor.d397e91b.js";/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Gi extends HTMLElement{static get version(){return"22.0.2"}}customElements.define("vaadin-lumo-styles",Gi);/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Ct=window.ShadowRoot&&(window.ShadyCSS===void 0||window.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,St=Symbol(),fe=new Map;class Tt{constructor(t,r){if(this._$cssResult$=!0,r!==St)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t}get styleSheet(){let t=fe.get(this.cssText);return Ct&&t===void 0&&(fe.set(this.cssText,t=new CSSStyleSheet),t.replaceSync(this.cssText)),t}toString(){return this.cssText}}const Xi=i=>new Tt(typeof i=="string"?i:i+"",St),A=(i,...t)=>{const r=i.length===1?i[0]:t.reduce((s,e,o)=>s+(n=>{if(n._$cssResult$===!0)return n.cssText;if(typeof n=="number")return n;throw Error("Value passed to 'css' function must be a 'css' function result: "+n+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(e)+i[o+1],i[0]);return new Tt(r,St)},Zi=(i,t)=>{Ct?i.adoptedStyleSheets=t.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet):t.forEach(r=>{const s=document.createElement("style"),e=window.litNonce;e!==void 0&&s.setAttribute("nonce",e),s.textContent=r.cssText,i.appendChild(s)})},me=Ct?i=>i:i=>i instanceof CSSStyleSheet?(t=>{let r="";for(const s of t.cssRules)r+=s.cssText;return Xi(r)})(i):i;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Ot;const _e=window.trustedTypes,Qi=_e?_e.emptyScript:"",ye=window.reactiveElementPolyfillSupport,$t={toAttribute(i,t){switch(t){case Boolean:i=i?Qi:null;break;case Object:case Array:i=i==null?i:JSON.stringify(i)}return i},fromAttribute(i,t){let r=i;switch(t){case Boolean:r=i!==null;break;case Number:r=i===null?null:Number(i);break;case Object:case Array:try{r=JSON.parse(i)}catch{r=null}}return r}},ge=(i,t)=>t!==i&&(t==t||i==i),Nt={attribute:!0,type:String,converter:$t,reflect:!1,hasChanged:ge};class z extends HTMLElement{constructor(){super(),this._$Et=new Map,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Ei=null,this.o()}static addInitializer(t){var r;(r=this.l)!==null&&r!==void 0||(this.l=[]),this.l.push(t)}static get observedAttributes(){this.finalize();const t=[];return this.elementProperties.forEach((r,s)=>{const e=this._$Eh(s,r);e!==void 0&&(this._$Eu.set(e,s),t.push(e))}),t}static createProperty(t,r=Nt){if(r.state&&(r.attribute=!1),this.finalize(),this.elementProperties.set(t,r),!r.noAccessor&&!this.prototype.hasOwnProperty(t)){const s=typeof t=="symbol"?Symbol():"__"+t,e=this.getPropertyDescriptor(t,s,r);e!==void 0&&Object.defineProperty(this.prototype,t,e)}}static getPropertyDescriptor(t,r,s){return{get(){return this[r]},set(e){const o=this[t];this[r]=e,this.requestUpdate(t,o,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)||Nt}static finalize(){if(this.hasOwnProperty("finalized"))return!1;this.finalized=!0;const t=Object.getPrototypeOf(this);if(t.finalize(),this.elementProperties=new Map(t.elementProperties),this._$Eu=new Map,this.hasOwnProperty("properties")){const r=this.properties,s=[...Object.getOwnPropertyNames(r),...Object.getOwnPropertySymbols(r)];for(const e of s)this.createProperty(e,r[e])}return this.elementStyles=this.finalizeStyles(this.styles),!0}static finalizeStyles(t){const r=[];if(Array.isArray(t)){const s=new Set(t.flat(1/0).reverse());for(const e of s)r.unshift(me(e))}else t!==void 0&&r.push(me(t));return r}static _$Eh(t,r){const s=r.attribute;return s===!1?void 0:typeof s=="string"?s:typeof t=="string"?t.toLowerCase():void 0}o(){var t;this._$Ep=new Promise(r=>this.enableUpdating=r),this._$AL=new Map,this._$Em(),this.requestUpdate(),(t=this.constructor.l)===null||t===void 0||t.forEach(r=>r(this))}addController(t){var r,s;((r=this._$Eg)!==null&&r!==void 0?r:this._$Eg=[]).push(t),this.renderRoot!==void 0&&this.isConnected&&((s=t.hostConnected)===null||s===void 0||s.call(t))}removeController(t){var r;(r=this._$Eg)===null||r===void 0||r.splice(this._$Eg.indexOf(t)>>>0,1)}_$Em(){this.constructor.elementProperties.forEach((t,r)=>{this.hasOwnProperty(r)&&(this._$Et.set(r,this[r]),delete this[r])})}createRenderRoot(){var t;const r=(t=this.shadowRoot)!==null&&t!==void 0?t:this.attachShadow(this.constructor.shadowRootOptions);return Zi(r,this.constructor.elementStyles),r}connectedCallback(){var t;this.renderRoot===void 0&&(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$Eg)===null||t===void 0||t.forEach(r=>{var s;return(s=r.hostConnected)===null||s===void 0?void 0:s.call(r)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$Eg)===null||t===void 0||t.forEach(r=>{var s;return(s=r.hostDisconnected)===null||s===void 0?void 0:s.call(r)})}attributeChangedCallback(t,r,s){this._$AK(t,s)}_$ES(t,r,s=Nt){var e,o;const n=this.constructor._$Eh(t,s);if(n!==void 0&&s.reflect===!0){const l=((o=(e=s.converter)===null||e===void 0?void 0:e.toAttribute)!==null&&o!==void 0?o:$t.toAttribute)(r,s.type);this._$Ei=t,l==null?this.removeAttribute(n):this.setAttribute(n,l),this._$Ei=null}}_$AK(t,r){var s,e,o;const n=this.constructor,l=n._$Eu.get(t);if(l!==void 0&&this._$Ei!==l){const a=n.getPropertyOptions(l),c=a.converter,u=(o=(e=(s=c)===null||s===void 0?void 0:s.fromAttribute)!==null&&e!==void 0?e:typeof c=="function"?c:null)!==null&&o!==void 0?o:$t.fromAttribute;this._$Ei=l,this[l]=u(r,a.type),this._$Ei=null}}requestUpdate(t,r,s){let e=!0;t!==void 0&&(((s=s||this.constructor.getPropertyOptions(t)).hasChanged||ge)(this[t],r)?(this._$AL.has(t)||this._$AL.set(t,r),s.reflect===!0&&this._$Ei!==t&&(this._$E_===void 0&&(this._$E_=new Map),this._$E_.set(t,s))):e=!1),!this.isUpdatePending&&e&&(this._$Ep=this._$EC())}async _$EC(){this.isUpdatePending=!0;try{await this._$Ep}catch(r){Promise.reject(r)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var t;if(!this.isUpdatePending)return;this.hasUpdated,this._$Et&&(this._$Et.forEach((e,o)=>this[o]=e),this._$Et=void 0);let r=!1;const s=this._$AL;try{r=this.shouldUpdate(s),r?(this.willUpdate(s),(t=this._$Eg)===null||t===void 0||t.forEach(e=>{var o;return(o=e.hostUpdate)===null||o===void 0?void 0:o.call(e)}),this.update(s)):this._$EU()}catch(e){throw r=!1,this._$EU(),e}r&&this._$AE(s)}willUpdate(t){}_$AE(t){var r;(r=this._$Eg)===null||r===void 0||r.forEach(s=>{var e;return(e=s.hostUpdated)===null||e===void 0?void 0:e.call(s)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$Ep}shouldUpdate(t){return!0}update(t){this._$E_!==void 0&&(this._$E_.forEach((r,s)=>this._$ES(s,this[s],r)),this._$E_=void 0),this._$EU()}updated(t){}firstUpdated(t){}}z.finalized=!0,z.elementProperties=new Map,z.elementStyles=[],z.shadowRootOptions={mode:"open"},ye==null||ye({ReactiveElement:z}),((Ot=globalThis.reactiveElementVersions)!==null&&Ot!==void 0?Ot:globalThis.reactiveElementVersions=[]).push("1.0.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var Mt;const D=globalThis.trustedTypes,ve=D?D.createPolicy("lit-html",{createHTML:i=>i}):void 0,C=`lit$${(Math.random()+"").slice(9)}$`,be="?"+C,tr=`<${be}>`,R=document,V=(i="")=>R.createComment(i),j=i=>i===null||typeof i!="object"&&typeof i!="function",we=Array.isArray,er=i=>{var t;return we(i)||typeof((t=i)===null||t===void 0?void 0:t[Symbol.iterator])=="function"},Y=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Pe=/-->/g,xe=/>/g,$=/>|[ 	\n\r](?:([^\s"'>=/]+)([ 	\n\r]*=[ 	\n\r]*(?:[^ 	\n\r"'`<>=]|("|')|))|$)/g,Ee=/'/g,Ae=/"/g,Ce=/^(?:script|style|textarea)$/i,H=Symbol.for("lit-noChange"),_=Symbol.for("lit-nothing"),Se=new WeakMap,ir=(i,t,r)=>{var s,e;const o=(s=r==null?void 0:r.renderBefore)!==null&&s!==void 0?s:t;let n=o._$litPart$;if(n===void 0){const l=(e=r==null?void 0:r.renderBefore)!==null&&e!==void 0?e:null;o._$litPart$=n=new q(t.insertBefore(V(),l),l,void 0,r!=null?r:{})}return n._$AI(i),n},I=R.createTreeWalker(R,129,null,!1),rr=(i,t)=>{const r=i.length-1,s=[];let e,o=t===2?"<svg>":"",n=Y;for(let a=0;a<r;a++){const c=i[a];let u,d,h=-1,p=0;for(;p<c.length&&(n.lastIndex=p,d=n.exec(c),d!==null);)p=n.lastIndex,n===Y?d[1]==="!--"?n=Pe:d[1]!==void 0?n=xe:d[2]!==void 0?(Ce.test(d[2])&&(e=RegExp("</"+d[2],"g")),n=$):d[3]!==void 0&&(n=$):n===$?d[0]===">"?(n=e!=null?e:Y,h=-1):d[1]===void 0?h=-2:(h=n.lastIndex-d[2].length,u=d[1],n=d[3]===void 0?$:d[3]==='"'?Ae:Ee):n===Ae||n===Ee?n=$:n===Pe||n===xe?n=Y:(n=$,e=void 0);const m=n===$&&i[a+1].startsWith("/>")?" ":"";o+=n===Y?c+tr:h>=0?(s.push(u),c.slice(0,h)+"$lit$"+c.slice(h)+C+m):c+C+(h===-2?(s.push(void 0),a):m)}const l=o+(i[r]||"<?>")+(t===2?"</svg>":"");return[ve!==void 0?ve.createHTML(l):l,s]};class J{constructor({strings:t,_$litType$:r},s){let e;this.parts=[];let o=0,n=0;const l=t.length-1,a=this.parts,[c,u]=rr(t,r);if(this.el=J.createElement(c,s),I.currentNode=this.el.content,r===2){const d=this.el.content,h=d.firstChild;h.remove(),d.append(...h.childNodes)}for(;(e=I.nextNode())!==null&&a.length<l;){if(e.nodeType===1){if(e.hasAttributes()){const d=[];for(const h of e.getAttributeNames())if(h.endsWith("$lit$")||h.startsWith(C)){const p=u[n++];if(d.push(h),p!==void 0){const m=e.getAttribute(p.toLowerCase()+"$lit$").split(C),y=/([.?@])?(.*)/.exec(p);a.push({type:1,index:o,name:y[2],strings:m,ctor:y[1]==="."?or:y[1]==="?"?lr:y[1]==="@"?ar:st})}else a.push({type:6,index:o})}for(const h of d)e.removeAttribute(h)}if(Ce.test(e.tagName)){const d=e.textContent.split(C),h=d.length-1;if(h>0){e.textContent=D?D.emptyScript:"";for(let p=0;p<h;p++)e.append(d[p],V()),I.nextNode(),a.push({type:2,index:++o});e.append(d[h],V())}}}else if(e.nodeType===8)if(e.data===be)a.push({type:2,index:o});else{let d=-1;for(;(d=e.data.indexOf(C,d+1))!==-1;)a.push({type:7,index:o}),d+=C.length-1}o++}}static createElement(t,r){const s=R.createElement("template");return s.innerHTML=t,s}}function U(i,t,r=i,s){var e,o,n,l;if(t===H)return t;let a=s!==void 0?(e=r._$Cl)===null||e===void 0?void 0:e[s]:r._$Cu;const c=j(t)?void 0:t._$litDirective$;return(a==null?void 0:a.constructor)!==c&&((o=a==null?void 0:a._$AO)===null||o===void 0||o.call(a,!1),c===void 0?a=void 0:(a=new c(i),a._$AT(i,r,s)),s!==void 0?((n=(l=r)._$Cl)!==null&&n!==void 0?n:l._$Cl=[])[s]=a:r._$Cu=a),a!==void 0&&(t=U(i,a._$AS(i,t.values),a,s)),t}class sr{constructor(t,r){this.v=[],this._$AN=void 0,this._$AD=t,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}p(t){var r;const{el:{content:s},parts:e}=this._$AD,o=((r=t==null?void 0:t.creationScope)!==null&&r!==void 0?r:R).importNode(s,!0);I.currentNode=o;let n=I.nextNode(),l=0,a=0,c=e[0];for(;c!==void 0;){if(l===c.index){let u;c.type===2?u=new q(n,n.nextSibling,this,t):c.type===1?u=new c.ctor(n,c.name,c.strings,this,t):c.type===6&&(u=new cr(n,this,t)),this.v.push(u),c=e[++a]}l!==(c==null?void 0:c.index)&&(n=I.nextNode(),l++)}return o}m(t){let r=0;for(const s of this.v)s!==void 0&&(s.strings!==void 0?(s._$AI(t,s,r),r+=s.strings.length-2):s._$AI(t[r])),r++}}class q{constructor(t,r,s,e){var o;this.type=2,this._$AH=_,this._$AN=void 0,this._$AA=t,this._$AB=r,this._$AM=s,this.options=e,this._$Cg=(o=e==null?void 0:e.isConnected)===null||o===void 0||o}get _$AU(){var t,r;return(r=(t=this._$AM)===null||t===void 0?void 0:t._$AU)!==null&&r!==void 0?r:this._$Cg}get parentNode(){let t=this._$AA.parentNode;const r=this._$AM;return r!==void 0&&t.nodeType===11&&(t=r.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,r=this){t=U(this,t,r),j(t)?t===_||t==null||t===""?(this._$AH!==_&&this._$AR(),this._$AH=_):t!==this._$AH&&t!==H&&this.$(t):t._$litType$!==void 0?this.T(t):t.nodeType!==void 0?this.S(t):er(t)?this.M(t):this.$(t)}A(t,r=this._$AB){return this._$AA.parentNode.insertBefore(t,r)}S(t){this._$AH!==t&&(this._$AR(),this._$AH=this.A(t))}$(t){this._$AH!==_&&j(this._$AH)?this._$AA.nextSibling.data=t:this.S(R.createTextNode(t)),this._$AH=t}T(t){var r;const{values:s,_$litType$:e}=t,o=typeof e=="number"?this._$AC(t):(e.el===void 0&&(e.el=J.createElement(e.h,this.options)),e);if(((r=this._$AH)===null||r===void 0?void 0:r._$AD)===o)this._$AH.m(s);else{const n=new sr(o,this),l=n.p(this.options);n.m(s),this.S(l),this._$AH=n}}_$AC(t){let r=Se.get(t.strings);return r===void 0&&Se.set(t.strings,r=new J(t)),r}M(t){we(this._$AH)||(this._$AH=[],this._$AR());const r=this._$AH;let s,e=0;for(const o of t)e===r.length?r.push(s=new q(this.A(V()),this.A(V()),this,this.options)):s=r[e],s._$AI(o),e++;e<r.length&&(this._$AR(s&&s._$AB.nextSibling,e),r.length=e)}_$AR(t=this._$AA.nextSibling,r){var s;for((s=this._$AP)===null||s===void 0||s.call(this,!1,!0,r);t&&t!==this._$AB;){const e=t.nextSibling;t.remove(),t=e}}setConnected(t){var r;this._$AM===void 0&&(this._$Cg=t,(r=this._$AP)===null||r===void 0||r.call(this,t))}}class st{constructor(t,r,s,e,o){this.type=1,this._$AH=_,this._$AN=void 0,this.element=t,this.name=r,this._$AM=e,this.options=o,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=_}get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}_$AI(t,r=this,s,e){const o=this.strings;let n=!1;if(o===void 0)t=U(this,t,r,0),n=!j(t)||t!==this._$AH&&t!==H,n&&(this._$AH=t);else{const l=t;let a,c;for(t=o[0],a=0;a<o.length-1;a++)c=U(this,l[s+a],r,a),c===H&&(c=this._$AH[a]),n||(n=!j(c)||c!==this._$AH[a]),c===_?t=_:t!==_&&(t+=(c!=null?c:"")+o[a+1]),this._$AH[a]=c}n&&!e&&this.k(t)}k(t){t===_?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t!=null?t:"")}}class or extends st{constructor(){super(...arguments),this.type=3}k(t){this.element[this.name]=t===_?void 0:t}}const nr=D?D.emptyScript:"";class lr extends st{constructor(){super(...arguments),this.type=4}k(t){t&&t!==_?this.element.setAttribute(this.name,nr):this.element.removeAttribute(this.name)}}class ar extends st{constructor(t,r,s,e,o){super(t,r,s,e,o),this.type=5}_$AI(t,r=this){var s;if((t=(s=U(this,t,r,0))!==null&&s!==void 0?s:_)===H)return;const e=this._$AH,o=t===_&&e!==_||t.capture!==e.capture||t.once!==e.once||t.passive!==e.passive,n=t!==_&&(e===_||o);o&&this.element.removeEventListener(this.name,this,e),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var r,s;typeof this._$AH=="function"?this._$AH.call((s=(r=this.options)===null||r===void 0?void 0:r.host)!==null&&s!==void 0?s:this.element,t):this._$AH.handleEvent(t)}}class cr{constructor(t,r,s){this.element=t,this.type=6,this._$AN=void 0,this._$AM=r,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(t){U(this,t)}}const Te=window.litHtmlPolyfillSupport;Te==null||Te(J,q),((Mt=globalThis.litHtmlVersions)!==null&&Mt!==void 0?Mt:globalThis.litHtmlVersions=[]).push("2.0.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var kt,Lt;class ot extends z{constructor(){super(...arguments),this.renderOptions={host:this},this._$Dt=void 0}createRenderRoot(){var t,r;const s=super.createRenderRoot();return(t=(r=this.renderOptions).renderBefore)!==null&&t!==void 0||(r.renderBefore=s.firstChild),s}update(t){const r=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Dt=ir(r,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Dt)===null||t===void 0||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Dt)===null||t===void 0||t.setConnected(!1)}render(){return H}}ot.finalized=!0,ot._$litElement$=!0,(kt=globalThis.litElementHydrateSupport)===null||kt===void 0||kt.call(globalThis,{LitElement:ot});const Oe=globalThis.litElementPolyfillSupport;Oe==null||Oe({LitElement:ot});((Lt=globalThis.litElementVersions)!==null&&Lt!==void 0?Lt:globalThis.litElementVersions=[]).push("3.0.2");/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ur=i=>class extends i{static get properties(){return{theme:{type:String,readOnly:!0}}}attributeChangedCallback(r,s,e){super.attributeChangedCallback(r,s,e),r==="theme"&&this._setTheme(e)}};/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const $e=[];function nt(i,t,r={}){if(i){const s=customElements.get(i);s&&Object.prototype.hasOwnProperty.call(s,"__finalized")&&console.warn(`The custom element definition for "${i}"
      was finalized before a style module was registered.
      Make sure to add component specific style modules before
      importing the corresponding custom element.`)}t=Ne(t),window.Vaadin&&window.Vaadin.styleModules?window.Vaadin.styleModules.registerStyles(i,t,r):$e.push({themeFor:i,styles:t,include:r.include,moduleId:r.moduleId})}function zt(){return window.Vaadin&&window.Vaadin.styleModules?window.Vaadin.styleModules.getAllThemes():$e}function dr(i,t){return(i||"").split(" ").some(r=>new RegExp("^"+r.split("*").join(".*")+"$").test(t))}function hr(i=""){let t=0;return i.indexOf("lumo-")===0||i.indexOf("material-")===0?t=1:i.indexOf("vaadin-")===0&&(t=2),t}function Ne(i=[],t=[]){return i instanceof Tt?t.push(i):Array.isArray(i)?i.forEach(r=>Ne(r,t)):console.warn("An item in styles is not of type CSSResult. Use `unsafeCSS` or `css`."),t}function Me(i){const t=[];return i.include&&[].concat(i.include).forEach(r=>{const s=zt().find(e=>e.moduleId===r);s?t.push(...Me(s),...s.styles):console.warn(`Included moduleId ${r} not found in style registry`)},i.styles),t}function pr(i,t){const r=document.createElement("style");r.innerHTML=i.filter((s,e)=>e===i.lastIndexOf(s)).map(s=>s.cssText).join(`
`),t.content.appendChild(r)}function ke(i){const t=i+"-default-theme",r=zt().filter(s=>s.moduleId!==t&&dr(s.themeFor,i)).map(s=>pe(he({},s),{styles:[...Me(s),...s.styles],includePriority:hr(s.moduleId)})).sort((s,e)=>e.includePriority-s.includePriority);return r.length>0?r:zt().filter(s=>s.moduleId===t)}const fr=i=>class extends ur(i){static finalize(){super.finalize();const r=this.prototype._template;if(!r||r.__themes)return;const s=Object.getPrototypeOf(this.prototype)._template,e=(s?s.__themes:[])||[];r.__themes=[...e,...ke(this.is)];const o=r.__themes.reduce((n,l)=>[...n,...l.styles],[]);pr(o,r)}static finalizeStyles(r){return ke(this.is).reduce((s,e)=>[...s,...e.styles],[]).concat(r)}};/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const mr=A`
  :host {
    /* Base (background) */
    --lumo-base-color: #fff;

    /* Tint */
    --lumo-tint-5pct: hsla(0, 0%, 100%, 0.3);
    --lumo-tint-10pct: hsla(0, 0%, 100%, 0.37);
    --lumo-tint-20pct: hsla(0, 0%, 100%, 0.44);
    --lumo-tint-30pct: hsla(0, 0%, 100%, 0.5);
    --lumo-tint-40pct: hsla(0, 0%, 100%, 0.57);
    --lumo-tint-50pct: hsla(0, 0%, 100%, 0.64);
    --lumo-tint-60pct: hsla(0, 0%, 100%, 0.7);
    --lumo-tint-70pct: hsla(0, 0%, 100%, 0.77);
    --lumo-tint-80pct: hsla(0, 0%, 100%, 0.84);
    --lumo-tint-90pct: hsla(0, 0%, 100%, 0.9);
    --lumo-tint: #fff;

    /* Shade */
    --lumo-shade-5pct: hsla(214, 61%, 25%, 0.05);
    --lumo-shade-10pct: hsla(214, 57%, 24%, 0.1);
    --lumo-shade-20pct: hsla(214, 53%, 23%, 0.16);
    --lumo-shade-30pct: hsla(214, 50%, 22%, 0.26);
    --lumo-shade-40pct: hsla(214, 47%, 21%, 0.38);
    --lumo-shade-50pct: hsla(214, 45%, 20%, 0.52);
    --lumo-shade-60pct: hsla(214, 43%, 19%, 0.6);
    --lumo-shade-70pct: hsla(214, 42%, 18%, 0.69);
    --lumo-shade-80pct: hsla(214, 41%, 17%, 0.83);
    --lumo-shade-90pct: hsla(214, 40%, 16%, 0.94);
    --lumo-shade: hsl(214, 35%, 15%);

    /* Contrast */
    --lumo-contrast-5pct: var(--lumo-shade-5pct);
    --lumo-contrast-10pct: var(--lumo-shade-10pct);
    --lumo-contrast-20pct: var(--lumo-shade-20pct);
    --lumo-contrast-30pct: var(--lumo-shade-30pct);
    --lumo-contrast-40pct: var(--lumo-shade-40pct);
    --lumo-contrast-50pct: var(--lumo-shade-50pct);
    --lumo-contrast-60pct: var(--lumo-shade-60pct);
    --lumo-contrast-70pct: var(--lumo-shade-70pct);
    --lumo-contrast-80pct: var(--lumo-shade-80pct);
    --lumo-contrast-90pct: var(--lumo-shade-90pct);
    --lumo-contrast: var(--lumo-shade);

    /* Text */
    --lumo-header-text-color: var(--lumo-contrast);
    --lumo-body-text-color: var(--lumo-contrast-90pct);
    --lumo-secondary-text-color: var(--lumo-contrast-70pct);
    --lumo-tertiary-text-color: var(--lumo-contrast-50pct);
    --lumo-disabled-text-color: var(--lumo-contrast-30pct);

    /* Primary */
    --lumo-primary-color: hsl(214, 100%, 48%);
    --lumo-primary-color-50pct: hsla(214, 100%, 49%, 0.76);
    --lumo-primary-color-10pct: hsla(214, 100%, 60%, 0.13);
    --lumo-primary-text-color: hsl(214, 100%, 43%);
    --lumo-primary-contrast-color: #fff;

    /* Error */
    --lumo-error-color: hsl(3, 85%, 48%);
    --lumo-error-color-50pct: hsla(3, 85%, 49%, 0.5);
    --lumo-error-color-10pct: hsla(3, 85%, 49%, 0.1);
    --lumo-error-text-color: hsl(3, 89%, 42%);
    --lumo-error-contrast-color: #fff;

    /* Success */
    --lumo-success-color: hsl(145, 72%, 30%);
    --lumo-success-color-50pct: hsla(145, 72%, 31%, 0.5);
    --lumo-success-color-10pct: hsla(145, 72%, 31%, 0.1);
    --lumo-success-text-color: hsl(145, 85%, 25%);
    --lumo-success-contrast-color: #fff;
  }
`,Le=document.createElement("template");Le.innerHTML=`<style>${mr.toString().replace(":host","html")}</style>`;document.head.appendChild(Le.content);const ze=A`
  [theme~='dark'] {
    /* Base (background) */
    --lumo-base-color: hsl(214, 35%, 21%);

    /* Tint */
    --lumo-tint-5pct: hsla(214, 65%, 85%, 0.06);
    --lumo-tint-10pct: hsla(214, 60%, 80%, 0.14);
    --lumo-tint-20pct: hsla(214, 64%, 82%, 0.23);
    --lumo-tint-30pct: hsla(214, 69%, 84%, 0.32);
    --lumo-tint-40pct: hsla(214, 73%, 86%, 0.41);
    --lumo-tint-50pct: hsla(214, 78%, 88%, 0.5);
    --lumo-tint-60pct: hsla(214, 82%, 90%, 0.58);
    --lumo-tint-70pct: hsla(214, 87%, 92%, 0.69);
    --lumo-tint-80pct: hsla(214, 91%, 94%, 0.8);
    --lumo-tint-90pct: hsla(214, 96%, 96%, 0.9);
    --lumo-tint: hsl(214, 100%, 98%);

    /* Shade */
    --lumo-shade-5pct: hsla(214, 0%, 0%, 0.07);
    --lumo-shade-10pct: hsla(214, 4%, 2%, 0.15);
    --lumo-shade-20pct: hsla(214, 8%, 4%, 0.23);
    --lumo-shade-30pct: hsla(214, 12%, 6%, 0.32);
    --lumo-shade-40pct: hsla(214, 16%, 8%, 0.41);
    --lumo-shade-50pct: hsla(214, 20%, 10%, 0.5);
    --lumo-shade-60pct: hsla(214, 24%, 12%, 0.6);
    --lumo-shade-70pct: hsla(214, 28%, 13%, 0.7);
    --lumo-shade-80pct: hsla(214, 32%, 13%, 0.8);
    --lumo-shade-90pct: hsla(214, 33%, 13%, 0.9);
    --lumo-shade: hsl(214, 33%, 13%);

    /* Contrast */
    --lumo-contrast-5pct: var(--lumo-tint-5pct);
    --lumo-contrast-10pct: var(--lumo-tint-10pct);
    --lumo-contrast-20pct: var(--lumo-tint-20pct);
    --lumo-contrast-30pct: var(--lumo-tint-30pct);
    --lumo-contrast-40pct: var(--lumo-tint-40pct);
    --lumo-contrast-50pct: var(--lumo-tint-50pct);
    --lumo-contrast-60pct: var(--lumo-tint-60pct);
    --lumo-contrast-70pct: var(--lumo-tint-70pct);
    --lumo-contrast-80pct: var(--lumo-tint-80pct);
    --lumo-contrast-90pct: var(--lumo-tint-90pct);
    --lumo-contrast: var(--lumo-tint);

    /* Text */
    --lumo-header-text-color: var(--lumo-contrast);
    --lumo-body-text-color: var(--lumo-contrast-90pct);
    --lumo-secondary-text-color: var(--lumo-contrast-70pct);
    --lumo-tertiary-text-color: var(--lumo-contrast-50pct);
    --lumo-disabled-text-color: var(--lumo-contrast-30pct);

    /* Primary */
    --lumo-primary-color: hsl(214, 90%, 48%);
    --lumo-primary-color-50pct: hsla(214, 90%, 70%, 0.69);
    --lumo-primary-color-10pct: hsla(214, 90%, 55%, 0.13);
    --lumo-primary-text-color: hsl(214, 90%, 77%);
    --lumo-primary-contrast-color: #fff;

    /* Error */
    --lumo-error-color: hsl(3, 79%, 49%);
    --lumo-error-color-50pct: hsla(3, 75%, 62%, 0.5);
    --lumo-error-color-10pct: hsla(3, 75%, 62%, 0.14);
    --lumo-error-text-color: hsl(3, 100%, 80%);

    /* Success */
    --lumo-success-color: hsl(145, 72%, 30%);
    --lumo-success-color-50pct: hsla(145, 92%, 51%, 0.5);
    --lumo-success-color-10pct: hsla(145, 92%, 51%, 0.1);
    --lumo-success-text-color: hsl(145, 85%, 46%);
  }

  html {
    color: var(--lumo-body-text-color);
    background-color: var(--lumo-base-color);
  }

  [theme~='dark'] {
    color: var(--lumo-body-text-color);
    background-color: var(--lumo-base-color);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: var(--lumo-header-text-color);
  }

  a {
    color: var(--lumo-primary-text-color);
  }

  blockquote {
    color: var(--lumo-secondary-text-color);
  }

  code,
  pre {
    background-color: var(--lumo-contrast-10pct);
    border-radius: var(--lumo-border-radius-m);
  }
`;nt("",ze,{moduleId:"lumo-color"});const _r=A`
  :host {
    color: var(--lumo-body-text-color) !important;
    background-color: var(--lumo-base-color) !important;
  }
`;nt("",[ze,_r],{moduleId:"lumo-color-legacy"});/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const yr=A`
  :host {
    --lumo-size-xs: 1.625rem;
    --lumo-size-s: 1.875rem;
    --lumo-size-m: 2.25rem;
    --lumo-size-l: 2.75rem;
    --lumo-size-xl: 3.5rem;

    /* Icons */
    --lumo-icon-size-s: 1.25em;
    --lumo-icon-size-m: 1.5em;
    --lumo-icon-size-l: 2.25em;
    /* For backwards compatibility */
    --lumo-icon-size: var(--lumo-icon-size-m);
  }
`,De=document.createElement("template");De.innerHTML=`<style>${yr.toString().replace(":host","html")}</style>`;document.head.appendChild(De.content);/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const gr=A`
  :host {
    /* Square */
    --lumo-space-xs: 0.25rem;
    --lumo-space-s: 0.5rem;
    --lumo-space-m: 1rem;
    --lumo-space-l: 1.5rem;
    --lumo-space-xl: 2.5rem;

    /* Wide */
    --lumo-space-wide-xs: calc(var(--lumo-space-xs) / 2) var(--lumo-space-xs);
    --lumo-space-wide-s: calc(var(--lumo-space-s) / 2) var(--lumo-space-s);
    --lumo-space-wide-m: calc(var(--lumo-space-m) / 2) var(--lumo-space-m);
    --lumo-space-wide-l: calc(var(--lumo-space-l) / 2) var(--lumo-space-l);
    --lumo-space-wide-xl: calc(var(--lumo-space-xl) / 2) var(--lumo-space-xl);

    /* Tall */
    --lumo-space-tall-xs: var(--lumo-space-xs) calc(var(--lumo-space-xs) / 2);
    --lumo-space-tall-s: var(--lumo-space-s) calc(var(--lumo-space-s) / 2);
    --lumo-space-tall-m: var(--lumo-space-m) calc(var(--lumo-space-m) / 2);
    --lumo-space-tall-l: var(--lumo-space-l) calc(var(--lumo-space-l) / 2);
    --lumo-space-tall-xl: var(--lumo-space-xl) calc(var(--lumo-space-xl) / 2);
  }
`,Re=document.createElement("template");Re.innerHTML=`<style>${gr.toString().replace(":host","html")}</style>`;document.head.appendChild(Re.content);/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const vr=A`
  :host {
    /* Border radius */
    --lumo-border-radius-s: 0.25em; /* Checkbox, badge, date-picker year indicator, etc */
    --lumo-border-radius-m: var(--lumo-border-radius, 0.25em); /* Button, text field, menu overlay, etc */
    --lumo-border-radius-l: 0.5em; /* Dialog, notification, etc */
    --lumo-border-radius: 0.25em; /* Deprecated */

    /* Shadow */
    --lumo-box-shadow-xs: 0 1px 4px -1px var(--lumo-shade-50pct);
    --lumo-box-shadow-s: 0 2px 4px -1px var(--lumo-shade-20pct), 0 3px 12px -1px var(--lumo-shade-30pct);
    --lumo-box-shadow-m: 0 2px 6px -1px var(--lumo-shade-20pct), 0 8px 24px -4px var(--lumo-shade-40pct);
    --lumo-box-shadow-l: 0 3px 18px -2px var(--lumo-shade-20pct), 0 12px 48px -6px var(--lumo-shade-40pct);
    --lumo-box-shadow-xl: 0 4px 24px -3px var(--lumo-shade-20pct), 0 18px 64px -8px var(--lumo-shade-40pct);

    /* Clickable element cursor */
    --lumo-clickable-cursor: default;
  }
`,He=document.createElement("template");He.innerHTML=`<style>${vr.toString().replace(":host","html")}</style>`;document.head.appendChild(He.content);/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const br=A`
  :host {
    /* prettier-ignore */
    --lumo-font-family: -apple-system, BlinkMacSystemFont, 'Roboto', 'Segoe UI', Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';

    /* Font sizes */
    --lumo-font-size-xxs: 0.75rem;
    --lumo-font-size-xs: 0.8125rem;
    --lumo-font-size-s: 0.875rem;
    --lumo-font-size-m: 1rem;
    --lumo-font-size-l: 1.125rem;
    --lumo-font-size-xl: 1.375rem;
    --lumo-font-size-xxl: 1.75rem;
    --lumo-font-size-xxxl: 2.5rem;

    /* Line heights */
    --lumo-line-height-xs: 1.25;
    --lumo-line-height-s: 1.375;
    --lumo-line-height-m: 1.625;
  }
`,wr=A`
  html,
  :host {
    font-family: var(--lumo-font-family);
    font-size: var(--lumo-font-size, var(--lumo-font-size-m));
    line-height: var(--lumo-line-height-m);
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  small,
  [theme~='font-size-s'] {
    font-size: var(--lumo-font-size-s);
    line-height: var(--lumo-line-height-s);
  }

  [theme~='font-size-xs'] {
    font-size: var(--lumo-font-size-xs);
    line-height: var(--lumo-line-height-xs);
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: 600;
    line-height: var(--lumo-line-height-xs);
    margin-top: 1.25em;
  }

  h1 {
    font-size: var(--lumo-font-size-xxxl);
    margin-bottom: 0.75em;
  }

  h2 {
    font-size: var(--lumo-font-size-xxl);
    margin-bottom: 0.5em;
  }

  h3 {
    font-size: var(--lumo-font-size-xl);
    margin-bottom: 0.5em;
  }

  h4 {
    font-size: var(--lumo-font-size-l);
    margin-bottom: 0.5em;
  }

  h5 {
    font-size: var(--lumo-font-size-m);
    margin-bottom: 0.25em;
  }

  h6 {
    font-size: var(--lumo-font-size-xs);
    margin-bottom: 0;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  p,
  blockquote {
    margin-top: 0.5em;
    margin-bottom: 0.75em;
  }

  a {
    text-decoration: none;
  }

  a:hover {
    text-decoration: underline;
  }

  hr {
    display: block;
    align-self: stretch;
    height: 1px;
    border: 0;
    padding: 0;
    margin: var(--lumo-space-s) calc(var(--lumo-border-radius-m) / 2);
    background-color: var(--lumo-contrast-10pct);
  }

  blockquote {
    border-left: 2px solid var(--lumo-contrast-30pct);
  }

  b,
  strong {
    font-weight: 600;
  }

  /* RTL specific styles */
  blockquote[dir='rtl'] {
    border-left: none;
    border-right: 2px solid var(--lumo-contrast-30pct);
  }
`;nt("",wr,{moduleId:"lumo-typography"});const Ie=document.createElement("template");Ie.innerHTML=`<style>${br.toString().replace(":host","html")}</style>`;document.head.appendChild(Ie.content);const Pr=A`
  :host {
    /* Sizing */
    --lumo-button-size: var(--lumo-size-m);
    min-width: calc(var(--lumo-button-size) * 2);
    height: var(--lumo-button-size);
    padding: 0 calc(var(--lumo-button-size) / 3 + var(--lumo-border-radius-m) / 2);
    margin: var(--lumo-space-xs) 0;
    box-sizing: border-box;
    /* Style */
    font-family: var(--lumo-font-family);
    font-size: var(--lumo-font-size-m);
    font-weight: 500;
    color: var(--_lumo-button-color, var(--lumo-primary-text-color));
    background-color: var(--_lumo-button-background-color, var(--lumo-contrast-5pct));
    border-radius: var(--lumo-border-radius-m);
    cursor: var(--lumo-clickable-cursor);
    -webkit-tap-highlight-color: transparent;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Set only for the internal parts so we don’t affect the host vertical alignment */
  [part='label'],
  [part='prefix'],
  [part='suffix'] {
    line-height: var(--lumo-line-height-xs);
  }

  [part='label'] {
    padding: calc(var(--lumo-button-size) / 6) 0;
  }

  :host([theme~='small']) {
    font-size: var(--lumo-font-size-s);
    --lumo-button-size: var(--lumo-size-s);
  }

  :host([theme~='large']) {
    font-size: var(--lumo-font-size-l);
    --lumo-button-size: var(--lumo-size-l);
  }

  /* For interaction states */
  :host::before,
  :host::after {
    content: '';
    /* We rely on the host always being relative */
    position: absolute;
    z-index: 1;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: currentColor;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.2s;
    pointer-events: none;
  }

  /* Hover */

  @media (any-hover: hover) {
    :host(:hover)::before {
      opacity: 0.02;
    }
  }

  /* Active */

  :host::after {
    transition: opacity 1.4s, transform 0.1s;
    filter: blur(8px);
  }

  :host([active])::before {
    opacity: 0.05;
    transition-duration: 0s;
  }

  :host([active])::after {
    opacity: 0.1;
    transition-duration: 0s, 0s;
    transform: scale(0);
  }

  /* Keyboard focus */

  :host([focus-ring]) {
    box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
  }

  :host([theme~='primary'][focus-ring]) {
    box-shadow: 0 0 0 1px var(--lumo-base-color), 0 0 0 3px var(--lumo-primary-color-50pct);
  }

  /* Types (primary, tertiary, tertiary-inline */

  :host([theme~='tertiary']),
  :host([theme~='tertiary-inline']) {
    background-color: transparent !important;
    min-width: 0;
  }

  :host([theme~='tertiary']) {
    padding: 0 calc(var(--lumo-button-size) / 6);
  }

  :host([theme~='tertiary-inline'])::before {
    display: none;
  }

  :host([theme~='tertiary-inline']) {
    margin: 0;
    height: auto;
    padding: 0;
    line-height: inherit;
    font-size: inherit;
  }

  :host([theme~='tertiary-inline']) [part='label'] {
    padding: 0;
    overflow: visible;
    line-height: inherit;
  }

  :host([theme~='primary']) {
    background-color: var(--_lumo-button-primary-background-color, var(--lumo-primary-color));
    color: var(--_lumo-button-primary-color, var(--lumo-primary-contrast-color));
    font-weight: 600;
    min-width: calc(var(--lumo-button-size) * 2.5);
  }

  :host([theme~='primary'])::before {
    background-color: black;
  }

  @media (any-hover: hover) {
    :host([theme~='primary']:hover)::before {
      opacity: 0.05;
    }
  }

  :host([theme~='primary'][active])::before {
    opacity: 0.1;
  }

  :host([theme~='primary'][active])::after {
    opacity: 0.2;
  }

  /* Colors (success, error, contrast) */

  :host([theme~='success']) {
    color: var(--lumo-success-text-color);
  }

  :host([theme~='success'][theme~='primary']) {
    background-color: var(--lumo-success-color);
    color: var(--lumo-success-contrast-color);
  }

  :host([theme~='error']) {
    color: var(--lumo-error-text-color);
  }

  :host([theme~='error'][theme~='primary']) {
    background-color: var(--lumo-error-color);
    color: var(--lumo-error-contrast-color);
  }

  :host([theme~='contrast']) {
    color: var(--lumo-contrast);
  }

  :host([theme~='contrast'][theme~='primary']) {
    background-color: var(--lumo-contrast);
    color: var(--lumo-base-color);
  }

  /* Disabled state. Keep selectors after other color variants. */

  :host([disabled]) {
    pointer-events: none;
    color: var(--lumo-disabled-text-color);
  }

  :host([theme~='primary'][disabled]) {
    background-color: var(--lumo-contrast-30pct);
    color: var(--lumo-base-color);
  }

  :host([theme~='primary'][disabled]) [part] {
    opacity: 0.7;
  }

  /* Icons */

  [part] ::slotted(vaadin-icon),
  [part] ::slotted(iron-icon) {
    display: inline-block;
    width: var(--lumo-icon-size-m);
    height: var(--lumo-icon-size-m);
  }

  /* Vaadin icons are based on a 16x16 grid (unlike Lumo and Material icons with 24x24), so they look too big by default */
  [part] ::slotted(vaadin-icon[icon^='vaadin:']),
  [part] ::slotted(iron-icon[icon^='vaadin:']) {
    padding: 0.25em;
    box-sizing: border-box !important;
  }

  [part='prefix'] {
    margin-left: -0.25em;
    margin-right: 0.25em;
  }

  [part='suffix'] {
    margin-left: 0.25em;
    margin-right: -0.25em;
  }

  /* Icon-only */

  :host([theme~='icon']:not([theme~='tertiary-inline'])) {
    min-width: var(--lumo-button-size);
    padding-left: calc(var(--lumo-button-size) / 4);
    padding-right: calc(var(--lumo-button-size) / 4);
  }

  :host([theme~='icon']) [part='prefix'],
  :host([theme~='icon']) [part='suffix'] {
    margin-left: 0;
    margin-right: 0;
  }

  /* RTL specific styles */

  :host([dir='rtl']) [part='prefix'] {
    margin-left: 0.25em;
    margin-right: -0.25em;
  }

  :host([dir='rtl']) [part='suffix'] {
    margin-left: -0.25em;
    margin-right: 0.25em;
  }

  :host([dir='rtl'][theme~='icon']) [part='prefix'],
  :host([dir='rtl'][theme~='icon']) [part='suffix'] {
    margin-left: 0;
    margin-right: 0;
  }
`;nt("vaadin-button",Pr,{moduleId:"lumo-button"});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/window.JSCompiler_renameProperty=function(i,t){return i};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let xr=/(url\()([^)]*)(\))/g,Er=/(^\/[^\/])|(^#)|(^[\w-\d]*:)/,lt,P;function K(i,t){if(i&&Er.test(i)||i==="//")return i;if(lt===void 0){lt=!1;try{const r=new URL("b","http://a");r.pathname="c%20d",lt=r.href==="http://a/c%20d"}catch{}}if(t||(t=document.baseURI||window.location.href),lt)try{return new URL(i,t).href}catch{return i}return P||(P=document.implementation.createHTMLDocument("temp"),P.base=P.createElement("base"),P.head.appendChild(P.base),P.anchor=P.createElement("a"),P.body.appendChild(P.anchor)),P.base.href=t,P.anchor.href=i,P.anchor.href||i}function Dt(i,t){return i.replace(xr,function(r,s,e,o){return s+"'"+K(e.replace(/["']/g,""),t)+"'"+o})}function Rt(i){return i.substring(0,i.lastIndexOf("/")+1)}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const Ar=!window.ShadyDOM||!window.ShadyDOM.inUse;Boolean(!window.ShadyCSS||window.ShadyCSS.nativeCss);const Cr=Ar&&"adoptedStyleSheets"in Document.prototype&&"replaceSync"in CSSStyleSheet.prototype&&(()=>{try{const i=new CSSStyleSheet;i.replaceSync("");const t=document.createElement("div");return t.attachShadow({mode:"open"}),t.shadowRoot.adoptedStyleSheets=[i],t.shadowRoot.adoptedStyleSheets[0]===i}catch{return!1}})();let Sr=window.Polymer&&window.Polymer.rootPath||Rt(document.baseURI||window.location.href),at=window.Polymer&&window.Polymer.sanitizeDOMValue||void 0,Tr=window.Polymer&&window.Polymer.setPassiveTouchGestures||!1,Ht=window.Polymer&&window.Polymer.strictTemplatePolicy||!1,Or=window.Polymer&&window.Polymer.allowTemplateFromDomModule||!1,$r=window.Polymer&&window.Polymer.legacyOptimizations||!1,Nr=window.Polymer&&window.Polymer.legacyWarnings||!1,Mr=window.Polymer&&window.Polymer.syncInitialRender||!1,It=window.Polymer&&window.Polymer.legacyUndefined||!1,kr=window.Polymer&&window.Polymer.orderedComputed||!1,Ue=window.Polymer&&window.Polymer.removeNestedTemplates||!1,Lr=window.Polymer&&window.Polymer.fastDomIf||!1;window.Polymer&&window.Polymer.suppressTemplateNotifications;window.Polymer&&window.Polymer.legacyNoObservedAttributes;let zr=window.Polymer&&window.Polymer.useAdoptedStyleSheetsWithBuiltCSS||!1;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let Dr=0;const E=function(i){let t=i.__mixinApplications;t||(t=new WeakMap,i.__mixinApplications=t);let r=Dr++;function s(e){let o=e.__mixinSet;if(o&&o[r])return e;let n=t,l=n.get(e);if(!l){l=i(e),n.set(e,l);let a=Object.create(l.__mixinSet||o||null);a[r]=!0,l.__mixinSet=a}return l}return s};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let Ut={},Fe={};function Be(i,t){Ut[i]=Fe[i.toLowerCase()]=t}function Ve(i){return Ut[i]||Fe[i.toLowerCase()]}function Rr(i){i.querySelector("style")&&console.warn("dom-module %s has style outside template",i.id)}class W extends HTMLElement{static get observedAttributes(){return["id"]}static import(t,r){if(t){let s=Ve(t);return s&&r?s.querySelector(r):s}return null}attributeChangedCallback(t,r,s,e){r!==s&&this.register()}get assetpath(){if(!this.__assetpath){const t=window.HTMLImports&&HTMLImports.importForElement?HTMLImports.importForElement(this)||document:this.ownerDocument,r=K(this.getAttribute("assetpath")||"",t.baseURI);this.__assetpath=Rt(r)}return this.__assetpath}register(t){if(t=t||this.id,t){if(Ht&&Ve(t)!==void 0)throw Be(t,null),new Error(`strictTemplatePolicy: dom-module ${t} re-registered`);this.id=t,Be(t,this),Rr(this)}}}W.prototype.modules=Ut;customElements.define("dom-module",W);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const Hr="link[rel=import][type~=css]",Ir="include",je="shady-unscoped";function Ye(i){return W.import(i)}function Je(i){let t=i.body?i.body:i;const r=Dt(t.textContent,i.baseURI),s=document.createElement("style");return s.textContent=r,s}function Ur(i){const t=i.trim().split(/\s+/),r=[];for(let s=0;s<t.length;s++)r.push(...Fr(t[s]));return r}function Fr(i){const t=Ye(i);if(!t)return console.warn("Could not find style data in module named",i),[];if(t._styles===void 0){const r=[];r.push(...Ke(t));const s=t.querySelector("template");s&&r.push(...qe(s,t.assetpath)),t._styles=r}return t._styles}function qe(i,t){if(!i._styles){const r=[],s=i.content.querySelectorAll("style");for(let e=0;e<s.length;e++){let o=s[e],n=o.getAttribute(Ir);n&&r.push(...Ur(n).filter(function(l,a,c){return c.indexOf(l)===a})),t&&(o.textContent=Dt(o.textContent,t)),r.push(o)}i._styles=r}return i._styles}function Br(i){let t=Ye(i);return t?Ke(t):[]}function Ke(i){const t=[],r=i.querySelectorAll(Hr);for(let s=0;s<r.length;s++){let e=r[s];if(e.import){const o=e.import,n=e.hasAttribute(je);if(n&&!o._unscopedStyle){const l=Je(o);l.setAttribute(je,""),o._unscopedStyle=l}else o._style||(o._style=Je(o));t.push(n?o._unscopedStyle:o._style)}}return t}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const S=window.ShadyDOM&&window.ShadyDOM.noPatch&&window.ShadyDOM.wrap?window.ShadyDOM.wrap:window.ShadyDOM?i=>ShadyDOM.patch(i):i=>i;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function Ft(i){return i.indexOf(".")>=0}function N(i){let t=i.indexOf(".");return t===-1?i:i.slice(0,t)}function Vr(i,t){return i.indexOf(t+".")===0}function ct(i,t){return t.indexOf(i+".")===0}function ut(i,t,r){return t+r.slice(i.length)}function G(i){if(Array.isArray(i)){let t=[];for(let r=0;r<i.length;r++){let s=i[r].toString().split(".");for(let e=0;e<s.length;e++)t.push(s[e])}return t.join(".")}else return i}function We(i){return Array.isArray(i)?G(i).split("."):i.toString().split(".")}function v(i,t,r){let s=i,e=We(t);for(let o=0;o<e.length;o++){if(!s)return;let n=e[o];s=s[n]}return r&&(r.path=e.join(".")),s}function Ge(i,t,r){let s=i,e=We(t),o=e[e.length-1];if(e.length>1){for(let n=0;n<e.length-1;n++){let l=e[n];if(s=s[l],!s)return}s[o]=r}else s[t]=r;return e.join(".")}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const dt={},jr=/-[a-z]/g,Yr=/([A-Z])/g;function Xe(i){return dt[i]||(dt[i]=i.indexOf("-")<0?i:i.replace(jr,t=>t[1].toUpperCase()))}function ht(i){return dt[i]||(dt[i]=i.replace(Yr,"-$1").toLowerCase())}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let Jr=0,Ze=0,F=[],qr=0,Bt=!1,Qe=document.createTextNode("");new window.MutationObserver(Kr).observe(Qe,{characterData:!0});function Kr(){Bt=!1;const i=F.length;for(let t=0;t<i;t++){let r=F[t];if(r)try{r()}catch(s){setTimeout(()=>{throw s})}}F.splice(0,i),Ze+=i}const Wr={after(i){return{run(t){return window.setTimeout(t,i)},cancel(t){window.clearTimeout(t)}}},run(i,t){return window.setTimeout(i,t)},cancel(i){window.clearTimeout(i)}},ti={run(i){return Bt||(Bt=!0,Qe.textContent=qr++),F.push(i),Jr++},cancel(i){const t=i-Ze;if(t>=0){if(!F[t])throw new Error("invalid async handle: "+i);F[t]=null}}};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const Gr=ti,ei=E(i=>{class t extends i{static createProperties(s){const e=this.prototype;for(let o in s)o in e||e._createPropertyAccessor(o)}static attributeNameForProperty(s){return s.toLowerCase()}static typeForProperty(s){}_createPropertyAccessor(s,e){this._addPropertyToAttributeMap(s),this.hasOwnProperty(JSCompiler_renameProperty("__dataHasAccessor",this))||(this.__dataHasAccessor=Object.assign({},this.__dataHasAccessor)),this.__dataHasAccessor[s]||(this.__dataHasAccessor[s]=!0,this._definePropertyAccessor(s,e))}_addPropertyToAttributeMap(s){this.hasOwnProperty(JSCompiler_renameProperty("__dataAttributes",this))||(this.__dataAttributes=Object.assign({},this.__dataAttributes));let e=this.__dataAttributes[s];return e||(e=this.constructor.attributeNameForProperty(s),this.__dataAttributes[e]=s),e}_definePropertyAccessor(s,e){Object.defineProperty(this,s,{get(){return this.__data[s]},set:e?function(){}:function(o){this._setPendingProperty(s,o,!0)&&this._invalidateProperties()}})}constructor(){super();this.__dataEnabled=!1,this.__dataReady=!1,this.__dataInvalid=!1,this.__data={},this.__dataPending=null,this.__dataOld=null,this.__dataInstanceProps=null,this.__dataCounter=0,this.__serializing=!1,this._initializeProperties()}ready(){this.__dataReady=!0,this._flushProperties()}_initializeProperties(){for(let s in this.__dataHasAccessor)this.hasOwnProperty(s)&&(this.__dataInstanceProps=this.__dataInstanceProps||{},this.__dataInstanceProps[s]=this[s],delete this[s])}_initializeInstanceProperties(s){Object.assign(this,s)}_setProperty(s,e){this._setPendingProperty(s,e)&&this._invalidateProperties()}_getProperty(s){return this.__data[s]}_setPendingProperty(s,e,o){let n=this.__data[s],l=this._shouldPropertyChange(s,e,n);return l&&(this.__dataPending||(this.__dataPending={},this.__dataOld={}),this.__dataOld&&!(s in this.__dataOld)&&(this.__dataOld[s]=n),this.__data[s]=e,this.__dataPending[s]=e),l}_isPropertyPending(s){return!!(this.__dataPending&&this.__dataPending.hasOwnProperty(s))}_invalidateProperties(){!this.__dataInvalid&&this.__dataReady&&(this.__dataInvalid=!0,Gr.run(()=>{this.__dataInvalid&&(this.__dataInvalid=!1,this._flushProperties())}))}_enableProperties(){this.__dataEnabled||(this.__dataEnabled=!0,this.__dataInstanceProps&&(this._initializeInstanceProperties(this.__dataInstanceProps),this.__dataInstanceProps=null),this.ready())}_flushProperties(){this.__dataCounter++;const s=this.__data,e=this.__dataPending,o=this.__dataOld;this._shouldPropertiesChange(s,e,o)&&(this.__dataPending=null,this.__dataOld=null,this._propertiesChanged(s,e,o)),this.__dataCounter--}_shouldPropertiesChange(s,e,o){return Boolean(e)}_propertiesChanged(s,e,o){}_shouldPropertyChange(s,e,o){return o!==e&&(o===o||e===e)}attributeChangedCallback(s,e,o,n){e!==o&&this._attributeToProperty(s,o),super.attributeChangedCallback&&super.attributeChangedCallback(s,e,o,n)}_attributeToProperty(s,e,o){if(!this.__serializing){const n=this.__dataAttributes,l=n&&n[s]||s;this[l]=this._deserializeValue(e,o||this.constructor.typeForProperty(l))}}_propertyToAttribute(s,e,o){this.__serializing=!0,o=arguments.length<3?this[s]:o,this._valueToNodeAttribute(this,o,e||this.constructor.attributeNameForProperty(s)),this.__serializing=!1}_valueToNodeAttribute(s,e,o){const n=this._serializeValue(e);(o==="class"||o==="name"||o==="slot")&&(s=S(s)),n===void 0?s.removeAttribute(o):s.setAttribute(o,n)}_serializeValue(s){switch(typeof s){case"boolean":return s?"":void 0;default:return s!=null?s.toString():void 0}}_deserializeValue(s,e){switch(e){case Boolean:return s!==null;case Number:return Number(s);default:return s}}}return t});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const ii={};let pt=HTMLElement.prototype;for(;pt;){let i=Object.getOwnPropertyNames(pt);for(let t=0;t<i.length;t++)ii[i[t]]=!0;pt=Object.getPrototypeOf(pt)}function Xr(i,t){if(!ii[t]){let r=i[t];r!==void 0&&(i.__data?i._setPendingProperty(t,r):(i.__dataProto?i.hasOwnProperty(JSCompiler_renameProperty("__dataProto",i))||(i.__dataProto=Object.create(i.__dataProto)):i.__dataProto={},i.__dataProto[t]=r))}}const Zr=E(i=>{const t=ei(i);class r extends t{static createPropertiesForAttributes(){let e=this.observedAttributes;for(let o=0;o<e.length;o++)this.prototype._createPropertyAccessor(Xe(e[o]))}static attributeNameForProperty(e){return ht(e)}_initializeProperties(){this.__dataProto&&(this._initializeProtoProperties(this.__dataProto),this.__dataProto=null),super._initializeProperties()}_initializeProtoProperties(e){for(let o in e)this._setProperty(o,e[o])}_ensureAttribute(e,o){const n=this;n.hasAttribute(e)||this._valueToNodeAttribute(n,o,e)}_serializeValue(e){switch(typeof e){case"object":if(e instanceof Date)return e.toString();if(e)try{return JSON.stringify(e)}catch{return""}default:return super._serializeValue(e)}}_deserializeValue(e,o){let n;switch(o){case Object:try{n=JSON.parse(e)}catch{n=e}break;case Array:try{n=JSON.parse(e)}catch{n=null,console.warn(`Polymer::Attributes: couldn't decode Array as JSON: ${e}`)}break;case Date:n=isNaN(e)?String(e):Number(e),n=new Date(n);break;default:n=super._deserializeValue(e,o);break}return n}_definePropertyAccessor(e,o){Xr(this,e),super._definePropertyAccessor(e,o)}_hasAccessor(e){return this.__dataHasAccessor&&this.__dataHasAccessor[e]}_isPropertyPending(e){return Boolean(this.__dataPending&&e in this.__dataPending)}}return r});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const Qr={"dom-if":!0,"dom-repeat":!0};let ri=!1,si=!1;function ts(){if(!ri){ri=!0;const i=document.createElement("textarea");i.placeholder="a",si=i.placeholder===i.textContent}return si}function es(i){ts()&&i.localName==="textarea"&&i.placeholder&&i.placeholder===i.textContent&&(i.textContent=null)}function is(i){let t=i.getAttribute("is");if(t&&Qr[t]){let r=i;for(r.removeAttribute("is"),i=r.ownerDocument.createElement(t),r.parentNode.replaceChild(i,r),i.appendChild(r);r.attributes.length;)i.setAttribute(r.attributes[0].name,r.attributes[0].value),r.removeAttribute(r.attributes[0].name)}return i}function oi(i,t){let r=t.parentInfo&&oi(i,t.parentInfo);if(r){for(let s=r.firstChild,e=0;s;s=s.nextSibling)if(t.parentIndex===e++)return s}else return i}function rs(i,t,r,s){s.id&&(t[s.id]=r)}function ss(i,t,r){if(r.events&&r.events.length)for(let s=0,e=r.events,o;s<e.length&&(o=e[s]);s++)i._addMethodEventListenerToNode(t,o.name,o.value,i)}function os(i,t,r,s){r.templateInfo&&(t._templateInfo=r.templateInfo,t._parentTemplateInfo=s)}function ns(i,t,r){return i=i._methodHost||i,function(e){i[r]?i[r](e,e.detail):console.warn("listener method `"+r+"` not defined")}}const ls=E(i=>{class t extends i{static _parseTemplate(s,e){if(!s._templateInfo){let o=s._templateInfo={};o.nodeInfoList=[],o.nestedTemplate=Boolean(e),o.stripWhiteSpace=e&&e.stripWhiteSpace||s.hasAttribute("strip-whitespace"),this._parseTemplateContent(s,o,{parent:null})}return s._templateInfo}static _parseTemplateContent(s,e,o){return this._parseTemplateNode(s.content,e,o)}static _parseTemplateNode(s,e,o){let n=!1,l=s;return l.localName=="template"&&!l.hasAttribute("preserve-content")?n=this._parseTemplateNestedTemplate(l,e,o)||n:l.localName==="slot"&&(e.hasInsertionPoint=!0),es(l),l.firstChild&&this._parseTemplateChildNodes(l,e,o),l.hasAttributes&&l.hasAttributes()&&(n=this._parseTemplateNodeAttributes(l,e,o)||n),n||o.noted}static _parseTemplateChildNodes(s,e,o){if(!(s.localName==="script"||s.localName==="style"))for(let n=s.firstChild,l=0,a;n;n=a){if(n.localName=="template"&&(n=is(n)),a=n.nextSibling,n.nodeType===Node.TEXT_NODE){let u=a;for(;u&&u.nodeType===Node.TEXT_NODE;)n.textContent+=u.textContent,a=u.nextSibling,s.removeChild(u),u=a;if(e.stripWhiteSpace&&!n.textContent.trim()){s.removeChild(n);continue}}let c={parentIndex:l,parentInfo:o};this._parseTemplateNode(n,e,c)&&(c.infoIndex=e.nodeInfoList.push(c)-1),n.parentNode&&l++}}static _parseTemplateNestedTemplate(s,e,o){let n=s,l=this._parseTemplate(n,e);return(l.content=n.content.ownerDocument.createDocumentFragment()).appendChild(n.content),o.templateInfo=l,!0}static _parseTemplateNodeAttributes(s,e,o){let n=!1,l=Array.from(s.attributes);for(let a=l.length-1,c;c=l[a];a--)n=this._parseTemplateNodeAttribute(s,e,o,c.name,c.value)||n;return n}static _parseTemplateNodeAttribute(s,e,o,n,l){return n.slice(0,3)==="on-"?(s.removeAttribute(n),o.events=o.events||[],o.events.push({name:n.slice(3),value:l}),!0):n==="id"?(o.id=l,!0):!1}static _contentForTemplate(s){let e=s._templateInfo;return e&&e.content||s.content}_stampTemplate(s,e){s&&!s.content&&window.HTMLTemplateElement&&HTMLTemplateElement.decorate&&HTMLTemplateElement.decorate(s),e=e||this.constructor._parseTemplate(s);let o=e.nodeInfoList,n=e.content||s.content,l=document.importNode(n,!0);l.__noInsertionPoint=!e.hasInsertionPoint;let a=l.nodeList=new Array(o.length);l.$={};for(let c=0,u=o.length,d;c<u&&(d=o[c]);c++){let h=a[c]=oi(l,d);rs(this,l.$,h,d),os(this,h,d,e),ss(this,h,d)}return l=l,l}_addMethodEventListenerToNode(s,e,o,n){n=n||s;let l=ns(n,e,o);return this._addEventListenerToNode(s,e,l),l}_addEventListenerToNode(s,e,o){s.addEventListener(e,o)}_removeEventListenerFromNode(s,e,o){s.removeEventListener(e,o)}}return t});/**
 * @fileoverview
 * @suppress {checkPrototypalTypes}
 * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */let X=0;const Z=[],f={COMPUTE:"__computeEffects",REFLECT:"__reflectEffects",NOTIFY:"__notifyEffects",PROPAGATE:"__propagateEffects",OBSERVE:"__observeEffects",READ_ONLY:"__readOnly"},ni="__computeInfo",as=/[A-Z]/;function Vt(i,t,r){let s=i[t];if(!s)s=i[t]={};else if(!i.hasOwnProperty(t)&&(s=i[t]=Object.create(i[t]),r))for(let e in s){let o=s[e],n=s[e]=Array(o.length);for(let l=0;l<o.length;l++)n[l]=o[l]}return s}function Q(i,t,r,s,e,o){if(t){let n=!1;const l=X++;for(let a in r){let c=e?N(a):a,u=t[c];if(u)for(let d=0,h=u.length,p;d<h&&(p=u[d]);d++)(!p.info||p.info.lastRun!==l)&&(!e||jt(a,p.trigger))&&(p.info&&(p.info.lastRun=l),p.fn(i,a,r,s,p.info,e,o),n=!0)}return n}return!1}function cs(i,t,r,s,e,o,n,l){let a=!1,c=n?N(s):s,u=t[c];if(u)for(let d=0,h=u.length,p;d<h&&(p=u[d]);d++)(!p.info||p.info.lastRun!==r)&&(!n||jt(s,p.trigger))&&(p.info&&(p.info.lastRun=r),p.fn(i,s,e,o,p.info,n,l),a=!0);return a}function jt(i,t){if(t){let r=t.name;return r==i||!!(t.structured&&Vr(r,i))||!!(t.wildcard&&ct(r,i))}else return!0}function li(i,t,r,s,e){let o=typeof e.method=="string"?i[e.method]:e.method,n=e.property;o?o.call(i,i.__data[n],s[n]):e.dynamicFn||console.warn("observer method `"+e.method+"` not defined")}function us(i,t,r,s,e){let o=i[f.NOTIFY],n,l=X++;for(let c in t)t[c]&&(o&&cs(i,o,l,c,r,s,e)||e&&ds(i,c,r))&&(n=!0);let a;n&&(a=i.__dataHost)&&a._invalidateProperties&&a._invalidateProperties()}function ds(i,t,r){let s=N(t);if(s!==t){let e=ht(s)+"-changed";return ai(i,e,r[t],t),!0}return!1}function ai(i,t,r,s){let e={value:r,queueProperty:!0};s&&(e.path=s),S(i).dispatchEvent(new CustomEvent(t,{detail:e}))}function hs(i,t,r,s,e,o){let l=(o?N(t):t)!=t?t:null,a=l?v(i,l):i.__data[t];l&&a===void 0&&(a=r[t]),ai(i,e.eventName,a,l)}function ps(i,t,r,s,e){let o,n=i.detail,l=n&&n.path;l?(s=ut(r,s,l),o=n&&n.value):o=i.currentTarget[r],o=e?!o:o,(!t[f.READ_ONLY]||!t[f.READ_ONLY][s])&&t._setPendingPropertyOrPath(s,o,!0,Boolean(l))&&(!n||!n.queueProperty)&&t._invalidateProperties()}function fs(i,t,r,s,e){let o=i.__data[t];at&&(o=at(o,e.attrName,"attribute",i)),i._propertyToAttribute(t,e.attrName,o)}function ms(i,t,r,s){let e=i[f.COMPUTE];if(e)if(kr){X++;const o=ys(i),n=[];for(let a in t)ci(a,e,n,o,s);let l;for(;l=n.shift();)ui(i,"",t,r,l)&&ci(l.methodInfo,e,n,o,s);Object.assign(r,i.__dataOld),Object.assign(t,i.__dataPending),i.__dataPending=null}else{let o=t;for(;Q(i,e,o,r,s);)Object.assign(r,i.__dataOld),Object.assign(t,i.__dataPending),o=i.__dataPending,i.__dataPending=null}}const _s=(i,t,r)=>{let s=0,e=t.length-1,o=-1;for(;s<=e;){const n=s+e>>1,l=r.get(t[n].methodInfo)-r.get(i.methodInfo);if(l<0)s=n+1;else if(l>0)e=n-1;else{o=n;break}}o<0&&(o=e+1),t.splice(o,0,i)},ci=(i,t,r,s,e)=>{const o=e?N(i):i,n=t[o];if(n)for(let l=0;l<n.length;l++){const a=n[l];a.info.lastRun!==X&&(!e||jt(i,a.trigger))&&(a.info.lastRun=X,_s(a.info,r,s))}};function ys(i){let t=i.constructor.__orderedComputedDeps;if(!t){t=new Map;const r=i[f.COMPUTE];let{counts:s,ready:e,total:o}=gs(i),n;for(;n=e.shift();){t.set(n,t.size);const l=r[n];l&&l.forEach(a=>{const c=a.info.methodInfo;--o,--s[c]==0&&e.push(c)})}o!==0&&console.warn(`Computed graph for ${i.localName} incomplete; circular?`),i.constructor.__orderedComputedDeps=t}return t}function gs(i){const t=i[ni],r={},s=i[f.COMPUTE],e=[];let o=0;for(let n in t){const l=t[n];o+=r[n]=l.args.filter(a=>!a.literal).length+(l.dynamicFn?1:0)}for(let n in s)t[n]||e.push(n);return{counts:r,ready:e,total:o}}function ui(i,t,r,s,e){let o=Jt(i,t,r,s,e);if(o===Z)return!1;let n=e.methodInfo;return i.__dataHasAccessor&&i.__dataHasAccessor[n]?i._setPendingProperty(n,o,!0):(i[n]=o,!1)}function vs(i,t,r){let s=i.__dataLinkedPaths;if(s){let e;for(let o in s){let n=s[o];ct(o,t)?(e=ut(o,n,t),i._setPendingPropertyOrPath(e,r,!0,!0)):ct(n,t)&&(e=ut(n,o,t),i._setPendingPropertyOrPath(e,r,!0,!0))}}}function Yt(i,t,r,s,e,o,n){r.bindings=r.bindings||[];let l={kind:s,target:e,parts:o,literal:n,isCompound:o.length!==1};if(r.bindings.push(l),Es(l)){let{event:c,negate:u}=l.parts[0];l.listenerEvent=c||ht(e)+"-changed",l.listenerNegate=u}let a=t.nodeInfoList.length;for(let c=0;c<l.parts.length;c++){let u=l.parts[c];u.compoundIndex=c,bs(i,t,l,u,a)}}function bs(i,t,r,s,e){if(!s.literal)if(r.kind==="attribute"&&r.target[0]==="-")console.warn("Cannot set attribute "+r.target+' because "-" is not a valid attribute starting character');else{let o=s.dependencies,n={index:e,binding:r,part:s,evaluator:i};for(let l=0;l<o.length;l++){let a=o[l];typeof a=="string"&&(a=_i(a),a.wildcard=!0),i._addTemplatePropertyEffect(t,a.rootProperty,{fn:ws,info:n,trigger:a})}}}function ws(i,t,r,s,e,o,n){let l=n[e.index],a=e.binding,c=e.part;if(o&&c.source&&t.length>c.source.length&&a.kind=="property"&&!a.isCompound&&l.__isPropertyEffectsClient&&l.__dataHasAccessor&&l.__dataHasAccessor[a.target]){let u=r[t];t=ut(c.source,a.target,t),l._setPendingPropertyOrPath(t,u,!1,!0)&&i._enqueueClient(l)}else{let u=e.evaluator._evaluateBinding(i,c,t,r,s,o);u!==Z&&Ps(i,l,a,c,u)}}function Ps(i,t,r,s,e){if(e=xs(t,e,r,s),at&&(e=at(e,r.target,r.kind,t)),r.kind=="attribute")i._valueToNodeAttribute(t,e,r.target);else{let o=r.target;t.__isPropertyEffectsClient&&t.__dataHasAccessor&&t.__dataHasAccessor[o]?(!t[f.READ_ONLY]||!t[f.READ_ONLY][o])&&t._setPendingProperty(o,e)&&i._enqueueClient(t):i._setUnmanagedPropertyToNode(t,o,e)}}function xs(i,t,r,s){if(r.isCompound){let e=i.__dataCompoundStorage[r.target];e[s.compoundIndex]=t,t=e.join("")}return r.kind!=="attribute"&&(r.target==="textContent"||r.target==="value"&&(i.localName==="input"||i.localName==="textarea"))&&(t=t==null?"":t),t}function Es(i){return Boolean(i.target)&&i.kind!="attribute"&&i.kind!="text"&&!i.isCompound&&i.parts[0].mode==="{"}function As(i,t){let{nodeList:r,nodeInfoList:s}=t;if(s.length)for(let e=0;e<s.length;e++){let o=s[e],n=r[e],l=o.bindings;if(l)for(let a=0;a<l.length;a++){let c=l[a];Cs(n,c),Ss(n,i,c)}n.__dataHost=i}}function Cs(i,t){if(t.isCompound){let r=i.__dataCompoundStorage||(i.__dataCompoundStorage={}),s=t.parts,e=new Array(s.length);for(let n=0;n<s.length;n++)e[n]=s[n].literal;let o=t.target;r[o]=e,t.literal&&t.kind=="property"&&(o==="className"&&(i=S(i)),i[o]=t.literal)}}function Ss(i,t,r){if(r.listenerEvent){let s=r.parts[0];i.addEventListener(r.listenerEvent,function(e){ps(e,t,r.target,s.source,s.negate)})}}function di(i,t,r,s,e,o){o=t.static||o&&(typeof o!="object"||o[t.methodName]);let n={methodName:t.methodName,args:t.args,methodInfo:e,dynamicFn:o};for(let l=0,a;l<t.args.length&&(a=t.args[l]);l++)a.literal||i._addPropertyEffect(a.rootProperty,r,{fn:s,info:n,trigger:a});return o&&i._addPropertyEffect(t.methodName,r,{fn:s,info:n}),n}function Jt(i,t,r,s,e){let o=i._methodHost||i,n=o[e.methodName];if(n){let l=i._marshalArgs(e.args,t,r);return l===Z?Z:n.apply(o,l)}else e.dynamicFn||console.warn("method `"+e.methodName+"` not defined")}const Ts=[],hi="(?:[a-zA-Z_$][\\w.:$\\-*]*)",Os="(?:[-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)",$s="(?:'(?:[^'\\\\]|\\\\.)*')",Ns='(?:"(?:[^"\\\\]|\\\\.)*")',Ms="(?:"+$s+"|"+Ns+")",pi="(?:("+hi+"|"+Os+"|"+Ms+")\\s*)",ks="(?:"+pi+"(?:,\\s*"+pi+")*)",Ls="(?:\\(\\s*(?:"+ks+"?)\\)\\s*)",zs="("+hi+"\\s*"+Ls+"?)",Ds="(\\[\\[|{{)\\s*",Rs="(?:]]|}})",Hs="(?:(!)\\s*)?",Is=Ds+Hs+zs+Rs,fi=new RegExp(Is,"g");function mi(i){let t="";for(let r=0;r<i.length;r++)t+=i[r].literal||"";return t}function qt(i){let t=i.match(/([^\s]+?)\(([\s\S]*)\)/);if(t){let s={methodName:t[1],static:!0,args:Ts};if(t[2].trim()){let e=t[2].replace(/\\,/g,"&comma;").split(",");return Us(e,s)}else return s}return null}function Us(i,t){return t.args=i.map(function(r){let s=_i(r);return s.literal||(t.static=!1),s},this),t}function _i(i){let t=i.trim().replace(/&comma;/g,",").replace(/\\(.)/g,"$1"),r={name:t,value:"",literal:!1},s=t[0];switch(s==="-"&&(s=t[1]),s>="0"&&s<="9"&&(s="#"),s){case"'":case'"':r.value=t.slice(1,-1),r.literal=!0;break;case"#":r.value=Number(t),r.literal=!0;break}return r.literal||(r.rootProperty=N(t),r.structured=Ft(t),r.structured&&(r.wildcard=t.slice(-2)==".*",r.wildcard&&(r.name=t.slice(0,-2)))),r}function yi(i,t,r){let s=v(i,r);return s===void 0&&(s=t[r]),s}function gi(i,t,r,s){const e={indexSplices:s};It&&!i._overrideLegacyUndefined&&(t.splices=e),i.notifyPath(r+".splices",e),i.notifyPath(r+".length",t.length),It&&!i._overrideLegacyUndefined&&(e.indexSplices=[])}function tt(i,t,r,s,e,o){gi(i,t,r,[{index:s,addedCount:e,removed:o,object:t,type:"splice"}])}function Fs(i){return i[0].toUpperCase()+i.substring(1)}const Bs=E(i=>{const t=ls(Zr(i));class r extends t{constructor(){super();this.__isPropertyEffectsClient=!0,this.__dataClientsReady,this.__dataPendingClients,this.__dataToNotify,this.__dataLinkedPaths,this.__dataHasPaths,this.__dataCompoundStorage,this.__dataHost,this.__dataTemp,this.__dataClientsInitialized,this.__data,this.__dataPending,this.__dataOld,this.__computeEffects,this.__computeInfo,this.__reflectEffects,this.__notifyEffects,this.__propagateEffects,this.__observeEffects,this.__readOnly,this.__templateInfo,this._overrideLegacyUndefined}get PROPERTY_EFFECT_TYPES(){return f}_initializeProperties(){super._initializeProperties(),this._registerHost(),this.__dataClientsReady=!1,this.__dataPendingClients=null,this.__dataToNotify=null,this.__dataLinkedPaths=null,this.__dataHasPaths=!1,this.__dataCompoundStorage=this.__dataCompoundStorage||null,this.__dataHost=this.__dataHost||null,this.__dataTemp={},this.__dataClientsInitialized=!1}_registerHost(){if(et.length){let e=et[et.length-1];e._enqueueClient(this),this.__dataHost=e}}_initializeProtoProperties(e){this.__data=Object.create(e),this.__dataPending=Object.create(e),this.__dataOld={}}_initializeInstanceProperties(e){let o=this[f.READ_ONLY];for(let n in e)(!o||!o[n])&&(this.__dataPending=this.__dataPending||{},this.__dataOld=this.__dataOld||{},this.__data[n]=this.__dataPending[n]=e[n])}_addPropertyEffect(e,o,n){this._createPropertyAccessor(e,o==f.READ_ONLY);let l=Vt(this,o,!0)[e];l||(l=this[o][e]=[]),l.push(n)}_removePropertyEffect(e,o,n){let l=Vt(this,o,!0)[e],a=l.indexOf(n);a>=0&&l.splice(a,1)}_hasPropertyEffect(e,o){let n=this[o];return Boolean(n&&n[e])}_hasReadOnlyEffect(e){return this._hasPropertyEffect(e,f.READ_ONLY)}_hasNotifyEffect(e){return this._hasPropertyEffect(e,f.NOTIFY)}_hasReflectEffect(e){return this._hasPropertyEffect(e,f.REFLECT)}_hasComputedEffect(e){return this._hasPropertyEffect(e,f.COMPUTE)}_setPendingPropertyOrPath(e,o,n,l){if(l||N(Array.isArray(e)?e[0]:e)!==e){if(!l){let a=v(this,e);if(e=Ge(this,e,o),!e||!super._shouldPropertyChange(e,o,a))return!1}if(this.__dataHasPaths=!0,this._setPendingProperty(e,o,n))return vs(this,e,o),!0}else{if(this.__dataHasAccessor&&this.__dataHasAccessor[e])return this._setPendingProperty(e,o,n);this[e]=o}return!1}_setUnmanagedPropertyToNode(e,o,n){(n!==e[o]||typeof n=="object")&&(o==="className"&&(e=S(e)),e[o]=n)}_setPendingProperty(e,o,n){let l=this.__dataHasPaths&&Ft(e),a=l?this.__dataTemp:this.__data;return this._shouldPropertyChange(e,o,a[e])?(this.__dataPending||(this.__dataPending={},this.__dataOld={}),e in this.__dataOld||(this.__dataOld[e]=this.__data[e]),l?this.__dataTemp[e]=o:this.__data[e]=o,this.__dataPending[e]=o,(l||this[f.NOTIFY]&&this[f.NOTIFY][e])&&(this.__dataToNotify=this.__dataToNotify||{},this.__dataToNotify[e]=n),!0):!1}_setProperty(e,o){this._setPendingProperty(e,o,!0)&&this._invalidateProperties()}_invalidateProperties(){this.__dataReady&&this._flushProperties()}_enqueueClient(e){this.__dataPendingClients=this.__dataPendingClients||[],e!==this&&this.__dataPendingClients.push(e)}_flushClients(){this.__dataClientsReady?this.__enableOrFlushClients():(this.__dataClientsReady=!0,this._readyClients(),this.__dataReady=!0)}__enableOrFlushClients(){let e=this.__dataPendingClients;if(e){this.__dataPendingClients=null;for(let o=0;o<e.length;o++){let n=e[o];n.__dataEnabled?n.__dataPending&&n._flushProperties():n._enableProperties()}}}_readyClients(){this.__enableOrFlushClients()}setProperties(e,o){for(let n in e)(o||!this[f.READ_ONLY]||!this[f.READ_ONLY][n])&&this._setPendingPropertyOrPath(n,e[n],!0);this._invalidateProperties()}ready(){this._flushProperties(),this.__dataClientsReady||this._flushClients(),this.__dataPending&&this._flushProperties()}_propertiesChanged(e,o,n){let l=this.__dataHasPaths;this.__dataHasPaths=!1;let a;ms(this,o,n,l),a=this.__dataToNotify,this.__dataToNotify=null,this._propagatePropertyChanges(o,n,l),this._flushClients(),Q(this,this[f.REFLECT],o,n,l),Q(this,this[f.OBSERVE],o,n,l),a&&us(this,a,o,n,l),this.__dataCounter==1&&(this.__dataTemp={})}_propagatePropertyChanges(e,o,n){this[f.PROPAGATE]&&Q(this,this[f.PROPAGATE],e,o,n),this.__templateInfo&&this._runEffectsForTemplate(this.__templateInfo,e,o,n)}_runEffectsForTemplate(e,o,n,l){const a=(c,u)=>{Q(this,e.propertyEffects,c,n,u,e.nodeList);for(let d=e.firstChild;d;d=d.nextSibling)this._runEffectsForTemplate(d,c,n,u)};e.runEffects?e.runEffects(a,o,l):a(o,l)}linkPaths(e,o){e=G(e),o=G(o),this.__dataLinkedPaths=this.__dataLinkedPaths||{},this.__dataLinkedPaths[e]=o}unlinkPaths(e){e=G(e),this.__dataLinkedPaths&&delete this.__dataLinkedPaths[e]}notifySplices(e,o){let n={path:""},l=v(this,e,n);gi(this,l,n.path,o)}get(e,o){return v(o||this,e)}set(e,o,n){n?Ge(n,e,o):(!this[f.READ_ONLY]||!this[f.READ_ONLY][e])&&this._setPendingPropertyOrPath(e,o,!0)&&this._invalidateProperties()}push(e,...o){let n={path:""},l=v(this,e,n),a=l.length,c=l.push(...o);return o.length&&tt(this,l,n.path,a,o.length,[]),c}pop(e){let o={path:""},n=v(this,e,o),l=Boolean(n.length),a=n.pop();return l&&tt(this,n,o.path,n.length,0,[a]),a}splice(e,o,n,...l){let a={path:""},c=v(this,e,a);o<0?o=c.length-Math.floor(-o):o&&(o=Math.floor(o));let u;return arguments.length===2?u=c.splice(o):u=c.splice(o,n,...l),(l.length||u.length)&&tt(this,c,a.path,o,l.length,u),u}shift(e){let o={path:""},n=v(this,e,o),l=Boolean(n.length),a=n.shift();return l&&tt(this,n,o.path,0,0,[a]),a}unshift(e,...o){let n={path:""},l=v(this,e,n),a=l.unshift(...o);return o.length&&tt(this,l,n.path,0,o.length,[]),a}notifyPath(e,o){let n;if(arguments.length==1){let l={path:""};o=v(this,e,l),n=l.path}else Array.isArray(e)?n=G(e):n=e;this._setPendingPropertyOrPath(n,o,!0,!0)&&this._invalidateProperties()}_createReadOnlyProperty(e,o){this._addPropertyEffect(e,f.READ_ONLY),o&&(this["_set"+Fs(e)]=function(n){this._setProperty(e,n)})}_createPropertyObserver(e,o,n){let l={property:e,method:o,dynamicFn:Boolean(n)};this._addPropertyEffect(e,f.OBSERVE,{fn:li,info:l,trigger:{name:e}}),n&&this._addPropertyEffect(o,f.OBSERVE,{fn:li,info:l,trigger:{name:o}})}_createMethodObserver(e,o){let n=qt(e);if(!n)throw new Error("Malformed observer expression '"+e+"'");di(this,n,f.OBSERVE,Jt,null,o)}_createNotifyingProperty(e){this._addPropertyEffect(e,f.NOTIFY,{fn:hs,info:{eventName:ht(e)+"-changed",property:e}})}_createReflectedProperty(e){let o=this.constructor.attributeNameForProperty(e);o[0]==="-"?console.warn("Property "+e+" cannot be reflected to attribute "+o+' because "-" is not a valid starting attribute name. Use a lowercase first letter for the property instead.'):this._addPropertyEffect(e,f.REFLECT,{fn:fs,info:{attrName:o}})}_createComputedProperty(e,o,n){let l=qt(o);if(!l)throw new Error("Malformed computed expression '"+o+"'");const a=di(this,l,f.COMPUTE,ui,e,n);Vt(this,ni)[e]=a}_marshalArgs(e,o,n){const l=this.__data,a=[];for(let c=0,u=e.length;c<u;c++){let{name:d,structured:h,wildcard:p,value:m,literal:y}=e[c];if(!y)if(p){const x=ct(d,o),b=yi(l,n,x?o:d);m={path:x?o:d,value:b,base:x?v(l,d):b}}else m=h?yi(l,n,d):l[d];if(It&&!this._overrideLegacyUndefined&&m===void 0&&e.length>1)return Z;a[c]=m}return a}static addPropertyEffect(e,o,n){this.prototype._addPropertyEffect(e,o,n)}static createPropertyObserver(e,o,n){this.prototype._createPropertyObserver(e,o,n)}static createMethodObserver(e,o){this.prototype._createMethodObserver(e,o)}static createNotifyingProperty(e){this.prototype._createNotifyingProperty(e)}static createReadOnlyProperty(e,o){this.prototype._createReadOnlyProperty(e,o)}static createReflectedProperty(e){this.prototype._createReflectedProperty(e)}static createComputedProperty(e,o,n){this.prototype._createComputedProperty(e,o,n)}static bindTemplate(e){return this.prototype._bindTemplate(e)}_bindTemplate(e,o){let n=this.constructor._parseTemplate(e),l=this.__preBoundTemplateInfo==n;if(!l)for(let a in n.propertyEffects)this._createPropertyAccessor(a);if(o)if(n=Object.create(n),n.wasPreBound=l,!this.__templateInfo)this.__templateInfo=n;else{const a=e._parentTemplateInfo||this.__templateInfo,c=a.lastChild;n.parent=a,a.lastChild=n,n.previousSibling=c,c?c.nextSibling=n:a.firstChild=n}else this.__preBoundTemplateInfo=n;return n}static _addTemplatePropertyEffect(e,o,n){let l=e.hostProps=e.hostProps||{};l[o]=!0;let a=e.propertyEffects=e.propertyEffects||{};(a[o]=a[o]||[]).push(n)}_stampTemplate(e,o){o=o||this._bindTemplate(e,!0),et.push(this);let n=super._stampTemplate(e,o);if(et.pop(),o.nodeList=n.nodeList,!o.wasPreBound){let l=o.childNodes=[];for(let a=n.firstChild;a;a=a.nextSibling)l.push(a)}return n.templateInfo=o,As(this,o),this.__dataClientsReady&&(this._runEffectsForTemplate(o,this.__data,null,!1),this._flushClients()),n}_removeBoundDom(e){const o=e.templateInfo,{previousSibling:n,nextSibling:l,parent:a}=o;n?n.nextSibling=l:a&&(a.firstChild=l),l?l.previousSibling=n:a&&(a.lastChild=n),o.nextSibling=o.previousSibling=null;let c=o.childNodes;for(let u=0;u<c.length;u++){let d=c[u];S(S(d).parentNode).removeChild(d)}}static _parseTemplateNode(e,o,n){let l=t._parseTemplateNode.call(this,e,o,n);if(e.nodeType===Node.TEXT_NODE){let a=this._parseBindings(e.textContent,o);a&&(e.textContent=mi(a)||" ",Yt(this,o,n,"text","textContent",a),l=!0)}return l}static _parseTemplateNodeAttribute(e,o,n,l,a){let c=this._parseBindings(a,o);if(c){let u=l,d="property";as.test(l)?d="attribute":l[l.length-1]=="$"&&(l=l.slice(0,-1),d="attribute");let h=mi(c);return h&&d=="attribute"&&(l=="class"&&e.hasAttribute("class")&&(h+=" "+e.getAttribute(l)),e.setAttribute(l,h)),d=="attribute"&&u=="disable-upgrade$"&&e.setAttribute(l,""),e.localName==="input"&&u==="value"&&e.setAttribute(u,""),e.removeAttribute(u),d==="property"&&(l=Xe(l)),Yt(this,o,n,d,l,c,h),!0}else return t._parseTemplateNodeAttribute.call(this,e,o,n,l,a)}static _parseTemplateNestedTemplate(e,o,n){let l=t._parseTemplateNestedTemplate.call(this,e,o,n);const a=e.parentNode,c=n.templateInfo,u=a.localName==="dom-if",d=a.localName==="dom-repeat";Ue&&(u||d)&&(a.removeChild(e),n=n.parentInfo,n.templateInfo=c,n.noted=!0,l=!1);let h=c.hostProps;if(Lr&&u)h&&(o.hostProps=Object.assign(o.hostProps||{},h),Ue||(n.parentInfo.noted=!0));else{let p="{";for(let m in h){let y=[{mode:p,source:m,dependencies:[m],hostProp:!0}];Yt(this,o,n,"property","_host_"+m,y)}}return l}static _parseBindings(e,o){let n=[],l=0,a;for(;(a=fi.exec(e))!==null;){a.index>l&&n.push({literal:e.slice(l,a.index)});let c=a[1][0],u=Boolean(a[2]),d=a[3].trim(),h=!1,p="",m=-1;c=="{"&&(m=d.indexOf("::"))>0&&(p=d.substring(m+2),d=d.substring(0,m),h=!0);let y=qt(d),x=[];if(y){let{args:b,methodName:w}=y;for(let Pt=0;Pt<b.length;Pt++){let ce=b[Pt];ce.literal||x.push(ce)}let L=o.dynamicFns;(L&&L[w]||y.static)&&(x.push(w),y.dynamicFn=!0)}else x.push(d);n.push({source:d,mode:c,negate:u,customEvent:h,signature:y,dependencies:x,event:p}),l=fi.lastIndex}if(l&&l<e.length){let c=e.substring(l);c&&n.push({literal:c})}return n.length?n:null}static _evaluateBinding(e,o,n,l,a,c){let u;return o.signature?u=Jt(e,n,l,a,o.signature):n!=o.source?u=v(e,o.source):c&&Ft(n)?u=v(e,n):u=e.__data[n],o.negate&&(u=!u),u}}return r}),et=[];/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function Vs(i){}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/function js(i){const t={};for(let r in i){const s=i[r];t[r]=typeof s=="function"?{type:s}:s}return t}const Ys=E(i=>{const t=ei(i);function r(o){const n=Object.getPrototypeOf(o);return n.prototype instanceof e?n:null}function s(o){if(!o.hasOwnProperty(JSCompiler_renameProperty("__ownProperties",o))){let n=null;if(o.hasOwnProperty(JSCompiler_renameProperty("properties",o))){const l=o.properties;l&&(n=js(l))}o.__ownProperties=n}return o.__ownProperties}class e extends t{static get observedAttributes(){if(!this.hasOwnProperty(JSCompiler_renameProperty("__observedAttributes",this))){Vs(this.prototype);const n=this._properties;this.__observedAttributes=n?Object.keys(n).map(l=>this.prototype._addPropertyToAttributeMap(l)):[]}return this.__observedAttributes}static finalize(){if(!this.hasOwnProperty(JSCompiler_renameProperty("__finalized",this))){const n=r(this);n&&n.finalize(),this.__finalized=!0,this._finalizeClass()}}static _finalizeClass(){const n=s(this);n&&this.createProperties(n)}static get _properties(){if(!this.hasOwnProperty(JSCompiler_renameProperty("__properties",this))){const n=r(this);this.__properties=Object.assign({},n&&n._properties,s(this))}return this.__properties}static typeForProperty(n){const l=this._properties[n];return l&&l.type}_initializeProperties(){this.constructor.finalize(),super._initializeProperties()}connectedCallback(){super.connectedCallback&&super.connectedCallback(),this._enableProperties()}disconnectedCallback(){super.disconnectedCallback&&super.disconnectedCallback()}}return e});/**
 * @fileoverview
 * @suppress {checkPrototypalTypes}
 * @license Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt The complete set of authors may be found
 * at http://polymer.github.io/AUTHORS.txt The complete set of contributors may
 * be found at http://polymer.github.io/CONTRIBUTORS.txt Code distributed by
 * Google as part of the polymer project is also subject to an additional IP
 * rights grant found at http://polymer.github.io/PATENTS.txt
 */const Js="3.4.1",vi=window.ShadyCSS&&window.ShadyCSS.cssBuild,qs=E(i=>{const t=Ys(Bs(i));function r(a){if(!a.hasOwnProperty(JSCompiler_renameProperty("__propertyDefaults",a))){a.__propertyDefaults=null;let c=a._properties;for(let u in c){let d=c[u];"value"in d&&(a.__propertyDefaults=a.__propertyDefaults||{},a.__propertyDefaults[u]=d)}}return a.__propertyDefaults}function s(a){return a.hasOwnProperty(JSCompiler_renameProperty("__ownObservers",a))||(a.__ownObservers=a.hasOwnProperty(JSCompiler_renameProperty("observers",a))?a.observers:null),a.__ownObservers}function e(a,c,u,d){u.computed&&(u.readOnly=!0),u.computed&&(a._hasReadOnlyEffect(c)?console.warn(`Cannot redefine computed property '${c}'.`):a._createComputedProperty(c,u.computed,d)),u.readOnly&&!a._hasReadOnlyEffect(c)?a._createReadOnlyProperty(c,!u.computed):u.readOnly===!1&&a._hasReadOnlyEffect(c)&&console.warn(`Cannot make readOnly property '${c}' non-readOnly.`),u.reflectToAttribute&&!a._hasReflectEffect(c)?a._createReflectedProperty(c):u.reflectToAttribute===!1&&a._hasReflectEffect(c)&&console.warn(`Cannot make reflected property '${c}' non-reflected.`),u.notify&&!a._hasNotifyEffect(c)?a._createNotifyingProperty(c):u.notify===!1&&a._hasNotifyEffect(c)&&console.warn(`Cannot make notify property '${c}' non-notify.`),u.observer&&a._createPropertyObserver(c,u.observer,d[u.observer]),a._addPropertyToAttributeMap(c)}function o(a,c,u,d){if(!vi){const h=c.content.querySelectorAll("style"),p=qe(c),m=Br(u),y=c.content.firstElementChild;for(let b=0;b<m.length;b++){let w=m[b];w.textContent=a._processStyleText(w.textContent,d),c.content.insertBefore(w,y)}let x=0;for(let b=0;b<p.length;b++){let w=p[b],L=h[x];L!==w?(w=w.cloneNode(!0),L.parentNode.insertBefore(w,L)):x++,w.textContent=a._processStyleText(w.textContent,d)}}if(window.ShadyCSS&&window.ShadyCSS.prepareTemplate(c,u),zr&&vi&&Cr){const h=c.content.querySelectorAll("style");if(h){let p="";Array.from(h).forEach(m=>{p+=m.textContent,m.parentNode.removeChild(m)}),a._styleSheet=new CSSStyleSheet,a._styleSheet.replaceSync(p)}}}function n(a){let c=null;if(a&&(!Ht||Or)&&(c=W.import(a,"template"),Ht&&!c))throw new Error(`strictTemplatePolicy: expecting dom-module or null template for ${a}`);return c}class l extends t{static get polymerElementVersion(){return Js}static _finalizeClass(){t._finalizeClass.call(this);const c=s(this);c&&this.createObservers(c,this._properties),this._prepareTemplate()}static _prepareTemplate(){let c=this.template;c&&(typeof c=="string"?(console.error("template getter must return HTMLTemplateElement"),c=null):$r||(c=c.cloneNode(!0))),this.prototype._template=c}static createProperties(c){for(let u in c)e(this.prototype,u,c[u],c)}static createObservers(c,u){const d=this.prototype;for(let h=0;h<c.length;h++)d._createMethodObserver(c[h],u)}static get template(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_template",this))){const c=this.prototype.hasOwnProperty(JSCompiler_renameProperty("_template",this.prototype))?this.prototype._template:void 0;this._template=c!==void 0?c:this.hasOwnProperty(JSCompiler_renameProperty("is",this))&&n(this.is)||Object.getPrototypeOf(this.prototype).constructor.template}return this._template}static set template(c){this._template=c}static get importPath(){if(!this.hasOwnProperty(JSCompiler_renameProperty("_importPath",this))){const c=this.importMeta;if(c)this._importPath=Rt(c.url);else{const u=W.import(this.is);this._importPath=u&&u.assetpath||Object.getPrototypeOf(this.prototype).constructor.importPath}}return this._importPath}constructor(){super();this._template,this._importPath,this.rootPath,this.importPath,this.root,this.$}_initializeProperties(){this.constructor.finalize(),this.constructor._finalizeTemplate(this.localName),super._initializeProperties(),this.rootPath=Sr,this.importPath=this.constructor.importPath;let c=r(this.constructor);if(!!c)for(let u in c){let d=c[u];if(this._canApplyPropertyDefault(u)){let h=typeof d.value=="function"?d.value.call(this):d.value;this._hasAccessor(u)?this._setPendingProperty(u,h,!0):this[u]=h}}}_canApplyPropertyDefault(c){return!this.hasOwnProperty(c)}static _processStyleText(c,u){return Dt(c,u)}static _finalizeTemplate(c){const u=this.prototype._template;if(u&&!u.__polymerFinalized){u.__polymerFinalized=!0;const d=this.importPath,h=d?K(d):"";o(this,u,c,h),this.prototype._bindTemplate(u)}}connectedCallback(){window.ShadyCSS&&this._template&&window.ShadyCSS.styleElement(this),super.connectedCallback()}ready(){this._template&&(this.root=this._stampTemplate(this._template),this.$=this.root.$),super.ready()}_readyClients(){this._template&&(this.root=this._attachDom(this.root)),super._readyClients()}_attachDom(c){const u=S(this);if(u.attachShadow)return c?(u.shadowRoot||(u.attachShadow({mode:"open",shadyUpgradeFragment:c}),u.shadowRoot.appendChild(c),this.constructor._styleSheet&&(u.shadowRoot.adoptedStyleSheets=[this.constructor._styleSheet])),Mr&&window.ShadyDOM&&window.ShadyDOM.flushInitial(u.shadowRoot),u.shadowRoot):null;throw new Error("ShadowDOM not available. PolymerElement can create dom as children instead of in ShadowDOM by setting `this.root = this;` before `ready`.")}updateStyles(c){window.ShadyCSS&&window.ShadyCSS.styleSubtree(this,c)}resolveUrl(c,u){return!u&&this.importPath&&(u=K(this.importPath)),K(c,u)}static _parseTemplateContent(c,u,d){return u.dynamicFns=u.dynamicFns||this._properties,t._parseTemplateContent.call(this,c,u,d)}static _addTemplatePropertyEffect(c,u,d){return Nr&&!(u in this._properties)&&!(d.info.part.signature&&d.info.part.signature.static)&&!d.info.part.hostProp&&!c.nestedTemplate&&console.warn(`Property '${u}' used in template but not declared in 'properties'; attribute will not be observed.`),t._addTemplatePropertyEffect.call(this,c,u,d)}}return l});/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/class bi{constructor(t){this.value=t.toString()}toString(){return this.value}}function Ks(i){if(i instanceof bi)return i.value;throw new Error(`non-literal value passed to Polymer's htmlLiteral function: ${i}`)}function Ws(i){if(i instanceof HTMLTemplateElement)return i.innerHTML;if(i instanceof bi)return Ks(i);throw new Error(`non-template value passed to Polymer's html function: ${i}`)}const Gs=function(t,...r){const s=document.createElement("template");return s.innerHTML=r.reduce((e,o,n)=>e+Ws(o)+t[n+1],t[0]),s};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const Xs=qs(HTMLElement);/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/class ft{constructor(){this._asyncModule=null,this._callback=null,this._timer=null}setConfig(t,r){this._asyncModule=t,this._callback=r,this._timer=this._asyncModule.run(()=>{this._timer=null,wi.delete(this),this._callback()})}cancel(){this.isActive()&&(this._cancelAsync(),wi.delete(this))}_cancelAsync(){this.isActive()&&(this._asyncModule.cancel(this._timer),this._timer=null)}flush(){this.isActive()&&(this.cancel(),this._callback())}isActive(){return this._timer!=null}static debounce(t,r,s){return t instanceof ft?t._cancelAsync():t=new ft,t.setConfig(r,s),t}}let wi=new Set;/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/let Kt=typeof document.head.style.touchAction=="string",mt="__polymerGestures",_t="__polymerGesturesHandled",Wt="__polymerGesturesTouchAction",Pi=25,xi=5,Zs=2,Qs=2500,Ei=["mousedown","mousemove","mouseup","click"],to=[0,1,4,2],eo=function(){try{return new MouseEvent("test",{buttons:1}).buttons===1}catch{return!1}}();function Gt(i){return Ei.indexOf(i)>-1}let Xt=!1;(function(){try{let i=Object.defineProperty({},"passive",{get(){Xt=!0}});window.addEventListener("test",null,i),window.removeEventListener("test",null,i)}catch{}})();function Ai(i){if(!(Gt(i)||i==="touchend")&&Kt&&Xt&&Tr)return{passive:!0}}let Ci=navigator.userAgent.match(/iP(?:[oa]d|hone)|Android/);const Zt=[],io={button:!0,input:!0,keygen:!0,meter:!0,output:!0,textarea:!0,progress:!0,select:!0},ro={button:!0,command:!0,fieldset:!0,input:!0,keygen:!0,optgroup:!0,option:!0,select:!0,textarea:!0};function so(i){return io[i.localName]||!1}function oo(i){let t=Array.prototype.slice.call(i.labels||[]);if(!t.length){t=[];let r=i.getRootNode();if(i.id){let s=r.querySelectorAll(`label[for = ${i.id}]`);for(let e=0;e<s.length;e++)t.push(s[e])}}return t}let Si=function(i){let t=i.sourceCapabilities;if(!(t&&!t.firesTouchEvents)&&(i[_t]={skip:!0},i.type==="click")){let r=!1,s=yt(i);for(let e=0;e<s.length;e++){if(s[e].nodeType===Node.ELEMENT_NODE){if(s[e].localName==="label")Zt.push(s[e]);else if(so(s[e])){let o=oo(s[e]);for(let n=0;n<o.length;n++)r=r||Zt.indexOf(o[n])>-1}}if(s[e]===g.mouse.target)return}if(r)return;i.preventDefault(),i.stopPropagation()}};function Ti(i){let t=Ci?["click"]:Ei;for(let r=0,s;r<t.length;r++)s=t[r],i?(Zt.length=0,document.addEventListener(s,Si,!0)):document.removeEventListener(s,Si,!0)}function no(i){g.mouse.mouseIgnoreJob||Ti(!0);let t=function(){Ti(),g.mouse.target=null,g.mouse.mouseIgnoreJob=null};g.mouse.target=yt(i)[0],g.mouse.mouseIgnoreJob=ft.debounce(g.mouse.mouseIgnoreJob,Wr.after(Qs),t)}function M(i){let t=i.type;if(!Gt(t))return!1;if(t==="mousemove"){let r=i.buttons===void 0?1:i.buttons;return i instanceof window.MouseEvent&&!eo&&(r=to[i.which]||0),Boolean(r&1)}else return(i.button===void 0?0:i.button)===0}function lo(i){if(i.type==="click"){if(i.detail===0)return!0;let t=T(i);if(!t.nodeType||t.nodeType!==Node.ELEMENT_NODE)return!0;let r=t.getBoundingClientRect(),s=i.pageX,e=i.pageY;return!(s>=r.left&&s<=r.right&&e>=r.top&&e<=r.bottom)}return!1}let g={mouse:{target:null,mouseIgnoreJob:null},touch:{x:0,y:0,id:-1,scrollDecided:!1}};function ao(i){let t="auto",r=yt(i);for(let s=0,e;s<r.length;s++)if(e=r[s],e[Wt]){t=e[Wt];break}return t}function Oi(i,t,r){i.movefn=t,i.upfn=r,document.addEventListener("mousemove",t),document.addEventListener("mouseup",r)}function B(i){document.removeEventListener("mousemove",i.movefn),document.removeEventListener("mouseup",i.upfn),i.movefn=null,i.upfn=null}document.addEventListener("touchend",no,Xt?{passive:!0}:!1);const yt=window.ShadyDOM&&window.ShadyDOM.noPatch?window.ShadyDOM.composedPath:i=>i.composedPath&&i.composedPath()||[],it={},k=[];function co(i,t){let r=document.elementFromPoint(i,t),s=r;for(;s&&s.shadowRoot&&!window.ShadyDOM;){let e=s;if(s=s.shadowRoot.elementFromPoint(i,t),e===s)break;s&&(r=s)}return r}function T(i){const t=yt(i);return t.length>0?t[0]:i.target}function $i(i){let t,r=i.type,e=i.currentTarget[mt];if(!e)return;let o=e[r];if(!!o){if(!i[_t]&&(i[_t]={},r.slice(0,5)==="touch")){i=i;let n=i.changedTouches[0];if(r==="touchstart"&&i.touches.length===1&&(g.touch.id=n.identifier),g.touch.id!==n.identifier)return;Kt||(r==="touchstart"||r==="touchmove")&&uo(i)}if(t=i[_t],!t.skip){for(let n=0,l;n<k.length;n++)l=k[n],o[l.name]&&!t[l.name]&&l.flow&&l.flow.start.indexOf(i.type)>-1&&l.reset&&l.reset();for(let n=0,l;n<k.length;n++)l=k[n],o[l.name]&&!t[l.name]&&(t[l.name]=!0,l[r](i))}}}function uo(i){let t=i.changedTouches[0],r=i.type;if(r==="touchstart")g.touch.x=t.clientX,g.touch.y=t.clientY,g.touch.scrollDecided=!1;else if(r==="touchmove"){if(g.touch.scrollDecided)return;g.touch.scrollDecided=!0;let s=ao(i),e=!1,o=Math.abs(g.touch.x-t.clientX),n=Math.abs(g.touch.y-t.clientY);i.cancelable&&(s==="none"?e=!0:s==="pan-x"?e=n>o:s==="pan-y"&&(e=o>n)),e?i.preventDefault():gt("track")}}function ho(i,t,r){return it[t]?(fo(i,t,r),!0):!1}function po(i,t,r){return it[t]?(mo(i,t,r),!0):!1}function fo(i,t,r){let s=it[t],e=s.deps,o=s.name,n=i[mt];n||(i[mt]=n={});for(let l=0,a,c;l<e.length;l++)a=e[l],!(Ci&&Gt(a)&&a!=="click")&&(c=n[a],c||(n[a]=c={_count:0}),c._count===0&&i.addEventListener(a,$i,Ai(a)),c[o]=(c[o]||0)+1,c._count=(c._count||0)+1);i.addEventListener(t,r),s.touchAction&&yo(i,s.touchAction)}function mo(i,t,r){let s=it[t],e=s.deps,o=s.name,n=i[mt];if(n)for(let l=0,a,c;l<e.length;l++)a=e[l],c=n[a],c&&c[o]&&(c[o]=(c[o]||1)-1,c._count=(c._count||1)-1,c._count===0&&i.removeEventListener(a,$i,Ai(a)));i.removeEventListener(t,r)}function Qt(i){k.push(i);for(let t=0;t<i.emits.length;t++)it[i.emits[t]]=i}function _o(i){for(let t=0,r;t<k.length;t++){r=k[t];for(let s=0,e;s<r.emits.length;s++)if(e=r.emits[s],e===i)return r}return null}function yo(i,t){Kt&&i instanceof HTMLElement&&ti.run(()=>{i.style.touchAction=t}),i[Wt]=t}function te(i,t,r){let s=new Event(t,{bubbles:!0,cancelable:!0,composed:!0});if(s.detail=r,S(i).dispatchEvent(s),s.defaultPrevented){let e=r.preventer||r.sourceEvent;e&&e.preventDefault&&e.preventDefault()}}function gt(i){let t=_o(i);t.info&&(t.info.prevent=!0)}Qt({name:"downup",deps:["mousedown","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["down","up"],info:{movefn:null,upfn:null},reset:function(){B(this.info)},mousedown:function(i){if(!M(i))return;let t=T(i),r=this,s=function(n){M(n)||(rt("up",t,n),B(r.info))},e=function(n){M(n)&&rt("up",t,n),B(r.info)};Oi(this.info,s,e),rt("down",t,i)},touchstart:function(i){rt("down",T(i),i.changedTouches[0],i)},touchend:function(i){rt("up",T(i),i.changedTouches[0],i)}});function rt(i,t,r,s){!t||te(t,i,{x:r.clientX,y:r.clientY,sourceEvent:r,preventer:s,prevent:function(e){return gt(e)}})}Qt({name:"track",touchAction:"none",deps:["mousedown","touchstart","touchmove","touchend"],flow:{start:["mousedown","touchstart"],end:["mouseup","touchend"]},emits:["track"],info:{x:0,y:0,state:"start",started:!1,moves:[],addMove:function(i){this.moves.length>Zs&&this.moves.shift(),this.moves.push(i)},movefn:null,upfn:null,prevent:!1},reset:function(){this.info.state="start",this.info.started=!1,this.info.moves=[],this.info.x=0,this.info.y=0,this.info.prevent=!1,B(this.info)},mousedown:function(i){if(!M(i))return;let t=T(i),r=this,s=function(n){let l=n.clientX,a=n.clientY;Ni(r.info,l,a)&&(r.info.state=r.info.started?n.type==="mouseup"?"end":"track":"start",r.info.state==="start"&&gt("tap"),r.info.addMove({x:l,y:a}),M(n)||(r.info.state="end",B(r.info)),t&&ee(r.info,t,n),r.info.started=!0)},e=function(n){r.info.started&&s(n),B(r.info)};Oi(this.info,s,e),this.info.x=i.clientX,this.info.y=i.clientY},touchstart:function(i){let t=i.changedTouches[0];this.info.x=t.clientX,this.info.y=t.clientY},touchmove:function(i){let t=T(i),r=i.changedTouches[0],s=r.clientX,e=r.clientY;Ni(this.info,s,e)&&(this.info.state==="start"&&gt("tap"),this.info.addMove({x:s,y:e}),ee(this.info,t,r),this.info.state="track",this.info.started=!0)},touchend:function(i){let t=T(i),r=i.changedTouches[0];this.info.started&&(this.info.state="end",this.info.addMove({x:r.clientX,y:r.clientY}),ee(this.info,t,r))}});function Ni(i,t,r){if(i.prevent)return!1;if(i.started)return!0;let s=Math.abs(i.x-t),e=Math.abs(i.y-r);return s>=xi||e>=xi}function ee(i,t,r){if(!t)return;let s=i.moves[i.moves.length-2],e=i.moves[i.moves.length-1],o=e.x-i.x,n=e.y-i.y,l,a=0;s&&(l=e.x-s.x,a=e.y-s.y),te(t,"track",{state:i.state,x:r.clientX,y:r.clientY,dx:o,dy:n,ddx:l,ddy:a,sourceEvent:r,hover:function(){return co(r.clientX,r.clientY)}})}Qt({name:"tap",deps:["mousedown","click","touchstart","touchend"],flow:{start:["mousedown","touchstart"],end:["click","touchend"]},emits:["tap"],info:{x:NaN,y:NaN,prevent:!1},reset:function(){this.info.x=NaN,this.info.y=NaN,this.info.prevent=!1},mousedown:function(i){M(i)&&(this.info.x=i.clientX,this.info.y=i.clientY)},click:function(i){M(i)&&Mi(this.info,i)},touchstart:function(i){const t=i.changedTouches[0];this.info.x=t.clientX,this.info.y=t.clientY},touchend:function(i){Mi(this.info,i.changedTouches[0],i)}});function Mi(i,t,r){let s=Math.abs(t.clientX-i.x),e=Math.abs(t.clientY-i.y),o=T(r||t);!o||ro[o.localName]&&o.hasAttribute("disabled")||(isNaN(s)||isNaN(e)||s<=Pi&&e<=Pi||lo(t))&&(i.prevent||te(o,"tap",{x:t.clientX,y:t.clientY,sourceEvent:t,preventer:r}))}/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/const go=E(i=>{class t extends i{_addEventListenerToNode(s,e,o){ho(s,e,o)||super._addEventListenerToNode(s,e,o)}_removeEventListenerFromNode(s,e,o){po(s,e,o)||super._removeEventListenerFromNode(s,e,o)}}return t});/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const ki=E(i=>class extends i{static get properties(){return{disabled:{type:Boolean,value:!1,observer:"_disabledChanged",reflectToAttribute:!0}}}_disabledChanged(r){this._setAriaDisabled(r)}_setAriaDisabled(r){r?this.setAttribute("aria-disabled","true"):this.removeAttribute("aria-disabled")}click(){this.disabled||super.click()}});/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const vo=E(i=>class extends i{ready(){super.ready(),this.addEventListener("keydown",r=>{this._onKeyDown(r)}),this.addEventListener("keyup",r=>{this._onKeyUp(r)})}_onKeyDown(r){}_onKeyUp(r){}});/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const bo=i=>class extends ki(go(vo(i))){get _activeKeys(){return[" "]}ready(){super.ready(),this._addEventListenerToNode(this,"down",r=>{this._shouldSetActive(r)&&this._setActive(!0)}),this._addEventListenerToNode(this,"up",()=>{this._setActive(!1)})}disconnectedCallback(){super.disconnectedCallback(),this._setActive(!1)}_shouldSetActive(r){return!this.disabled}_onKeyDown(r){super._onKeyDown(r),this._shouldSetActive(r)&&this._activeKeys.includes(r.key)&&this._setActive(!0)}_onKeyUp(r){super._onKeyUp(r),this._activeKeys.includes(r.key)&&this._setActive(!1)}_setActive(r){this.toggleAttribute("active",r)}},wo=/\/\*\*\s+vaadin-dev-mode:start([\s\S]*)vaadin-dev-mode:end\s+\*\*\//i,vt=window.Vaadin&&window.Vaadin.Flow&&window.Vaadin.Flow.clients;function Po(){function i(){return!0}return Li(i)}function xo(){try{return Eo()?!0:Ao()?vt?!Co():!Po():!1}catch{return!1}}function Eo(){return localStorage.getItem("vaadin.developmentmode.force")}function Ao(){return["localhost","127.0.0.1"].indexOf(window.location.hostname)>=0}function Co(){return!!(vt&&Object.keys(vt).map(t=>vt[t]).filter(t=>t.productionMode).length>0)}function Li(i,t){if(typeof i!="function")return;const r=wo.exec(i.toString());if(r)try{i=new Function(r[1])}catch(s){console.log("vaadin-development-mode-detector: uncommentAndRun() failed",s)}return i(t)}window.Vaadin=window.Vaadin||{};const zi=function(i,t){if(window.Vaadin.developmentMode)return Li(i,t)};window.Vaadin.developmentMode===void 0&&(window.Vaadin.developmentMode=xo());function So(){}const To=function(){if(typeof zi=="function")return zi(So)};/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */let ie=[],Oo=document.createTextNode("");new window.MutationObserver($o).observe(Oo,{characterData:!0});function $o(){const i=ie.length;for(let t=0;t<i;t++){let r=ie[t];if(r)try{r()}catch(s){setTimeout(()=>{throw s})}}ie.splice(0,i)}const No={run(i){return window.requestIdleCallback?window.requestIdleCallback(i):window.setTimeout(i,16)},cancel(i){window.cancelIdleCallback?window.cancelIdleCallback(i):window.clearTimeout(i)}};/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/class bt{constructor(){this._asyncModule=null,this._callback=null,this._timer=null}setConfig(t,r){this._asyncModule=t,this._callback=r,this._timer=this._asyncModule.run(()=>{this._timer=null,re.delete(this),this._callback()})}cancel(){this.isActive()&&(this._cancelAsync(),re.delete(this))}_cancelAsync(){this.isActive()&&(this._asyncModule.cancel(this._timer),this._timer=null)}flush(){this.isActive()&&(this.cancel(),this._callback())}isActive(){return this._timer!=null}static debounce(t,r,s){return t instanceof bt?t._cancelAsync():t=new bt,t.setConfig(r,s),t}}let re=new Set;const Mo=function(i){re.add(i)};/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class se{static detectScrollType(){const t=document.createElement("div");t.textContent="ABCD",t.dir="rtl",t.style.fontSize="14px",t.style.width="4px",t.style.height="1px",t.style.position="absolute",t.style.top="-1000px",t.style.overflow="scroll",document.body.appendChild(t);let r="reverse";return t.scrollLeft>0?r="default":(t.scrollLeft=2,t.scrollLeft<2&&(r="negative")),document.body.removeChild(t),r}static getNormalizedScrollLeft(t,r,s){const{scrollLeft:e}=s;if(r!=="rtl"||!t)return e;switch(t){case"negative":return s.scrollWidth-s.clientWidth+e;case"reverse":return s.scrollWidth-s.clientWidth-e}return e}static setNormalizedScrollLeft(t,r,s,e){if(r!=="rtl"||!t){s.scrollLeft=e;return}switch(t){case"negative":s.scrollLeft=s.clientWidth-s.scrollWidth+e;break;case"reverse":s.scrollLeft=s.scrollWidth-s.clientWidth-e;break;default:s.scrollLeft=e;break}}}/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const O=[],ko=function(){const i=ne();O.forEach(t=>{oe(t,i)})};let wt;const Lo=new MutationObserver(ko);Lo.observe(document.documentElement,{attributes:!0,attributeFilter:["dir"]});const oe=function(i,t,r=i.getAttribute("dir")){t?i.setAttribute("dir",t):r!=null&&i.removeAttribute("dir")},ne=function(){return document.documentElement.getAttribute("dir")},zo=i=>class extends i{static get properties(){return{dir:{type:String,value:"",reflectToAttribute:!0}}}static finalize(){super.finalize(),wt||(wt=se.detectScrollType())}connectedCallback(){super.connectedCallback(),this.hasAttribute("dir")||(this.__subscribe(),oe(this,ne(),null))}attributeChangedCallback(r,s,e){if(super.attributeChangedCallback(r,s,e),r!=="dir")return;const o=ne(),n=e===o&&O.indexOf(this)===-1,l=!e&&s&&O.indexOf(this)===-1;n||l?(this.__subscribe(),oe(this,o,e)):e!==o&&s===o&&this.__subscribe(!1)}disconnectedCallback(){super.disconnectedCallback(),this.__subscribe(!1),this.removeAttribute("dir")}_valueToNodeAttribute(r,s,e){e==="dir"&&s===""&&!r.hasAttribute("dir")||super._valueToNodeAttribute(r,s,e)}_attributeToProperty(r,s,e){r==="dir"&&!s?this.dir="":super._attributeToProperty(r,s,e)}__subscribe(r=!0){r?O.indexOf(this)===-1&&O.push(this):O.indexOf(this)>-1&&O.splice(O.indexOf(this),1)}__getNormalizedScrollLeft(r){return se.getNormalizedScrollLeft(wt,this.getAttribute("dir")||"ltr",r)}__setNormalizedScrollLeft(r,s){return se.setNormalizedScrollLeft(wt,this.getAttribute("dir")||"ltr",r,s)}};/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */window.Vaadin=window.Vaadin||{};window.Vaadin.registrations=window.Vaadin.registrations||[];window.Vaadin.developmentModeCallback=window.Vaadin.developmentModeCallback||{};window.Vaadin.developmentModeCallback["vaadin-usage-statistics"]=function(){To()};let le;const Di=new Set,Do=i=>class extends zo(i){static get version(){return"22.0.2"}static finalize(){super.finalize();const{is:r}=this;r&&!Di.has(r)&&(window.Vaadin.registrations.push(this),Di.add(r),window.Vaadin.developmentModeCallback&&(le=bt.debounce(le,No,()=>{window.Vaadin.developmentModeCallback["vaadin-usage-statistics"]()}),Mo(le)))}constructor(){super();document.doctype===null&&console.warn('Vaadin components require the "standards mode" declaration. Please add <!DOCTYPE html> to the HTML document.')}};/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */let ae=!1;window.addEventListener("keydown",()=>{ae=!0},{capture:!0});window.addEventListener("mousedown",()=>{ae=!1},{capture:!0});const Ro=E(i=>class extends i{get _keyboardActive(){return ae}ready(){this.addEventListener("focusin",r=>{this._shouldSetFocus(r)&&this._setFocused(!0)}),this.addEventListener("focusout",r=>{this._shouldRemoveFocus(r)&&this._setFocused(!1)}),super.ready()}disconnectedCallback(){super.disconnectedCallback(),this.hasAttribute("focused")&&this._setFocused(!1)}_setFocused(r){this.toggleAttribute("focused",r),this.toggleAttribute("focus-ring",r&&this._keyboardActive)}_shouldSetFocus(r){return!0}_shouldRemoveFocus(r){return!0}});/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */const Ho=i=>class extends ki(i){static get properties(){return{tabindex:{type:Number,value:0,reflectToAttribute:!0,observer:"_tabindexChanged"},__lastTabIndex:{type:Number,value:0}}}_disabledChanged(r,s){super._disabledChanged(r,s),r?(this.__lastTabIndex=this.tabindex,this.tabindex=-1):s&&(this.tabindex=this.__lastTabIndex)}_tabindexChanged(r){this.disabled&&r!==-1&&(this.__lastTabIndex=r,this.tabindex=-1)}};/**
 * @license
 * Copyright (c) 2021 Vaadin Ltd.
 * This program is available under Apache License Version 2.0, available at https://vaadin.com/license/
 */class Ri extends bo(Ho(Ro(Do(fr(Xs))))){static get is(){return"vaadin-button"}static get template(){return Gs`
      <style>
        :host {
          display: inline-block;
          position: relative;
          outline: none;
          white-space: nowrap;
          -webkit-user-select: none;
          -moz-user-select: none;
          user-select: none;
        }

        :host([hidden]) {
          display: none !important;
        }

        /* Aligns the button with form fields when placed on the same line.
          Note, to make it work, the form fields should have the same "::before" pseudo-element. */
        .vaadin-button-container::before {
          content: '\\2003';
          display: inline-block;
          width: 0;
        }

        .vaadin-button-container {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          width: 100%;
          height: 100%;
          min-height: inherit;
          text-shadow: inherit;
          background: transparent;
          padding: 0;
          border: none;
          box-shadow: none;
        }

        [part='prefix'],
        [part='suffix'] {
          flex: none;
        }

        [part='label'] {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      </style>
      <div class="vaadin-button-container">
        <span part="prefix">
          <slot name="prefix"></slot>
        </span>
        <span part="label">
          <slot></slot>
        </span>
        <span part="suffix">
          <slot name="suffix"></slot>
        </span>
      </div>
    `}get _activeKeys(){return["Enter"," "]}ready(){super.ready(),this.hasAttribute("role")||this.setAttribute("role","button")}_onKeyDown(t){super._onKeyDown(t),this._activeKeys.includes(t.key)&&(t.preventDefault(),this.click())}}customElements.define(Ri.is,Ri);function Io(i){let t,r,s,e;return{c(){t=xt("div"),r=xt("h1"),r.textContent="GDLauncher",s=Ji(),e=xt("h1"),e.textContent=`Welcome to ${Uo}!`,qi(t,"class","main svelte-1yyl7u1")},m(o,n){Ki(o,t,n),Et(t,r),Et(t,s),Et(t,e)},p:At,i:At,o:At,d(o){o&&Wi(t)}}}var Uo="GDLauncher";class Zo extends Vi{constructor(t){super();ji(this,t,null,Io,Yi,{})}}export{Zo as default};
