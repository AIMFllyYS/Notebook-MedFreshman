import type { VideoEntry } from "@/lib/content/types";

// ⚠️ 本文件由 manim/render_physics.py 自动生成，请勿手动编辑。
export const physicsVideos: VideoEntry[] = [
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.1-ex1-artery-stenosis-velocity",
    "chapterId": "ch02",
    "sectionId": "2.1",
    "title": "动脉狭窄处血流速度",
    "src": "/media/videos/physics/ch02/phys-ch02-2.1-ex1-artery-stenosis-velocity.mp4",
    "description": "用连续性方程 S1v1=S2v2 分析动脉粥样硬化斑块导致狭窄处血流加速，求解正常段与狭窄段流速。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.1-kp2-streamline-flow-tube",
    "chapterId": "ch02",
    "sectionId": "2.1",
    "title": "流线与流管的几何图像",
    "src": "/media/videos/physics/ch02/phys-ch02-2.1-kp2-streamline-flow-tube.mp4",
    "description": "用速度场箭头网格、逐条流线绘制与流管半透明填充，演示流线不相交特性和流管封闭性，ValueTracker 扫动流速展示流线疏密与速度的对应关系。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.1-kp3-continuity-equation",
    "chapterId": "ch02",
    "sectionId": "2.1",
    "title": "连续性方程：流量守恒",
    "src": "/media/videos/physics/ch02/phys-ch02-2.1-kp3-continuity-equation.mp4",
    "description": "用流管截面缩放动画与 v=Q/S 双曲线，直观演示不可压缩稳定流中 S1v1=S2v2 守恒规律。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.2-ex1-tank-orifice-velocity",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "容器小孔流速（托里拆利定理）",
    "src": "/media/videos/physics/ch02/phys-ch02-2.2-ex1-tank-orifice-velocity.mp4",
    "description": "以伯努利方程为基础逐步推导托里拆利公式 v=√(2gh)，并用 ValueTracker 动画展示液面下降时流速衰减与抛物线射程变化。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.2-ex2-aircraft-wing-lift",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "机翼升力与上下表面流速差",
    "src": "/media/videos/physics/ch02/phys-ch02-2.2-ex2-aircraft-wing-lift.mp4",
    "description": "用伯努利方程解释机翼升力原理：上表面流速大→压强小，下表面流速小→压强大，逐步推导并代入数值求 v1 ≈ 116 m/s。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.2-ex3-venturi-flowmeter",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "文丘里流量计原理与流量计算",
    "src": "/media/videos/physics/ch02/phys-ch02-2.2-ex3-venturi-flowmeter.mp4",
    "description": "用连续性方程与伯努利方程推导文丘里流量计公式，ValueTracker 演示液面差 h 与流量 Q 的关系。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.2-kp1-bernoulli-derivation",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "伯努利方程的推导",
    "src": "/media/videos/physics/ch02/phys-ch02-2.2-kp1-bernoulli-derivation.mp4",
    "description": "从倾斜流管的压力做功出发，用功能定理逐步推导伯努利方程，并动态演示三项此消彼长。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.2-kp2-bernoulli-pressure-velocity-tradeoff",
    "chapterId": "ch02",
    "sectionId": "2.2",
    "title": "截面变化引起的压强-流速互换",
    "src": "/media/videos/physics/ch02/phys-ch02-2.2-kp2-bernoulli-pressure-velocity-tradeoff.mp4",
    "description": "变截面管+测压管液面+ValueTracker演示伯努利方程：截面越小流速越大压强越低，含p-S曲线与空吸效应。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.3-ex1-poiseuille-viscosity-measurement",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "泊肃叶法测硫酸黏度",
    "src": "/media/videos/physics/ch02/phys-ch02-2.3-ex1-poiseuille-viscosity-measurement.mp4",
    "description": "通过泊肃叶定律，利用液柱压差驱动水平细管流动，测量硫酸的动力黏度 η=0.04 Pa·s。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.3-ex2-max-velocity-artery-reynolds",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "小动脉层流最大流速（雷诺数约束）",
    "src": "/media/videos/physics/ch02/phys-ch02-2.3-ex2-max-velocity-artery-reynolds.mp4",
    "description": "由雷诺数判据 Re<1000 推导小动脉（r=3mm）维持层流的最大流速约 0.95 m/s，并用动态仪表盘展示临界条件。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.3-ex3-viscous-bernoulli-energy-loss",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "黏性流体伯努利方程与供油管能量损耗",
    "src": "/media/videos/physics/ch02/phys-ch02-2.3-ex3-viscous-bernoulli-energy-loss.mp4",
    "description": "以等截面倾斜供油管为例，演示黏性伯努利方程化简、各能量项的正负贡献（柱状图直觉）与总能量损耗的计算全过程。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.3-kp1-newton-viscosity-law",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "牛顿黏滞定律与速度梯度",
    "src": "/media/videos/physics/ch02/phys-ch02-2.3-kp1-newton-viscosity-law.mp4",
    "description": "用双平行板线性速度剖面演示黏性流动，ValueTracker 扫动 dv/dx 和面积 S 展示 F=ηS(dv/dx)，并对比甘油与水的黏性力之比。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.3-kp2-poiseuille-law-velocity-profile",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "泊肃叶定律与抛物面流速分布",
    "src": "/media/videos/physics/ch02/phys-ch02-2.3-kp2-poiseuille-law-velocity-profile.mp4",
    "description": "用圆截面颜色映射展示抛物线速度剖面，ValueTracker 演示 Q∝R^4 的灵敏性，并将流量公式拆解为压差/流阻类比电路，配合数值例题揭示血管狭窄的危险性。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.3-kp3-reynolds-number-laminar-turbulent",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "雷诺数与层流-湍流转变",
    "src": "/media/videos/physics/ch02/phys-ch02-2.3-kp3-reynolds-number-laminar-turbulent.mp4",
    "description": "用圆管流动图+Re仪表盘演示层流到湍流的转变过程，ValueTracker 扫动流速；分析四参数对 Re 的影响；展示血管中典型 Re 值。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch02-2.3-kp4-blood-circulation-velocity-pressure",
    "chapterId": "ch02",
    "sectionId": "2.3",
    "title": "血液循环中的血流速度与血压分布",
    "src": "/media/videos/physics/ch02/phys-ch02-2.3-kp4-blood-circulation-velocity-pressure.mp4",
    "description": "用一维流程条展示血管总截面积S(x)与平均流速v(x)的镜像关系（连续性方程），叠加血压p(x)分布曲线（动脉红、静脉蓝），并以ValueTracker模拟心跳脉动演示收缩压与舒张压的动态波动。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.1-ex1-floating-block-shm",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "浮木简谐振动的证明与周期",
    "src": "/media/videos/physics/ch03/phys-ch03-3.1-ex1-floating-block-shm.mp4",
    "description": "通过浮力与重力的动态受力分析，推导合力 F=-kx，证明浮木振动为简谐振动，并得出周期 T=2π√(a/g)。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.1-ex2-initial-phase-phasor",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "用旋转矢量法确定初相位（例3-1）",
    "src": "/media/videos/physics/ch03/phys-ch03-3.1-ex2-initial-phase-phasor.mp4",
    "description": "旋转矢量圆图上，由 x₀=A/2 找两候选交点，再用 v₀>0 淘汰第一象限点，确定初相位 φ=-π/3，最终写出完整振动方程。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.1-kp2-shm-equation-derivation",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "简谐振动方程的建立与三要素",
    "src": "/media/videos/physics/ch03/phys-ch03-3.1-kp2-shm-equation-derivation.mp4",
    "description": "从弹簧振子受力出发推导微分方程，化简为标准形式，给出通解 x=Acos(ωt+φ)，用 ValueTracker 动态演示振幅、角频率、初相对 x-t 曲线的影响。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.1-kp3-rotating-vector-method",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "旋转矢量法与初相位确定",
    "src": "/media/videos/physics/ch03/phys-ch03-3.1-kp3-rotating-vector-method.mp4",
    "description": "用旋转矢量在圆上的投影演示 x=Acos(ωt+φ)，ValueTracker 同步描绘余弦波形，并通过两种典型初始条件演示初相位的几何确定方法。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.1-kp4-shm-phase-xva",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "位移、速度、加速度的相位关系",
    "src": "/media/videos/physics/ch03/phys-ch03-3.1-kp4-shm-phase-xva.mp4",
    "description": "动画演示简谐振动中 x、v、a 三者的余弦曲线，直观揭示 v 超前 x 相位 π/2、a 与 x 反相的规律，并用旋转矢量图联动验证。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.1-kp5-shm-energy",
    "chapterId": "ch03",
    "sectionId": "3.1",
    "title": "简谐振动的能量守恒",
    "src": "/media/videos/physics/ch03/phys-ch03-3.1-kp5-shm-energy.mp4",
    "description": "弹簧振子动画 + E-t 曲线同步展示 Ek/Ep 互换、总能量守恒，ValueTracker 演示 E∝A² 关系，能量条形图动态分配。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.2-ex1-phasor-addition-example",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "旋转矢量法数值合成（例3-10）",
    "src": "/media/videos/physics/ch03/phys-ch03-3.2-ex1-phasor-addition-example.mp4",
    "description": "用旋转矢量（相量）平行四边形法合成 x1=4cos(3πt+π/3) 与 x2=3cos(3πt-π/6)，逐步推导 Δφ=-π/2 → A=5m → 合振动方程，并用三条 x-t 波形验证结果。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.2-kp1-same-freq-synthesis-phasor",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "同向同频简谐振动的合成（旋转矢量法）",
    "src": "/media/videos/physics/ch03/phys-ch03-3.2-kp1-same-freq-synthesis-phasor.mp4",
    "description": "用旋转矢量（相量）法演示同向同频简谐振动的合成：平行四边形法则、合振幅随相位差余弦变化、同相加强/反相相消的极值条件，以及 x-t 波形对比。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.2-kp2-beat-phenomenon",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "拍现象与拍频",
    "src": "/media/videos/physics/ch03/phys-ch03-3.2-kp2-beat-phenomenon.mp4",
    "description": "双频率接近余弦波叠加演示拍现象：Axes绘制分量波与合振动，DashedVMobject绘制慢变包络，ValueTracker动态改变频率差观察拍频等比例变化，旁注调音应用。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.2-kp3-perpendicular-lissajous",
    "chapterId": "ch03",
    "sectionId": "3.2",
    "title": "互相垂直振动的合成与李萨如图形",
    "src": "/media/videos/physics/ch03/phys-ch03-3.2-kp3-perpendicular-lissajous.mp4",
    "description": "通过 ValueTracker 扫动相位差演示同频垂直振动的轨迹变化（直线→椭圆→圆），再展示频率比 1:2、1:3、2:3 时的稳定李萨如图形及切点数规律。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.3-ex1-three-damping-comparison",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "三种阻尼状态的判断与对比",
    "src": "/media/videos/physics/ch03/phys-ch03-3.3-ex1-three-damping-comparison.mp4",
    "description": "并排绘制欠阻尼/临界/过阻尼 x-t 曲线，配生活类比与判据表格，帮助零基础读者直观理解三种阻尼状态的差异与应用。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.3-kp1-damped-oscillation",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "阻尼振动：三种阻尼状态与指数衰减",
    "src": "/media/videos/physics/ch03/phys-ch03-3.3-kp1-damped-oscillation.mp4",
    "description": "用三色曲线对比欠阻尼/临界阻尼/过阻尼，ValueTracker 演示 β 增大时振幅指数衰减与振荡消失的完整过程。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch03-3.3-kp2-resonance-amplitude-curve",
    "chapterId": "ch03",
    "sectionId": "3.3",
    "title": "受迫振动与共振曲线",
    "src": "/media/videos/physics/ch03/phys-ch03-3.3-kp2-resonance-amplitude-curve.mp4",
    "description": "绘制不同阻尼下的振幅-频率共振曲线，演示驱动频率扫动时振幅的实时变化，标注共振峰与Q值，并通过塔科马大桥和乐器共鸣箱说明共振的危害与应用。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.1-ex1-wave-param-from-equation",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "例题：由波函数读取物理量",
    "src": "/media/videos/physics/ch04/phys-ch04-4.1-ex1-wave-param-from-equation.mp4",
    "description": "给定 y=0.05cos(10πt-4πx)，逐步彩框标注系数读出振幅 A、角频率 ω、波数 k，推导频率、波长、波速，并可视化 t=0 波形与 x=0 振动曲线，标出质点最大速度与最大加速度的位置。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.1-ex2-phase-tracking-along-wave",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "例题：相位追踪与运动状态传播",
    "src": "/media/videos/physics/ch04/phys-ch04-4.1-ex2-phase-tracking-along-wave.mp4",
    "description": "在 x-t 时空图上沿等相位线追踪三个关键点（红/绿/蓝），验证 φ=9.2π 以波速 u=2.5m/s 传播，并在波形图中高亮对应质点。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.1-kp1-plane-wave",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "平面简谐波：振动在空间的传播",
    "src": "/media/videos/physics/ch04/phys-ch04-4.1-kp1-plane-wave.mp4",
    "description": "Axes 绘制 y=Acos(kx-ωt)，ValueTracker 时间扫动让波形传播，红点演示质点只上下振动。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.1-kp2-wave-function-meaning",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "波函数的三重意义与相位分析",
    "src": "/media/videos/physics/ch04/phys-ch04-4.1-kp2-wave-function-meaning.mp4",
    "description": "用 ValueTracker 动画依次演示波函数的三重意义（质点振动、波形快照、波形传播），并用双向箭头和动态相位差公式展示 Δφ=kΔx，最后以半波长反相、整波长同相收尾。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.1-kp3-transverse-vs-longitudinal",
    "chapterId": "ch04",
    "sectionId": "4.1",
    "title": "横波与纵波：振动方向可视化",
    "src": "/media/videos/physics/ch04/phys-ch04-4.1-kp3-transverse-vs-longitudinal.mp4",
    "description": "左侧演示横波质点上下振动、右侧演示纵波疏密前进，最终定格横波/纵波判断口诀与波速公式。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.2-ex1-interference-coherent-sources",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "例题：两相干波源在延长线上的干涉",
    "src": "/media/videos/physics/ch04/phys-ch04-4.2-ex1-interference-coherent-sources.mp4",
    "description": "以 P(0)、Q(3m) 两相干波源为例，用相量图、路程彩线与 ValueTracker 逐步推导延长线上任意点 S 的相位差 Δφ=-π，说明 Q 右侧全为干涉相消暗区。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.2-ex2-standing-wave-nodes-antinodes",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "例题：由驻波方程求波节波腹位置",
    "src": "/media/videos/physics/ch04/phys-ch04-4.2-ex2-standing-wave-nodes-antinodes.mp4",
    "description": "由驻波方程 y=0.12cos(πx)cos(4πt) 逐步推导波节、波腹位置及任意点振幅，最终动画展示驻波整体振动形态。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.2-kp1-wave-energy-density",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "波的能量：动能势能同步与能流强度",
    "src": "/media/videos/physics/ch04/phys-ch04-4.2-kp1-wave-energy-density.mp4",
    "description": "可视化演示行波中动能与势能同相变化，对比弹簧振子反相；ValueTracker 驱动高能量区随波传播；逐步导出能量密度与能流强度公式。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.2-kp2-wave-interference-pattern",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "波的干涉：相位差条件与空间分布",
    "src": "/media/videos/physics/ch04/phys-ch04-4.2-kp2-wave-interference-pattern.mp4",
    "description": "用同心圆波纹动画 + 二维热图展示两相干波源的干涉场，ValueTracker 拖动 P 点实时显示波程差 δ、相位差 Δφ 与合振幅，揭示明暗纹沿双曲线族分布的规律。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.2-kp3-standing-wave-formation",
    "chapterId": "ch04",
    "sectionId": "4.2",
    "title": "驻波的形成与波节波腹分布",
    "src": "/media/videos/physics/ch04/phys-ch04-4.2-kp3-standing-wave-formation.mp4",
    "description": "三行坐标轴同步展示两列行波叠加为驻波，标注波节/波腹位置与间距λ/2，能量柱图演示动能↔势能交替转化而无净传播。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.3-ex1-sonar-doppler-submarine",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "例题：声呐超声波测潜艇航速",
    "src": "/media/videos/physics/ch04/phys-ch04-4.3-ex1-sonar-doppler-submarine.mp4",
    "description": "演示声呐双重多普勒效应：驱逐舰发射→潜艇（运动观测者）接收→反射回驱逐舰，分三步推导合并公式并用 ValueTracker 代入数值求解潜艇速度≈9.4 m/s。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.3-ex2-doppler-beat-frequency",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "例题：双声源多普勒拍频",
    "src": "/media/videos/physics/ch04/phys-ch04-4.3-ex2-doppler-beat-frequency.mp4",
    "description": "P、Q 双声源 + 运动观察者：逐步用多普勒公式求各自接收频率，再作差得拍频 13 Hz，最后用叠加波形动画演示「拍」现象。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.3-kp1-doppler-effect-mechanism",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "多普勒效应：波源运动与观测者运动的机制",
    "src": "/media/videos/physics/ch04/phys-ch04-4.3-kp1-doppler-effect-mechanism.mp4",
    "description": "分上下两幅分别演示观测者运动和波源运动导致的频率变化，结合 ValueTracker 动态扫动，汇总统一多普勒公式并以救护车数值示例收尾。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch04-4.3-kp2-sound-intensity-level",
    "chapterId": "ch04",
    "sectionId": "4.3",
    "title": "声强级与对数标度：人耳感知范围",
    "src": "/media/videos/physics/ch04/phys-ch04-4.3-kp2-sound-intensity-level.mp4",
    "description": "通过线性轴 vs 对数轴对比、ValueTracker 游标拖动与特例冲击动画，直观理解 L_I=10lg(I/I0) 及声强比公式。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.1-ex1-gas-bubble-rising-volume",
    "chapterId": "ch05",
    "sectionId": "5.1",
    "title": "湖底气泡上升至湖面的体积变化",
    "src": "/media/videos/physics/ch05/phys-ch05-5.1-ex1-gas-bubble-rising-volume.mp4",
    "description": "用湖泊截面图与双仪表盘演示气泡从50m深处上升过程中压强、温度、体积的动态变化，逐步代入理想气体状态方程求解V2≈61cm³。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.1-kp2-molecular-force-potential-well",
    "chapterId": "ch05",
    "sectionId": "5.1",
    "title": "分子力与分子势能曲线",
    "src": "/media/videos/physics/ch05/phys-ch05-5.1-kp2-molecular-force-potential-well.mp4",
    "description": "双坐标系联动演示 F(r) 分子力曲线与 Ep(r) 势能阱，ValueTracker 扫动 r 值实时标注斥力/引力/平衡态，揭示凝聚态与不可压缩性的微观本质。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.1-kp3-pressure-derivation-molecular-collision",
    "chapterId": "ch05",
    "sectionId": "5.1",
    "title": "气体压强的微观推导",
    "src": "/media/videos/physics/ch05/phys-ch05-5.1-kp3-pressure-derivation-molecular-collision.mp4",
    "description": "从单分子弹性碰撞出发，经圆柱体扫过体积统计分子数、ValueTracker扫速度分布，逐步推导出 p=(1/3)nmv²=(2/3)nEk，揭示压强是大量分子碰撞的统计平均。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.1-kp4-energy-equipartition-degrees-of-freedom",
    "chapterId": "ch05",
    "sectionId": "5.1",
    "title": "能量均分定理与分子自由度",
    "src": "/media/videos/physics/ch05/phys-ch05-5.1-kp4-energy-equipartition-degrees-of-freedom.mp4",
    "description": "通过单原子、双原子、三原子分子三段式动画，演示各类分子自由度划分与能量均分定理，并用 ValueTracker 动态展示 U=(i/2)RT 随 i 变化的曲线。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-ex1-three-speed-comparison-maxwell",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "三种特征速率的计算与比较（氢气/氧气）",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-ex1-three-speed-comparison-maxwell.mp4",
    "description": "麦克斯韦速率分布双曲线（H2/O2），逐步标注 vp、v_bar、v_rms，展示 4:1 之比，ValueTracker 扫温度演示速率随 sqrt(T) 增长。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-ex2-soap-bubble-pressure-work",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "吹肥皂泡的做功与附加压强（例5-4/5-15）",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-ex2-soap-bubble-pressure-work.mp4",
    "description": "动画演示肥皂泡从零吹大的做功计算（双层膜 ΔA=8πR²α），并推导球形液膜附加压强 ΔP=4α/R，对比液面单面公式 ΔP=2α/R。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-ex3-capillary-height-ratio-two-tubes",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "不同液体在两毛细管中的高度差比较（例5-5）",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-ex3-capillary-height-ratio-two-tubes.mp4",
    "description": "用两根不同半径毛细管演示水与酒精的高度差 Δh，由比值公式 Δh1/Δh2=α1ρ2/(α2ρ1) 反推酒精表面张力系数 α2≈0.022 N/m。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-kp2-maxwell-speed-distribution",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "麦克斯韦速率分布律",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-kp2-maxwell-speed-distribution.mp4",
    "description": "Axes 绘制 f(v) 分布曲线，ValueTracker 扫动温度 T 和分子质量 m，展示三特征速率 vp/v_bar/v_rms 的物理含义与参数依赖关系。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-kp3-mean-free-path-collision-frequency",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "平均自由程与平均碰撞频率",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-kp3-mean-free-path-collision-frequency.mp4",
    "description": "通过碰撞管几何模型推导平均自由程 λ 和碰撞频率 z，用 ValueTracker 展示 λ 随分子数密度 n 减小，并对比压强与温度对 λ 的不同影响。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-kp4-boltzmann-distribution-atmosphere",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "玻尔兹曼分布与大气压随高度变化",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-kp4-boltzmann-distribution-atmosphere.mp4",
    "description": "通过密度点阵+n(h)/p(h)坐标系，用ValueTracker动态演示温度T与摩尔质量μ对大气垂直分布和标高的影响。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-kp5-surface-tension-molecular-origin",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "表面张力的微观起源与表面能",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-kp5-surface-tension-molecular-origin.mp4",
    "description": "从分子受力不均揭示表面张力的微观起源，用 ValueTracker 演示 F=αL，并展示拉伸液面做功与表面能增量的等价关系及肥皂膜收缩。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-kp6-curved-surface-excess-pressure",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "弯曲液面的附加压强（拉普拉斯公式）",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-kp6-curved-surface-excess-pressure.mp4",
    "description": "从球形液面力平衡推导 ΔP=2α/R，扩展到肥皂泡双膜 ΔP=4α/R，用连通管动画演示小泡高压流向大泡的反直觉现象。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch05-5.2-kp7-capillary-rise-contact-angle",
    "chapterId": "ch05",
    "sectionId": "5.2",
    "title": "毛细现象与接触角",
    "src": "/media/videos/physics/ch05/phys-ch05-5.2-kp7-capillary-rise-contact-angle.mp4",
    "description": "接触角决定液面凹凸，逐步推导平衡公式 h=2αcosθ/(ρgr)，ValueTracker 扫动 r/α/θ 演示参数依赖，配 1/r 曲线与树木导管应用。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.1-ex1-finite-line-charge-field",
    "chapterId": "ch07",
    "sectionId": "7.1",
    "title": "例题：有限长均匀带电直线的中垂线场强",
    "src": "/media/videos/physics/ch07/phys-ch07-7.1-ex1-finite-line-charge-field.mp4",
    "description": "用矢量分解+ValueTracker扫动演示有限长均匀带电直线在中垂线上的合场强推导，含两个极限情形的公式变化。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.1-kp1-electric-field",
    "chapterId": "ch07",
    "sectionId": "7.1",
    "title": "电场强度：电荷周围的力场",
    "src": "/media/videos/physics/ch07/phys-ch07-7.1-kp1-electric-field.mp4",
    "description": "用辐射状矢量场展示点电荷电场，ValueTracker 扫动电荷量演示 E∝q、E∝1/r²。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.1-kp2-superposition-continuous-charge",
    "chapterId": "ch07",
    "sectionId": "7.1",
    "title": "叠加原理与连续带电体场强积分",
    "src": "/media/videos/physics/ch07/phys-ch07-7.1-kp2-superposition-continuous-charge.mp4",
    "description": "从离散叠加到连续积分，动画演示带电直线的 dE 方向、对称抵消与有限长场强公式 E=kq/(r√(L²+r²))。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.2-ex1-cylinder-gauss-surface",
    "chapterId": "ch07",
    "sectionId": "7.2",
    "title": "例题：无限长带电圆柱面内外场强",
    "src": "/media/videos/physics/ch07/phys-ch07-7.2-ex1-cylinder-gauss-surface.mp4",
    "description": "用同轴高斯圆柱面分析通量，推导无限长带电圆柱面内 E=0、外 E=Dσ/(2ε₀r)，并用 ValueTracker 演示 E(r) 随半径的跳变行为。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.2-ex2-charged-disk-field",
    "chapterId": "ch07",
    "sectionId": "7.2",
    "title": "例题：均匀带电圆盘轴线场强",
    "src": "/media/videos/physics/ch07/phys-ch07-7.2-ex2-charged-disk-field.mp4",
    "description": "将带电圆盘拆分为同心圆环逐步积分，动画演示 dE 垂直分量对称抵消、轴向分量累加，推导 E=σ/(2ε₀)[1-1/√(1+R²/x²)] 并展示两个物理极限。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.2-kp1-electric-flux-gauss-law",
    "chapterId": "ch07",
    "sectionId": "7.2",
    "title": "电通量与高斯定理",
    "src": "/media/videos/physics/ch07/phys-ch07-7.2-kp1-electric-flux-gauss-law.mp4",
    "description": "用 ValueTracker 动态演示面倾角对电通量的影响，再以场线计数动画揭示高斯定理的核心——净通量只取决于闭合面内部电荷总量。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.2-kp2-gauss-law-symmetric-fields",
    "chapterId": "ch07",
    "sectionId": "7.2",
    "title": "高斯定理求对称电场分布",
    "src": "/media/videos/physics/ch07/phys-ch07-7.2-kp2-gauss-law-symmetric-fields.mp4",
    "description": "通过球对称、柱对称、面对称三类典型模型，演示如何借助高斯定理和对称性一步求出 E 的分布规律及公式。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.3-ex1-solid-sphere-potential-distribution",
    "chapterId": "ch07",
    "sectionId": "7.3",
    "title": "例题：均匀带电球体内外电势分布",
    "src": "/media/videos/physics/ch07/phys-ch07-7.3-ex1-solid-sphere-potential-distribution.mp4",
    "description": "用 ValueTracker 扫动高斯球面，实时绘制 E(r) 曲线；分两段积分动画推导 V(r)，展示球内抛物线分布与球心最大电势。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.3-ex2-charged-sphere-capacitor-energy",
    "chapterId": "ch07",
    "sectionId": "7.3",
    "title": "例题：平行板电容器能量与极板间距变化",
    "src": "/media/videos/physics/ch07/phys-ch07-7.3-ex2-charged-sphere-capacitor-energy.mp4",
    "description": "电量不变时极板间距从 d 变为 2d，通过场能密度直观演示电场能量加倍，并澄清极板受力中单/双面场的常见错误。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.3-kp1-circulation-theorem-electric-potential",
    "chapterId": "ch07",
    "sectionId": "7.3",
    "title": "环路定理与电势的引入",
    "src": "/media/videos/physics/ch07/phys-ch07-7.3-kp1-circulation-theorem-electric-potential.mp4",
    "description": "三幕动画：路径无关与环路定理→等势面与电场线正交（ValueTracker）→电势积分定义与 V=kq/r 曲线。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.3-kp2-gradient-field-potential-relation",
    "chapterId": "ch07",
    "sectionId": "7.3",
    "title": "场强与电势梯度的关系",
    "src": "/media/videos/physics/ch07/phys-ch07-7.3-kp2-gradient-field-potential-relation.mp4",
    "description": "用平行板匀强电场与点电荷场，动画演示 E = -grad V：等势面越密场强越大，负梯度方向即场强方向。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.4-ex1-dipole-circular-path-work",
    "chapterId": "ch07",
    "sectionId": "7.4",
    "title": "例题：电偶极子场中沿圆弧路径做功",
    "src": "/media/videos/physics/ch07/phys-ch07-7.4-ex1-dipole-circular-path-work.mp4",
    "description": "以电偶极子为背景，可视化演示 A→B 三条路径电场力做功结果相同，推导 W=2kpq/r² 并揭示静电场路径无关性。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.4-kp1-electric-dipole-far-field",
    "chapterId": "ch07",
    "sectionId": "7.4",
    "title": "电偶极子远场电势与场强",
    "src": "/media/videos/physics/ch07/phys-ch07-7.4-kp1-electric-dipole-far-field.mp4",
    "description": "用叠加法推导远场电势 V=pcosθ/(4πε₀r²)，扫描角 θ 演示 E_r、E_θ 变化，展示场线形态与 E∝1/r³ 衰减特性。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch07-7.4-kp2-dipole-layer-solid-angle",
    "chapterId": "ch07",
    "sectionId": "7.4",
    "title": "电偶层、立体角与生物电应用",
    "src": "/media/videos/physics/ch07/phys-ch07-7.4-kp2-dipole-layer-solid-angle.mp4",
    "description": "从电偶层层矩 τ=σδ 出发，推导面元电势 dV=kτdΩ 和积分公式 V=kτΩ，用 ValueTracker 演示立体角随场点位置变化，再以心脏闭合电偶层为例建立 ECG 物理模型并同步绘制心电波形。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.1-ex1-rectangular-surface-magnetic-flux",
    "chapterId": "ch08",
    "sectionId": "8.1",
    "title": "矩形平面磁通量（长直导线）",
    "src": "/media/videos/physics/ch08/phys-ch08-8.1-ex1-rectangular-surface-magnetic-flux.mp4",
    "description": "通过颜色渐变、ValueTracker扫动积分变量、柱状图堆叠三步动画，演示长直导线旁矩形面的磁通量积分推导，最终得到 Φ=(μ₀Il/2π)ln(d2/d1)。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.1-kp2-magnetic-flux-gauss-theorem",
    "chapterId": "ch08",
    "sectionId": "8.1",
    "title": "磁通量与磁场高斯定理",
    "src": "/media/videos/physics/ch08/phys-ch08-8.1-kp2-magnetic-flux-gauss-theorem.mp4",
    "description": "用条形磁铁场线、倾角扫动和封闭球面计数器，直观推导磁通量定义与磁场高斯定理 ∮B·dS=0。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.1-kp3-magnetic-field-right-hand-rule",
    "chapterId": "ch08",
    "sectionId": "8.1",
    "title": "磁感应强度方向与右手定则",
    "src": "/media/videos/physics/ch08/phys-ch08-8.1-kp3-magnetic-field-right-hand-rule.mp4",
    "description": "通过叉积几何可视化、ValueTracker 扫动夹角 θ 演示洛伦兹力变化，再用同心圆切线箭头展示载流导线磁场，彻底建立右手定则直觉。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.2-ex1-hydrogen-atom-magnetic-moment",
    "chapterId": "ch08",
    "sectionId": "8.2",
    "title": "氢原子电子轨道磁矩",
    "src": "/media/videos/physics/ch08/phys-ch08-8.2-ex1-hydrogen-atom-magnetic-moment.mp4",
    "description": "通过俯视圆形轨道、安培定律汇聚dB、侧视磁矩矢量三步可视化，推导氢原子电子轨道等效电流、圆心磁场B与轨道磁矩pm，并与玻尔磁子量级对照。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.2-ex2-arc-straight-wire-combined-field",
    "chapterId": "ch08",
    "sectionId": "8.2",
    "title": "直线-圆弧复合导线的磁场叠加",
    "src": "/media/videos/physics/ch08/phys-ch08-8.2-ex2-arc-straight-wire-combined-field.mp4",
    "description": "对由两段半无限长直导线和一段120°圆弧构成的平面载流导线，逐段用毕奥-萨伐尔定律求各段在圆心P处的磁感应强度，再通过矢量叠加得到合场B≈0.21μ₀I/R，方向垂直纸面向里。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.2-kp2-biot-savart-law-derivation",
    "chapterId": "ch08",
    "sectionId": "8.2",
    "title": "毕奥-萨伐尔定律与电流元叠加",
    "src": "/media/videos/physics/ch08/phys-ch08-8.2-kp2-biot-savart-law-derivation.mp4",
    "description": "从电流元 Idl 出发，逐步推导毕奥-萨伐尔定律，通过叉积动画与积分扫动展示有限长导线磁场公式及无限长特例的同心圆场线。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.2-kp3-circular-loop-axial-field",
    "chapterId": "ch08",
    "sectionId": "8.2",
    "title": "载流圆线圈轴线磁场分布",
    "src": "/media/videos/physics/ch08/phys-ch08-8.2-kp3-circular-loop-axial-field.mp4",
    "description": "从比奥-萨法尔定律出发，通过对称性分析推导圆线圈轴线磁场公式，ValueTracker 扫动场点演示 B(x) 曲线，并展示远场 1/x³ 磁偶极子近似。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.2-kp4-solenoid-interior-field",
    "chapterId": "ch08",
    "sectionId": "8.2",
    "title": "载流螺线管内部匀强磁场",
    "src": "/media/videos/physics/ch08/phys-ch08-8.2-kp4-solenoid-interior-field.mp4",
    "description": "通过叠加圆环磁场曲线（ValueTracker 5→100匝）直觉化演示内部匀强过程，推导有限长公式 B=(μ₀nI/2)(cosβ₁-cosβ₂)，取无限长极限得 B=μ₀nI，并绘制磁感应线截面图。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.3-ex1-coaxial-cable-b-distribution",
    "chapterId": "ch08",
    "sectionId": "8.3",
    "title": "同轴电缆各区域磁场与B-r曲线",
    "src": "/media/videos/physics/ch08/phys-ch08-8.3-ex1-coaxial-cable-b-distribution.mp4",
    "description": "用安培环路定理逐区域推导同轴电缆磁场，ValueTracker动态展示安培回路，最后逐段绘制B-r分布曲线并揭示电磁屏蔽原理。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.3-kp2-ampere-law-symmetric-applications",
    "chapterId": "ch08",
    "sectionId": "8.3",
    "title": "安培环路定理的对称应用",
    "src": "/media/videos/physics/ch08/phys-ch08-8.3-kp2-ampere-law-symmetric-applications.mp4",
    "description": "以同轴电缆为例，用安培环路定理分四区推导 B(r) 并动画绘制完整 B-r 曲线。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.3-kp3-ampere-law-vs-gauss-analogy",
    "chapterId": "ch08",
    "sectionId": "8.3",
    "title": "安培环路定理与高斯定理类比",
    "src": "/media/videos/physics/ch08/phys-ch08-8.3-kp3-ampere-law-vs-gauss-analogy.mp4",
    "description": "左右分屏对比电场高斯定理（有源）与安培环路定理（有旋），并演示「积分为零不等于B为零」的关键误区。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.4-ex1-ampere-impulse-wire-jump",
    "chapterId": "ch08",
    "sectionId": "8.4",
    "title": "安培力冲量使导线跳起",
    "src": "/media/videos/physics/ch08/phys-ch08-8.4-ex1-ampere-impulse-wire-jump.mp4",
    "description": "通过安培力冲量 Blq=mv 推导水银槽导线跳起高度，并用 ValueTracker 演示电量 q 对跳高 h 的参数依赖。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.4-ex2-lorentz-force-three-directions",
    "chapterId": "ch08",
    "sectionId": "8.4",
    "title": "电子在长直导线磁场中的洛伦兹力方向",
    "src": "/media/videos/physics/ch08/phys-ch08-8.4-ex2-lorentz-force-three-directions.mp4",
    "description": "用三列并排场景展示电子在长直导线同心圆磁场中以三种不同速度方向运动时洛伦兹力的方向与大小，揭示 sinθ 决定力的大小的物理本质。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.4-ex3-hall-effect-blood-velocity",
    "chapterId": "ch08",
    "sectionId": "8.4",
    "title": "霍尔效应测量血流速度",
    "src": "/media/videos/physics/ch08/phys-ch08-8.4-ex3-hall-effect-blood-velocity.mp4",
    "description": "以血管截面动画演示霍尔效应：磁场中运动的导电血液产生横向电压，由此推算血流速度 v=UH/(Bd)=0.63 m/s。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.4-kp2-lorentz-force-circular-helical-motion",
    "chapterId": "ch08",
    "sectionId": "8.4",
    "title": "洛伦兹力：带电粒子圆周与螺旋运动",
    "src": "/media/videos/physics/ch08/phys-ch08-8.4-kp2-lorentz-force-circular-helical-motion.mp4",
    "description": "演示带电粒子在匀强磁场中做圆周/螺旋运动，推导 R、T、f、h 公式，展示回旋加速器原理。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.4-kp3-ampere-force-current-loop-torque",
    "chapterId": "ch08",
    "sectionId": "8.4",
    "title": "安培力与载流线圈磁力矩",
    "src": "/media/videos/physics/ch08/phys-ch08-8.4-kp3-ampere-force-current-loop-torque.mp4",
    "description": "从安培力受力分析出发，用 ValueTracker 演示力矩 M=NISB sinφ 随角度变化，再同步势能 U=-pm·B 曲线展示线圈旋转至稳定平衡的全过程。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch08-8.4-kp4-hall-effect-mechanism",
    "chapterId": "ch08",
    "sectionId": "8.4",
    "title": "霍尔效应：载流子偏转与霍尔电压",
    "src": "/media/videos/physics/ch08/phys-ch08-8.4-kp4-hall-effect-mechanism.mp4",
    "description": "四步递进：洛伦兹力侧偏电子→霍尔电场平衡→UH公式推导→ValueTracker扫动参数与正负载流子对比。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.1-ex1-rotating-coil-ac-emf",
    "chapterId": "ch09",
    "sectionId": "9.1",
    "title": "匀强磁场中旋转线圈的感应电动势",
    "src": "/media/videos/physics/ch09/phys-ch09-9.1-ex1-rotating-coil-ac-emf.mp4",
    "description": "正视图线圈旋转 + 双坐标轴实时追踪 Φ(t) 和 ε(t)，演示两者 π/2 相位差与交流电产生原理。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.1-ex2-rectangular-coil-moving-away-wire",
    "chapterId": "ch09",
    "sectionId": "9.1",
    "title": "矩形线圈远离长直导线的感应电动势",
    "src": "/media/videos/physics/ch09/phys-ch09-9.1-ex2-rectangular-coil-moving-away-wire.mp4",
    "description": "推导矩形线圈从初位置 R1 向右运动时，AB/CD 两边动生 EMF 之差构成净感应电动势的公式，并用楞次定律判断顺时针感应电流方向。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.1-kp1-faraday-induction-law",
    "chapterId": "ch09",
    "sectionId": "9.1",
    "title": "法拉第电磁感应定律",
    "src": "/media/videos/physics/ch09/phys-ch09-9.1-kp1-faraday-induction-law.mp4",
    "description": "三幕结构：磁感线密度+Φ(t)曲线→切线斜率导出ε=-dΦ/dt（负号=楞次定律）→N匝线圈磁链ε=-NdΦ/dt。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.1-kp2-lenz-law-direction",
    "chapterId": "ch09",
    "sectionId": "9.1",
    "title": "楞次定律与感应方向",
    "src": "/media/videos/physics/ch09/phys-ch09-9.1-kp2-lenz-law-direction.mp4",
    "description": "动画演示磁铁插入/拔出线圈时楞次定律的三步判断流程，实时展示磁通变化与感应电流方向，最后揭示楞次定律的能量守恒本质。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.2-ex1-rotating-rod-emf-integration",
    "chapterId": "ch09",
    "sectionId": "9.2",
    "title": "旋转金属杆的动生电动势",
    "src": "/media/videos/physics/ch09/phys-ch09-9.2-ex1-rotating-rod-emf-integration.mp4",
    "description": "用洛伦兹力微元积分与法拉第定律两种方法推导旋转金属杆的动生电动势 ε=BωL²/2，ValueTracker 演示微元扫动与扇形面积增长，验证两法等价并分析极性。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.2-ex2-ab-bar-sliding-motional-emf",
    "chapterId": "ch09",
    "sectionId": "9.2",
    "title": "导体棒在匀强磁场中滑动的动生电动势",
    "src": "/media/videos/physics/ch09/phys-ch09-9.2-ex2-ab-bar-sliding-motional-emf.mp4",
    "description": "俯视图演示导体棒 ab 在匀强磁场中匀速滑动：从洛伦兹力分析到 ε=Blv、I、P 的逐步计算，再到安培阻力与能量守恒的完整闭环。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.2-kp1-motional-emf-lorentz",
    "chapterId": "ch09",
    "sectionId": "9.2",
    "title": "动生电动势与洛伦兹力",
    "src": "/media/videos/physics/ch09/phys-ch09-9.2-kp1-motional-emf-lorentz.mp4",
    "description": "以导体棒在匀强磁场中平动为主线，演示洛伦兹力分离电荷、产生动生电动势，并推导直棒公式 ε=Blv 和旋转杆公式 ε=BωL²/2。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.2-kp2-induced-electric-field-vortex",
    "chapterId": "ch09",
    "sectionId": "9.2",
    "title": "感生电动势与涡旋电场",
    "src": "/media/videos/physics/ch09/phys-ch09-9.2-kp2-induced-electric-field-vortex.mp4",
    "description": "用俯视图动画展示变化磁场激发涡旋电场，ValueTracker 驱动 B 增大，环路定理逐步推导内外两段 E_i(r) 公式，最终拼成完整 E-r 图像。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.3-ex1-toroidal-inductor-self-inductance",
    "chapterId": "ch09",
    "sectionId": "9.3",
    "title": "螺绕环自感系数计算",
    "src": "/media/videos/physics/ch09/phys-ch09-9.3-ex1-toroidal-inductor-self-inductance.mp4",
    "description": "用安培环路定理推导螺绕环磁场，对截面积分磁通量，逐步化简出 L = muN^2h/(2pi)*ln(R2/R1)。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.3-ex2-mutual-inductance-geometry-mean",
    "chapterId": "ch09",
    "sectionId": "9.3",
    "title": "两同轴线圈互感等于自感几何平均",
    "src": "/media/videos/physics/ch09/phys-ch09-9.3-ex2-mutual-inductance-geometry-mean.mp4",
    "description": "通过共轴螺线管磁感线动画与逐步公式推导，证明完全耦合时互感 M 等于两线圈自感 L1、L2 的几何平均，并介绍耦合系数 k。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.3-kp1-self-inductance-rl-transient",
    "chapterId": "ch09",
    "sectionId": "9.3",
    "title": "自感与 RL 电路暂态",
    "src": "/media/videos/physics/ch09/phys-ch09-9.3-kp1-self-inductance-rl-transient.mp4",
    "description": "第一幕：螺线管磁感线随电流变化演示自感 ε_L=-L dI/dt；第二幕：RL 电路微分方程推导 → 指数增长/衰减曲线 + τ/5τ 标注。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.3-kp2-magnetic-energy-density",
    "chapterId": "ch09",
    "sectionId": "9.3",
    "title": "磁场能量与能量密度",
    "src": "/media/videos/physics/ch09/phys-ch09-9.3-kp2-magnetic-energy-density.mp4",
    "description": "三幕动画：RL充电积分推导W=LI²/2、螺线管参数替换得w=B²/(2μ₀)、非均匀场体积分概念。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.4-ex1-capacitor-displacement-current",
    "chapterId": "ch09",
    "sectionId": "9.4",
    "title": "平行板电容器中的位移电流",
    "src": "/media/videos/physics/ch09/phys-ch09-9.4-ex1-capacitor-displacement-current.mp4",
    "description": "逐步推导平行板电容器中的位移电流 I_d = C dU/dt，演示其与传导电流数值相等，并用安培全电流定律说明路径无关性。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.4-ex2-em-wave-transverse-properties",
    "chapterId": "ch09",
    "sectionId": "9.4",
    "title": "平面电磁波性质综合辨析",
    "src": "/media/videos/physics/ch09/phys-ch09-9.4-ex2-em-wave-transverse-properties.mp4",
    "description": "五格动画逐步演示电磁波横波性（E×B右手系）、同相位波形叠加、振幅比E/B=c与能量密度相等、麦克斯韦方程推导光速c=1/√(μ₀ε₀)、以及电磁波谱彩虹七色可见光段。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.4-kp1-displacement-current-maxwell",
    "chapterId": "ch09",
    "sectionId": "9.4",
    "title": "位移电流与麦克斯韦方程组",
    "src": "/media/videos/physics/ch09/phys-ch09-9.4-kp1-displacement-current-maxwell.mp4",
    "description": "用平行板电容器充电动画展示位移电流与全电流连续性，再用四彩框逐步呈现麦克斯韦方程组，引出 E 与 B 互激产生电磁波。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch09-9.4-kp2-electromagnetic-wave-propagation",
    "chapterId": "ch09",
    "sectionId": "9.4",
    "title": "平面电磁波的特性与传播",
    "src": "/media/videos/physics/ch09/phys-ch09-9.4-kp2-electromagnetic-wave-propagation.mp4",
    "description": "用 ValueTracker 演示 E⊥B⊥k 互相垂直、同相位传播；Axes 画出完整 E(x)/B(x) 波形向右传播；推导 c=1/√(μ₀ε₀)、E/B=c；彩虹色块展示电磁波谱从无线电到 γ 射线。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.1-ex1-glass-ball-bubble-position",
    "chapterId": "ch10",
    "sectionId": "10.1",
    "title": "玻璃球内气泡定位",
    "src": "/media/videos/physics/ch10/phys-ch10-10.1-ex1-glass-ball-bubble-position.mp4",
    "description": "用折射球面公式逐步求解玻璃球内气泡的真实与表观位置，揭示视深变浅原理。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.1-ex2-glass-rod-two-surface-imaging",
    "chapterId": "ch10",
    "sectionId": "10.1",
    "title": "玻璃棒双球面逐次成像",
    "src": "/media/videos/physics/ch10/phys-ch10-10.1-ex2-glass-rod-two-surface-imaging.mp4",
    "description": "平行光经折射率1.5、棒长20cm玻璃棒的两个球面依次折射，逐步推导中间像v1=12cm及最终虚像v2=-16cm的位置。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.1-kp1-spherical-surface-refraction",
    "chapterId": "ch10",
    "sectionId": "10.1",
    "title": "单球面折射成像公式",
    "src": "/media/videos/physics/ch10/phys-ch10-10.1-kp1-spherical-surface-refraction.mp4",
    "description": "光路图演示近轴光线在单球面折射，ValueTracker 拖动物距实时更新像点，逐步推导 n1/u+n2/v=(n2-n1)/r 及焦点公式。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.1-kp2-sequential-imaging-coaxial",
    "chapterId": "ch10",
    "sectionId": "10.1",
    "title": "共轴球面系统逐次成像法",
    "src": "/media/videos/physics/ch10/phys-ch10-10.1-kp2-sequential-imaging-coaxial.mp4",
    "description": "用两面折射球面光路图演示逐次成像：第一面像距自动成为第二面物距，ValueTracker 扫动间距 d 展示虚物现象与 u2 符号变化。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.2-ex1-lens-group-sequential-imaging",
    "chapterId": "ch10",
    "sectionId": "10.2",
    "title": "双透镜组逐次成像（实物与虚物）",
    "src": "/media/videos/physics/ch10/phys-ch10-10.2-ex1-lens-group-sequential-imaging.mp4",
    "description": "通过 d=70cm（实物→虚像）与 d=45cm（虚物→实像）两种情况对比，直观解释「虚物」的物理本质与逐次成像公式的应用。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.2-kp1-thin-lens-imaging-formula",
    "chapterId": "ch10",
    "sectionId": "10.2",
    "title": "薄透镜成像公式与三条特殊光线",
    "src": "/media/videos/physics/ch10/phys-ch10-10.2-kp1-thin-lens-imaging-formula.mp4",
    "description": "动画演示凸透镜三条特殊光线作图成像，ValueTracker 实时展示物距变化时像点位移、实虚像切换及像距公式 1/u+1/v=1/f 数值，末尾对比凸/凹透镜成像差异。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.2-kp2-lens-in-medium-focal-length",
    "chapterId": "ch10",
    "sectionId": "10.2",
    "title": "透镜浸入液体后焦距变化",
    "src": "/media/videos/physics/ch10/phys-ch10-10.2-kp2-lens-in-medium-focal-length.mp4",
    "description": "用左右对比场景演示透镜在不同折射率介质中的焦距变化：ValueTracker 拖动 n0，实时更新光线汇聚/发散状态和焦度 Φ(n0) 曲线。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.2-kp3-lens-combination-power",
    "chapterId": "ch10",
    "sectionId": "10.2",
    "title": "薄透镜密接组合与焦度叠加",
    "src": "/media/videos/physics/ch10/phys-ch10-10.2-kp3-lens-combination-power.mp4",
    "description": "用逐次成像与等效透镜两种方法处理密接薄透镜组合，ValueTracker 动态演示等效焦点随 f2 的变化，并推导焦度叠加公式 Phi=Phi1+Phi2。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.3-ex1-myopia-glasses-diopter",
    "chapterId": "ch10",
    "sectionId": "10.3",
    "title": "近视眼镜度数计算",
    "src": "/media/videos/physics/ch10/phys-ch10-10.3-ex1-myopia-glasses-diopter.mp4",
    "description": "以远点 0.1 m 的近视眼为例，推导凹透镜焦度 Φ = -10 D，即眼镜度数 -1000 度。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.3-kp1-eye-accommodation-mechanism",
    "chapterId": "ch10",
    "sectionId": "10.3",
    "title": "眼的调节：近点、远点与明视距离",
    "src": "/media/videos/physics/ch10/phys-ch10-10.3-kp1-eye-accommodation-mechanism.mp4",
    "description": "通过眼截面动画与 ValueTracker 演示晶状体曲率调节，逐步说明正视眼、近视眼、远视眼的成像差异与眼镜矫正原理。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.3-kp2-ametropia-correction",
    "chapterId": "ch10",
    "sectionId": "10.3",
    "title": "近视、远视与散光的矫正原理",
    "src": "/media/videos/physics/ch10/phys-ch10-10.3-kp2-ametropia-correction.mp4",
    "description": "三栏并排图示近视/远视/散光的未矫正与矫正状态，ValueTracker 扫动屈光度让焦点实时移动，配公式 Phi=-1/d_far、Phi=1/0.25-1/d_near 推导及数值例题。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.4-ex1-microscope-specimen-placement",
    "chapterId": "ch10",
    "sectionId": "10.4",
    "title": "显微镜标本位置计算",
    "src": "/media/videos/physics/ch10/phys-ch10-10.4-ex1-microscope-specimen-placement.mp4",
    "description": "光路反推法：已知镜筒总长与两组透镜焦距，逐步求出标本应放置在物镜下方 1.74 cm 处，使最终像成在无穷远。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.4-ex2-microscope-na-resolution-comparison",
    "chapterId": "ch10",
    "sectionId": "10.4",
    "title": "数值孔径与分辨细节的判断",
    "src": "/media/videos/physics/ch10/phys-ch10-10.4-ex2-microscope-na-resolution-comparison.mp4",
    "description": "通过左右对比两台显微镜（N.A.=0.75 干燥 vs N.A.=1.5 油浸），演示最小分辨距离公式 Z=0.61λ/N.A. 及 ValueTracker 动态扫动，揭示油浸物镜提升分辨本领的原理。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.4-kp1-magnifier-angular-magnification",
    "chapterId": "ch10",
    "sectionId": "10.4",
    "title": "放大镜角放大率",
    "src": "/media/videos/physics/ch10/phys-ch10-10.4-kp1-magnifier-angular-magnification.mp4",
    "description": "通过裸眼与放大镜光路对比，推导角放大率 α=25/f，并用 ValueTracker 动态演示焦距变化对视角的影响。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch10-10.4-kp2-microscope-magnification-resolution",
    "chapterId": "ch10",
    "sectionId": "10.4",
    "title": "显微镜放大率与分辨本领",
    "src": "/media/videos/physics/ch10/phys-ch10-10.4-kp2-microscope-magnification-resolution.mp4",
    "description": "两阶段光路示意展示物镜/目镜放大率推导，ValueTracker 动态演示数值孔径变化时最小分辨距离的实时变化。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.1-ex1-thin-film-min-thickness",
    "chapterId": "ch11",
    "sectionId": "11.1",
    "title": "例题：薄膜反射最强/最弱最小厚度",
    "src": "/media/videos/physics/ch11/phys-ch11-11.1-ex1-thin-film-min-thickness.mp4",
    "description": "以 n=1.54 薄膜为例，动画化推导光程差 δ=2ne+λ/2，分别得出反射最强 e_min=λ/(4n)≈97.4nm 和反射最弱 e_min=λ/(2n)≈195nm，并强调上界面半波损失对条件的决定性影响。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.1-ex2-newton-ring-wavelength",
    "chapterId": "ch11",
    "sectionId": "11.1",
    "title": "例题：牛顿环测波长",
    "src": "/media/videos/physics/ch11/phys-ch11-11.1-ex2-newton-ring-wavelength.mp4",
    "description": "利用牛顿环第k环与第k+5环的半径公式相减消去k，推导并代入数值得到光波长590nm。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.1-kp2-young-double-slit-interference",
    "chapterId": "ch11",
    "sectionId": "11.1",
    "title": "杨氏双缝干涉光路与条纹分布",
    "src": "/media/videos/physics/ch11/phys-ch11-11.1-kp2-young-double-slit-interference.mp4",
    "description": "绘制双缝装置几何图示，演示S1/S2圆弧波阵面叠加，用ValueTracker实时控制λ和d展示屏上明暗条纹与间距公式Δx=Dλ/d。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.1-kp3-half-wave-loss",
    "chapterId": "ch11",
    "sectionId": "11.1",
    "title": "半波损失与光程差修正",
    "src": "/media/videos/physics/ch11/phys-ch11-11.1-kp3-half-wave-loss.mp4",
    "description": "通过界面反射相位翻转动画、波形对比、劳埃德镜几何与条纹扫动，直观讲解半波损失的物理本质及光程差修正规则。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.1-kp4-thin-film-equal-thickness",
    "chapterId": "ch11",
    "sectionId": "11.1",
    "title": "等厚干涉：劈尖与牛顿环",
    "src": "/media/videos/physics/ch11/phys-ch11-11.1-kp4-thin-film-equal-thickness.mp4",
    "description": "侧视图演示劈尖光路与半波损失，ValueTracker 扫动夹角θ展示条纹间距变化，再切换至牛顿环俯视图动画出同心暗环并展示环半径随曲率半径R的平方根关系。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.2-ex1-grating-missing-order-slit-width",
    "chapterId": "ch11",
    "sectionId": "11.2",
    "title": "例题：光栅常数、缺级与可见谱线",
    "src": "/media/videos/physics/ch11/phys-ch11-11.2-ex1-grating-missing-order-slit-width.mp4",
    "description": "三步解题：光栅方程求光栅常数d=3μm，缺级条件求单缝宽a=0.75μm，最后确定可见谱线共9条。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.2-kp2-single-slit-half-wave-zone",
    "chapterId": "ch11",
    "sectionId": "11.2",
    "title": "单缝夫琅禾费衍射：半波带法",
    "src": "/media/videos/physics/ch11/phys-ch11-11.2-kp2-single-slit-half-wave-zone.mp4",
    "description": "从单缝几何出发，动画演示偶数半波带相消得暗纹、奇数半波带多出一带得明纹，并用 ValueTracker 展示缝宽变化对中央明纹宽度与强度的影响。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.2-kp3-optical-resolution-airy-disk",
    "chapterId": "ch11",
    "sectionId": "11.2",
    "title": "圆孔衍射与瑞利判据",
    "src": "/media/videos/physics/ch11/phys-ch11-11.2-kp3-optical-resolution-airy-disk.mp4",
    "description": "演示圆孔衍射产生的艾里斑图样，通过三态对比（可分/瑞利临界/不可分）和孔径 ValueTracker 动画，直观讲解光学分辨本领 R = D/(1.22λ)。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.2-kp4-grating-diffraction-missing-orders",
    "chapterId": "ch11",
    "sectionId": "11.2",
    "title": "光栅衍射方程与缺级现象",
    "src": "/media/videos/physics/ch11/phys-ch11-11.2-kp4-grating-diffraction-missing-orders.mp4",
    "description": "从光栅截面光程差出发推导光栅方程，相量叠加展示主极大形成，单缝衍射包络压零缺级，ValueTracker动态演示d/a变化时缺级级次移动。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.3-ex1-three-polarizer-transmission",
    "chapterId": "ch11",
    "sectionId": "11.3",
    "title": "例题：三块偏振片串联光强",
    "src": "/media/videos/physics/ch11/phys-ch11-11.3-ex1-three-polarizer-transmission.mp4",
    "description": "通过三块偏振片（P1竖直/P2斜θ/P3水平）演示马吕斯定律连续应用，ValueTracker扫角度实时更新光强，推导 I₃=I₀sin²(2θ)/8 并高亮 θ=45° 极大值。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.3-kp2-polarization-types-natural-light",
    "chapterId": "ch11",
    "sectionId": "11.3",
    "title": "自然光与偏振态：横波的振动方向",
    "src": "/media/videos/physics/ch11/phys-ch11-11.3-kp2-polarization-types-natural-light.mp4",
    "description": "从自然光多向等幅截面出发，演示偏振片过滤、Malus 定律 cos² 衰减与消光，对比部分偏振和椭圆偏振。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.3-kp3-malus-law-angle-sweep",
    "chapterId": "ch11",
    "sectionId": "11.3",
    "title": "马吕斯定律与多片偏振片串联",
    "src": "/media/videos/physics/ch11/phys-ch11-11.3-kp3-malus-law-angle-sweep.mp4",
    "description": "ValueTracker 扫角度展示 I=I₀cos²θ 极坐标玫瑰图，并推导 P1⊥P2 插入 P3 后的三级偏振公式 I=I₀sin²(2θ)/8，标注 θ=45° 极大值。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch11-11.3-kp4-brewster-angle-polarization",
    "chapterId": "ch11",
    "sectionId": "11.3",
    "title": "布儒斯特定律与反射偏振",
    "src": "/media/videos/physics/ch11/phys-ch11-11.3-kp4-brewster-angle-polarization.mp4",
    "description": "用界面几何图演示 s/p 分量分解，ValueTracker 扫反射率曲线，逐步推导 tan i₀=n₂/n₁，可视化布儒斯特角处的完全线偏振现象。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.1-ex1-compton-scatter-90deg",
    "chapterId": "ch12",
    "sectionId": "12.1",
    "title": "例：90°康普顿散射求偏移与反冲电子动能",
    "src": "/media/videos/physics/ch12/phys-ch12-12.1-ex1-compton-scatter-90deg.mp4",
    "description": "分步动画演示 φ=90° 康普顿散射：散射示意图→公式代入→能量守恒柱状图→数值结论 Ek≈74.2 eV。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.1-kp2-planck-blackbody-spectrum",
    "chapterId": "ch12",
    "sectionId": "12.1",
    "title": "普朗克黑体辐射曲线与温度依赖",
    "src": "/media/videos/physics/ch12/phys-ch12-12.1-kp2-planck-blackbody-spectrum.mp4",
    "description": "三阶段演示普朗克曲线：单曲线峰值标注、三温对比、ValueTracker 动态扫温，直觉验证维恩位移定律与 Stefan-Boltzmann 定律。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.1-kp3-photoelectric-effect-equation",
    "chapterId": "ch12",
    "sectionId": "12.1",
    "title": "光电效应：爱因斯坦方程与红限",
    "src": "/media/videos/physics/ch12/phys-ch12-12.1-kp3-photoelectric-effect-equation.mp4",
    "description": "用能量柱状图和 eUa-ν 坐标系动态演示爱因斯坦光电方程，通过 ValueTracker 扫频率展示红限与动能的线性关系，并对比铯、钾、钠三种金属逸出功的差异。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.1-kp4-compton-scattering-geometry",
    "chapterId": "ch12",
    "sectionId": "12.1",
    "title": "康普顿散射：几何与波长偏移",
    "src": "/media/videos/physics/ch12/phys-ch12-12.1-kp4-compton-scattering-geometry.mp4",
    "description": "用矢量图和 ValueTracker 扫动散射角，演示康普顿散射几何与 Δλ=λ_C(1-cosφ) 公式的物理含义。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.2-ex1-balmer-series-transition",
    "chapterId": "ch12",
    "sectionId": "12.2",
    "title": "例：巴尔末系谱线计算与能级跃迁识别",
    "src": "/media/videos/physics/ch12/phys-ch12-12.2-ex1-balmer-series-transition.mp4",
    "description": "用巴尔末公式逐步代入 430 nm 解出 n=5，在能级图上高亮 n=5→2 跃迁并标注光子能量，最后在可见光谱条上定位该谱线并与 H_α、H_β 对比。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.2-kp2-bohr-energy-levels-transitions",
    "chapterId": "ch12",
    "sectionId": "12.2",
    "title": "玻尔能级图与谱线系跃迁",
    "src": "/media/videos/physics/ch12/phys-ch12-12.2-kp2-bohr-energy-levels-transitions.mp4",
    "description": "动画化演示氢原子玻尔能级图，展示莱曼(紫外)、巴尔末(可见光)、帕邢(红外)三大谱线系的跃迁过程，并用里德伯公式动态计算对应波长。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.2-kp3-bohr-orbit-quantization",
    "chapterId": "ch12",
    "sectionId": "12.2",
    "title": "玻尔轨道量子化：半径与角动量",
    "src": "/media/videos/physics/ch12/phys-ch12-12.2-kp3-bohr-orbit-quantization.mp4",
    "description": "同心圆轨道驻波条件引出 r_n=n²a₀ 与 L=nℏ，ValueTracker 扫 n 演示半径/角动量/速度联动，棒状图对比经典连续与量子离散。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.2-kp4-bohr-model-classical-crisis",
    "chapterId": "ch12",
    "sectionId": "12.2",
    "title": "卢瑟福模型的经典危机与玻尔假设的破局",
    "src": "/media/videos/physics/ch12/phys-ch12-12.2-kp4-bohr-model-classical-crisis.mp4",
    "description": "用螺旋坍缩动画展示经典理论的致命困境，再以玻尔量子化轨道与跃迁光子动画说明离散谱线的来源。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.3-ex1-electron-vs-bullet-uncertainty",
    "chapterId": "ch12",
    "sectionId": "12.3",
    "title": "例：电子与子弹位置不确定量对比",
    "src": "/media/videos/physics/ch12/phys-ch12-12.3-ex1-electron-vs-bullet-uncertainty.mp4",
    "description": "双栏对比动画：用海森堡不确定性原理计算宏观子弹(Δx~10⁻³¹m)与微观电子(Δx~mm)的位置不确定量，对数尺度可视化揭示「宏观物体无需量子描述」的本质。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.3-kp2-de-broglie-wavelength-dependence",
    "chapterId": "ch12",
    "sectionId": "12.3",
    "title": "德布罗意波长的质量与速度依赖",
    "src": "/media/videos/physics/ch12/phys-ch12-12.3-kp2-de-broglie-wavelength-dependence.mp4",
    "description": "双栏宏观/微观对比+ValueTracker速度扫动演示λ=h/mv随m和v的变化，双对数λ-m曲线直观呈现量子波动性在宏观极限的消失。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.3-kp3-single-slit-uncertainty-derivation",
    "chapterId": "ch12",
    "sectionId": "12.3",
    "title": "单缝衍射导出不确定关系",
    "src": "/media/videos/physics/ch12/phys-ch12-12.3-kp3-single-slit-uncertainty-derivation.mp4",
    "description": "从单缝衍射几何条件出发，逐步推导 Δx·Δp_x≈h，用双坐标轴动画展示位置与动量的互补关系，最终给出 Heisenberg 不确定关系的精确形式。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.3-kp4-matter-wave-standing-wave-bohr",
    "chapterId": "ch12",
    "sectionId": "12.3",
    "title": "德布罗意驻波解释玻尔量子化条件",
    "src": "/media/videos/physics/ch12/phys-ch12-12.3-kp4-matter-wave-standing-wave-bohr.mp4",
    "description": "圆形轨道上叠加物质波，演示 n=1/2/3 稳定驻波与非整数不稳定对比，逐步推导 L=nℏ 及 r_n=n²a₀，同心圆展示量子化离散轨道。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.4-ex1-square-well-probability-integral",
    "chapterId": "ch12",
    "sectionId": "12.4",
    "title": "例：势阱基态粒子在中间半区的出现概率",
    "src": "/media/videos/physics/ch12/phys-ch12-12.4-ex1-square-well-probability-integral.mp4",
    "description": "无限深势阱基态驻波 sin(πx/a) 的概率密度积分：量子给出82%，对比经典50%，揭示驻波峰在势阱中部的物理直觉。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.4-kp2-wave-function-probability-density",
    "chapterId": "ch12",
    "sectionId": "12.4",
    "title": "波函数与概率密度的统计解释",
    "src": "/media/videos/physics/ch12/phys-ch12-12.4-kp2-wave-function-probability-density.mp4",
    "description": "通过平面波振荡、高斯波包收缩/扩展与颜色填充面积，直观展示 |ψ|² 作为概率密度的统计诠释，及归一化条件与区间概率的动态积分。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.4-kp3-infinite-square-well-quantization",
    "chapterId": "ch12",
    "sectionId": "12.4",
    "title": "一维无限深势阱：能量量子化与驻波",
    "src": "/media/videos/physics/ch12/phys-ch12-12.4-kp3-infinite-square-well-quantization.mp4",
    "description": "用 ValueTracker 动态演示 n=1~5 驻波、n²能级棒状图、概率密度分布以及 n=50 经典极限，直观呈现量子数如何导致能量量子化。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch12-12.4-kp4-tunnel-effect-barrier-penetration",
    "chapterId": "ch12",
    "sectionId": "12.4",
    "title": "势垒穿透与隧道效应",
    "src": "/media/videos/physics/ch12/phys-ch12-12.4-kp4-tunnel-effect-barrier-penetration.mp4",
    "description": "三幕动画：经典vs量子粒子穿越势垒、STM隧穿电流指数灵敏度、α衰变库仑势垒类比，贯穿核心公式 T∝e^{-2κa}。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.1-ex1-o16-alpha-decay-feasibility",
    "chapterId": "ch13",
    "sectionId": "13.1",
    "title": "¹⁶O→¹²C+⁴He 衰变是否可能",
    "src": "/media/videos/physics/ch13/phys-ch13-13.1-ex1-o16-alpha-decay-feasibility.mp4",
    "description": "通过计算质量差 Δm = -0.007688u（Q ≈ -7.16 MeV < 0），用天平动画和逐步减法证明 ¹⁶O 的 α 衰变需要吸能，因此不能自发发生。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.1-ex2-deuterium-helium-binding-energy",
    "chapterId": "ch13",
    "sectionId": "13.1",
    "title": "氘核与氦核结合能和比结合能",
    "src": "/media/videos/physics/ch13/phys-ch13-13.1-ex2-deuterium-helium-binding-energy.mp4",
    "description": "通过核结构示意图、能量柱状图和折叠除法动画，逐步推导并直观比较氘核（2.22 MeV/1.11 MeV per nucleon）与氦核（28.30 MeV/7.07 MeV per nucleon）的结合能和比结合能，揭示⁴He远比²H稳定的物理本质。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.1-kp2-nuclear-radius-scale",
    "chapterId": "ch13",
    "sectionId": "13.1",
    "title": "核半径经验公式与尺度比较",
    "src": "/media/videos/physics/ch13/phys-ch13-13.1-kp2-nuclear-radius-scale.mp4",
    "description": "通过 R=R0·A^(1/3) 公式推导、log-log 图和足球场/豌豆类比，直观展示原子核的极小尺度与恒定超高密度。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.1-kp3-binding-energy-curve",
    "chapterId": "ch13",
    "sectionId": "13.1",
    "title": "比结合能曲线与核稳定性",
    "src": "/media/videos/physics/ch13/phys-ch13-13.1-kp3-binding-energy-curve.mp4",
    "description": "绘制比结合能 ε(A) 曲线，标注 Fe-56 峰值，用彩色箭头演示轻核聚变与重核裂变均向峰值靠拢从而释放能量，并对比核能与化学能的数量级差异。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.1-kp4-nuclear-spin-nmr",
    "chapterId": "ch13",
    "sectionId": "13.1",
    "title": "核自旋量子化与核磁共振",
    "src": "/media/videos/physics/ch13/phys-ch13-13.1-kp4-nuclear-spin-nmr.mp4",
    "description": "用 2D 能级图和 ValueTracker 展示核自旋量子化：m_I 取值、能级分裂、共振条件与核磁子。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.2-ex1-fe59-effective-half-life",
    "chapterId": "ch13",
    "sectionId": "13.2",
    "title": "Fe-59 有效半衰期与残留量",
    "src": "/media/videos/physics/ch13/phys-ch13-13.2-ex1-fe59-effective-half-life.mp4",
    "description": "通过并联通道矩形图与三条衰减曲线，直观演示 Fe-59 的物理衰变、生物代谢和有效总衰减，并逐步计算 t=13.5d 时体内残留量为 70.7%。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.2-ex2-carbon14-dating",
    "chapterId": "ch13",
    "sectionId": "13.2",
    "title": "碳-14 测年法推算古尸年代",
    "src": "/media/videos/physics/ch13/phys-ch13-13.2-ex2-carbon14-dating.mp4",
    "description": "通过指数衰减曲线与逐步公式推导，展示如何由 ¹⁴C/¹²C 比值反算古尸距今年代约 9090 年，并演示如何从活度 1 Bq 反推现存核数 2.61×10¹¹。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.2-ex3-na24-blood-volume",
    "chapterId": "ch13",
    "sectionId": "13.2",
    "title": "Na-24 示踪估算全身血容量",
    "src": "/media/videos/physics/ch13/phys-ch13-13.2-ex3-na24-blood-volume.mp4",
    "description": "用放射性稀释法四步推导：注射活度→衰减曲线→稀释方程→反求全身血液体积 6.26 L。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.2-kp2-three-decay-types",
    "chapterId": "ch13",
    "sectionId": "13.2",
    "title": "α、β、γ 三种衰变类型",
    "src": "/media/videos/physics/ch13/phys-ch13-13.2-kp2-three-decay-types.mp4",
    "description": "通过核素图（Z-N平面）动画展示α、β⁻、β⁺/EC、γ四种衰变的子核位置移动规律、衰变方程与三种射线穿透力对比。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.2-kp3-radioactive-decay-law",
    "chapterId": "ch13",
    "sectionId": "13.2",
    "title": "放射性衰变指数定律",
    "src": "/media/videos/physics/ch13/phys-ch13-13.2-kp3-radioactive-decay-law.mp4",
    "description": "粒子模拟 + Axes 绘制 N=N₀e^{-λt}，ValueTracker 扫动 λ 演示半衰期变化，三曲线对比，半对数坐标变直线。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.2-kp4-half-life-mean-life-effective",
    "chapterId": "ch13",
    "sectionId": "13.2",
    "title": "半衰期、平均寿命与有效半衰期",
    "src": "/media/videos/physics/ch13/phys-ch13-13.2-kp4-half-life-mean-life-effective.mp4",
    "description": "N-t 指数衰变曲线标注半衰期 T 与平均寿命 τ，三条曲线对比物理/生物/有效衰减，推导 1/Tₑ=1/T+1/Tb 并以 Fe-59 为数值示例。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch13-13.2-kp5-radioactive-activity",
    "chapterId": "ch13",
    "sectionId": "13.2",
    "title": "放射性活度 A 与单位 Bq/Ci",
    "src": "/media/videos/physics/ch13/phys-ch13-13.2-kp5-radioactive-activity.mp4",
    "description": "双坐标系同步衰减动画演示 A=-dN/dt 的导数含义，ValueTracker 扫动 λ 展示活度变化规律，数字换算 1 Ci=3.7e10 Bq，并对比 U-238 与 I-131 在相同活度下核数相差 10^13 倍。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.1-ex1-short-wave-limit-voltage-sweep",
    "chapterId": "ch14",
    "sectionId": "14.1",
    "title": "短波极限随管电压的变化",
    "src": "/media/videos/physics/ch14/phys-ch14-14.1-ex1-short-wave-limit-voltage-sweep.mp4",
    "description": "从能量守恒推导短波极限公式，以 50 kV 为例逐步数值计算，ValueTracker 扫动 λ_min-U 双曲线展示管电压与短波极限的反比关系。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.1-ex2-bragg-reflection-wavelength-selection",
    "chapterId": "ch14",
    "sectionId": "14.1",
    "title": "布喇格衍射选波长",
    "src": "/media/videos/physics/ch14/phys-ch14-14.1-ex2-bragg-reflection-wavelength-selection.mp4",
    "description": "以 d=2.75Å、θ=20° 为例，动画推导路程差 δ=1.88Å，逐级筛选 k=1(1.88Å)和 k=2(0.94Å)在探测范围内、k=3(0.63Å)超出，配合波形干涉直觉与汇总表格。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.1-ex3-muscle-bone-attenuation-voltage-contrast",
    "chapterId": "ch14",
    "sectionId": "14.1",
    "title": "肌肉与骨骼的衰减系数对比选管电压",
    "src": "/media/videos/physics/ch14/phys-ch14-14.1-ex3-muscle-bone-attenuation-voltage-contrast.mp4",
    "description": "通过柱形图与透过强度分布对比，直观说明低管电压（40 kV）时骨/肉衰减比达 6.09 → 成像对比度高，高管电压（150 kV）时比值降至 2.13 → 穿透力强但图像模糊，从而给出选管电压的临床原则。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.1-kp1-xray-tube-bremsstrahlung",
    "chapterId": "ch14",
    "sectionId": "14.1",
    "title": "X 射线管结构与轫致辐射机制",
    "src": "/media/videos/physics/ch14/phys-ch14-14.1-kp1-xray-tube-bremsstrahlung.mp4",
    "description": "从剖面结构图到单电子偏转辐射动画，再到能量分配条形图，三步讲清 X 射线管工作原理与轫致辐射机制。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.1-kp2-xray-spectrum-short-wave-limit",
    "chapterId": "ch14",
    "sectionId": "14.1",
    "title": "X 射线谱与短波极限",
    "src": "/media/videos/physics/ch14/phys-ch14-14.1-kp2-xray-spectrum-short-wave-limit.mp4",
    "description": "连续 X 射线谱 Axes.plot + ValueTracker 管电压扫动演示 λ_min 左移，叠加 Kα/Kβ 特征峰及原子能级跃迁示意，对比 mA/kV 分别控制强度与硬度。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.1-kp3-xray-attenuation-lambert-law",
    "chapterId": "ch14",
    "sectionId": "14.1",
    "title": "X 射线衰减规律与半价层",
    "src": "/media/videos/physics/ch14/phys-ch14-14.1-kp3-xray-attenuation-lambert-law.mp4",
    "description": "动画演示 Lambert-Beer 指数衰减 I=I₀e^{-μx}：入射箭头束穿过吸收材料后强度减弱、实时 I(x) 曲线追踪、半价层虚线分割、对数坐标直线化、x_{1/2}=ln2/μ 逐步推导与质量衰减系数概念。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.1-kp4-bragg-diffraction-crystal",
    "chapterId": "ch14",
    "sectionId": "14.1",
    "title": "布喇格衍射定律",
    "src": "/media/videos/physics/ch14/phys-ch14-14.1-kp4-bragg-diffraction-crystal.mp4",
    "description": "用两层晶面几何图演示 X 射线布喇格衍射，ValueTracker 扫动掠射角并实时显示路程差 2d sinθ，颜色指示相长/相消，最终展示 k=1,2,3 三个衍射峰与衍射条件 2d sinθ=kλ。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.2-ex1-three-level-laser-pump-wavelength",
    "chapterId": "ch14",
    "sectionId": "14.2",
    "title": "三能级激光器泵浦波长与激光波长计算",
    "src": "/media/videos/physics/ch14/phys-ch14-14.2-ex1-three-level-laser-pump-wavelength.mp4",
    "description": "通过四条能级线、跃迁路径分析和逐步公式推导，计算三能级激光器的泵浦波长（477.8 nm）与激光波长（591.6 nm），并在可见光谱条上直观定位两种光的颜色差异。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.2-kp1-three-radiative-processes",
    "chapterId": "ch14",
    "sectionId": "14.2",
    "title": "三种辐射过程：自发辐射、受激吸收、受激辐射",
    "src": "/media/videos/physics/ch14/phys-ch14-14.2-kp1-three-radiative-processes.mp4",
    "description": "三列并排能级图演示自发辐射（随机方向光子）、受激吸收（光子消失粒子跃迁）、受激辐射（一变二完全相干），并以逐行淡入对比表格汇总四项属性差异。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.2-kp2-population-inversion",
    "chapterId": "ch14",
    "sectionId": "14.2",
    "title": "粒子数反转分布",
    "src": "/media/videos/physics/ch14/phys-ch14-14.2-kp2-population-inversion.mp4",
    "description": "用柱状图+三能级泵浦过程+链式放大动画，逐步演示热平衡分布、粒子数反转条件与受激辐射倍增原理。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.2-kp3-optical-resonator-laser-output",
    "chapterId": "ch14",
    "sectionId": "14.2",
    "title": "光学谐振腔与激光输出",
    "src": "/media/videos/physics/ch14/phys-ch14-14.2-kp3-optical-resonator-laser-output.mp4",
    "description": "动画演示谐振腔结构、光子受激辐射往返放大、光子数指数增长至阈值、激光方向性与驻波选频机制。"
  },
  {
    "subjectId": "physics",
    "id": "phys-ch14-14.2-kp4-hene-three-level-laser-system",
    "chapterId": "ch14",
    "sectionId": "14.2",
    "title": "He-Ne 激光器与三能级/四能级系统",
    "src": "/media/videos/physics/ch14/phys-ch14-14.2-kp4-hene-three-level-laser-system.mp4",
    "description": "动画演示 He-Ne 激光器工作循环：He 亚稳态共振转移→Ne 5s 粒子数反转→受激辐射 632.8 nm 橘红激光，并对比三/四能级系统反转难易度。"
  }
];
