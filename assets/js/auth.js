/* Auth mock front-only. Nenhuma biometria é persistida. */
(function(){
  const KEY="verdeid.session.v1", USERS="verdeid.users.v1";
  const norm = e => (e||"").trim().toLowerCase();
  function leUsers(){
    try{ const l=JSON.parse(localStorage.getItem(USERS)||"[]"); return Array.isArray(l)?l:[] }catch{ return [] }
  }
  function salvaUsers(l){ localStorage.setItem(USERS, JSON.stringify(l)); }
  window.Auth = {
    niveis: window.VERDEID_NIVEIS,
    sessao(){ try{return JSON.parse(sessionStorage.getItem(KEY)||localStorage.getItem(KEY+"-persist")||"null")}catch{return null} },
    entrar(email,senha,lembrar){
      email=norm(email);
      const todos=[...window.VERDEID_USUARIOS_DEMO, ...leUsers()];
      const u=todos.find(x=>norm(x.email)===email && x.senha===senha);
      if(!u) return {erro:"Credenciais inválidas. Use uma conta [DEMO] ou cadastre-se."};
      const s={nome:u.nome,email:u.email,nivel:u.nivel,face:false,ts:Date.now()};
      sessionStorage.setItem(KEY,JSON.stringify(s));
      if(lembrar) localStorage.setItem(KEY+"-persist",JSON.stringify(s));
      return {ok:s};
    },
    cadastrar(nome,email,senha,nivel){
      nome=(nome||"").trim(); email=norm(email);
      const n=parseInt(nivel,10);
      if(!n || n<1 || n>3) return {erro:"Nível de acesso inválido."};
      if(nome.length<2) return {erro:"Informe seu nome."};
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return {erro:"E-mail inválido."};
      if((senha||"").length<6) return {erro:"Senha com no mínimo 6 caracteres."};
      const todos=[...window.VERDEID_USUARIOS_DEMO, ...leUsers()];
      if(todos.some(x=>norm(x.email)===email)) return {erro:"Este e-mail já está em uso."};
      const u={nome,email,senha,nivel:n};
      const l=leUsers(); l.push(u); salvaUsers(l);
      return Auth.entrar(email,senha,false);
    },
    sair(){ sessionStorage.removeItem(KEY); localStorage.removeItem(KEY+"-persist"); location.href="login.html"; },
    exigir(){ const s=Auth.sessao(); if(!s){ location.href="login.html?next="+encodeURIComponent(location.pathname.split("/").pop()+location.search); } return s; },
    marcarRosto(){ const s=Auth.sessao(); if(!s) return; s.face=true;
      sessionStorage.setItem(KEY,JSON.stringify(s)); },
    nomeNivel(n){ const x=(window.VERDEID_NIVEIS||[]).find(v=>v.id===n); return x?x.nome:"—"; },
    pode(artigoNivel){ const s=Auth.sessao(); return s && s.nivel>=artigoNivel; }
  };
})();
