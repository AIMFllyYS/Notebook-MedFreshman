import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
export const MISSING_AI_SECRET_MESSAGE='课堂 AI 服务暂不可用';
export class MissingAISecretError extends Error { readonly code='MISSING_AI_SECRET'; constructor(){super(MISSING_AI_SECRET_MESSAGE);} }
export interface CreateModelConfig {baseUrl:string;model:string;userOverride?:string|null}
export function createModel(_config:CreateModelConfig){
  void _config;
  return createOpenAICompatible({name:'classroom-server',baseURL:'/api/class/ai',apiKey:'session-transport',
    fetch:async(url,init)=>{
      const headers=new Headers(init?.headers);headers.delete('authorization');
      headers.set('X-Request-Id',crypto.randomUUID());
      return fetch(url,{...init,headers,credentials:'include'});
    },
  })('classroom');
}
