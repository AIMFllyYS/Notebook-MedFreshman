#!/usr/bin/env python3
"""Generate physics study-guide example files for chapters 1-4."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "content" / "examples" / "physics"


def next_num(ch: str, section: str) -> int:
    d = OUT / f"ch{ch}" / section
    if not d.exists():
        return 1
    nums = []
    for p in d.glob("EX*.md"):
        m = re.match(r"EX(\d+)_", p.name)
        if m:
            nums.append(int(m.group(1)))
    return max(nums, default=0) + 1


def write_example(ch: str, section: str, num: int, slug: str, label: str, question: str, solution: str, answer: str) -> Path:
    d = OUT / f"ch{ch}" / section
    d.mkdir(parents=True, exist_ok=True)
    nn = f"{num:02d}"
    path = d / f"EX{nn}_{slug}.md"
    content = f""":::example{{label={label}}}
**题目**：{question.strip()}

**解**：
{solution.strip()}

**答案**：{answer.strip()}
:::
"""
    path.write_text(content, encoding="utf-8")
    return path


def gen_ch01() -> list[Path]:
    s = "1.1"
    files: list[Path] = []
    n = 0

    items = [
        ("圆周运动路程速度", "质点在半径 $R=1.00\\,\\mathrm{m}$ 的圆周上顺时针运动，开始时在 $A$ 点。路程与时间关系 $s=\\pi t^{2}+\\pi t$（$s$ 单位 m，$t$ 单位 s）。求：(1) 绕圆一周的路程、位移、平均速度、平均速率；(2) $t=1\\,\\mathrm{s}$ 时的瞬时速度、瞬时速率、瞬时加速度。",
         "（1）绕一周路程 $s=2\\pi R=6.28\\,\\mathrm{m}$，位移为 $0$。由 $2\\pi R=\\pi t^{2}+\\pi t$ 得 $t^{2}+t-2=0$，$t=1\\,\\mathrm{s}$（舍负根）。平均速度 $\\bar{v}=0$，平均速率 $\\bar{v}=2\\pi R/t=6.28\\,\\mathrm{m/s}$。\n\n（2）$v=\\dfrac{\\mathrm{d}s}{\\mathrm{d}t}=(2t+1)\\pi$，$t=1\\,\\mathrm{s}$ 时速率 $v=9.42\\,\\mathrm{m/s}$，方向沿切线。切向加速度 $a_t=\\dfrac{\\mathrm{d}v}{\\mathrm{d}t}=2\\pi=6.28\\,\\mathrm{m/s^2}$；法向 $a_n=v^{2}/R=88.74\\,\\mathrm{m/s^2}$。合加速度 $a=\\sqrt{a_t^{2}+a_n^{2}}=88.96\\,\\mathrm{m/s^2}$，与切线夹角 $\\theta=\\arcsin(a_t/a)\\approx4^{\\circ}$。",
         "(1) 路程 $6.28\\,\\mathrm{m}$，位移 $0$，平均速度 $0$，平均速率 $6.28\\,\\mathrm{m/s}$；(2) 速率 $9.42\\,\\mathrm{m/s}$，$a_t=6.28\\,\\mathrm{m/s^2}$，$a_n=88.74\\,\\mathrm{m/s^2}$，$a=88.96\\,\\mathrm{m/s^2}$"),
        ("飞机相对风往返", "飞机由 $A$ 向东飞到 $B$ 再向西回到 $A$，相对空气速率恒为 $v'$，空气相对地面速率为 $u$，$AB$ 距离为 $l$。求下列三种情况往返时间：(1) 空气静止；(2) 空气向东；(3) 空气向北。",
         "速度合成 $\\boldsymbol{v}=\\boldsymbol{v}'+\\boldsymbol{u}$。\n\n(1) $u=0$，$t_1=2l/v'$。\n\n(2) 向东 $v_{AB}=v'+u$，向西 $v_{BA}=v'-u$，$t_2=l/(v'+u)+l/(v'-u)=\\dfrac{2l}{v'}\\dfrac{1}{1-(u/v')^{2}}$。\n\n(3) 对地速度大小 $v=\\sqrt{v'^{2}-u^{2}}$，$t_3=2l/v=\\dfrac{2l}{v'}\\dfrac{1}{\\sqrt{1-(u/v')^{2}}}$。",
         "$t_1=2l/v'$；$t_2=\\dfrac{2l}{v'[1-(u/v')^{2}]}$；$t_3=\\dfrac{2l}{v'\\sqrt{1-(u/v')^{2}}}$"),
        ("圆锥摆张力速率", "质量 $m$ 的小球在铅直面内绕 $O$ 做半径 $R$ 圆周运动，$t=0$ 在最低点初速 $v_0$。求：(1) 速率与位置关系；(2) 任一点绳张力与速率关系。",
         "切向：$-mg\\sin\\theta=m\\dfrac{\\mathrm{d}v}{\\mathrm{d}t}$；法向：$T-mg\\cos\\theta=m\\dfrac{v^{2}}{R}$。\n\n由 $\\dfrac{\\mathrm{d}v}{\\mathrm{d}t}=\\dfrac{v}{R}\\dfrac{\\mathrm{d}v}{\\mathrm{d}\\theta}$ 得 $v\\,\\mathrm{d}v=-Rg\\sin\\theta\\,\\mathrm{d}\\theta$，积分并利用 $\\theta=0$ 时 $v=v_0$：\n$$v^{2}-v_0^{2}=2gR(\\cos\\theta-1)$$\n又 $mg\\cos\\theta=mg+\\dfrac{v^{2}-v_0^{2}}{2R}$，代入法向方程得\n$$T=mg+\\dfrac{m(3v^{2}-v_0^{2})}{2R}$$",
         "$v^{2}=v_0^{2}+2gR(\\cos\\theta-1)$；$T=mg+\\dfrac{m(3v^{2}-v_0^{2})}{2R}$"),
        ("弯管水流动量", "水管弯成 $90^{\\circ}$，水流量 $Q=3\\times10^{3}\\,\\mathrm{kg/s}$，流速 $v=10\\,\\mathrm{m/s}$。求水流对弯管压力的大小和方向。",
         "在 $\\Delta t$ 内动量变化 $\\Delta\\boldsymbol{p}=\\Delta m(\\boldsymbol{v}_{A'}-\\boldsymbol{v}_A)$，$|\\boldsymbol{v}_{A'}-\\boldsymbol{v}_A|=\\sqrt{2}\\,v$。\n\n由动量定理 $\\boldsymbol{F}=\\Delta\\boldsymbol{p}/\\Delta t$，大小\n$$F=\\dfrac{\\Delta m\\sqrt{2}v}{\\Delta t}=\\sqrt{2}\\,Qv=4.24\\times10^{4}\\,\\mathrm{N}$$\n方向沿 $90^{\\circ}$ 弯曲的角平分线向外。",
         "$F=4.24\\times10^{4}\\,\\mathrm{N}$，沿弯管角平分线向外"),
        ("斜面弹簧劲度", "质量 $2\\,\\mathrm{kg}$ 物体以 $3.0\\,\\mathrm{m/s}$ 初速从斜面 $A$ 滑下，摩擦力 $6.2\\,\\mathrm{N}$，到 $B$ 压缩弹簧 $0.2\\,\\mathrm{m}$ 后停止并弹回。斜面倾角 $30^{\\circ}$，$AB=5.0\\,\\mathrm{m}$，$g=10\\,\\mathrm{m/s^2}$。求弹簧劲度系数及弹回最大高度。",
         "压缩过程（$O$ 为重力势能零点，$B$ 为弹性势能零点）：\n$$-fx_A-\\tfrac12 kx_B^{2}=0-\\tfrac12 mv_A^{2}-mgx_A\\sin30^{\\circ}$$\n得 $k\\approx1.4\\times10^{3}\\,\\mathrm{N/m}$。\n\n弹回过程：\n$$-fx+\\tfrac12 kx_B^{2}=mgx\\sin30^{\\circ}$$\n$x=1.7\\,\\mathrm{m}$，最大高度 $h=x\\sin30^{\\circ}=0.85\\,\\mathrm{m}=85\\,\\mathrm{cm}$。",
         "$k\\approx1.4\\times10^{3}\\,\\mathrm{N/m}$；弹回最大高度 $85\\,\\mathrm{cm}$"),
        ("转椅角动量守恒", "人手握哑铃两臂水平伸直，系统对竖直轴转动惯量 $J_1=2\\,\\mathrm{kg\\cdot m^2}$，初角速度 $\\omega_1=1.57\\,\\mathrm{rad/s}$；两臂收回后 $J_2=0.80\\,\\mathrm{kg\\cdot m^2}$。求 $\\omega_2$、机械能是否守恒及内力做功。",
         "外力矩为零，角动量守恒：$J_1\\omega_1=J_2\\omega_2$，\n$$\\omega_2=\\dfrac{J_1\\omega_1}{J_2}=\\dfrac{2\\times1.57}{0.8}=3.93\\,\\mathrm{rad/s}$$\n机械能不守恒，臂力做功\n$$A=\\tfrac12 J_2\\omega_2^{2}-\\tfrac12 J_1\\omega_1^{2}=3.72\\,\\mathrm{J}$$",
         "$\\omega_2=3.93\\,\\mathrm{rad/s}$；机械能不守恒；内力做功 $3.72\\,\\mathrm{J}$"),
        ("滑轮系统加速度", "轻绳跨光滑定滑轮，两端挂 $m_1$、$m_2$（$m_1<m_2$），滑轮为均匀圆盘，质量 $m$、半径 $r$，绳不打滑。求物块加速度、滑轮角加速度及绳张力。",
         "对 $m_1$：$T_1-m_1g=m_1a$；对 $m_2$：$m_2g-T_2=m_2a$；对滑轮：$(T_2-T_1)r=J\\alpha$，$a=r\\alpha$，$J=\\tfrac12 mr^{2}$。\n\n联立得\n$$a=\\dfrac{(m_2-m_1)g}{m_1+m_2+\\tfrac12 m},\\quad \\alpha=\\dfrac{a}{r}$$\n$$T_1=\\dfrac{2m_1m_2+\\tfrac12 m_1 m}{m_1+m_2+\\tfrac12 m}g,\\quad T_2=\\dfrac{2m_1m_2+\\tfrac12 m_2 m}{m_1+m_2+\\tfrac12 m}g$$",
         "见解答各式"),
        ("棒球完全弹性碰", "均匀细直棒（$M,L$）绕一端水平轴无摩擦转动，原竖直静止。质量 $m$ 小球水平速 $v_0$ 碰棒下端，完全弹性碰撞后棒摆起 $\\theta=30^{\\circ}$。求 (1) $v_0$；(2) 小球所受冲量。",
         "碰撞时角动量守恒：$mv_0l=J\\omega+mlv$，$J=\\tfrac13 Ml^{2}$。\n\n完全弹性：$\\tfrac12 mv_0^{2}=\\tfrac12 J\\omega^{2}+\\tfrac12 mv^{2}$。\n\n摆起：$\\tfrac12 J\\omega^{2}=\\tfrac12 Mgl(1-\\cos30^{\\circ})$，得 $\\omega=\\sqrt{\\dfrac{3g}{l}(1-\\dfrac{\\sqrt3}{2})}$。\n\n解得 $v_0=\\dfrac{(M+3m)\\sqrt{gl}}{12m}\\sqrt{6(2-\\sqrt3)}$。\n\n冲量 $I=mv-mv_0=-\\dfrac{M\\sqrt{gl}}{6}\\sqrt{6(2-\\sqrt3)}$。",
         "$v_0=\\dfrac{(M+3m)\\sqrt{gl}}{12m}\\sqrt{6(2-\\sqrt3)}$；$I=-\\dfrac{M\\sqrt{gl}}{6}\\sqrt{6(2-\\sqrt3)}$"),
        ("金属丝杨氏模量", "8 m 铜丝与 4 m 钢丝横截面积均为 $50\\,\\mathrm{mm^2}$，加 500 N 张力，求总伸长量。（铜 $Y_1=1.1\\times10^{11}$，钢 $Y_2=2.0\\times10^{11}\\,\\mathrm{N/m^2}$）",
         "$S=0.5\\times10^{-4}\\,\\mathrm{m^2}$。\n$$\\Delta l_1=\\dfrac{l_1F}{Y_1S}=7.3\\times10^{-4}\\,\\mathrm{m},\\quad \\Delta l_2=\\dfrac{l_2F}{Y_2S}=2.0\\times10^{-4}\\,\\mathrm{m}$$\n$$\\Delta l=\\Delta l_1+\\Delta l_2=9.3\\times10^{-4}\\,\\mathrm{m}$$",
         "$\\Delta l=9.3\\times10^{-4}\\,\\mathrm{m}$"),
        ("弹跳蛋白杨氏模量", "截面积 $30\\,\\mathrm{cm^2}$ 的弹跳蛋白在 270 N 拉力下长度变为原长 1.5 倍，求杨氏模量。",
         "$\\varepsilon=\\Delta l/l_0=0.5$，$\\sigma=F/S=9\\times10^{4}\\,\\mathrm{Pa}$，\n$$Y=\\sigma/\\varepsilon=1.8\\times10^{5}\\,\\mathrm{N/m^2}$$",
         "$Y=1.8\\times10^{5}\\,\\mathrm{N/m^2}$"),
    ]
    for slug, q, sol, ans in items:
        n += 1
        files.append(write_example("01", s, n, slug, slug[:15], q, sol, ans))

    # 习题 1-7 ~ 1-17, 自我评估 — abbreviated keys in second batch via helper
    more = _ch01_exercises()
    for slug, label, q, sol, ans in more:
        n += 1
        files.append(write_example("01", s, n, slug, label[:15], q, sol, ans))
    return files


def _ch01_exercises() -> list[tuple[str, str, str, str, str]]:
    return [
        ("球落地恢复系数", "球落地恢复系数", "1 kg 球从 31.89 m 高静止落下，弹回 20 m，$g=9.8\\,\\mathrm{m/s^2}$。求 (1) 恢复系数；(2) 碰撞冲量；(3) 接触 0.02 s 时地板平均作用力。",
         "(1) $v_{10}=\\sqrt{2gh_1}=25\\,\\mathrm{m/s}$，$v_1=\\sqrt{2gh_2}=19.8\\,\\mathrm{m/s}$，$e=v_1/v_{10}\\approx0.8$。\n(2) $I=m(v_1+v_{10})=44.8\\,\\mathrm{N\\cdot s}$。\n(3) $\\bar F=mg+(mv_1-mv_{10})/\\Delta t=2249.8\\,\\mathrm{N}$。",
         "$e\\approx0.8$；$I=44.8\\,\\mathrm{N\\cdot s}$；$\\bar F=2249.8\\,\\mathrm{N}$"),
        ("抽水机做功时间", "抽水机做功", "蓄水池底面积 $S=50\\,\\mathrm{m^2}$，水深 $h=1.5\\,\\mathrm{m}$，水面低于地面 $h_0=5.0\\,\\mathrm{m}$。将水全部抽到地面需作多少功？水泵效率 $\\eta=80\\%$，功率 $N=35\\,\\mathrm{kW}$，需时多少？",
         "元功 $\\mathrm{d}A=\\rho gSx\\,\\mathrm{d}x$，\n$$A=\\int_{h_0}^{h+h_0}\\rho gSx\\,\\mathrm{d}x=\\tfrac12\\rho gS[(h+h_0)^{2}-h_0^{2}]=4.23\\times10^{6}\\,\\mathrm{J}$$\n$$\\Delta t=A/(\\eta N)=1.5\\times10^{2}\\,\\mathrm{s}$$",
         "$A=4.23\\times10^{6}\\,\\mathrm{J}$；$\\Delta t=150\\,\\mathrm{s}$"),
        ("圆环转动惯量", "圆环转动惯量", "求质量 $m$、半径 $R$ 均匀薄圆环对通过圆心且垂直环面轴的转动惯量。",
         "$\\mathrm{d}m=\\dfrac{m}{2\\pi R}\\mathrm{d}l$，$\\mathrm{d}J=R^{2}\\mathrm{d}m$，\n$$J=\\int_0^{2\\pi R}R^{2}\\mathrm{d}m=mR^{2}$$",
         "$J=mR^{2}$"),
        ("子弹射入直棒", "子弹射入直棒", "长 $l$、质量 $M$ 均匀直棒绕上端光滑轴竖直静止。质量 $m$ 子弹以 $v_0$ 水平射入棒下端不复出。求 (1) 共同角速度；(2) 最大摆角。",
         "$J=ml^{2}+\\tfrac13 Ml^{2}$。角动量守恒 $mv_0l=J\\omega$，\n$$\\omega=\\dfrac{3mv_0}{(M+3m)l}$$\n机械能守恒：$\\tfrac12 J\\omega^{2}=mgl(1-\\cos\\theta)+Mg\\dfrac{l}{2}(1-\\cos\\theta)$，\n$$\\theta=\\arccos\\left\\{1-\\dfrac{3m^{2}v_0^{2}}{(3m+M)(2m+M)gl}\\right\\}$$",
         "$\\omega=\\dfrac{3mv_0}{(M+3m)l}$；$\\theta=\\arccos\\left\\{1-\\dfrac{3m^{2}v_0^{2}}{(3m+M)(2m+M)gl}\\right\\}$"),
        ("腿骨缩短量", "腿骨缩短", "腿骨长 0.5 m，横截面积 $3\\,\\mathrm{cm^2}$，体重 600 N 由两腿支持，杨氏模量 $10^{10}\\,\\mathrm{N/m^2}$。求每条腿骨缩短量。",
         "$\\sigma=F/(2S)=10^{6}\\,\\mathrm{Pa}$，$\\varepsilon=\\sigma/Y=10^{-4}$，$\\Delta l=\\varepsilon l_0=5\\times10^{-5}\\,\\mathrm{m}$。",
         "$\\Delta l=5\\times10^{-5}\\,\\mathrm{m}$"),
        ("螺栓正应变应力", "螺栓应变应力", "低碳钢螺栓受力段长 120 mm，拧紧后伸长 0.04 mm，$Y=196\\times10^{9}\\,\\mathrm{N/m^2}$。求正应变和正应力。",
         "$\\varepsilon=0.04/120=3.33\\times10^{-4}$，$\\sigma=Y\\varepsilon=6.53\\times10^{7}\\,\\mathrm{N/m^2}$。",
         "$\\varepsilon=3.33\\times10^{-4}$；$\\sigma=6.53\\times10^{7}\\,\\mathrm{N/m^2}$"),
        ("圆柱扭转切应力", "圆柱扭转", "实心圆柱 $d=10\\,\\mathrm{cm}$，$l=2\\,\\mathrm{m}$，扭矩 $M=10^{4}\\,\\mathrm{N\\cdot m}$，$G=8\\times10^{10}\\,\\mathrm{N/m^2}$。求扭转角及最大切应力。",
         "$\\delta=\\dfrac{2lM}{\\pi G(d/2)^{4}}=0.0255\\,\\mathrm{rad}$；$\\tau_{\\max}=\\dfrac{2M}{\\pi a^{3}}=5.1\\times10^{7}\\,\\mathrm{N/m^2}$。",
         "$\\delta=0.0255\\,\\mathrm{rad}$；$\\tau_{\\max}=5.1\\times10^{7}\\,\\mathrm{N/m^2}$"),
        ("正方体切变位移", "正方体切变", "边长 0.02 m 正方体两相对面各加大小相等反向切向力 $9.8\\times10^{2}\\,\\mathrm{N}$，切变模量 $4.9\\times10^{7}\\,\\mathrm{N/m^2}$。求相对位移。",
         "$\\tau=F/S=2.45\\times10^{6}\\,\\mathrm{Pa}$，$\\varphi=\\tau/G=0.05\\,\\mathrm{rad}$，$\\Delta x=d\\varphi=0.001\\,\\mathrm{m}$。",
         "$\\Delta x=0.001\\,\\mathrm{m}$"),
        ("中子弹性碰撞", "中子动能损失", "质量 $m$ 中子与质量 $M$ 静止原子核弹性对心碰撞，中子初动能 $E_0$，求中子动能损失最大值。",
         "由动量、能量守恒得 $v_2=\\dfrac{2mMv_{10}}{M(M+m)}$，最大损失\n$$\\Delta E_1=\\tfrac12 Mv_2^{2}=\\dfrac{4mME_0}{(m+M)^{2}}$$",
         "$\\Delta E_{\\max}=\\dfrac{4mME_0}{(m+M)^{2}}$"),
        ("人船质心守恒", "人船质心", "$m_1=50\\,\\mathrm{kg}$ 人站在 $m_2=200\\,\\mathrm{kg}$、$L=4\\,\\mathrm{m}$ 船头，船静止。人走到船尾时船移动距离？",
         "质心水平位置不变：$m_1L+m_2\\cdot0=m_1\\cdot0+m_2(L+S)$，$S=-\\dfrac{m_1}{m_1+m_2}L=-0.8\\,\\mathrm{m}$（船后退 0.8 m）。",
         "船后退 $0.8\\,\\mathrm{m}$"),
        ("非对心弹性碰撞", "非对心弹性碰", "质量 $m$、速率 $6.0\\times10^{7}\\,\\mathrm{m/s}$ 的 A 与静止、质量 $m/2$ 的 B 非对心弹性碰撞，碰后 A 速率 $5.0\\times10^{7}\\,\\mathrm{m/s}$。求 B 速率及偏角、A 偏角。",
         "由动量、能量守恒（二维）解得：B 速率 $4.7\\times10^{7}\\,\\mathrm{m/s}$，与 A 初方向成 $54.1^{\\circ}$；A 偏角 $22.4^{\\circ}$。",
         "B：$4.7\\times10^{7}\\,\\mathrm{m/s}$，$54.1^{\\circ}$；A 偏角 $22.4^{\\circ}$"),
        ("转台人跑角速度", "转台角速度", "转台 $J=1200\\,\\mathrm{kg\\cdot m^2}$，$T=10\\,\\mathrm{s}$/周，$M=80\\,\\mathrm{kg}$ 人站中心后跑到 $r=2\\,\\mathrm{m}$，求角速度。",
         "$\\omega_0=2\\pi/T=0.628\\,\\mathrm{rad/s}$。角动量守恒 $(J+Mr^{2})\\omega=J\\omega_0$，$\\omega=0.496\\,\\mathrm{rad/s}$。",
         "$\\omega=0.496\\,\\mathrm{rad/s}$"),
        ("子弹射杆偏角", "子弹射杆", "杆 $L=0.40\\,\\mathrm{m}$，$M=1.0\\,\\mathrm{kg}$，$m=8.0\\,\\mathrm{g}$ 子弹以 $v=200\\,\\mathrm{m/s}$ 射入轴下 $d=3L/4$ 处。求 (1) 角速度；(2) 最大偏角。",
         "$ml^2\\omega+\\tfrac13 Ml^{2}\\omega=mvl$，$l=3L/4$。$\\omega=8.89\\,\\mathrm{rad/s}$；能量守恒得 $\\theta=94^{\\circ}18'$。",
         "$\\omega=8.89\\,\\mathrm{rad/s}$；$\\theta=94^{\\circ}18'$"),
    ]


def gen_ch02() -> list[Path]:
    files: list[Path] = []
    sections: dict[str, list] = {
        "2.1": [
            ("动脉狭窄流速", "动脉狭窄流速", "半径 1.0 cm 动脉出现硬斑块，有效半径 0.6 cm，狭窄处平均血流 $0.5\\,\\mathrm{m/s}$。求未变窄处平均流速。",
             "连续性方程 $S_1v_1=S_2v_2$，$v_1=\\dfrac{S_2}{S_1}v_2=\\dfrac{0.6^{2}}{1.0^{2}}\\times0.5=0.18\\,\\mathrm{m/s}$。", "0.18 m/s"),
            ("水龙头收缩流量", "水龙头流量", "龙头出口 $S_0=1.2\\,\\mathrm{cm^2}$，下落 45 mm 后 $S=0.35\\,\\mathrm{cm^2}$。求体积流量。",
             "由 $v^{2}=v_0^{2}+2gh$ 与 $S_0v_0=Sv$ 得 $v_0=\\sqrt{\\dfrac{2ghS^{2}}{S_0^{2}-S^{2}}}=28.6\\,\\mathrm{cm/s}$，$Q=S_0v_0=34.3\\,\\mathrm{cm^3/s}$。", "34.3 cm³/s"),
            ("小动脉层流速度", "层流最大速度", "半径 3 mm 小动脉层流，$\\eta=3.0\\times10^{-3}\\,\\mathrm{Pa\\cdot s}$，$\\rho=1.05\\times10^{3}\\,\\mathrm{kg/m^3}$。求最大允许流速。",
             "$Re=\\rho vr/\\eta<1000$，$v<\\dfrac{\\eta\\cdot1000}{\\rho r}=0.952\\,\\mathrm{m/s}$。", "v < 0.952 m/s"),
            ("雷诺数判断层流", "雷诺数层流", "藤本植物内水分流动雷诺数约 3.33，说明流动状态。",
             "$Re\\ll1000$，为层流。", "层流"),
        ],
        "2.2": [
            ("注射器射水速度", "注射器射水", "活塞面积 $S_1$，出口 $S_2\\ll S_1$，水平放置，恒力 $F$ 推活塞位移 $L$。求射水速度和时间。",
             "伯努利：$v_2=\\sqrt{2F/(\\rho S_1)}$，$t=\\dfrac{S_1L}{S_2v_2}=\\dfrac{S_1L}{S_2}\\sqrt{\\dfrac{\\rho S_1}{2F}}$。", "见解答"),
            ("伯努利适用条件", "伯努利适用", "U 形管隔膜穿孔后液体流动，说明伯努利方程为何不适用。",
             "对 A、B 应用伯努利且 $v_A=v_B$ 得 $h_A=h_B$，与事实矛盾；流动非稳定，不能用伯努利。", "非稳定流动，伯努利不适用"),
            ("容器小孔流速", "小孔流速", "大容器水面下深度 $h$ 开小孔 $S_B\\ll S_A$，求小孔流速。",
             "$v_A\\approx0$，$p_A=p_B=p_0$，$\\rho gh=\\tfrac12\\rho v_B^{2}$，$v_B=\\sqrt{2gh}$。", "v_B = √(2gh)"),
            ("机翼升力流速", "机翼升力", "机翼下表面 $110\\,\\mathrm{m/s}$，上下压强差 900 Pa，$\\rho=1.3\\,\\mathrm{g/cm^3}$。求上表面流速。",
             "$p_1+\\tfrac12\\rho v_1^{2}=p_2+\\tfrac12\\rho v_2^{2}$，$v_1=\\sqrt{\\dfrac{2(p_2-p_1)}{\\rho}+v_2^{2}}=116\\,\\mathrm{m/s}$。", "116 m/s"),
            ("虹吸各点压强", "虹吸压强", "虹吸管最高处比液面高 $h$，出口低 $H$，求各点流速与压强关系。",
             "$v_e=\\sqrt{2gH}$，管内均匀 $v_b=v_c=v_d=v_e$；$p_b=p_0-\\rho gH$，$p_c=p_d=p_0-\\rho g(H+h)$；$p_a>p_b>p_c=p_d<p_e$。", "v = √(2gH)；压强见解答"),
            ("水平管第二点压强", "水平管压强", "水平管第一点 $v_1=2\\,\\mathrm{m/s}$，计示压强 $10^{4}\\,\\mathrm{Pa}$；第二点低 1 m，面积减半。求第二点计示压强。",
             "$v_2=4\\,\\mathrm{m/s}$，$p_2-p_0=10^{4}-500(v_2^{2}-v_1^{2})+\\rho gh=1.38\\times10^{4}\\,\\mathrm{Pa}=13.8\\,\\mathrm{kPa}$。", "13.8 kPa"),
            ("细管负压开孔", "细管负压", "出口面积是最细处 3 倍，出口 $v=2\\,\\mathrm{m/s}$，最细处开 small hole 会否流出？",
             "$v_2=6\\,\\mathrm{m/s}$，$p_2=p_0+\\tfrac12\\rho(v_1^{2}-v_2^{2})=85\\,\\mathrm{kPa}<p_0$，水不会流出。", "85 kPa；不会流出"),
            ("U形管测流速", "U形管测流速", "粗 $S_A$、细 $S_B$，U 形管液面差 $h$，密度 $\\rho<\\rho'$。求粗处流速。",
             "$v_A=S_B\\sqrt{\\dfrac{2(\\rho'-\\rho)gh}{\\rho(S_A^{2}-S_B^{2})}}$。", "见公式"),
            ("皮托管测流速", "皮托管流速", "两管水柱高差 $\\Delta h=4.9\\times10^{-2}\\,\\mathrm{m}$，求水流速度。",
             "$v=\\sqrt{2g\\Delta h}=0.98\\,\\mathrm{m/s}$。", "0.98 m/s"),
            ("水箱三孔射程", "水箱三孔射程", "水箱壁 A、B（半水深）、C 三孔，比较落地速率与水平射程。",
             "由能量守恒，落地速率相同（D）；B 孔射程最大（B）。", "速率一样大；B 孔射程最大"),
            ("水管AB两点", "水管AB两点", "A 点 $v=1.0\\,\\mathrm{m/s}$，计示压强 $3.0\\times10^{5}\\,\\mathrm{Pa}$；B 低 20 m，A 面积是 B 的 3 倍。求 B 点流速和计示压强。",
             "$v_B=3.0\\,\\mathrm{m/s}$，计示压强 $4.92\\times10^{5}\\,\\mathrm{Pa}$（选 A）。", "3.0 m/s；4.92×10⁵ Pa"),
            ("皮托管测气体", "皮托管气体", "$\\rho=1.3\\,\\mathrm{kg/m^3}$，计示压强 $6.5\\times10^{3}\\,\\mathrm{Pa}$，求气体流速。",
             "$v=\\sqrt{2\\Delta p/\\rho}=100\\,\\mathrm{m/s}$。", "100 m/s"),
            ("油箱小孔流速", "油箱小孔", "油厚 4 m、水厚 1 m，箱底小孔流出速度。",
             "有效压头 $h_{\\mathrm{eff}}=h_1+h_2\\rho_{\\mathrm{油}}/\\rho_{\\mathrm{水}}$ 等，$v\\approx9.5\\,\\mathrm{m/s}$。", "9.5 m/s"),
            ("并联管流速", "并联管流速", "四根相同小管并联后与直径 2:1 的大管串联，大管 $v=1\\,\\mathrm{m/s}$，求小管流速。",
             "体积流量守恒，$v_{\\mathrm{小}}=1\\,\\mathrm{m/s}$。", "1 m/s"),
            ("变截面管面积", "变截面面积", "流量 $4\\times10^{-3}\\,\\mathrm{m^3/s}$，$S_1=0.001\\,\\mathrm{m^2}$ 处 $p=1.2\\times10^{5}\\,\\mathrm{Pa}$，求 $p=1.0\\times10^{5}\\,\\mathrm{Pa}$ 处面积。",
             "伯努利+连续，$S_2=5.35\\times10^{-4}\\,\\mathrm{m^2}$。", "5.35×10⁻⁴ m²"),
            ("容器排水时间", "容器排水", "柱形桶高 $H$、底面积 $A$，小孔 $S\\ll A$，求剩一半与全部流完时间 $t_1,t_2$。",
             "$t_1=(\\sqrt2-1)\\dfrac{A}{S}\\sqrt{\\dfrac{H}{g}}$，$t_2=\\sqrt2\\dfrac{A}{S}\\sqrt{\\dfrac{H}{g}}$；上半水位高、流速大，故流完上一半时间短。", "见公式"),
            ("虹吸管1处压强", "虹吸管压强", "虹吸 1 段面积是 2、3 段 2 倍，$H$ 已知，求 1 处压强。",
             "$p_1=p_0-\\tfrac14\\rho gH$。", "p₀ − ρgH/4"),
            ("水柱截面变化", "水柱截面", "小孔 $S_0,v_0$ 铅直下落，求高度 $h$ 处截面积。",
             "连续+能量：$S=S_0/\\sqrt{1+2gh/v_0^{2}}$。", "见公式"),
            ("引水管出口", "引水管出口", "粗管 $p=4\\times10^{5}\\,\\mathrm{Pa}$，$v=4\\,\\mathrm{m/s}$，引至 5 m 高细管，忽略黏性。求出口 $v,p$。",
             "伯努利：$v=16\\,\\mathrm{m/s}$，$p=2.3\\times10^{5}\\,\\mathrm{Pa}$。", "16 m/s；2.3×10⁵ Pa"),
        ],
        "2.3": [
            ("硫酸黏度测定", "硫酸黏度", "细管 $d=0.1\\,\\mathrm{cm}$，$l=10\\,\\mathrm{cm}$，液面高 5 cm，$\\rho=1.9\\times10^{3}\\,\\mathrm{kg/m^3}$，1 min 流出 $m=0.66\\times10^{-3}\\,\\mathrm{kg}$。求黏度。",
             "$\\eta=\\dfrac{\\rho\\Delta t}{m}\\cdot\\dfrac{\\pi r^{4}}{8l}\\cdot\\rho gh=0.04\\,\\mathrm{Pa\\cdot s}$。", "0.04 Pa·s"),
            ("圆管压强降落", "圆管压强降", "20°C 水在 $R=1\\,\\mathrm{cm}$ 水平圆管，轴处 $v=0.1\\,\\mathrm{m/s}$，流 10 m 压强降多少？",
             "$\\Delta p=\\dfrac{4\\eta Lv}{R^{2}}=40\\,\\mathrm{Pa}$。", "40 Pa"),
            ("体循环流阻", "体循环流阻", "心输出量 $Q=0.83\\times10^{-4}\\,\\mathrm{m^3/s}$，总压差 12.0 kPa，求总流阻。",
             "$R_t=\\Delta p/Q=1.44\\times10^{8}\\,\\mathrm{N\\cdot s/m^5}$。", "1.44×10⁸ N·s/m⁵"),
            ("供油管道能量损耗", "供油能量损", "A 比 B 高 3.0 m、压强低 $1.5\\times10^{3}\\,\\mathrm{Pa}$，$\\rho=0.9\\times10^{3}\\,\\mathrm{kg/m^3}$，$4.0\\,\\mathrm{m^3}$ 油 A→B 稳定流动能量损耗。",
             "单位体积损耗 $w=-(p_A-p_B)+\\rho gh=2.5\\times10^{4}\\,\\mathrm{J/m^3}$，$W=wV=1.0\\times10^{5}\\,\\mathrm{J}$。", "1.0×10⁵ J"),
            ("牛顿黏滞摩擦力", "黏滞摩擦力", "$\\eta=3.0\\times10^{-3}\\,\\mathrm{Pa\\cdot s}$，$\\mathrm{d}v/\\mathrm{d}x=0.6\\,\\mathrm{s^{-1}}$，$S=10\\,\\mathrm{cm^2}$，求层间摩擦力。",
             "$f=\\eta S\\,\\mathrm{d}v/\\mathrm{d}x=1.8\\times10^{-6}\\,\\mathrm{N}$。", "1.8×10⁻⁶ N"),
            ("油管能量损失", "油管能量损", "水平油管相隔 300 m 压降 $1.5\\times10^{4}\\,\\mathrm{Pa}$，求每 m³ 油过 1 m 能量损失。",
             "$w=\\Delta p/L=50\\,\\mathrm{J/m^3}$ per m。", "50 J/m³"),
            ("液体黏度测定", "液体黏度", "同例 2-7 条件，求液体 $\\eta$。",
             "$\\eta=0.04\\,\\mathrm{Pa\\cdot s}$。", "0.04 Pa·s"),
            ("心脏做功", "心脏做功", "主动脉平均血压 $1.33\\times10^{4}\\,\\mathrm{Pa}$，$v=0.4\\,\\mathrm{m/s}$，输出 5000 ml/min，$\\rho=1.05\\times10^{3}\\,\\mathrm{kg/m^3}$。求每分钟做功。",
             "$W=pQV+\\tfrac12\\rho v^{2}Q\\approx67\\,\\mathrm{J/min}$。", "67 J/min"),
        ],
    }
    counters: dict[str, int] = {}
    for sec, items in sections.items():
        counters[sec] = 0
        for slug, label, q, sol, ans in items:
            counters[sec] += 1
            files.append(write_example("02", sec, counters[sec], slug, label[:15], q, sol, ans))
    return files


def gen_ch03() -> list[Path]:
    files: list[Path] = []
    sections = {
        "3.1": [
            ("初相位振动式", "初相位", "弹簧振子振幅 $A$、周期 $T$，$t=0$ 时 $x=A/2$ 且向正方向运动，求初相位并写振动表达式。", "旋转矢量法或公式法得 $\\varphi=-\\pi/3$，$x=A\\cos(2\\pi t/T-\\pi/3)$。", "$\\varphi=-\\pi/3$；$x=A\\cos(2\\pi t/T-\\pi/3)$"),
            ("振动曲线方程", "振动曲线", "已知振动曲线 $A=4.0\\times10^{-2}\\,\\mathrm{m}$，$t=0$ 时 $x_0=A/2,v_0>0$，$t=1\\,\\mathrm{s}$ 时 $x=0$，写位移-时间关系。", "$\\varphi=-\\pi/3$，$\\omega=5\\pi/6\\,\\mathrm{rad/s}$，$x=4.0\\times10^{-2}\\cos(5\\pi t/6-\\pi/3)\\,\\mathrm{m}$。", "见解答"),
            ("浮木简谐振动", "浮木简谐", "底面积 $S$ 木块浮于水面下 $a$，按下 $x$ 释放，证简谐振动并求 $T=2\\pi\\sqrt{a/g}$。", "$F=-S\\rho gx=-kx$，$\\omega=\\sqrt{g/a}$，$T=2\\pi/\\omega=2\\pi\\sqrt{a/g}$。", "$T=2\\pi\\sqrt{a/g}$"),
            ("弹簧振子方程", "弹簧振子", "$x_0=0.05\\,\\mathrm{m}$，$v_0=-0.628\\,\\mathrm{m/s}$，$k=15.8\\,\\mathrm{N/m}$，$m=0.1\\,\\mathrm{kg}$，写振动表达式。", "$\\omega=12.56\\,\\mathrm{rad/s}$，$A=0.0707\\,\\mathrm{m}$，$\\varphi=\\pi/4$，$x=0.0707\\cos(12.56t+\\pi/4)\\,\\mathrm{m}$。", "见解答"),
            ("平衡位置初相", "平衡初相", "$A=5.0\\times10^{-2}\\,\\mathrm{m}$，$\\nu=2.0\\,\\mathrm{Hz}$，$t=0$ 开始：(1) 过平衡向正；(2) 过平衡向负。写表达式。", "$\\omega=4\\pi$；(1) $\\varphi=-\\pi/2$；(2) $\\varphi=\\pi/2$。", "见解答两式"),
            ("位移时间关系", "位移时间", "$x=0.10\\cos(2.5\\pi t+\\pi/3)\\,\\mathrm{m}$，求 $T,\\omega,\\nu,A,\\varphi$ 及 $t=2\\,\\mathrm{s}$ 时 $x,v,a$。", "$A=0.10\\,\\mathrm{m}$，$\\omega=2.5\\pi$，$T=0.80\\,\\mathrm{s}$，$\\nu=1.25\\,\\mathrm{Hz}$，$\\varphi=\\pi/3$；$x=-0.05\\,\\mathrm{m}$，$v=0.68\\,\\mathrm{m/s}$，$a=3.1\\,\\mathrm{m/s^2}$。", "见解答"),
            ("简谐振动物受力", "简谐受力", "$m=10\\,\\mathrm{g}$，$A=24\\,\\mathrm{cm}$，$T=4.0\\,\\mathrm{s}$，$t=0$ 时 $x=+24\\,\\mathrm{cm}$。求 $t=0.5\\,\\mathrm{s}$ 位置、受力及 $x=12\\,\\mathrm{cm}$ 时能量。", "$x=0.24\\cos(\\pi t/2)$；$t=0.5\\,\\mathrm{s}$：$x=0.17\\,\\mathrm{m}$，$F=-4.19\\times10^{-3}\\,\\mathrm{N}$；$E_k=5.32\\times10^{-4}\\,\\mathrm{J}$，$E_p=1.78\\times10^{-4}\\,\\mathrm{J}$，$E=7.10\\times10^{-4}\\,\\mathrm{J}$。", "见解答"),
            ("弹簧振子周期", "弹簧周期", "拉离 1 cm 与 2 cm 静止释放，比较周期、振幅等。", "周期相同（A）；振幅、最大速度等不同。", "周期相同（A）"),
            ("初相位判断", "初相位", "$t=0$ 在平衡位置开始向下，初相位。", "$\\varphi=\\pi/2$（B）。", "π/2（B）"),
            ("弹簧振子表达式", "振子表达式", "$m=2.5\\,\\mathrm{kg}$，$k=100\\,\\mathrm{N/m}$，$x_0=0.1\\,\\mathrm{m}$，$v_0=0$。", "$\\omega=2\\pi$，$x=0.1\\cos2\\pi t$。", "x = 0.1 cos 2πt"),
            ("氢原子振动", "氢原子振动", "$m=1.68\\times10^{-27}\\,\\mathrm{kg}$，$\\nu=10^{4}\\,\\mathrm{Hz}$，$A=10^{-11}\\,\\mathrm{m}$。求 $v_{\\max}$ 和能量。", "$v_{\\max}=6.28\\times10^{-7}\\,\\mathrm{m/s}$；$E=3.31\\times10^{-40}\\,\\mathrm{J}$。", "见解答"),
            ("动能变化倍数", "动能倍数", "平衡向右 $v=1.0\\,\\mathrm{m/s}$，$T=1.0\\,\\mathrm{s}$，经 $1/3\\,\\mathrm{s}$ 动能是原来多少？", "$\\omega=2\\pi$，$t=1/3\\,\\mathrm{s}$ 时 $\\sin^{2}(\\omega t)=3/4$，$E_k/E_{k0}=1/4$。", "1/4"),
            ("弹簧振子参数", "振子参数", "$m=0.5\\,\\mathrm{kg}$，$k=50\\,\\mathrm{N/m}$，$A=0.04\\,\\mathrm{m}$。求 $\\omega,v_{\\max},a_{\\max}$。", "$\\omega=10\\,\\mathrm{rad/s}$，$v_{\\max}=0.4\\,\\mathrm{m/s}$，$a_{\\max}=4\\,\\mathrm{m/s^2}$。", "见解答"),
            ("振动方程求状态", "振动方程", "$A=0.01\\,\\mathrm{m}$，$T=0.5\\,\\mathrm{s}$，$t=0$ 时 $x=A/2$ 向正，求方程及 $t=3\\,\\mathrm{s}$ 时 $x,v,a$。", "$x=0.01\\cos(4\\pi t-\\pi/3)$；$x=0.005\\,\\mathrm{m}$，$v=0.11\\,\\mathrm{m/s}$，$a=-0.79\\,\\mathrm{m/s^2}$。", "见解答"),
            ("劲度32弹簧", "劲度32弹簧", "$k=32\\,\\mathrm{N/m}$，$m=0.5\\,\\mathrm{kg}$，拉伸 10 cm 释放，写 $x,v,a$ 与时间关系。", "$\\omega=8\\,\\mathrm{rad/s}$；$x=0.100\\cos8t$，$v=-0.800\\sin8t$，$a=-6.40\\cos8t$（SI）。", "见解答"),
        ],
        "3.2": [
            ("同频振动合成", "同频合成", "$x_1=4\\cos(3\\pi t+\\pi/3)$，$x_2=3\\cos(3\\pi t-\\pi/6)$（m），求合振动。", "$A=5$，$\\varphi=0.128\\pi$，$x=5\\cos(3\\pi t+0.128\\pi)\\,\\mathrm{m}$。", "x = 5 cos(3πt + 0.128π) m"),
            ("相位差求合成", "相位差合成", "同向同频合成振幅 0.09 m，分振幅 0.05 m、0.07 m，求相位差。", "$\\Delta\\varphi=84^{\\circ}16'$。", "84°16′"),
            ("两振动合成式", "两振动合成", "$x_1=10\\cos(\\pi t-\\pi/2)$ cm，$x_2=20\\cos(\\pi t-\\pi/3)$ cm，求合成。", "$x=29.1\\cos[\\pi t-\\arctan(1+\\sqrt3)]\\,\\mathrm{cm}$。", "见解答"),
        ],
        "3.3": [
            ("简谐振动判定", "简谐判定", "拍皮球与凹球面底部小幅度摆动是否为简谐振动？", "拍皮球：否；小幅度球面摆：是（$F=-kx$）。", "拍皮球否；球面摆是"),
            ("振幅加倍影响", "振幅加倍", "弹簧振子振幅增为 2 倍，周期、$v_{\\max}$、$a_{\\max}$、能量如何变？", "周期不变；$v_{\\max},a_{\\max}$ 变 2 倍；能量变 4 倍。", "见解答"),
            ("弹簧质量影响", "弹簧质量", "考虑弹簧质量，周期如何变？", "$\\omega=\\sqrt{k/m_{\\mathrm{eff}}}$ 减小，周期变长。", "周期变长"),
        ],
    }
    counters: dict[str, int] = {}
    for sec, items in sections.items():
        counters[sec] = 0
        for slug, label, q, sol, ans in items:
            counters[sec] += 1
            files.append(write_example("03", sec, counters[sec], slug, label[:15], q, sol, ans))
    return files


def gen_ch04() -> list[Path]:
    files: list[Path] = []
    sections = {
        "4.1": [
            ("绳波基本量", "绳波基本量", "$y=0.05\\cos(10\\pi t-4\\pi x)$（SI），求 $A,u,\\nu,\\lambda$、$v_{\\max},a_{\\max}$、相位及两点相位差。", "$A=0.05\\,\\mathrm{m}$，$\\nu=5\\,\\mathrm{Hz}$，$\\lambda=0.5\\,\\mathrm{m}$，$u=2.5\\,\\mathrm{m/s}$；$v_{\\max}=1.57\\,\\mathrm{m/s}$，$a_{\\max}=49.3\\,\\mathrm{m/s^2}$；$x=0.2\\,\\mathrm{m},t=1\\,\\mathrm{s}$ 相位 $9.2\\pi$；$\\Delta\\varphi=\\pi/2$。", "见解答"),
            ("波函数求参量", "波函数参量", "$y=A\\cos(bt-cx)$，求 $A,u,\\nu,\\lambda$。", "$A=A$，$\\nu=b/(2\\pi)$，$\\lambda=2\\pi/c$，$u=b/c$。", "见解答"),
            ("平面波表达式", "平面波式", "$A=0.10\\,\\mathrm{m}$，$T=0.50\\,\\mathrm{s}$，$\\lambda=10\\,\\mathrm{m}$，原点 $y=A\\cos(\\omega t+\\varphi)$，写波函数及 2.5 m 相位差。", "$y=0.10\\cos[2\\pi(2t-x/10)+\\varphi]$；$\\Delta\\varphi=\\pi/2$。", "见解答"),
            ("绳波横向速度", "绳波速度", "$y=0.10\\cos(0.01\\pi x-2\\pi t)\\,\\mathrm{m}$，求波参量及最大横向速度。", "$A=0.10\\,\\mathrm{m}$，$\\nu=1\\,\\mathrm{Hz}$，$u=200\\,\\mathrm{m/s}$，$\\lambda=200\\,\\mathrm{m}$；$v_{\\max}=0.63\\,\\mathrm{m/s}$。", "见解答"),
            ("负向传播波函数", "负向波函数", "$\\lambda=1.0\\,\\mathrm{m}$，$\\nu=2.0\\,\\mathrm{Hz}$，$A=0.1\\,\\mathrm{m}$，$t=0$ 过平衡向 $-y$，写沿 $-x$ 传播波函数。", "$y=0.1\\cos[4\\pi(t+x/2)+\\pi/2]\\,\\mathrm{m}$。", "见解答"),
            ("波源P点方程", "P点方程", "波源 $y=6\\times10^{-2}\\cos(\\pi t/5)$，$u=2.0\\,\\mathrm{m/s}$，求距源 6.0 m 处 P 点方程及相位差。", "$y_P=6\\times10^{-2}\\cos(\\pi t/5-3\\pi/5)\\,\\mathrm{m}$；相位差 $-3\\pi/5$。", "见解答"),
            ("声波能量密度", "声波能量", "$\\nu=500\\,\\mathrm{Hz}$，$u=340\\,\\mathrm{m/s}$，$\\rho=1.3\\,\\mathrm{g/cm^3}$，$A=10^{-4}\\,\\mathrm{cm}$，求平均能量密度和强度。", "$\\bar w=6.41\\times10^{-6}\\,\\mathrm{J/m^3}$，$I=2.18\\times10^{-3}\\,\\mathrm{W/m^2}$。", "见解答"),
            ("金属棒应力", "金属棒应力", "长 2 m、宽 3 cm、厚 4 cm 金属棒两端各拉 120 N，求应力。", "$\\sigma=F/S=120/(0.03\\times0.04)=1.0\\times10^{5}\\,\\mathrm{N/m^2}$（C）。", "1.0×10⁵ N/m²（C）"),
        ],
        "4.2": [
            ("相干波干涉", "相干波干涉", "P、Q 相干源，$\\nu=100\\,\\mathrm{Hz}$，$u=400\\,\\mathrm{m/s}$，$PQ=3.0\\,\\mathrm{m}$，P 超前 $\\pi/2$，Q 右侧 S 点合成。", "$\\Delta\\varphi=-\\pi$，Q 右侧全域干涉相消。", "静止（相消）"),
            ("驻波方程波节", "驻波方程", "$y_1=0.06\\cos\\pi(x-4t)$，$y_2=0.06\\cos\\pi(x+4t)$，求驻波、波节波腹及 $x=1.2\\,\\mathrm{m}$ 振幅。", "$y=0.12\\cos\\pi x\\cos4\\pi t$；波节 $x=(2k+1)/2$，波腹 $x=k$；$A(1.2)=0.097\\,\\mathrm{m}$。", "见解答"),
            ("PQ干涉相消", "PQ干涉", "P、Q 同相同幅，$\\lambda$ 波长，$PQ=1.5\\lambda$，R 在 Q 外侧，求相位差及 R 振幅。", "$\\Delta\\varphi=3\\pi$；$A_R=0$。", "A_R = 0"),
            ("球面波波函数", "球面波", "球面波振幅 $A_0$ 在 $r=1$ 处，求波函数。", "$y=\\dfrac{A_0}{r}\\cos[\\omega(t-r/u)+\\varphi]$。", "见公式"),
            ("驻波波长波速", "驻波波速", "$y=0.02\\cos(20x)\\cos(750t)$，求两行波振幅波速及相邻波节距。", "$A=0.01\\,\\mathrm{m}$，$u=37.5\\,\\mathrm{m/s}$；相邻波节 $0.157\\,\\mathrm{m}$。", "见解答"),
            ("弦线驻波波长", "弦线驻波", "相邻波节距 65 cm，$\\nu=2.3\\times10^{2}\\,\\mathrm{Hz}$，求 $\\lambda,u$。", "$\\lambda=1.3\\,\\mathrm{m}$，$u=3.0\\times10^{2}\\,\\mathrm{m/s}$。", "见解答"),
            ("两波P点合成", "P点合成", "波 1 在 B：$y_1=2\\times10^{-3}\\cos2\\pi t$，波 2 在 C：$y_2=2\\times10^{-3}\\cos(2\\pi t+\\pi)$，$BP=0.4\\,\\mathrm{m}$，$CP=0.5\\,\\mathrm{m}$，$u=0.2\\,\\mathrm{m/s}$。求 P 相位差与合振幅。", "$\\Delta\\varphi=0$；$A=4\\times10^{-3}\\,\\mathrm{m}$。", "4×10⁻³ m"),
        ],
        "4.3": [
            ("超声波测潜艇", "超声测潜艇", "发射 $1.8\\times10^{4}\\,\\mathrm{Hz}$，反射频差 220 Hz，$u=1.54\\times10^{3}\\,\\mathrm{m/s}$，求潜艇航速。", "$v=\\dfrac{u\\Delta\\nu}{2\\nu_s}=9.4\\,\\mathrm{m/s}$。", "9.4 m/s"),
            ("听阈空气振幅", "听阈振幅", "1000 Hz 听阈 $I=10^{-12}\\,\\mathrm{W/m^2}$，求 20°C 空气分子振幅。", "$A=1\\times10^{-11}\\,\\mathrm{m}$。", "10⁻¹¹ m"),
            ("声强级差1dB", "声强级1dB", "两声音强级差 1 dB，求强度比。", "$I_1/I_2=10^{0.1}=1.26$。", "1.26"),
            ("多普勒拍频", "多普勒拍频", "P、Q 相距 2 km，$\\nu=1\\,\\mathrm{kHz}$，Q 以 60 m/s 远离 P，观察者以 30 m/s 同向，$u=340\\,\\mathrm{m/s}$。求接收 P、Q 频率及拍频。", "$\\nu_{RP}=912\\,\\mathrm{Hz}$，$\\nu_{RQ}=925\\,\\mathrm{Hz}$，$\\Delta\\nu=13\\,\\mathrm{Hz}$。", "912 Hz；925 Hz；13 Hz"),
            ("多普勒测心壁", "多普勒心壁", "5 MHz 超声直射，频差 500 Hz，$u=1500\\,\\mathrm{m/s}$，求心壁速度。", "$v=\\dfrac{u\\Delta\\nu}{2\\nu}=7.5\\times10^{-2}\\,\\mathrm{m/s}$。", "0.075 m/s"),
            ("声强级差20dB", "声强级20dB", "两声波声强级差 20 dB，声强比。", "$I_1/I_2=100$（B）。", "100:1（B）"),
            ("反射面多普勒", "反射多普勒", "源 2 kHz，反射面以 0.20 m/s 接近观察者，频差 4 Hz，求声速。", "$u=200\\,\\mathrm{m/s}$。", "200 m/s"),
        ],
    }
    counters: dict[str, int] = {}
    for sec, items in sections.items():
        counters[sec] = 0
        for slug, label, q, sol, ans in items:
            counters[sec] += 1
            files.append(write_example("04", sec, counters[sec], slug, label[:15], q, sol, ans))
    return files


def gen_supplement() -> list[Path]:
    """Additional conceptual and exercise problems not in first pass."""
    files: list[Path] = []

    def add(ch: str, sec: str, slug: str, label: str, q: str, sol: str, ans: str) -> None:
        n = next_num(ch, sec)
        files.append(write_example(ch, sec, n, slug, label[:15], q, sol, ans))

    # ch01 conceptual & self-assessment
    s = "1.1"
    add("01", s, "速度速率判断", "速度速率判断",
        "下列说法哪些正确、哪些错误？(1) 恒定速度则速率必为常数；(2) 某方向加速度减小时该方向速度必减；(3) 直线运动加速度愈大速度愈大；(4) 匀速运动轨迹必为直线；(5) 恒定加速度则轨迹必为直线。",
        "(1) 正确：恒定速度大小方向不变，速率恒定。\n(2) 错误：加速度与速度同向时速度仍增加。\n(3) 错误：加速度反映速度变化快慢，与速度大小无简单对应。\n(4) 错误：匀速可指速率恒定，如匀速率圆周运动。\n(5) 错误：如匀速率圆周运动加速度恒定但轨迹为圆。",
        "(1)正确；(2)(3)(4)(5)错误")
    add("01", s, "位移路程区别", "位移路程",
        "位移和路程、速度和速率、瞬时速度与平均速度有何区别？物体能否速率不变而速度变？速度为零时加速度是否为零？",
        "位移是有向线段（矢量），路程是路径长度（标量）。速度是位矢对时间导数（矢量），速率是路程对时间导数（标量）。可以：匀速率圆周运动。速度为零时加速度不一定为零，如自由落体初时刻。",
        "见解答")
    add("01", s, "牛顿定律辨析", "牛顿定律",
        "物体受几个力是否一定有加速度？速度很大合外力是否很大？运动方向是否与合外力同向？速率不变合外力是否为零？",
        "合力为零则加速度为零。速度与合外力无直接关系。运动方向不必与合外力同向（如圆周运动）。速率不变时合外力不一定为零。",
        "见解答")
    add("01", s, "动量动能关系", "动量动能",
        "合外力作用使动量改变，动能是否一定改变？合外力做功使动能改变，动量是否一定改变？",
        "动量改变时动能不一定变（如合外力始终垂直速度）。动能改变时动量一定变（合外力做功必有时间积累）。",
        "动量变→动能不一定变；动能变→动量一定变")
    add("01", s, "跳马角动量", "跳马角动量",
        "合外力不为零但水平轴外力为零，水平动量如何？跳马腾空外力矩及守恒量？",
        "水平方向外力为零，水平动量守恒。腾空时重力等力对质心力矩为零，对质心角动量守恒。",
        "水平动量守恒；外力矩为零；角动量守恒")
    add("01", s, "曲线速率表达式", "曲线速率",
        "质点在 xOy 平面曲线运动，速率正确表达式是哪些？A. dr/dt  B. d|r|/dt  C. |dr/dt|  D. ds/dt  E. √[(dx/dt)²+(dy/dt)²]",
        "速率是标量，等于 ds/dt 或 |dr/dt| 或速度分量平方和的平方根。A、B 为矢量或不正确。",
        "C、D、E")
    add("01", s, "斜面最高点时刻", "斜面最高点",
        "质点沿斜面向上，$s=5+4t-t^{2}$（m），运动到最高点时刻是？",
        "$v=ds/dt=4-2t=0$，$t=2\\,\\mathrm{s}$。",
        "t = 2 s（B）")
    add("01", s, "两质点引力体系", "引力体系",
        "两质点仅引力，外力矢量和为零，系统动量、机械能、角动量如何？",
        "动量、角动量守恒；仅引力时机械能守恒。",
        "D：动量和角动量守恒，机械能是否守恒不能判定→实际仅引力时机械能也守恒，选 D 意指角动量可能不确定；标准答案 D")
    add("01", s, "绳拉小球角动量", "绳拉小球",
        "光滑桌面小球以 $\\omega$ 在半径 $r$ 转动，绳从小孔缓慢下拉，下列何者正确？",
        "绳拉力过孔心，外力矩为零，角动量守恒；$L=mvr$ 不变而 $r$ 减小故 $v$、动能增大。",
        "E：角动量不变，动量、动能改变")
    add("01", s, "变速圆周运动", "变速圆周",
        "半径 $R$ 圆周运动，$v=b-ct$（$b,c>0$），求加速度大小、夹角及 $v=0$ 时圈数。",
        "$a_t=-c$，$a_n=v^{2}/R$，$a=\\sqrt{R^{2}c^{2}+(b-ct)^{4}}/R$；夹角 $\\pi-\\arctan[(b-ct)^{2}/(Rc)]$；圈数 $n=b^{2}/(4\\pi Rc)$。",
        "见解答公式")
    add("01", s, "钢丝绳张应力", "钢丝绳应力",
        "长 0.5 m、直径 $2\\times10^{-3}$ m 钢丝绳受 450 N 张力，求张应力。",
        "$S=\\pi(d/2)^{2}$，$\\sigma=F/S=1.43\\times10^{8}\\,\\mathrm{N/m^2}$。",
        "1.43×10⁸ N/m²")
    add("01", s, "铜丝拉长张力", "铜丝拉长",
        "铜丝 $S=4\\times10^{-5}\\,\\mathrm{m^2}$，由 15000 m 拉至 15005 m，$Y=1.2\\times10^{11}\\,\\mathrm{N/m^2}$，求张力。",
        "$\\varepsilon=5/15000$，$F=YS\\varepsilon=1600\\,\\mathrm{N}$。",
        "1600 N")
    add("01", s, "腿骨杨氏模量", "腿骨模量",
        "腿骨 0.4 m，$S=5\\,\\mathrm{cm^2}$，500 N 时缩短 $4\\times10^{-5}$ m，求杨氏模量。",
        "$Y=\\sigma/\\varepsilon=(F/S)/(\\Delta l/l)=1\\times10^{10}\\,\\mathrm{N/m^2}$。",
        "1×10¹⁰ N/m²")
    add("01", s, "肌肉杨氏模量", "肌肉模量",
        "肌肉圆柱 $l=0.2\\,\\mathrm{m}$，$S=50\\,\\mathrm{cm^2}$，松弛伸长 5 cm 需 25 N，紧张时需 500 N，求两种杨氏模量。",
        "$Y=Fl/(S\\Delta l)$：松弛 $2\\times10^{4}$，紧张 $2\\times10^{5}\\,\\mathrm{N/m^2}$。",
        "2×10⁴；2×10⁵ N/m²")
    add("01", s, "钢丝最大负荷", "钢丝负荷",
        "钢丝 $S=6\\times10^{-6}\\,\\mathrm{m^2}$，断裂应力 $1.2\\times10^{9}\\,\\mathrm{N/m^2}$，求最大负荷。",
        "$F=\\sigma S=7.2\\times10^{3}\\,\\mathrm{N}$。",
        "7.2×10³ N")
    add("01", s, "起重机钢丝绳径", "钢丝绳直径",
        "起重 9×10⁴ N，钢弹性极限 3×10⁸ N/m²，应力不超过极限 1/4，求钢丝绳最小直径。",
        "$\\sigma=F/S$，$S=\\pi d^{2}/4$，$d\\approx1.95\\,\\mathrm{cm}$。",
        "1.95 cm")
    add("01", s, "弹性塑性形变", "弹性塑性",
        "日常生活中哪些形变属于弹性形变，哪些属于塑性形变？",
        "外力撤除后形变完全消失为弹性形变（如弹簧）；不完全消失为塑性形变（如橡皮泥）。",
        "弹性：弹簧等；塑性：橡皮泥等")
    add("01", s, "切应变正应变", "切正应变",
        "切应变与正应变、切应力与正应力的区别？",
        "正应变是长度变化比，切应变是形状相对变化；正应力垂直于截面，切应力平行于截面。",
        "见解答")
    add("01", s, "杨氏模量含义", "杨氏模量",
        "杨氏模量的物理含义是什么？",
        "比例极限内正应力与正应变之比，只与材料有关，反映抵抗线变能力，越大越不易变形。",
        "见解答")

    # ch02 supplement
    add("02", "2.1", "适用条件简述", "适用条件",
        "简述体积流量守恒、伯努利方程、泊肃叶定律的适用条件。",
        "体积流量：不可压缩流体同一流管稳定流动。理想伯努利：理想流体同一流管稳定流动。黏性伯努利：黏性流体同一流管稳定流动。泊肃叶：牛顿流体水平均匀圆管层流。",
        "见解答")
    add("02", "2.2", "喷雾器原理", "喷雾原理",
        "说明家用喷雾器（空吸作用）原理。",
        "T 型管交叉处截面积小、流速大、压强低，液体被大气压吸入并被高速气流雾化。",
        "空吸作用")
    add("02", "2.1", "竖管与自由下落", "竖管与水滴",
        "自来水沿竖直管连续，自由下落为何断成水滴？",
        "管壁处流速为零、轴处最大，形成稳定层流；自由下落各高度速度不同，难以维持连续流管。",
        "见解答")
    add("02", "2.2", "圆柱容器水位", "容器水位",
        "圆柱容器高 0.2 m、直径 0.1 m，底孔 $1\\times10^{-4}\\,\\mathrm{m^2}$，进水 $1.4\\times10^{-4}\\,\\mathrm{m^3/s$，求最高水位及关水后流尽时间。",
        "$H=\\dfrac{1}{2g}(Q/S_2)^{2}=0.1\\,\\mathrm{m}$；$T=\\dfrac{S_1}{S_2}\\sqrt{2H/g}=11.2\\,\\mathrm{s}$。",
        "H=0.1 m；T=11.2 s")
    add("02", "2.2", "理想流体流量", "理想流体流量",
        "理想流体同一流管稳定流动，不同截面质量/体积流量关系？",
        "不可压缩理想流体稳定流动时，各截面体积流量（质量流量）相等。",
        "D")
    add("02", "2.2", "伯努利能量和", "伯努利能量",
        "理想流体粗细不均、高低不同管稳定流动，压强较小处单位体积动能与势能之和？",
        "伯努利方程表明 $p+\\frac12\\rho v^{2}+\\rho gh$ 为常量，压强小处后两项之和大。",
        "C")
    add("02", "2.2", "牛顿黏滞条件", "黏滞条件",
        "运用牛顿黏滞定律的条件？",
        "牛顿流体作层流。",
        "D")

    # ch03 supplement
    add("03", "3.1", "四种初相位", "四种初相位",
        "弹簧振子 $x=A\\cos(\\omega t+\\varphi)$，$t=0$ 时：(1) $x=-A$；(2) 过平衡向 $+x$；(3) 过 $A/2$ 向 $-x$；(4) 过 $A/\\sqrt2$ 向 $+x$。求各初相位。",
        "(1) $\\varphi=\\pi$；(2) $\\varphi=-\\pi/2$；(3) $\\varphi=\\pi/3$；(4) $\\varphi=-\\pi/4$。",
        "见解答")
    add("03", "3.1", "速度与加速度负号", "速度加速度",
        "简谐振动速度、加速度式中负号是否表示恒为负值或同向？",
        "否。化为同一余弦形式后，速度相位超前位移 $\\pi/2$，加速度反相。",
        "见解答")
    add("03", "3.2", "简谐振动判定", "简谐判定",
        "具有哪些特点必定为简谐振动？",
        "F 与位移成正比反向；a 与 x 成正比反向；位移按正余弦规律变化。",
        "A、B、C")
    add("03", "3.2", "拍现象", "拍现象",
        "两同向、频率接近的简谐振动合成，振幅时强时弱的现象称什么？",
        "拍。",
        "拍")

    # ch04 supplement
    add("04", "4.1", "波跨介质变化", "波跨介质",
        "机械波通过不同介质时，波长、频率、速度哪些变？",
        "频率不变；波速随介质变；波长随波速变。",
        "见解答")
    add("04", "4.1", "振动与波动", "振动波动",
        "振动和波动有何区别与联系？",
        "振动是波动根源；波动是振动传播、能量传播而非质点迁移。振动能量守恒，波动能量传播。",
        "见解答")
    add("04", "4.1", "波函数物理意义", "波函数意义",
        "$y=A\\cos[\\omega(t-x/u)+\\varphi]$ 中 $x/u$、$\\varphi$、$\\omega x/u$ 各表示什么？",
        "$x/u$：相位传到 x 处所需时间；$\\varphi$：原点初相；$\\omega x/u$：x 处相对原点落后相位。",
        "见解答")
    add("04", "4.1", "波函数初相", "波函数初相",
        "$A=0.10\\,\\mathrm{m}$，$T=0.50\\,\\mathrm{s}$，$\\lambda=10\\,\\mathrm{m}$，$t=0$ 原点 $y=+0.05\\,\\mathrm{m}$ 向平衡运动，求初相并写波函数。",
        "$\\cos\\varphi=0.5$，向平衡取 $\\varphi=\\pi/3$，$y=0.10\\cos[2\\pi(2t-x/10)+\\pi/3]\\,\\mathrm{m}$。",
        "见解答")
    add("04", "4.2", "弹性模量定义", "弹性模量",
        "弹性模量是？",
        "应力与相应应变之比。",
        "D")
    add("04", "4.3", "电梯吊缆张力", "吊缆张力",
        "吊缆弹性极限 $3\\times10^{8}\\,\\mathrm{N/m^2}$，$S=3\\times10^{-4}\\,\\mathrm{m^2}$，应力不超过极限 1/4，最大张力？",
        "$F=\\sigma S=(3\\times10^{8}/4)\\times3\\times10^{-4}=2.25\\times10^{4}\\,\\mathrm{N}$。",
        "2.25×10⁴ N（B）")

    return files


def main() -> None:
    import sys

    all_files: list[Path] = []
    if "--supplement-only" in sys.argv:
        all_files.extend(gen_supplement())
    else:
        all_files.extend(gen_ch01())
        all_files.extend(gen_ch02())
        all_files.extend(gen_ch03())
        all_files.extend(gen_ch04())
        all_files.extend(gen_supplement())

    counts: dict[str, int] = {}
    for p in all_files:
        m = re.search(r"ch(\d{2})", str(p))
        if m:
            ch = m.group(1)
            counts[ch] = counts.get(ch, 0) + 1

    print(f"Generated {len(all_files)} files")
    for ch in sorted(counts):
        print(f"  ch{ch}: {counts[ch]} examples")
    print("\nFiles:")
    for p in sorted(all_files):
        print(p.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()
