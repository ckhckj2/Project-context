(()=>{
'use strict';
function ensureActionA11y(root){
  const actions=root?.querySelector('.map>.actions');
  if(!actions)return;
  actions.querySelectorAll('[data-drawer]').forEach(button=>{
    const key=button.dataset.drawer;
    const pane=root.querySelector(`[data-pane="${key}"]`);
    if(!pane)return;
    pane.id=pane.id||`cc259-pane-${key}`;
    button.type='button';
    button.setAttribute('aria-controls',pane.id);
    if(!button.hasAttribute('aria-expanded'))button.setAttribute('aria-expanded','false');
  });
}

function revealPane(pane){
  requestAnimationFrame(()=>{
    const rect=pane.getBoundingClientRect();
    if(rect.top>window.innerHeight-72||rect.bottom<72){
      const reduce=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      pane.scrollIntoView({behavior:reduce?'auto':'smooth',block:'start'});
    }
  });
}

function ensurePaneSlot(map,actions){
  let slot=map.querySelector(':scope>.cc259-active-pane-slot');
  if(!slot){
    slot=document.createElement('section');
    slot.className='cc259-active-pane-slot';
    slot.setAttribute('aria-live','polite');
  }
  if(actions.nextElementSibling!==slot)actions.after(slot);
  map.querySelectorAll('[data-pane]').forEach(pane=>{if(pane.parentElement!==slot)slot.append(pane)});
  return slot;
}

function toggleDrawer(button){
  const root=button.closest('#contextResult');
  const map=button.closest('.map');
  const actions=button.closest('.actions');
  const key=button.dataset.drawer;
  const pane=map?.querySelector(`[data-pane="${key}"]`);
  if(!root||!map||!actions||!pane)return;
  const open=!pane.classList.contains('show');
  const slot=ensurePaneSlot(map,actions);

  map.querySelectorAll('.drawer.show').forEach(item=>item.classList.remove('show'));
  map.querySelectorAll('.actions [data-drawer]').forEach(item=>{
    item.classList.remove('cc-drawer-active');
    item.setAttribute('aria-expanded','false');
  });
  if(open){
    pane.classList.add('show','cc259-pane-reveal');
    button.classList.add('cc-drawer-active');
    button.setAttribute('aria-expanded','true');
    revealPane(pane);
  }
}

function installDrawerController(){
  document.addEventListener('click',event=>{
    const button=event.target.closest('#contextResult .actions [data-drawer]');
    const ask=event.target.closest('#contextResult [data-ask-context]');
    if(ask){event.preventDefault();window.CC_CONTEXT_RENDERER.ask();return}
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    toggleDrawer(button);
  },true);
}


function prepare(root){const map=root?.querySelector('.map'),actions=map?.querySelector(':scope>.actions');if(!map||!actions)return;ensureActionA11y(root);ensurePaneSlot(map,actions)}
window.CC_CONTEXT_CONTROLLER=Object.freeze({prepare,toggleDrawer});
window.CC_BOOT.register('context-controller',installDrawerController);
})();
