import {extractAccessToken,verifySupabaseAccessToken} from '@/lib/auth/aiGate';
import {resolveProvider,ENV_MODEL_FLASH} from '@/lib/ai/provider';
import {getModelInfo} from '@/lib/ai/models';
import {configuredUnitRate} from '@/lib/billing/unitRate';
export const runtime='nodejs';export const dynamic='force-dynamic';
export async function GET(request:Request){
 const token=extractAccessToken(request.headers);const user=token?await verifySupabaseAccessToken(token):null;
 if(!user)return Response.json({error:'请先登录'},{status:401});
 if(user.mfaRequired)return Response.json({error:'请完成两步验证'},{status:403});
 const provider=resolveProvider(process.env.CLASS_AI_MODEL||ENV_MODEL_FLASH);const price=getModelInfo(provider.registryId)?.pricing;
 return Response.json({ai:provider.configured&&provider.apiProtocol==='openai'&&!!price&&price.input>0&&price.output>0,
 asr:!!((process.env.CLASS_ASR_BASE_URL||process.env.ASR_BASE_URL)&&(process.env.CLASS_ASR_API_KEY||process.env.ASR_API_KEY)&&(process.env.CLASS_ASR_MODEL||process.env.ASR_MODEL)&&configuredUnitRate(process.env.CLASS_ASR_CNY_PER_SECOND)!==null),
 image:!!(process.env.CLASS_IMAGE_SEARCH_API_KEY&&Number(process.env.CLASS_IMAGE_SEARCH_CNY_PER_CALL)>0)}, {headers:{'Cache-Control':'no-store'}});
}
