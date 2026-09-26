import {boundedText,RequestBodyTooLarge} from '@/lib/http/boundedBody';
import {z} from "zod";
import {extractAccessToken,verifySupabaseAccessToken} from "@/lib/auth/aiGate";
import {resolveProvider,ENV_MODEL_FLASH,chatCompletionsUrl} from "@/lib/ai/provider";
import {getModelInfo} from "@/lib/ai/models";
import {reserveCredit,settleCredit,cancelCredit,CreditAdmissionError,type Admission} from "@/lib/billing/centralCredits";
export const runtime="nodejs";export const dynamic="force-dynamic";
const schema=z.object({messages:z.array(z.record(z.string(),z.unknown())).min(1).max(100),tools:z.array(z.record(z.string(),z.unknown())).max(8).optional(),tool_choice:z.unknown().optional(),stream:z.boolean().optional(),temperature:z.number().min(0).max(2).optional(),max_tokens:z.number().int().positive().optional(),max_completion_tokens:z.number().int().positive().optional()});
function actualCost(usage:unknown,inputPrice:number,outputPrice:number):number|null{
  if(!usage||typeof usage!=="object")return null;
  const value=usage as Record<string,unknown>;
  const input=Number(value.prompt_tokens);const output=Number(value.completion_tokens);
  if(!Number.isSafeInteger(input)||!Number.isSafeInteger(output)||input<0||output<0)return null;
  return (input*inputPrice+output*outputPrice)/1_000_000;
}
export async function POST(request:Request){
  const token=extractAccessToken(request.headers);const user=token?await verifySupabaseAccessToken(token):null;
  if(!user)return Response.json({error:{message:"请先登录"}},{status:401});
  if(user.mfaRequired)return Response.json({error:{message:"请先完成两步验证"}},{status:403});
  let admission:Admission|undefined;
  try{
    const text=await boundedText(request,128000);if(new TextEncoder().encode(text).length>128000)return Response.json({error:{message:"课堂上下文过长，请分段提问"}},{status:413});
    const body=schema.parse(JSON.parse(text));
    const provider=resolveProvider(process.env.CLASS_AI_MODEL||ENV_MODEL_FLASH);
    const price=getModelInfo(provider.registryId)?.pricing;
    if(!provider.configured||provider.apiProtocol!=="openai"||!price||!Number.isFinite(price.input)||!Number.isFinite(price.output)||price.input<=0||price.output<=0)throw new CreditAdmissionError("课堂 AI 模型或价格未配置",503);
    const outputLimit=Math.min(4096,body.max_tokens||body.max_completion_tokens||2048);
    const inputBound=new TextEncoder().encode(JSON.stringify(body.messages)+JSON.stringify(body.tools||[])).length+4096;
    const key=z.string().uuid().parse(request.headers.get("x-request-id")||crypto.randomUUID());
    admission=await reserveCredit(user.id,`class-ai:${key}`,(inputBound*price.input+outputLimit*price.output)/1_000_000,{route:"class-ai",model:provider.registryId,max_output_tokens:outputLimit,input_bound:inputBound});
    const upstream=await fetch(chatCompletionsUrl(provider.baseUrl),{method:"POST",headers:{Authorization:`Bearer ${provider.apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({...body,model:provider.apiModelId,max_tokens:outputLimit,max_completion_tokens:undefined,stream:body.stream===true,...(body.stream?{stream_options:{include_usage:true}}:{})}),signal:AbortSignal.any([request.signal,AbortSignal.timeout(180000)])});
    if(!upstream.ok){if([400,401,403,404,413,422,429].includes(upstream.status))await cancelCredit(admission);return Response.json({error:{message:`课堂模型服务暂不可用 (${upstream.status})`}},{status:502});}
    if(!body.stream){const data=await upstream.json();const cost=actualCost(data.usage,price.input,price.output);if(cost===null)throw new CreditAdmissionError("模型未返回用量，额度已预留待核对",503);await settleCredit(admission,cost);return Response.json(data);}
    if(!upstream.body)throw new Error("Missing provider stream");
    const reader=upstream.body.getReader();const decoder=new TextDecoder();let buffer='';let usage:unknown;const reserved=admission;
    const stream=new ReadableStream<Uint8Array>({
      async start(controller){
        try{
          while(true){const chunk=await reader.read();if(chunk.done)break;controller.enqueue(chunk.value);buffer+=decoder.decode(chunk.value,{stream:true});
            const lines=buffer.split('\n');buffer=lines.pop()||'';
            for(const line of lines){if(!line.startsWith('data:'))continue;const raw=line.slice(5).trim();if(!raw||raw==='[DONE]')continue;try{const data=JSON.parse(raw);if(data.usage)usage=data.usage;}catch{}}
            if(buffer.length>256000)throw new Error('Provider frame too large');
          }
          const cost=actualCost(usage,price.input,price.output);
          if(cost!==null)await settleCredit(reserved,cost);
          // Missing final usage/disconnect stays reserved; never fabricate a free charge.
          controller.close();
        }catch(error){controller.error(error);}finally{reader.releaseLock();}
      },
      async cancel(){await reader.cancel();},
    });
    return new Response(stream,{headers:{"Content-Type":"text/event-stream","Cache-Control":"no-store","X-Accel-Buffering":"no"}});
  }catch(error){
    const status=error instanceof RequestBodyTooLarge?413:error instanceof CreditAdmissionError?error.status:error instanceof z.ZodError||error instanceof SyntaxError?400:503;
    return Response.json({error:{message:error instanceof CreditAdmissionError?error.message:"课堂 AI 请求未能完成；已接受的请求额度保留待核对"}},{status});
  }
}
