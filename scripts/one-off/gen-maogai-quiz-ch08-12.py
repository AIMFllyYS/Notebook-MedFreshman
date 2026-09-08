#!/usr/bin/env python3
"""Generate high-quality maogai quiz JSON for ch08-ch12."""
import json
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "content" / "quiz" / "maogai"

EXAM = {
    "source": "docs/refer/考试题型分布.md",
    "totalPoints": 100,
    "timeLimit": 50,
}


def summary(questions):
    by_type = {"single_choice": 0, "multiple_choice": 0, "essay": 0}
    by_source = {"current_chapter": 0, "review": 0}
    by_diff = {"basic": 0, "medium": 0, "hard": 0}
    for q in questions:
        by_type[q["type"]] = by_type.get(q["type"], 0) + 1
        by_source[q["source"]] = by_source.get(q["source"], 0) + 1
        by_diff[q["difficulty"]] = by_diff.get(q["difficulty"], 0) + 1
    return {
        "totalQuestions": len(questions),
        "byType": by_type,
        "bySource": by_source,
        "byDifficulty": by_diff,
    }


def write_chapter(chapter_id, questions):
    data = {
        "subjectId": "maogai",
        "chapterId": chapter_id,
        "generatedAt": "2026-06-21",
        "examConfig": EXAM,
        "questions": questions,
        "summary": summary(questions),
    }
    path = OUT / f"{chapter_id}.json"
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {path} ({len(questions)} questions)")


CH08 = [
    # --- single current (8) ---
    {
        "id": "q001", "type": "single_choice", "difficulty": "basic",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.1.md", "label": "新民主主义社会的五种经济成分"},
        "stem": "新民主主义社会并存五种经济成分。据教材数据，个体经济与资本主义经济合计占整个社会经济的比重为（　）。",
        "options": ["21.3%", "52.8%", "69.0%", "78.7%"],
        "answer": 3,
        "hint": "五种经济成分按性质分类：社会主义性质21.3%，资本主义6.9%，个体71.8%。",
        "explanation": "D正确。8.1.md指出：社会主义性质经济占21.3%，资本主义占6.9%，个体经济占71.8%；个体与资本主义合计78.7%，私有制仍占绝对优势，这正是社会主义改造的任务所在。A是社会主义性质比重；B是1952年国营工业在全国工业中的比重；C为干扰项。",
    },
    {
        "id": "q002", "type": "single_choice", "difficulty": "basic",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.1.md", "label": "主要矛盾的转化"},
        "stem": "全国土地改革完成后，中国社会主要矛盾发生了根本性转化，表现为（　）。",
        "options": [
            "帝国主义与中华民族的矛盾上升为主要矛盾",
            "地主阶级与农民阶级的矛盾继续是主要矛盾",
            "工人阶级与资产阶级的矛盾成为主要矛盾",
            "人民内部矛盾与敌我矛盾并存且同等突出",
        ],
        "answer": 2,
        "hint": "土改后地主阶级作为整体被消灭，阶级矛盾格局发生变化。",
        "explanation": "C正确。8.1.md明确：土地改革完成、地主阶级作为整体被消灭后，主要矛盾由地主阶级与农民阶级的矛盾转化为工人阶级与资产阶级的矛盾，决定着中国向社会主义还是资本主义发展。A是近代中国半殖民地半封建时期的主要矛盾之一；B是土改前的状况；D混淆了两类矛盾与主要矛盾的表述。",
    },
    {
        "id": "q003", "type": "single_choice", "difficulty": "medium",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.1.md", "label": "新民主主义社会的历史定位"},
        "stem": "关于新民主主义社会的历史定位，下列表述正确的是（　）。",
        "options": [
            "它是独立的社会形态，介于封建社会与社会主义社会之间",
            "它属于资本主义体系，前途是走向资本主义",
            "它是过渡性社会形态，属于社会主义体系，前途是社会主义",
            "它的政治制度与经济制度完全匹配，结构稳定自洽",
        ],
        "answer": 2,
        "hint": "新民主主义社会政治制度已具社会主义属性，经济上是五种成分并存的混合体。",
        "explanation": "C正确。8.1.md指出：新民主主义社会不是独立社会形态，而是由新民主主义向社会主义过渡的过渡性社会形态，属于社会主义体系，前途是社会主义。A把它当作独立形态错误；B与“前途是社会主义”相悖；D与“政治制度和经济制度并不完全匹配”的论述相反。",
    },
    {
        "id": "q004", "type": "single_choice", "difficulty": "basic",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "过渡时期总路线"},
        "stem": "党在过渡时期总路线的完整表述中，“一化”是指（　）。",
        "options": [
            "逐步实现国家的社会主义工业化",
            "逐步实现农业的机械化",
            "逐步实现资本主义工商业的国有化",
            "逐步实现城乡人民公社化",
        ],
        "answer": 0,
        "hint": "总路线核心要义是“一化三改”，主体是工业化。",
        "explanation": "A正确。8.2.md：过渡时期总路线要在相当长的时期内逐步实现国家的社会主义工业化，并逐步实现三大改造。“一化”即社会主义工业化，是“一体两翼”中的主体。B是曾被否定的“先机械化后集体化”思路；C是已被否定的“一次性国有化”设想；D与过渡时期总路线无关。",
    },
    {
        "id": "q005", "type": "single_choice", "difficulty": "medium",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "思想演变的四个改变"},
        "stem": "从七届二中全会到过渡时期总路线提出，党在认识上发生的四个改变中，关于农业改造的正确变化是（　）。",
        "options": [
            "改变“先集体化后机械化”，改为先机械化后集体化",
            "改变“先机械化后集体化”，改为先集体化后机械化",
            "改变“先国有化后合作化”，改为先合作化后国有化",
            "改变“先合作化后国有化”，改为先国有化后合作化",
        ],
        "answer": 1,
        "hint": "第四个改变涉及农业上集体化与机械化的先后关系。",
        "explanation": "B正确。8.2.md四个改变之四：改变“先机械化后集体化”的主张，改为先集体化再机械化，同时采取积极引导、逐步过渡。A颠倒了正确变化方向；C、D用“国有化/合作化”表述，与原文“机械化/集体化”不符。",
    },
    {
        "id": "q006", "type": "single_choice", "difficulty": "basic",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "一体两翼"},
        "stem": "毛泽东将过渡时期总路线比喻为“一只鸟”。其中“两翼”是指（　）。",
        "options": [
            "国营经济与合作社经济",
            "对农业、手工业和资本主义工商业的社会主义改造",
            "社会主义工业化与国防现代化",
            "国家资本主义与个体经济",
        ],
        "answer": 1,
        "hint": "主体是工业化，两翼是三大改造。",
        "explanation": "B正确。8.2.md：主体是社会主义工业化（一化），两翼是对农业、手工业和资本主义工商业的社会主义改造（三改）。A是经济成分而非总路线两翼；C把工业化与国防现代化并列，与“一化三改”不符；D是经济成分分类，不是总路线结构。",
    },
    {
        "id": "q007", "type": "single_choice", "difficulty": "hard",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "斯大林经济模式"},
        "stem": "斯大林经济模式的三大特征不包括（　）。",
        "options": [
            "单一公有制",
            "指令性计划经济",
            "优先发展重工业",
            "以市场调节为主、计划为辅",
        ],
        "answer": 3,
        "hint": "斯大林模式是高度集中的计划体制，不是市场主导。",
        "explanation": "D正确（本题选“不包括”）。8.2.md：斯大林模式三大特征是单一公有制、指令性计划经济、优先发展重工业。D描述的是改革开放后的经济体制特征，不属于斯大林模式。A、B、C均为斯大林模式三大特征。",
    },
    {
        "id": "q008", "type": "single_choice", "difficulty": "medium",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "1952年底的关键转变"},
        "stem": "1952年底毛泽东判断“现在就开始进行社会主义改造”，重要依据之一是（　）。",
        "options": [
            "私营工业已占工业总产值的67%以上",
            "工业中国营经济比重已达67%，农业互助合作在老解放区达70%—80%",
            "个体经济比重已降至21.3%以下",
            "资本主义工商业已全部纳入公私合营",
        ],
        "answer": 1,
        "hint": "刘少奇1952年访苏报告中向斯大林汇报的数据。",
        "explanation": "B正确。8.2.md：1952年10月刘少奇访苏报告核心内容——工业中国营经济比重已达67%，农业互助合作在新解放区40%、老解放区70%—80%，斯大林予以肯定。A颠倒了国营与私营比重；C与78.7%私有经济比重矛盾；D是1956年底才基本完成的状况。",
    },
    # --- single review (7) ---
    {
        "id": "q009", "type": "single_choice", "difficulty": "basic",
        "source": "review", "sourceChapter": "ch05", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/5.2.md", "label": "新民主主义革命总路线"},
        "stem": "1948年毛泽东在晋绥干部会议上完整表述的新民主主义革命总路线是（　）。",
        "options": [
            "无产阶级领导的，人民大众的，反对帝国主义、封建主义和官僚资本主义的革命",
            "工人阶级领导的，以工农联盟为基础的，反帝反封建的革命",
            "资产阶级领导的，全民族联合的，反对帝国主义和封建主义的革命",
            "无产阶级领导的，农民为主体的，反对地主阶级和资产阶级的革命",
        ],
        "answer": 0,
        "hint": "总路线五个字：领导、动力、对象、性质、前途。",
        "explanation": "A正确。5.2.md：1948年晋绥干部会议完整表述为“无产阶级领导的，人民大众的，反对帝国主义、封建主义和官僚资本主义的革命”。B缺少官僚资本主义且表述不完整；C领导力量错误；D对象表述错误，新民主主义革命不是直接反对整个民族资产阶级。",
    },
    {
        "id": "q010", "type": "single_choice", "difficulty": "basic",
        "source": "review", "sourceChapter": "ch04", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/4.1.md", "label": "半殖民地半封建社会"},
        "stem": "毛泽东指出，认清中国社会的性质，就是认清中国的国情，乃是认清一切革命问题的基本依据。近代中国的基本国情是（　）。",
        "options": [
            "半殖民地半封建社会",
            "封建专制社会",
            "资本主义社会",
            "新民主主义社会",
        ],
        "answer": 0,
        "hint": "新民主主义社会是1949年后、改造完成前的过渡状态。",
        "explanation": "A正确。4.1.md开篇引用毛泽东论断，近代中国基本国情是半殖民地半封建社会。B是辛亥革命前帝制时代；C不符合中国未完成工业化的实际；D是1949年后向社会主义过渡的特定阶段，不是近代中国基本国情。",
    },
    {
        "id": "q011", "type": "single_choice", "difficulty": "medium",
        "source": "review", "sourceChapter": "ch07", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/7.1.md", "label": "统一战线的四个发展阶段"},
        "stem": "新民主主义革命时期，统一战线范围最广大的阶段是（　）。",
        "options": [
            "国民革命联合战线（1924—1927）",
            "工农民主统一战线（1927—1937）",
            "抗日民族统一战线（1937—1946）",
            "人民民主统一战线（1946—1949）",
        ],
        "answer": 3,
        "hint": "解放战争时期几乎除敌人外一切爱国力量都被团结。",
        "explanation": "D正确。7.1.md指出人民民主统一战线包括工人、农民、小资产阶级、民族资产阶级、各民主党派、开明绅士、少数民族和海外侨胞等，是四个阶段中范围最广大的。A、B、C各阶段联盟范围均小于解放战争时期。",
    },
    {
        "id": "q012", "type": "single_choice", "difficulty": "basic",
        "source": "review", "sourceChapter": "ch03", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/3.2.md", "label": "毛泽东思想的主要内容"},
        "stem": "贯穿毛泽东思想各个理论组成部分的活的灵魂，其三个基本方面是（　）。",
        "options": [
            "统一战线、武装斗争、党的建设",
            "实事求是、群众路线、独立自主",
            "理论联系实际、密切联系群众、批评与自我批评",
            "新民主主义革命、社会主义改造、社会主义建设",
        ],
        "answer": 1,
        "hint": "三大法宝与活的灵魂是不同概念。",
        "explanation": "B正确。3.2.md：毛泽东思想活的灵魂三个基本方面是实事求是、群众路线、独立自主。A是新民主主义革命三大法宝；C是党的三大优良作风；D是理论组成部分而非方法论原则。",
    },
    {
        "id": "q013", "type": "single_choice", "difficulty": "medium",
        "source": "review", "sourceChapter": "ch07", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/7.2.md", "label": "《湖南农民运动考察报告》"},
        "stem": "1927年毛泽东在《湖南农民运动考察报告》中回应“过分”指责时指出（　）。",
        "options": [
            "农民运动应当立即停止，以免破坏统一战线",
            "革命不是请客吃饭，是一个阶级推翻另一个阶级的暴烈行动",
            "农民运动的核心是和平请愿而非武装斗争",
            "地主阶级应当与农民平分土地以维持社会稳定",
        ],
        "answer": 1,
        "hint": "报告为农民运动正名，肯定其革命意义。",
        "explanation": "B正确。7.2.md引文：面对“过分”指责，毛泽东指出革命不是请客吃饭……革命是暴动，是一个阶级推翻另一个阶级的暴烈行动。A与报告精神相反；C与武装斗争道路不符；D不是报告主张。",
    },
    {
        "id": "q014", "type": "single_choice", "difficulty": "basic",
        "source": "review", "sourceChapter": "ch05", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/5.1.md", "label": "政治革命四要素"},
        "stem": "马克思主义分析政治革命的四个要素不包括（　）。",
        "options": ["革命主体", "革命条件", "革命形式", "革命纲领"],
        "answer": 3,
        "hint": "四要素：主体、条件、形式、结果。",
        "explanation": "D正确（选不包括）。5.1.md/4.2.md：政治革命四要素是革命主体、革命条件、革命形式、革命结果。革命纲领虽重要，但不是四要素框架中的独立要素。A、B、C均为四要素。",
    },
    {
        "id": "q015", "type": "single_choice", "difficulty": "hard",
        "source": "review", "sourceChapter": "ch07", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/7.3.md", "label": "三大优良作风"},
        "stem": "中国共产党在长期革命实践中形成的三大优良作风是（　）。",
        "options": [
            "实事求是、群众路线、独立自主",
            "理论联系实际、密切联系群众、批评与自我批评",
            "武装斗争、统一战线、党的建设",
            "调查研究、典型示范、国家帮助",
        ],
        "answer": 1,
        "hint": "作风建设与思想路线、活的灵魂要区分。",
        "explanation": "B正确。7.3.md：三大优良作风是理论联系实际、密切联系群众、批评与自我批评。A是毛泽东思想活的灵魂；C是三大法宝；D是农业合作化原则，与党的建设无关。",
    },
    # --- multiple current (5) ---
    {
        "id": "q016", "type": "multiple_choice", "difficulty": "basic",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.1.md", "label": "新民主主义社会的五种经济成分"},
        "stem": "新民主主义社会五种经济成分中，属于社会主义性质或带有社会主义因素的有（　）。",
        "options": ["国营经济", "合作社经济", "个体经济", "国家资本主义经济", "私人资本主义经济"],
        "answer": [0, 1, 3],
        "hint": "国家资本主义是向社会主义过渡的形式，合作社是半社会主义性质。",
        "explanation": "ABD正确。8.1.md：五种成分包括社会主义性质国营经济、半社会主义性质合作社经济、个体经济、私人资本主义、国家资本主义。国营经济属社会主义性质；合作社属半社会主义；国家资本主义是国家介入资本主义生产过程向社会主义过渡的形式。C个体经济、E私人资本主义属私有性质。",
    },
    {
        "id": "q017", "type": "multiple_choice", "difficulty": "medium",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.1.md", "label": "民族资产阶级的两面性"},
        "stem": "土地改革后，工人阶级与资产阶级矛盾具有双重属性，其根源在于民族资产阶级的两面性。下列体现其两面性的有（　）。",
        "options": [
            "拥护共产党领导、愿意接受社会主义改造",
            "追求利润最大化、存在行贿偷税等违法行为",
            "完全拒绝参与国家建设、铁板一块反对社会主义",
            "在“五反”运动中被纳入国营经济领导轨道",
            "与工人阶级矛盾只有对抗性、没有非对抗性",
        ],
        "answer": [0, 1, 3],
        "hint": "两面性决定矛盾既有对抗性也有非对抗性。",
        "explanation": "ABD正确。8.1.md：民族资产阶级既有合作性（拥护领导、接受改造），也有对抗性（唯利是图、五反中暴露违法行为）；五反后私营工商业被纳入国营经济领导轨道。C“铁板一块反对”与两面性不符；E否认非对抗性一面，与教材论述相反。",
    },
    {
        "id": "q018", "type": "multiple_choice", "difficulty": "basic",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "思想演变的四个改变"},
        "stem": "党在向社会主义过渡问题上的四个认识改变包括（　）。",
        "options": [
            "改变“先建设后过渡”，1953年即开始过渡",
            "改变“先工业化后改造”，改为同时并举",
            "改变“一次性国有化”，改为国家资本主义逐步过渡",
            "改变“先集体化后机械化”，改为先机械化后集体化",
            "改变“先机械化后集体化”，改为先集体化后机械化",
        ],
        "answer": [0, 1, 2, 4],
        "hint": "第四个改变是集体化与机械化先后关系的调整。",
        "explanation": "ABCE正确。8.2.md明确列出四个改变，D与第四个改变方向相反。",
    },
    {
        "id": "q019", "type": "multiple_choice", "difficulty": "medium",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "三反五反运动"},
        "stem": "1951—1952年开展的三反、五反运动中，下列表述正确的有（　）。",
        "options": [
            "三反在党政机关内部开展，内容是反贪污、反浪费、反官僚主义",
            "五反在资本主义工商业中开展，重点打击不法投机商人",
            "三反典型案例包括刘青山、张子善被依法处决",
            "五反内容是反贪污、反浪费、反官僚主义",
            "三反在五反之后才开始",
        ],
        "answer": [0, 1, 2],
        "hint": "三反针对机关，五反针对工商界，内容不同。",
        "explanation": "ABC正确。8.2.md：三反1951年底在机关开展，反贪污浪费官僚主义，刘青山张子善被处决；五反1952年初在工商界开展，反行贿、偷税漏税等，重点打击不法投机商人。D把三反内容套到五反；E时间顺序教材未作“五反先于三反”的表述，且三反1951年底、五反1952年初，D内容本身错误。",
    },
    {
        "id": "q020", "type": "multiple_choice", "difficulty": "hard",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "个体农业暴露的三大问题"},
        "stem": "土地改革后个体小农经济暴露的严重问题包括（　）。",
        "options": [
            "缺少男劳动力的家庭耕种困难，出现两极分化苗头",
            "无力进行大规模农田水利建设",
            "无力购买新式农具和抵御自然灾害",
            "已能为城市工业化提供大量稳定的生产资料",
            "与国营经济矛盾已完全消失",
        ],
        "answer": [0, 1, 2],
        "hint": "个体农业的分散性正是三大改造的现实依据之一。",
        "explanation": "ABC正确。8.2.md列举个体农业三大问题：劳动力缺乏导致两极分化；无力搞大规模水利（东荆河、红旗渠需集体合作）；无力购新式农具和抗灾。D与“个体农业无法为城市工业化提供大量稳定生产资料”相反；E与工人阶级和资产阶级矛盾显现的论述不符。",
    },
    # --- multiple review (5) ---
    {
        "id": "q021", "type": "multiple_choice", "difficulty": "basic",
        "source": "review", "sourceChapter": "ch04", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/4.2.md", "label": "政治革命四要素"},
        "stem": "运用马克思主义政治革命四要素分析框架，下列配对正确的有（　）。",
        "options": [
            "法国大革命——革命主体是资产阶级",
            "俄国十月革命——革命主体是无产阶级",
            "辛亥革命——革命结果是建立了工人阶级专政的社会主义国家",
            "1917年俄国——革命形式主要是武装斗争",
            "法国大革命——革命条件是反对封建专制主义",
        ],
        "answer": [0, 1, 3, 4],
        "hint": "辛亥革命建立的是资产阶级性质政权，不是社会主义国家。",
        "explanation": "ABDE正确。4.2.md/5.1.md：法国大革命主体是资产阶级，条件是反封建专制；十月革命主体是无产阶级，形式是武装斗争。C错误——辛亥革命结果是南京国民政府，实质是地主大资产阶级专政，非社会主义国家。",
    },
    {
        "id": "q022", "type": "multiple_choice", "difficulty": "medium",
        "source": "review", "sourceChapter": "ch07", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/7.1.md", "label": "两个联盟"},
        "stem": "新民主主义革命时期统一战线的两个联盟，下列表述正确的有（　）。",
        "options": [
            "第一个联盟是工人阶级同农民阶级、知识分子及其他劳动者的联盟",
            "第一个联盟是统一战线的基础性联盟",
            "第二个联盟是工人阶级同非劳动人民的联盟，主要指同民族资产阶级的联盟",
            "第二个联盟是可有可无的辅助联盟",
            "两个联盟相互促进、不可分割",
        ],
        "answer": [0, 1, 2, 4],
        "hint": "第二个联盟被教材称为“必不可少”。",
        "explanation": "ABCE正确。7.1.md：第一个联盟是工农知识分子联盟，属基础性联盟；第二个联盟是工人阶级与非劳动人民（主要是民族资产阶级）的联盟，属必不可少联盟；两者相互促进。D“可有可无”与“必不可少”直接矛盾。",
    },
    {
        "id": "q023", "type": "multiple_choice", "difficulty": "basic",
        "source": "review", "sourceChapter": "ch03", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/3.2.md", "label": "马克思主义中国化时代化的内涵"},
        "stem": "马克思主义中国化时代化内涵包括（　）。",
        "options": [
            "运用马克思主义立场观点方法分析和解决中国实际问题",
            "将中国革命建设改革经验提升为中国化的马克思主义理论",
            "将马克思主义植根于中华民族优秀文化沃土",
            "完全抛弃中国传统文化，全盘西化",
            "把马克思主义当作一成不变的教条",
        ],
        "answer": [0, 1, 2],
        "hint": "“两个结合”是准确把握内涵的关键。",
        "explanation": "ABC正确。3.2.md三层含义：与中国实际相结合、形成中国化理论、与优秀传统文化相结合。D与“两个结合”相悖；E与“不能把马克思主义当作僵化教条”的论述相反。",
    },
    {
        "id": "q024", "type": "multiple_choice", "difficulty": "medium",
        "source": "review", "sourceChapter": "ch05", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/5.2.md", "label": "革命对象：三座大山"},
        "stem": "中国新民主主义革命的对象——“三座大山”包括（　）。",
        "options": ["帝国主义", "封建主义", "官僚资本主义", "民族资本主义", "小资产阶级"],
        "answer": [0, 1, 2],
        "hint": "民族资产阶级是革命动力之一，不是革命对象。",
        "explanation": "ABC正确。5.2.md：革命对象是帝国主义、封建主义、官僚资本主义三座大山。D民族资产阶级具有两面性，是团结对象；E小资产阶级是革命动力组成部分。",
    },
    {
        "id": "q025", "type": "multiple_choice", "difficulty": "hard",
        "source": "review", "sourceChapter": "ch07", "points": 2,
        "sourceRef": {"path": "content/maogai/detail/7.3.md", "label": "思想建设"},
        "stem": "关于党的建设，下列表述正确的有（　）。",
        "options": [
            "思想建设是党的建设的首要任务",
            "思想建设核心是用马克思列宁主义武装全党，克服非无产阶级思想",
            "“支部建在连上”是三湾改编的重要组织创新",
            "三大法宝中，党的组织是掌握统一战线和武装斗争武器的“英勇战士”",
            "思想建设可以取代组织建设和作风建设",
        ],
        "answer": [0, 1, 2, 3],
        "hint": "思想、组织、作风三方面建设相辅相成。",
        "explanation": "ABCD正确。7.3.md：思想建设首位，核心是马列主义武装全党；三湾改编“支部建在连上”；《〈共产党人〉发刊词》比喻党是掌握两武器的战士。E错误——三方面建设不可相互取代。",
    },
    # --- essays ---
    {
        "id": "q026", "type": "essay", "difficulty": "basic", "label": "简答题",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 10, "total_points": 10,
        "sourceRef": {"path": "content/maogai/detail/8.1.md", "label": "农业合作化的三个发展阶段"},
        "stem": "简述新民主主义社会五种经济成分的内容，并说明按性质分类后各类经济的比重及其意义。",
        "answer": "五种经济成分：①社会主义性质国营经济；②半社会主义性质合作社经济；③农民和手工业者个体经济；④私人资本主义经济；⑤国家资本主义经济。按性质分类：社会主义性质（含国营、合作社、公私合营）占21.3%；资本主义性质占6.9%；个体私有性质占71.8%。个体与资本主义合计78.7%，私有制仍占绝对优势，说明新民主主义社会在经济上是“混合体”，不是稳定自洽的独立社会形态，必须通过社会主义改造将私有性质经济逐步转变为公有性质经济。",
        "hint": "先列五种成分，再给出三类比重数据，最后点明过渡性含义。",
        "explanation": "本题考查8.1.md核心定义与数据。五种成分及其对应阶级力量是高频考点；78.7%私有经济比重是理解“为什么必须改造”的关键数据。",
        "scoring_criteria": [
            "正确列出五种经济成分（3分）",
            "正确给出三类性质比重数据（4分）",
            "阐明私有经济占优势和过渡改造任务（3分）",
        ],
    },
    {
        "id": "q027", "type": "essay", "difficulty": "medium", "label": "简答题",
        "source": "review", "sourceChapter": "ch04", "points": 10, "total_points": 10,
        "sourceRef": {"path": "content/maogai/detail/4.1.md", "label": "半殖民地半封建社会"},
        "stem": "简述近代中国半殖民地半封建社会的含义，并各举一点具体表现。",
        "answer": "半殖民地：帝国主义通过不平等条约操纵中国财政经济命脉和政治军事力量，中国长期处于多个帝国主义统治和半统治之下，没有完全主权和统一国家。半封建：封建帝制虽被推翻，但封建剥削制度根基未铲除，地主阶级仍占相当财富和权力，并与买办资本、高利贷资本结合。表现示例：半殖民地——外国银行垄断金融、海关实际由外国人控制；半封建——地主对农民剥削依旧，军阀官僚统治取代帝制。",
        "hint": "分别从“半殖民地”“半封建”两个概念作答，各配一例。",
        "explanation": "4.1.md是理解中国革命逻辑的起点。半殖民地半封建国情决定了中国革命必须反帝反封建，也为理解新民主主义社会向社会主义过渡的历史必然性提供背景。",
        "scoring_criteria": [
            "准确解释半殖民地含义（3分）",
            "准确解释半封建含义（3分）",
            "各举一点具体表现（4分）",
        ],
    },
    {
        "id": "q028", "type": "essay", "difficulty": "medium", "label": "论述题",
        "source": "current_chapter", "sourceChapter": "ch08", "points": 15, "total_points": 15,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "因果分析：一体两翼的内在逻辑"},
        "stem": "结合教材内容，论述过渡时期总路线“一化三改”中工业化与三大改造之间的内在逻辑关系。",
        "answer": "过渡时期总路线“一体两翼”中，社会主义工业化是主体，对农业、手工业和资本主义工商业的改造是两翼，二者是有机整体而非并列任务。逻辑链条：优先发展重工业的工业化需要大量资金和生产资料→国家必须把分散在个体农民和资本家手中的财富集中起来→三大改造实质是变私有为公有→国家掌握财富后可有计划地组织生产、优先投入重工业→推动自上而下工业化→生产更多工农业产品，满足人民需要、增强国防、巩固政权。教材引毛泽东论述：只有完成私有制到社会主义公有制的过渡，才利于生产力迅速发展、满足人民需要、增强国防、巩固人民政权。若只搞工业化不搞改造，或改造与工业化速度不相适应，工业化将遇到极大困难。",
        "hint": "从“为什么工业化需要改造”和“改造如何服务于工业化”两条线展开。",
        "explanation": "8.2.md“因果分析：一体两翼的内在逻辑”是本章论述题核心。答题须体现资金—生产资料—公有化—计划工业化之间的链条，并引用教材关于两者“紧密联系、相辅相成”的论述。",
        "scoring_criteria": [
            "阐明“一体两翼”结构与各自定位（3分）",
            "论证工业化对资金和生产资料的需求（4分）",
            "说明三大改造“变私有为公有”的作用（4分）",
            "总结二者相辅相成及忽视改造的后果（4分）",
        ],
    },
    {
        "id": "q029", "type": "essay", "difficulty": "hard", "label": "材料分析题",
        "source": "review", "sourceChapter": "ch08", "points": 15, "total_points": 15,
        "sourceRef": {"path": "content/maogai/detail/8.2.md", "label": "开国大典的\"万国牌武器展览会\""},
        "stem": "阅读材料，回答问题。\n\n材料：1949年10月1日开国大典上，受阅部队装备来自24个国家的98家工厂，天上飞的飞机只有21架，其中9架来回飞了两趟。毛泽东1954年指出：“现在我们能造什么？……一辆汽车、一架飞机、一辆坦克、一辆拖拉机都造不出来。”\n\n（1）材料反映了新中国成立初期怎样的工业状况？（5分）\n（2）这一状况与1953年提出过渡时期总路线有何内在联系？（10分）",
        "answer": "（1）反映新中国工业基础极其薄弱：现代工业仅占国民经济约10%，90%是农业和手工业；国防装备依赖外国，不能自主制造汽车、飞机、坦克、拖拉机等关键工业品，工业化水平远低于发达国家。（2）内在联系：工业落后使实现民族独立后的国家面临“由农业国变工业国”的紧迫任务；七届二中全会已提出稳步实现工业化，1953年总路线以社会主义工业化为“主体”，一五计划集中156项苏联援建重工业项目，体现优先发展重工业战略。工业化的紧迫性要求尽快集中全国资源，而三大改造正是通过变私有为公有使国家掌握财富和生产资料，为一化提供物质条件。抗美援朝后毛泽东判断有15年左右和平建设窗口，进一步推动了1953年即开始“一化三改”。",
        "hint": "先概括“一穷二白”的工业现实，再联系总路线提出背景与一体两翼逻辑。",
        "explanation": "材料出自8.2.md“新中国的工业基础”和“开国大典万国牌”事例。分析题需将具体材料上升到“工业化紧迫性→总路线→三大改造服务工业化”的理论高度。",
        "scoring_criteria": [
            "准确概括工业基础薄弱状况（5分）",
            "联系工业化紧迫性与总路线提出（5分）",
            "阐明改造为工业化创造条件的逻辑（5分）",
        ],
    },
]

from gen_maogai_quiz_data_ch09 import CH09
from gen_maogai_quiz_data_ch10_11 import CH10, CH11
from gen_maogai_quiz_data_ch12 import CH12


def validate_chapter(chapter_id, questions):
    assert len(questions) == 29, f"{chapter_id}: expected 29 questions, got {len(questions)}"
    singles = [q for q in questions if q["type"] == "single_choice"]
    multiples = [q for q in questions if q["type"] == "multiple_choice"]
    essays = [q for q in questions if q["type"] == "essay"]
    assert len(singles) == 15, f"{chapter_id}: singles={len(singles)}"
    assert len(multiples) == 10, f"{chapter_id}: multiples={len(multiples)}"
    assert len(essays) == 4, f"{chapter_id}: essays={len(essays)}"
    total = sum(q.get("points", q.get("total_points", 0)) for q in questions)
    assert total == 100, f"{chapter_id}: total points={total}"
    for q in questions:
        if q["type"] in ("single_choice", "multiple_choice"):
            assert q["points"] == 2
        if q["type"] == "essay":
            assert "label" in q and "scoring_criteria" in q and "total_points" in q


if __name__ == "__main__":
    for cid, qs in [
        ("ch08", CH08),
        ("ch09", CH09),
        ("ch10", CH10),
        ("ch11", CH11),
        ("ch12", CH12),
    ]:
        validate_chapter(cid, qs)
        write_chapter(cid, qs)
    print("Done.")
