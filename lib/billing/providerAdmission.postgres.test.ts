/** Opt-in real SQL verification; retains a fresh database in a dedicated LOCAL container. */
import assert from "node:assert/strict";
import { test } from "node:test";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { LanguageModelV4 } from "@ai-sdk/provider";
import { withProviderAdmission, type CreditDriver } from "./providerAdmission";
import { runPaidContext } from "./paidContext";
import { cnyToMicrocredits } from "./centralCredits";

test("real PostgreSQL admission/settlement: duplicate and insufficient funds never invoke provider", {
  skip: process.env.RUN_LOCAL_CREDIT_TESTS !== "1", timeout: 120_000,
}, async () => {
  const container="rootsolo-shared-ledger-test-20260927";
  const db=`studysolo_admission_${Date.now()}`;
  const literal=(s:string)=>"'"+s.replaceAll("'","''")+"'";
  const sql=(query:string,database=db)=>execFileSync("docker",["exec","-i",container,"psql","-U","postgres","-d",database,"-X","-qAt","-v","ON_ERROR_STOP=1"],{input:query,encoding:"utf8",timeout:30_000}).trim();
  sql(`CREATE DATABASE ${db}`,"postgres");
  sql(`CREATE SCHEMA auth; CREATE TABLE auth.users(id uuid PRIMARY KEY);
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth,public TO anon,authenticated,service_role;
    CREATE TABLE public.admission_guard(user_id uuid,request_key text,PRIMARY KEY(user_id,request_key));`);
  sql(readFileSync(resolve("../1037Solo-Shared/supabase/migrations/202609270001_shared_foundation.sql"),"utf8"));
  sql(readFileSync(resolve("supabase/migrations/202609270003_usage_detail.sql"),"utf8"));
  const user="00000000-0000-4000-8000-000000000101",empty="00000000-0000-4000-8000-000000000102";
  sql(`INSERT INTO auth.users VALUES('${user}'),('${empty}'); SELECT credit_apply('${user}','studysolo','seed','grant',1000000,'{}');`);
  const credits:CreditDriver={
    async reserve(userId,requestKey,maxCny,metadata){
      sql(`INSERT INTO admission_guard VALUES(${literal(userId)},${literal(requestKey)});`);
      const amount=Math.max(1,cnyToMicrocredits(maxCny));
      sql(`SET ROLE service_role; SELECT credit_apply(${literal(userId)},'studysolo',${literal(requestKey)},'reserve',${amount},${literal(JSON.stringify(metadata))}::jsonb);`);
      return {userId,requestKey,reserved:amount,metadata};
    },
    async settleMicro(a,amount){sql(`SET ROLE service_role; SELECT credit_apply(${literal(a.userId)},'studysolo',${literal(a.requestKey)},'settle',${amount},'{}');`);},
    async cancel(a){sql(`SET ROLE service_role; SELECT credit_apply(${literal(a.userId)},'studysolo',${literal(a.requestKey)},'cancel',0,'{}');`);},
  };
  let invoked=0;
  const fake:LanguageModelV4={specificationVersion:"v4",provider:"test",modelId:"custom",supportedUrls:{},
    async doGenerate(){invoked++;return {content:[],finishReason:{unified:"stop",raw:"stop"},warnings:[],usage:{inputTokens:{total:10,noCache:10,cacheRead:0,cacheWrite:0},outputTokens:{total:5,text:5,reasoning:0}}};},
    async doStream(){throw new Error("unused");},
  };
  const model=withProviderAdmission(fake,"custom",true,credits);
  const params={prompt:[{role:"user" as const,content:[{type:"text" as const,text:"Hello"}]}],maxOutputTokens:100};
  const run=(id:string,key:string)=>runPaidContext({userId:id,requestId:key,route:"/api/chat",sequence:0,reservedCny:0},()=>model.doGenerate(params));
  await run(user,"first");
  assert.equal(invoked,1);
  assert.equal(sql(`SELECT available_microcredits||','||held_microcredits FROM credit_accounts WHERE user_id='${user}'`),"999992,0");
  await assert.rejects(async()=>await run(user,"first"));
  assert.equal(invoked,1);
  await assert.rejects(async()=>await run(empty,"insufficient"));
  assert.equal(invoked,1);
  fake.doGenerate=async()=>{invoked++;throw new Error("provider timeout outcome unknown");};
  await assert.rejects(async()=>await run(user,"unknown"));
  assert.equal(sql("SELECT state FROM credit_operations WHERE request_key='unknown:1'"),"reserved");
  assert.ok(Number(sql(`SELECT held_microcredits FROM credit_accounts WHERE user_id='${user}'`))>0);
  const balanceBefore = sql(`SELECT available_microcredits FROM credit_accounts WHERE user_id='${user}'`);
  sql(`SET ROLE service_role; INSERT INTO ss_usage_ledger(user_id,pool,route,kind,cost_cny) VALUES('${user}','platform','test','llm',12345);`);
  assert.equal(sql(`SELECT available_microcredits FROM credit_accounts WHERE user_id='${user}'`),balanceBefore);
  assert.equal(sql(`SET ROLE authenticated; SET request.jwt.claim.sub='${empty}'; SELECT count(*) FROM ss_usage_ledger;`),"0");
  assert.equal(sql(`SET ROLE authenticated; SET request.jwt.claim.sub='${user}'; SELECT count(*) FROM ss_usage_ledger;`),"1");
  console.log(`Retained SQL evidence database: ${db}; container: ${container}`);
});
