"use client";
import {useEffect,useRef,useState,useSyncExternalStore} from 'react';
import {get} from 'idb-keyval';
import {useAuthSession} from '@/lib/hooks/useAuthSession';
import {redirectAccount} from '@/lib/auth/account';
import {createAndOpenNote} from '@/lib/notes/openUserNote';
import {WorkbenchShell} from './components/layout/workbench-shell';
import {TranscriptPane} from './features/transcript/pane';
import {NotesPane} from './features/notes/pane';
import {ChatPanel} from './features/agent/chat-panel';
import {SilentAgentBoot} from './features/agent/silent-boot';
import {RenderHost} from './features/render-modules/host';
import {resetChatPrivate} from './features/agent/chat-store';
import {resetChatPersistSeq} from './features/agent/chat-persist';
import {stopSession} from './features/transcript/pipeline';
import {getNotesPublic,getTranscriptPublic,subscribeNotesPublic,subscribeRenderProjection,useTranscriptPublic} from './lib/session';
import {resetTranscriptPublic,appendCommitted,patchTranscriptPublic} from './lib/session/writes/transcript';
import {resetNotesPublic,patchNotesPublic} from './lib/session/writes/notes';
import {resetRenderProjection,upsertRenderMessage} from './lib/session/writes/render';
import {getDb,setClassUserId,getClassUserId,subscribeClassSync,getClassRevision,getPendingCount,getSyncError,listSessions,loadClassSession,insertSession,insertTranscriptSegments,upsertNoteOutline,insertRenderMessage,flushClassPending,setClassHydrating,isClassHydrating,getLocalClassSnapshot,type ClassSession} from './lib/db';
import type {RenderMessage} from './features/render-modules/types';
import './styles.css';

export default function Workbench(){
  const auth=useAuthSession();
  const owner=useSyncExternalStore(subscribeClassSync,getClassUserId,()=>null);
  const revision=useSyncExternalStore(subscribeClassSync,getClassRevision,()=>0);
  void revision;
  const sessionId=useTranscriptPublic(s=>s.sessionId);
  const [sessions,setSessions]=useState<ClassSession[]>([]);
  const [capabilities,setCapabilities]=useState<{ai:boolean;asr:boolean;image:boolean}|null>(null);
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const [draft,setDraft]=useState('');const [showDraft,setShowDraft]=useState(false);
  const initialized=useRef<string|null>(null);
  useEffect(()=>{
    let active=true;
    // Hide old account immediately; wait for capture shutdown before exposing new UI.
    setClassUserId(null);
    void stopSession().finally(()=>{
      if(!active)return;
      resetTranscriptPublic();resetNotesPublic();resetRenderProjection();resetChatPrivate();resetChatPersistSeq();
      setClassUserId(auth.userId);initialized.current=null;
      if(auth.userId)void getDb().then(listSessions).then(rows=>{if(active)setSessions(rows);}).catch(e=>{if(active)setError(String(e));});
    });
    return()=>{active=false;setClassUserId(null);void stopSession();};
  },[auth.userId]);
  useEffect(()=>{
    if(!owner||owner!==auth.userId)return;
    const db={userId:owner};
    void fetch("/api/class/capabilities",{credentials:"include"}).then(async response=>{if(response.ok&&getClassUserId()===owner)setCapabilities(await response.json());}).catch(()=>{});
    const notes=subscribeNotesPublic(s=>s.outlineVersion,()=>{
      const id=getTranscriptPublic().sessionId;if(!id||isClassHydrating())return;
      const state=getNotesPublic();void upsertNoteOutline(db,{sessionId:id,revision:state.outlineVersion,outline:{nodes:[...state.outlineDigest]}}).catch(e=>setError(String(e)));
    });
    const render=subscribeRenderProjection(s=>s.byId,(next,prev)=>{
      const id=getTranscriptPublic().sessionId;if(!id||isClassHydrating())return;
      for(const [key,value] of Object.entries(next)){if(value===prev[key])continue;
        void insertRenderMessage(db,{id:value.id,sessionId:id,module:value.module,version:value.version,target:value.target,props:value.props as Record<string,unknown>,source:value.meta.source,transcriptAnchor:value.meta.transcriptAnchor,createdAt:new Date(value.meta.createdAt).toISOString()}).catch(e=>setError(String(e)));
      }
    });
    const sync=()=>{void flushClassPending(db);};window.addEventListener('online',sync);const syncTimer=setInterval(sync,10000);
    return()=>{notes();render();clearInterval(syncTimer);window.removeEventListener('online',sync);};
  },[owner,auth.userId]);
  useEffect(()=>{if(owner&&owner===auth.userId&&sessionId)void getDb().then(listSessions).then(setSessions).catch(()=>{});},[owner,auth.userId,sessionId]);
  useEffect(()=>{
    if(!owner||owner!==auth.userId||initialized.current===owner)return;
    initialized.current=owner;
    const id=new URL(window.location.href).searchParams.get('session');
    if(id&&/^[0-9a-f-]{36}$/i.test(id))void open(id);
    // A deep-link is restored once for each verified owner, never during capture.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[owner,auth.userId]);
  async function open(id:string){
    if(!id||busy)return;setBusy(true);setError('');
    try{
      await stopSession();const db=await getDb();const data=await loadClassSession(db,id);
      if(getClassUserId()!==db.userId)return;
      setClassHydrating(true);resetTranscriptPublic();resetNotesPublic();resetRenderProjection();resetChatPrivate();resetChatPersistSeq();
      patchTranscriptPublic({sessionId:id,recordingStatus:'stopped'});
      for(const row of data.transcript)appendCommitted(row);
      const nodes=data.outline?.outline.nodes;
      if(Array.isArray(nodes))patchNotesPublic({outlineDigest:nodes as {id:string;title:string}[],outlineVersion:data.outline?.revision||0});
      for(const row of data.renders)upsertRenderMessage({id:row.id,module:row.module,version:row.version,target:row.target as RenderMessage['target'],props:row.props,meta:{source:row.source as RenderMessage['meta']['source'],createdAt:new Date(row.createdAt||Date.now()).getTime(),...(row.transcriptAnchor?{transcriptAnchor:row.transcriptAnchor}:{})}});
    }catch(e){setError(e instanceof Error?e.message:'打开失败');}finally{setClassHydrating(false);setBusy(false);}
  }
  async function importText(){
    if(!draft.trim()||busy)return;setBusy(true);setError('');
    try{
      await stopSession();resetTranscriptPublic();resetNotesPublic();resetRenderProjection();
      const db=await getDb();const session=await insertSession(db,{title:draft.trim().slice(0,35),status:'ended',asrSnapshot:{family:'text-import',dialect:'text',model:'none',baseUrl:'',sampleRate:16000}});
      patchTranscriptPublic({sessionId:session.id,recordingStatus:'stopped'});
      const paragraphs=draft.trim().split(/\n+/).filter(Boolean).flatMap(text=>text.match(/.{1,4000}/gu)||[]).slice(0,100);
      const rows=paragraphs.map((text,i)=>({id:crypto.randomUUID(),sessionId:session.id,seq:i+1,startMs:0,endMs:0,text}));
      await insertTranscriptSegments(db,rows);rows.forEach(appendCommitted);setDraft('');setShowDraft(false);
    }catch(e){setError(e instanceof Error?e.message:'导入失败');}finally{setBusy(false);}
  }
  function exportNote(){
    const state=getTranscriptPublic();if(!state.sessionId)return;
    const title=sessions.find(s=>s.id===state.sessionId)?.title||'课堂笔记';
    const markdown=`# ${title}\n\n[来源课堂](/class?session=${state.sessionId})\n\n## 提纲\n${getNotesPublic().outlineDigest.map(n=>`- ${n.title}`).join('\n')}\n\n## 文稿\n${state.committed.map(s=>s.text).join('\n\n')}`;
    createAndOpenNote(null,{title,markdown});
  }
  async function downloadAudio(){
    if(!owner||!sessionId)return;
    const rows=await get<{key:string;sessionId:string}[]>(`ss-class-audio-index:${owner}`);
    const selected=(rows||[]).filter(r=>r.sessionId===sessionId);
    if(!selected.length){setError('当前设备没有这节课的原始音频；云端同步的是文稿与课堂产物。');return;}
    const {zipSync}=await import('fflate');const files:Record<string,Uint8Array>={};
    for(let i=0;i<selected.length;i++){const data=await get<ArrayBuffer>(selected[i].key);if(data)files[`part-${String(i+1).padStart(4,'0')}.wav`]=new Uint8Array(data);}
    const bytes=zipSync(files,{level:0});const url=URL.createObjectURL(new Blob([bytes.slice().buffer],{type:'application/zip'}));
    const a=document.createElement('a');a.href=url;a.download=`class-${sessionId}.zip`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  if(auth.status==='loading')return <div className="p-8">正在验证课堂账号…</div>;
  if(!auth.userId)return <section className="m-6 rounded-2xl border p-8"><h1 className="text-2xl font-semibold">课堂工作台</h1><p className="my-4">登录后录音、整理笔记与课堂提问，课堂产物随账号同步。</p><button className="rounded-xl bg-emerald-700 px-5 py-3 text-white" onClick={()=>redirectAccount()}>登录统一账号</button></section>;
  if(owner!==auth.userId)return <div className="p-8">正在安全切换课堂空间…</div>;
  const local=sessionId?getLocalClassSnapshot(sessionId):null;
  return <div className="ss-class-workbench relative flex h-full min-h-0 flex-col" key={owner}>
    <header className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
      <div className="mr-auto"><h1 className="font-serif text-lg font-semibold">Classolo · 课堂工作台</h1><p className="text-xs opacity-70">文稿、思维导图与提问相互关联 · AI 按实际用量计费</p></div>
      <select aria-label="打开课堂记录" className="max-w-60 rounded-lg border bg-transparent p-2 text-sm" disabled={busy} value={sessionId||''} onChange={e=>void open(e.target.value)}><option value="">课堂记录</option>{sessions.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select>
      <button className="class-action" onClick={()=>setShowDraft(v=>!v)}>补充文稿</button>
      <button className="class-action" disabled={!sessionId} onClick={exportNote}>存为学习笔记</button>
      <button className="class-action" disabled={!sessionId} onClick={()=>void downloadAudio()}>导出录音</button>
    </header>
    {(error||getSyncError())&&<p role="alert" className="m-2 rounded-lg border border-amber-300 bg-amber-50 p-2 text-sm text-amber-900">{error||getSyncError()} <button className="underline" onClick={()=>void getDb().then(flushClassPending)}>重试同步</button></p>}
    <p className="px-4 py-1 text-xs opacity-70">{getPendingCount()?`${getPendingCount()} 项课堂变更待同步`:'课堂变更已同步'} · 原始音频保留在当前设备，可导出；云端保存文稿和课堂产物。</p>
    {capabilities&&!capabilities.asr&&<p className="px-4 py-1 text-xs text-amber-800">语音转写服务暂未启用；可以导入已有文稿继续整理与提问。</p>}
    {showDraft&&<div className="border-b p-3"><textarea aria-label="已有课堂文稿" className="h-28 w-full rounded-lg border bg-transparent p-3 text-sm" maxLength={100000} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="粘贴已有文稿，或补充课堂记录。导入后会生成提纲与补充解析。"/><button className="class-action" disabled={busy||!draft.trim()} onClick={()=>void importText()}>创建课堂并整理</button></div>}
    <div className="relative min-h-0 flex-1"><SilentAgentBoot/><ChatPanel/><WorkbenchShell chrome={false} transcript={<TranscriptPane enabled={capabilities?.asr===true}/>} notes={<NotesPane/>} transcriptRender={<RenderHost target="transcript"/>} notesRender={<RenderHost target="notes"/>}/></div>
    {!!local?.chat.length&&<details className="max-h-48 overflow-auto border-t px-4 py-2 text-sm"><summary>课堂问答记录 · {local.chat.length}</summary>{local.chat.map(row=><p key={row.id} className="my-2 whitespace-pre-wrap"><strong>{row.role==='user'?'我':'课堂助手'}：</strong>{row.content}</p>)}</details>}
  </div>;
}
