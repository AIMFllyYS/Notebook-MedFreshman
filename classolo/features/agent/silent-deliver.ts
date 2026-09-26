import { getNotesPublic,getTranscriptPublic } from '@/classolo/lib/session';
import { upsertRenderMessage } from '@/classolo/lib/session/writes/render';
import {createModel,generateText} from '@/classolo/lib/ai';
export const SILENT_RENDER_ID='silent-agent-supplement';
let running=false;
export async function deliverSilentRender():Promise<void>{
  if(running)return;running=true;
  const snapshot=getTranscriptPublic();const session=snapshot.sessionId;
  try{
    const recent=snapshot.committed.slice(-8).map(s=>s.text).join('\n');
    if(!recent)return;
    const result=await generateText({model:createModel({baseUrl:'',model:'classroom'}),maxOutputTokens:768,maxRetries:0,
      prompt:`根据以下课堂文稿，补充一个关键概念的解释和一个自测问题。区分文稿事实与补充说明，不编造来源。\n${recent}\n已有提纲：${getNotesPublic().outlineDigest.map(n=>n.title).join('、')}`});
    if(getTranscriptPublic().sessionId!==session)return;
    upsertRenderMessage({id:SILENT_RENDER_ID,module:'rich-text',version:'1.0',target:'notes',props:{markdown:result.text},meta:{createdAt:Date.now(),source:'silent-agent'}});
  }catch{
    if(getTranscriptPublic().sessionId===session)upsertRenderMessage({id:SILENT_RENDER_ID,module:'rich-text',version:'1.0',target:'notes',props:{markdown:'课堂补充暂不可用。文稿与笔记仍已保留，可稍后在课堂提问中重试。'},meta:{createdAt:Date.now(),source:'system'}});
  }finally{running=false;}
}
