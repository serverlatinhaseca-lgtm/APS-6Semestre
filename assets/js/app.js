/* VerdeID — interações: nav, modal login, reveal, facial (slot plugável). */
(function(){
  document.querySelectorAll("[data-ano]").forEach(e=>e.textContent=new Date().getFullYear());

  /* ---- Slot facial: ponto de integração do módulo real ----
     Futuro: substituir window.VerdeIDFace.verify por chamada ao modelo real
     (ex.: face-api / backend). Contrato: recebe {video}, retorna {ok:true}.
     Hoje: simulação didática — nada é persistido/enviado. */
  window.VerdeIDFace = window.VerdeIDFace || {
    async verify(){
      await new Promise(r=>setTimeout(r,1200));
      return {ok:true, simulado:true};
    }
  };
  let faceStream=null;
  function stopFace(video){
    try{ (video?.srcObject?.getTracks?.()||[]).forEach(t=>t.stop()); }catch{}
    if(video) video.srcObject=null;
    faceStream=null;
  }

  // sessão no nav
  const s = window.Auth ? Auth.sessao() : null;
  document.querySelectorAll("[data-auth-area]").forEach(el=>{
    if(s){
      el.innerHTML = `<span class="muted">Olá, <strong></strong> · ${Auth.nomeNivel(s.nivel)}${s.face?" · facial ✓":""}</span> <a class="btn btn-ghost btn-small" href="painel.html">Painel</a> <button class="btn btn-ghost btn-small" data-sair>Sair</button>`;
      el.querySelector("strong").textContent = s.nome;
    }
    else{ el.innerHTML = `<button class="btn btn-ghost btn-small" data-open-login>Entrar</button> <a class="btn btn-primary btn-small" href="cadastro.html">Criar conta</a>`; }
  });
  document.addEventListener("click",e=>{
    if(e.target.closest("[data-sair]")) Auth.sair();
    if(e.target.closest("[data-open-login]")) openLogin();
    if(e.target.closest("[data-close-login]")) closeLogin();
  });

  // modal login (popup)
  const overlay=document.getElementById("loginOverlay");
  function openLogin(){ if(!overlay) { location.href="login.html"; return; } overlay.classList.add("show"); document.body.style.overflow="hidden"; setTimeout(()=>document.getElementById("m-email")?.focus(),60); }
  function closeLogin(){ if(!overlay) return; overlay.classList.remove("show"); document.body.style.overflow=""; const v=overlay.querySelector("video"); if(v) stopFace(v); }
  window.openLogin=openLogin; window.closeLogin=closeLogin;
  document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeLogin(); });
  overlay?.addEventListener("click",e=>{ if(e.target===overlay) closeLogin(); });

  const fModal=document.getElementById("f-modal-login");
  fModal?.addEventListener("submit",e=>{
    e.preventDefault();
    const err=document.getElementById("modal-erro");
    const r=Auth.entrar(
      document.getElementById("m-email").value,
      document.getElementById("m-senha").value,
      document.getElementById("m-lembrar").checked
    );
    if(r.erro){ err.hidden=false; err.textContent=r.erro; return; }
    err.hidden=true;
    showWelcomeThenGo(r.ok);
  });

  function showWelcomeThenGo(sess){
    const w=document.getElementById("welcomeScreen");
    if(!w){ location.href="painel.html"; return; }
    document.getElementById("welcomeText").textContent="Bem-vindo(a), "+sess.nome;
    document.getElementById("welcomeSub").textContent="Sessão validada para o nível "+sess.nivel+".";
    document.getElementById("welcomeLevel").textContent="NÍVEL "+sess.nivel+" · "+Auth.nomeNivel(sess.nivel).toUpperCase();
    closeLogin();
    w.classList.add("show");
    setTimeout(()=>{ w.classList.remove("show"); location.href="painel.html"; },1800);
  }

  // reveal
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("vis");io.unobserve(x.target)}}),{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

  // facial (simulação via adapter; câmera descartada)
  const face=document.querySelector("[data-face]");
  if(face){
    const video=face.querySelector("video"), msg=face.querySelector("[data-face-msg]");
    const btnCam=face.querySelector("[data-face-cam]"), btnSim=face.querySelector("[data-face-sim]");
    btnCam?.addEventListener("click", async ()=>{
      try{
        faceStream=await navigator.mediaDevices.getUserMedia({video:true});
        video.srcObject=faceStream; video.style.display="block"; face.classList.add("ativo");
        if(msg) msg.textContent="Câmera ativa para demonstração. Nada é gravado ou enviado. Clique em “Simular verificação”.";
        if(btnSim) btnSim.textContent="Concluir verificação (simulação)";
      }catch{ if(msg) msg.textContent="Câmera indisponível — use a simulação. Nenhum dado é coletado."; }
    });
    btnSim?.addEventListener("click", async ()=>{
      face.classList.add("ativo");
      if(msg) msg.textContent="Analisando traços (simulação didática)…";
      const r=await window.VerdeIDFace.verify({video});
      if(r.ok){
        try{ Auth.marcarRosto(); }catch{}
        stopFace(video);
        if(msg) msg.textContent="Verificação concluída [SIMULAÇÃO]. Nenhum dado biométrico foi armazenado.";
      }
    });
  }
})();
