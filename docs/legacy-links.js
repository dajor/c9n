// Preserve previously shared landing-page section URLs.
(() => {
 const pages={product:'product',video:'product',dashboards:'product',access:'product',evidence:'evidence',community:'community',name:'community',download:'download',contact:'contact'};
 function redirect(){const key=location.hash.slice(1),page=pages[key];if(page)location.replace(page+(document.documentElement.lang==='en'?'.en':'')+'.html'+location.search+location.hash);}
 redirect();window.addEventListener('hashchange',redirect);
})();
