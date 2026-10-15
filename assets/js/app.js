/* Interações: nav, reveal, busca, facial simulado. */
(function(){
  // ano
  document.querySelectorAll("[data-ano]").forEach(e=>e.textContent=new Date().getFullYear());
  // sessão no nav
  const s = window.Auth ? Auth.sessao() : null;
  document.querySelectorAll("[data-auth-area]").forEach(el=>{
    if(s){ el.innerHTML = `<span class="muted">Olá, <strong>${s.nome}</strong> · ${Auth.nomeNivel(s.nivel)}${s.face?" · facial ✓":""}</span> <a class="btn btn-ghost btn-small" href="painel.html">Painel</a> <button class="btn btn-ghost btn-small" data-sair>Sair</button>`; }
    else{ el.innerHTML = `<a class="btn btn-ghost btn-small" href="login.html">Entrar</a> <a class="btn btn-primary btn-small" href="cadastro.html">Criar conta</a>`; }
  });
  document.addEventListener("click",e=>{ if(e.target.closest("[data-sair]")) Auth.sair(); });
  // reveal
  const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add("vis");io.unobserve(x.target)}}),{threshold:.12});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
  // facial mock
  const face=document.querySelector("[data-face]");
  if(face){
    const video=face.querySelector("video"), msg=face.querySelector("[data-face-msg]");
    const btnCam=face.querySelector("[data-face-cam]"), btnSim=face.querySelector("[data-face-sim]");
    btnCam?.addEventListener("click", async ()=>{
      try{
        const stream=await navigator.mediaDevices.getUserMedia({video:true});
        video.srcObject=stream; video.style.display="block"; face.classList.add("ativo");
        msg.textContent="Câmera ativa para demonstração. Nada é gravado ou enviado. Clique em “Concluir verificação”.";
        btnSim.textContent="Concluir verificação (simulação)";
      }catch{ msg.textContent="Câmera indisponível — use a simulação abaixo. Nenhum dado é coletado."; }
    });
    btnSim?.addEventListener("click", ()=>{
      face.classList.add("ativo");
      msg.textContent="Analisando traços (simulação didática)…";
      setTimeout(()=>{ Auth.marcarRosto(); msg.textContent="Verificação concluída [SIMULAÇÃO]. Nenhum dado biométrico foi armazenado."; },1200);
    });
  }
})();
