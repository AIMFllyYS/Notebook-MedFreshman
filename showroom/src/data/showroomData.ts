export interface ShowroomItem {
  id: number;
  type: 'three' | 'gsap';
  name: string;
  componentName: string;
  purpose: string;
  description: string;
  techPoints: string[];
}

export const showroomData: ShowroomItem[] = [
  // Three.js Effects 1-50
  {
    id: 1,
    type: 'three',
    name: '旋转立方体阵列',
    componentName: 'T1_RotatingCubes',
    purpose: '用于展示基础3D场景搭建与变换矩阵',
    description: '通过BoxGeometry创建立方体，使用Group进行分组管理，实现多个立方体的旋转动画，展示Three.js最基础的3D变换能力。',
    techPoints: ['BoxGeometry', 'MeshBasicMaterial', 'Group', 'requestAnimationFrame', '矩阵变换']
  },
  {
    id: 2,
    type: 'three',
    name: '透明玻璃材质球体',
    componentName: 'T2_GlassSphere',
    purpose: '用于产品展示中的玻璃质感渲染',
    description: '使用MeshPhysicalMaterial的transmission属性模拟真实玻璃透光效果，配合ior折射率参数，实现逼真的玻璃球体渲染。',
    techPoints: ['MeshPhysicalMaterial', 'transmission', 'ior折射率', 'thickness', 'clearcoat']
  },
  {
    id: 3,
    type: 'three',
    name: '程序化纹理地球仪',
    componentName: 'T3_EarthGlobe',
    purpose: '用于教育类3D地球展示',
    description: '使用CanvasTexture动态生成地球纹理，结合SphereGeometry和UV映射，创建可旋转的3D地球仪，展示程序化纹理生成技术。',
    techPoints: ['CanvasTexture', 'SphereGeometry', 'UV映射', '纹理叠加', '动态生成']
  },
  {
    id: 4,
    type: 'three',
    name: '多材质复合模型（骰子）',
    componentName: 'T4_MultiMaterialDice',
    purpose: '用于展示多面体不同面材质',
    description: '利用BoxGeometry的面分组特性，为每个面分配不同材质，创建立方体骰子效果，展示多材质复合模型技术。',
    techPoints: ['BufferGeometryUtils', 'groups材质索引', 'BoxGeometry面分组', '数组材质']
  },
  {
    id: 5,
    type: 'three',
    name: '动态变形几何体（Blob）',
    componentName: 'T5_MorphingBlob',
    purpose: '用于展示有机形态动画',
    description: '基于IcosahedronGeometry，通过顶点着色器位移和噪声函数，实现有机形态的Blob变形动画效果。',
    techPoints: ['IcosahedronGeometry', '顶点着色器位移', '噪声函数', 'sin/cos波变形']
  },
  {
    id: 6,
    type: 'three',
    name: '线框模式拓扑结构',
    componentName: 'T6_WireframeTopology',
    purpose: '用于3D模型结构分析展示',
    description: '使用EdgesGeometry和LineSegments渲染模型的边缘线框，展示3D模型的拓扑结构和几何构造。',
    techPoints: ['EdgesGeometry', 'LineSegments', 'WireframeGeometry', '拓扑线框渲染']
  },
  {
    id: 7,
    type: 'three',
    name: '反射金属材质展示台',
    componentName: 'T7_MetalShowcase',
    purpose: '用于电商产品3D展示',
    description: '通过MeshStandardMaterial的metalness和roughness参数，配合CubeCamera环境贴图，实现逼真的金属反射效果。',
    techPoints: ['MeshStandardMaterial', 'metalness/roughness', 'CubeCamera环境贴图', 'PMREMGenerator']
  },
  {
    id: 8,
    type: 'three',
    name: '法线贴图浮雕墙面',
    componentName: 'T8_NormalMapWall',
    purpose: '用于建筑可视化中的细节增强',
    description: '使用TextureLoader加载法线贴图，通过normalMap和bumpScale参数，在平面几何体上模拟浮雕细节效果。',
    techPoints: ['TextureLoader', 'normalMap', 'bumpScale', 'Tangents计算', '细节层次']
  },
  {
    id: 9,
    type: 'three',
    name: '顶点颜色渐变地形',
    componentName: 'T9_VertexColorTerrain',
    purpose: '用于地形高度可视化',
    description: '基于PlaneGeometry的顶点颜色属性，使用Color.lerp实现根据高度进行颜色渐变的地形渲染效果。',
    techPoints: ['PlaneGeometry顶点颜色', 'Color.lerp', '高度图生成', 'vertexColors属性']
  },
  {
    id: 10,
    type: 'three',
    name: 'MatCap材质头像雕塑',
    componentName: 'T10_MatCapSculpture',
    purpose: '用于快速艺术风格渲染',
    description: '使用MeshMatcapMaterial和MatCap纹理，通过法线到UV的映射技术，实现艺术风格的快速雕塑渲染。',
    techPoints: ['MeshMatcapMaterial', 'MatCap纹理', '法线到UV映射', '艺术风格渲染']
  },
  {
    id: 11,
    type: 'three',
    name: '三点布光产品展示',
    componentName: 'T11_ThreePointLighting',
    purpose: '用于专业3D产品摄影效果',
    description: '组合使用DirectionalLight、SpotLight和PointLight，配合ShadowMap实现专业的三点布光产品展示效果。',
    techPoints: ['DirectionalLight/SpotLight/PointLight组合', 'ShadowMap', 'light.position调控']
  },
  {
    id: 12,
    type: 'three',
    name: '体积光（上帝之光）',
    componentName: 'T12_VolumetricLight',
    purpose: '用于营造神圣/神秘氛围',
    description: '通过SpotLight配合自定义VolumetricLightShader，使用深度采样和射线步进技术，模拟真实的体积光效果。',
    techPoints: ['SpotLight + VolumetricLightShader', '深度采样', '射线步进', '半透明混合']
  },
  {
    id: 13,
    type: 'three',
    name: '实时光影昼夜循环',
    componentName: 'T13_DayNightCycle',
    purpose: '用于建筑可视化时间变化',
    description: '使用HemisphereLight和DirectionalLight，通过位置动画和颜色温度变化，模拟真实的昼夜光影循环。',
    techPoints: ['HemisphereLight天空地面色', 'DirectionalLight位置动画', 'color温度变化', 'shadow.bias调整']
  },
  {
    id: 14,
    type: 'three',
    name: '投影贴花（Decal）',
    componentName: 'T14_DecalProjection',
    purpose: '用于细节纹理叠加（弹孔、污渍）',
    description: '使用DecalGeometry和projector矩阵，通过MeshBasicMaterial透明贴花技术，实现3D模型表面的细节纹理投影。',
    techPoints: ['DecalGeometry', 'projector矩阵', 'MeshBasicMaterial透明贴花', '碰撞检测']
  },
  {
    id: 15,
    type: 'three',
    name: '环境光遮蔽（SSAO）',
    componentName: 'T15_SSAO',
    purpose: '用于增强场景深度感',
    description: '通过EffectComposer和SSAOPass，利用深度法线缓冲和多采样技术，实现屏幕空间环境光遮蔽效果。',
    techPoints: ['EffectComposer', 'SSAOPass', '深度法线缓冲', '采样半径', '后期处理链']
  },
  {
    id: 16,
    type: 'three',
    name: '焦散（Caustics）效果',
    componentName: 'T16_Caustics',
    purpose: '用于水下/玻璃光影模拟',
    description: '使用Custom Shader实现光线追踪近似，通过纹理投影模拟水下焦散效果，营造真实的水下光照氛围。',
    techPoints: ['Custom Shader', '光线追踪近似', '纹理投影', '水下光照模拟']
  },
  {
    id: 17,
    type: 'three',
    name: 'IES真实灯光分布',
    componentName: 'T17_IESLight',
    purpose: '用于建筑照明精确模拟',
    description: '通过IESLoader加载光度学数据，使用SpotLight自定义衰减纹理，实现真实世界的灯光分布模拟。',
    techPoints: ['IESLoader', 'SpotLight自定义衰减纹理', '光度学数据', '真实光照分布']
  },
  {
    id: 18,
    type: 'three',
    name: '动态软阴影（PCSS）',
    componentName: 'T18_DynamicSoftShadow',
    purpose: '用于影视级阴影质量',
    description: '实现PercentageCloserSoftShadows算法，通过阴影贴图采样和penumbra大小计算，生成动态软阴影效果。',
    techPoints: ['PercentageCloserSoftShadows', '阴影贴图采样', 'penumbra大小计算', 'ShaderMaterial自定义阴影']
  },
  {
    id: 19,
    type: 'three',
    name: '雪花飘落粒子系统',
    componentName: 'T19_SnowParticles',
    purpose: '用于天气/氛围效果',
    description: '使用Points和BufferGeometry创建大量粒子，通过PointsMaterial和透明纹理，模拟雪花飘落的天气效果。',
    techPoints: ['Points', 'BufferGeometry自定义顶点', 'PointsMaterial', '透明纹理', '重力模拟']
  },
  {
    id: 20,
    type: 'three',
    name: '火焰与烟雾模拟',
    componentName: 'T20_FireSmoke',
    purpose: '用于特效动画',
    description: '通过ShaderParticleEngine和噪声纹理，管理粒子生命周期和颜色渐变，实现逼真的火焰与烟雾模拟效果。',
    techPoints: ['ShaderParticleEngine', '噪声纹理', '生命周期管理', '颜色随时间渐变', '加法混合']
  },
  {
    id: 21,
    type: 'three',
    name: '魔法轨迹拖尾',
    componentName: 'T21_MagicTrail',
    purpose: '用于游戏技能特效',
    description: '使用TrailRenderer记录历史位置，生成Ribbon几何体，通过顶点颜色渐变和透明衰减实现魔法轨迹拖尾效果。',
    techPoints: ['TrailRenderer', '历史位置记录', 'Ribbon几何体生成', '顶点颜色渐变', '透明衰减']
  },
  {
    id: 22,
    type: 'three',
    name: '粒子文字爆炸重组',
    componentName: 'T22_ParticleText',
    purpose: '用于标题动画特效',
    description: '将TextGeometry转换为粒子系统，使用GPU Instancing和目标位置插值，实现文字爆炸后重组的动画效果。',
    techPoints: ['TextGeometry转粒子', 'GPU Instancing', '目标位置插值', 'Explode/Assemble状态机']
  },
  {
    id: 23,
    type: 'three',
    name: '星域穿梭（Warp Speed）',
    componentName: 'T23_WarpSpeed',
    purpose: '用于太空场景转场',
    description: '创建StarField粒子系统，通过相机Z轴移动和粒子拉伸线形，配合FOV动态变化，模拟超光速穿梭效果。',
    techPoints: ['StarField', '相机Z轴移动', '粒子拉伸线形', 'FOV动态变化', '速度感模拟']
  },
  {
    id: 24,
    type: 'three',
    name: '粒子流体（SPH简化）',
    componentName: 'T24_ParticleFluid',
    purpose: '用于液体飞溅效果',
    description: '实现SPH（光滑粒子流体动力学）简化算法，通过粒子间作用力、密度计算和压力梯度，模拟液体流动效果。',
    techPoints: ['粒子间作用力', '密度计算', '压力梯度', '平滑核函数', '欧拉积分']
  },
  {
    id: 25,
    type: 'three',
    name: '花粉/尘埃浮动',
    componentName: 'T25_PollenDust',
    purpose: '用于自然场景氛围',
    description: '使用Brownian运动和Simplex噪声漂移算法，配合深度遮挡和光照响应，模拟花粉和尘埃的微小浮动效果。',
    techPoints: ['Brownian运动', 'Simplex噪声漂移', '深度遮挡', '光照响应', '微小尺度动画']
  },
  {
    id: 26,
    type: 'three',
    name: '水面波纹着色器',
    componentName: 'T26_WaterShader',
    purpose: '用于湖泊/海洋实时渲染',
    description: '通过Vertex Shader正弦波叠加和Fragment Shader菲涅尔反射，结合法线扰动和Gerstner波，实现逼真的水面效果。',
    techPoints: ['Vertex Shader正弦波叠加', 'Fragment Shader菲涅尔反射', '法线扰动', 'Gerstner波']
  },
  {
    id: 27,
    type: 'three',
    name: '全息投影扫描效果',
    componentName: 'T27_HologramScan',
    purpose: '用于科幻UI展示',
    description: '使用Scanline Shader实现扫描线效果，配合RGB分离和Glitch效果，通过Additive Blending营造科幻全息投影。',
    techPoints: ['Scanline Shader', '透明度扫描', 'RGB分离', 'Glitch效果', 'Additive Blending']
  },
  {
    id: 28,
    type: 'three',
    name: '融化/溶解过渡效果',
    componentName: 'T28_DissolveEffect',
    purpose: '用于物体消失/出现动画',
    description: '通过Dissolve Shader和噪声阈值控制，配合边缘发光（Emission Burn）和discard片段，实现物体溶解过渡效果。',
    techPoints: ['Dissolve Shader', '噪声阈值', '边缘发光（Emission Burn）', 'discard片段', '渐变控制']
  },
  {
    id: 29,
    type: 'three',
    name: '视差遮蔽映射（POM）',
    componentName: 'T29_ParallaxOcclusion',
    purpose: '用于超真实表面细节',
    description: '实现Parallax Occlusion Mapping算法，通过射线步进和高度图采样，配合自阴影和纹理分层，增强表面细节真实感。',
    techPoints: ['Parallax Occlusion Mapping', '射线步进', '高度图采样', '自阴影', '纹理分层']
  },
  {
    id: 30,
    type: 'three',
    name: '卡通渲染（三渲二）',
    componentName: 'T30_ToonShading',
    purpose: '用于动漫风格场景',
    description: '使用Toon Shader和Ramp纹理，配合轮廓线（Outline Pass）和边缘检测，实现动漫风格的三渲二效果。',
    techPoints: ['Toon Shader', 'Ramp纹理', '轮廓线（Outline Pass）', '边缘检测', '硬边光照']
  },
  {
    id: 31,
    type: 'three',
    name: 'Bloom辉光效果',
    componentName: 'T31_BloomGlow',
    purpose: '用于霓虹灯/发光体强调',
    description: '通过EffectComposer和UnrealBloomPass，设置亮度阈值和模糊迭代，实现发光物体的Bloom辉光后期处理效果。',
    techPoints: ['EffectComposer', 'UnrealBloomPass', '亮度阈值', '模糊迭代', '混合强度']
  },
  {
    id: 32,
    type: 'three',
    name: '景深（DOF）对焦效果',
    componentName: 'T32_DepthOfField',
    purpose: '用于摄影感画面引导',
    description: '使用BokehPass实现景深效果，通过焦点距离和散圈大小参数，配合深度缓冲和COC计算，模拟相机景深。',
    techPoints: ['BokehPass', '焦点距离', '散圈大小', '深度缓冲', 'COC计算']
  },
  {
    id: 33,
    type: 'three',
    name: '色调映射与色彩分级',
    componentName: 'T33_ToneMapping',
    purpose: '用于电影感画面调色',
    description: '使用ACESFilmicToneMapping和LUT纹理，调整饱和度、对比度等参数，实现HDR转SDR的电影级色调映射。',
    techPoints: ['ACESFilmicToneMapping', 'LUT纹理', '饱和度/对比度调整', 'HDR转SDR']
  },
  {
    id: 34,
    type: 'three',
    name: '屏幕空间反射（SSR）',
    componentName: 'T34_SSR',
    purpose: '用于实时镜面反射',
    description: '通过SSRPass实现屏幕空间反射，使用射线步进屏幕空间技术，配合粗糙度模糊和Fallback立方体贴图。',
    techPoints: ['SSRPass', '射线步进屏幕空间', '粗糙度模糊', 'Fallback立方体贴图']
  },
  {
    id: 35,
    type: 'three',
    name: '运动模糊（Motion Blur）',
    componentName: 'T35_MotionBlur',
    purpose: '用于高速运动表现',
    description: '使用Velocity Buffer和per-pixel运动向量，通过方向模糊和快门速度模拟，实现运动模糊后期效果。',
    techPoints: ['Velocity Buffer', 'per-pixel运动向量', '方向模糊', '快门速度模拟']
  },
  {
    id: 36,
    type: 'three',
    name: '复古CRT显示器效果',
    componentName: 'T36_CRTEffect',
    purpose: '用于怀旧游戏/科幻终端',
    description: '通过Scanline Shader实现扫描线，配合曲率变形、RGB分离、噪点闪烁和Vignette暗角，模拟复古CRT显示器。',
    techPoints: ['Scanline Shader', '曲率变形', 'RGB分离', '噪点闪烁', 'Vignette暗角']
  },
  {
    id: 37,
    type: 'three',
    name: '轨道控制器产品查看器',
    componentName: 'T37_OrbitViewer',
    purpose: '用于360°产品浏览',
    description: '使用OrbitControls实现阻尼平滑的相机控制，配合缩放限制和自动旋转，创建360度产品查看器。',
    techPoints: ['OrbitControls', '阻尼平滑', '缩放限制', '自动旋转', '触摸支持']
  },
  {
    id: 38,
    type: 'three',
    name: '第一人称漫游探索',
    componentName: 'T38_FirstPersonRoam',
    purpose: '用于虚拟展厅/建筑漫游',
    description: '通过PointerLockControls实现WASD键盘移动，配合碰撞检测、重力跳跃和视角俯仰限制，创建第一人称漫游体验。',
    techPoints: ['PointerLockControls', 'WASD移动', '碰撞检测', '重力跳跃', '视角俯仰限制']
  },
  {
    id: 39,
    type: 'three',
    name: '射线点击3D标注',
    componentName: 'T39_RaycastAnnotation',
    purpose: '用于3D模型信息标注',
    description: '使用Raycaster进行鼠标归一化坐标和交点计算，通过Sprite标注和DOM标签投影，实现3D模型交互式信息标注。',
    techPoints: ['Raycaster', '鼠标归一化坐标', '交点计算', 'Sprite标注', 'DOM标签投影']
  },
  {
    id: 40,
    type: 'three',
    name: '手势控制粒子绘画',
    componentName: 'T40_GesturePainting',
    purpose: '用于创意交互艺术',
    description: '通过HandTracking和MediaPipe捕捉手势，使用指尖射线和粒子发射技术，实现手势控制的创意粒子绘画。',
    techPoints: ['HandTracking', 'MediaPipe', '指尖射线', '粒子发射', '手势识别状态机']
  },
  {
    id: 41,
    type: 'three',
    name: '布料模拟（Verlet积分）',
    componentName: 'T41_ClothSimulation',
    purpose: '用于旗帜/衣物动态',
    description: '使用Verlet Integration和约束求解算法，配合风力场和碰撞检测，模拟真实布料的物理动态。',
    techPoints: ['Verlet Integration', '约束求解', '风力场', '碰撞检测', 'Pin约束点']
  },
  {
    id: 42,
    type: 'three',
    name: '刚体物理堆叠（Cannon.js）',
    componentName: 'T42_RigidBodyPhysics',
    purpose: '用于物理益智游戏',
    description: '通过Cannon-es实现RigidBody物理模拟，配合碰撞形状、质量/摩擦力和约束关节，创建刚体物理堆叠效果。',
    techPoints: ['Cannon-es', 'RigidBody', '碰撞形状', '质量/摩擦力', '约束关节']
  },
  {
    id: 43,
    type: 'three',
    name: '骨骼动画角色',
    componentName: 'T43_SkeletalAnimation',
    purpose: '用于角色展示/游戏',
    description: '使用SkinnedMesh和Skeleton骨骼层级，通过AnimationMixer管理GLTF动画剪辑，实现角色骨骼动画。',
    techPoints: ['SkinnedMesh', 'Skeleton', 'Bone层级', 'AnimationMixer', 'GLTF动画剪辑']
  },
  {
    id: 44,
    type: 'three',
    name: '软体/果冻物理',
    componentName: 'T44_SoftBodyJelly',
    purpose: '用于Q弹物体模拟',
    description: '通过体积保持约束和弹簧质点系统，配合形变恢复和压力模型，模拟软体和果冻的Q弹物理效果。',
    techPoints: ['体积保持约束', '弹簧质点系统', '形变恢复', '压力模型', '顶点动画']
  },
  {
    id: 45,
    type: 'three',
    name: '体积云天空渲染',
    componentName: 'T45_VolumetricClouds',
    purpose: '用于开放世界天空',
    description: '使用Ray Marching和3D噪声纹理，配合Beer定律光照和相位函数，实现逼真的体积云天空渲染。',
    techPoints: ['Ray Marching', '3D噪声纹理', 'Beer定律光照', '相位函数', 'LOD云层']
  },
  {
    id: 46,
    type: 'three',
    name: '实时光线追踪反射',
    componentName: 'T46_PathTracing',
    purpose: '用于影视级反射效果',
    description: '通过WebGL Path Tracing和BVH加速结构，使用蒙特卡洛积分和重要性采样，实现渐进式实时光线追踪。',
    techPoints: ['WebGL Path Tracing', 'BVH加速结构', '蒙特卡洛积分', '重要性采样', '渐进式渲染']
  },
  {
    id: 47,
    type: 'three',
    name: '大规模地形LOD系统',
    componentName: 'T47_TerrainLOD',
    purpose: '用于地理信息/飞行模拟',
    description: '使用Chunked LOD和高度图纹理，配合Geometry Clipmaps和视锥剔除，实现大规模地形的细节层次渲染。',
    techPoints: ['Chunked LOD', '高度图纹理', 'Geometry Clipmaps', '纹理贴片', '视锥剔除', '细节层次混合']
  },
  {
    id: 48,
    type: 'three',
    name: '次表面散射（SSS）',
    componentName: 'T48_SubsurfaceScattering',
    purpose: '用于皮肤/蜡/玉材质',
    description: '通过Subsurface Scattering算法，配合Wrap Lighting、厚度图和颜色模糊，实现皮肤、蜡和玉石的透光效果。',
    techPoints: ['Subsurface Scattering', 'Wrap Lighting', '厚度图', '颜色模糊', 'Transluency']
  },
  {
    id: 49,
    type: 'three',
    name: '程序化无限城市',
    componentName: 'T49_ProceduralCity',
    purpose: '用于大规模场景生成',
    description: '使用Shader Instancing和伪随机建筑生成算法，配合LOD距离剔除和视差建筑技术，创建程序化无限城市。',
    techPoints: ['Shader Instancing', '伪随机建筑生成', 'LOD距离剔除', '视差建筑', '性能优化']
  },
  {
    id: 50,
    type: 'three',
    name: '镜面反射效果',
    componentName: 'T50_MirrorReflection',
    purpose: '用于实时镜面反射展示',
    description: '通过Reflector或CubeCamera实现实时反射，配合多物体动画场景，展示逼真的镜面反射效果。',
    techPoints: ['Reflector', 'CubeCamera实时反射', '多物体动画场景']
  },

  // GSAP Effects 51-100
  {
    id: 51,
    type: 'gsap',
    name: '淡入淡出入场',
    componentName: 'G1_FadeIn',
    purpose: '页面元素从透明到可见的基础入场效果',
    description: '使用gsap.from配合autoAlpha和power2.out缓动，实现元素从完全透明到可见的平滑淡入效果，是最基础的GSAP动画。',
    techPoints: ['gsap.from()', 'autoAlpha', 'power2.out']
  },
  {
    id: 52,
    type: 'gsap',
    name: '弹性缩放弹出',
    componentName: 'G2_ElasticScale',
    purpose: '按钮或卡片的弹性放大出现效果',
    description: '通过gsap.from配合scale属性和elastic.out(1, 0.3)弹性缓动，实现元素带弹性效果的缩放出现动画。',
    techPoints: ['gsap.from()', 'scale', 'elastic.out(1, 0.3)']
  },
  {
    id: 53,
    type: 'gsap',
    name: '平滑位移动画',
    componentName: 'G3_SmoothSlide',
    purpose: '元素从屏幕外滑入的位移动画',
    description: '使用gsap.from配合x/y位移属性和power3.out缓动，实现元素从屏幕外平滑滑入的位移动画效果。',
    techPoints: ['gsap.from()', 'x/y', 'power3.out']
  },
  {
    id: 54,
    type: 'gsap',
    name: '旋转入场',
    componentName: 'G4_RotateIn',
    purpose: '元素带旋转角度的出现效果',
    description: '通过gsap.from配合rotation属性和back.out(1.7)回弹缓动，实现元素带旋转角度的弹性入场效果。',
    techPoints: ['gsap.from()', 'rotation', 'back.out(1.7)']
  },
  {
    id: 55,
    type: 'gsap',
    name: '倾斜变形出现',
    componentName: 'G5_SkewAppear',
    purpose: '利用skew实现倾斜切入效果',
    description: '使用gsap.from配合skewX/skewY属性，实现元素以倾斜变形的方式切入画面的独特入场效果。',
    techPoints: ['gsap.from()', 'skewX/skewY']
  },
  {
    id: 56,
    type: 'gsap',
    name: '颜色渐变过渡',
    componentName: 'G6_ColorTransition',
    purpose: '背景色或文字色的平滑过渡',
    description: '通过gsap.to配合backgroundColor/color属性，实现元素颜色的平滑渐变过渡效果。',
    techPoints: ['gsap.to()', 'backgroundColor/color']
  },
  {
    id: 57,
    type: 'gsap',
    name: '透明度脉冲',
    componentName: 'G7_OpacityPulse',
    purpose: '元素呼吸般的透明度循环',
    description: '使用gsap.to配合opacity、repeat和yoyo属性，实现元素像呼吸一样透明度循环变化的脉冲效果。',
    techPoints: ['gsap.to()', 'opacity', 'repeat', 'yoyo']
  },
  {
    id: 58,
    type: 'gsap',
    name: '边框圆角变形',
    componentName: 'G8_BorderRadiusMorph',
    purpose: '卡片从方形到圆角的形状过渡',
    description: '通过gsap.to配合borderRadius属性，实现卡片从方形到圆角的形状变形过渡效果。',
    techPoints: ['gsap.to()', 'borderRadius']
  },
  {
    id: 59,
    type: 'gsap',
    name: '宽度/高度展开',
    componentName: 'G9_DimensionExpand',
    purpose: '手风琴或展开面板效果',
    description: '使用gsap.to配合width/height属性和power2.inOut缓动，实现手风琴式的展开面板效果。',
    techPoints: ['gsap.to()', 'width/height', 'power2.inOut']
  },
  {
    id: 60,
    type: 'gsap',
    name: '3D翻转卡片',
    componentName: 'G10_3DCardFlip',
    purpose: '卡片沿Y轴翻转的3D效果',
    description: '通过gsap.to配合rotationY和transformOrigin属性，实现卡片沿Y轴的3D翻转效果。',
    techPoints: ['gsap.to()', 'rotationY', 'transformOrigin']
  },
  {
    id: 61,
    type: 'gsap',
    name: '分步引导动画',
    componentName: 'G11_StepGuide',
    purpose: '多步骤教程的依次高亮展示',
    description: '使用gsap.timeline配合绝对位置参数，实现多步骤引导动画的精确时间控制。',
    techPoints: ['gsap.timeline()', '绝对位置参数']
  },
  {
    id: 62,
    type: 'gsap',
    name: '链式图标动画',
    componentName: 'G12_ChainIcons',
    purpose: '多个图标依次执行不同变换',
    description: '通过gsap.timeline配合相对位置"+=0.2"，实现多个图标依次执行不同变换的链式动画。',
    techPoints: ['gsap.timeline()', '相对位置 "+=0.2"']
  },
  {
    id: 63,
    type: 'gsap',
    name: '标签跳转控制',
    componentName: 'G13_LabelJump',
    purpose: '可跳转到指定标记点的交互时间轴',
    description: '使用timeline.addLabel()和tl.play("label")，实现可跳转到指定标记点的交互式时间轴控制。',
    techPoints: ['timeline.addLabel()', 'tl.play("label")']
  },
  {
    id: 64,
    type: 'gsap',
    name: '嵌套时间轴',
    componentName: 'G14_NestedTimeline',
    purpose: '将多个子动画组合成主时间轴',
    description: '通过master.add(child, position)嵌套多个子时间轴，实现复杂动画的组合管理。',
    techPoints: ['master.add(child, position)', '嵌套']
  },
  {
    id: 65,
    type: 'gsap',
    name: '重叠并行动画',
    componentName: 'G15_OverlapParallel',
    purpose: '多个元素同时开始但不同步结束',
    description: '使用位置参数"<"和"<0.3"，实现多个元素同时开始但不同步结束的重叠并行动画。',
    techPoints: ['位置参数 "<"', '位置参数 "<0.3"']
  },
  {
    id: 66,
    type: 'gsap',
    name: '反向播放序列',
    componentName: 'G16_ReverseSequence',
    purpose: '正向播放后自动反向倒带',
    description: '通过timeline.yoyo(true)和repeat属性，实现动画正向播放后自动反向倒带的效果。',
    techPoints: ['timeline.yoyo(true)', 'repeat: 1']
  },
  {
    id: 67,
    type: 'gsap',
    name: '时间轴进度条',
    componentName: 'G17_ProgressBar',
    purpose: '动画进度与UI进度条绑定',
    description: '使用timeline.progress()和onUpdate回调，将动画进度实时绑定到UI进度条。',
    techPoints: ['timeline.progress()', 'onUpdate 回调']
  },
  {
    id: 68,
    type: 'gsap',
    name: '速度曲线变速',
    componentName: 'G18_SpeedCurve',
    purpose: '同一序列中不同元素使用不同缓动',
    description: '通过timeline.defaults和单独覆盖ease属性，实现同一序列中不同元素使用不同缓动曲线。',
    techPoints: ['timeline.defaults', '单独覆盖 ease']
  },
  {
    id: 69,
    type: 'gsap',
    name: '暂停恢复控制',
    componentName: 'G19_PauseResume',
    purpose: '用户点击暂停/继续的交互控制',
    description: '使用tl.pause()/tl.resume()/tl.kill()方法，实现用户可交互的暂停、继续和重置控制。',
    techPoints: ['tl.pause()', 'tl.resume()', 'tl.kill()']
  },
  {
    id: 70,
    type: 'gsap',
    name: '时间轴回调链',
    componentName: 'G20_CallbackChain',
    purpose: '动画节点触发函数调用',
    description: '通过onStart、onComplete和onUpdate回调，在动画的不同阶段触发自定义函数。',
    techPoints: ['onStart', 'onComplete', 'onUpdate', '回调']
  },
  {
    id: 71,
    type: 'gsap',
    name: '列表依次淡入',
    componentName: 'G21_ListStaggerFade',
    purpose: '列表项逐个从下方浮现',
    description: '使用stagger: 0.1配合gsap.from，实现列表项逐个从下方浮现的交错动画。',
    techPoints: ['stagger: 0.1', 'gsap.from()']
  },
  {
    id: 72,
    type: 'gsap',
    name: '从中心扩散',
    componentName: 'G22_CenterSpread',
    purpose: '网格元素从中心向四周依次动画',
    description: '通过stagger: { from: "center", amount: 0.5 }，实现网格元素从中心向四周依次动画。',
    techPoints: ['stagger: { from: "center", amount: 0.5 }']
  },
  {
    id: 73,
    type: 'gsap',
    name: '随机乱序出现',
    componentName: 'G23_RandomOrder',
    purpose: '元素以随机顺序依次入场',
    description: '使用stagger: { from: "random", each: 0.05 }，实现元素以随机顺序依次入场的惊喜效果。',
    techPoints: ['stagger: { from: "random", each: 0.05 }']
  },
  {
    id: 74,
    type: 'gsap',
    name: '边缘向中心汇聚',
    componentName: 'G24_EdgesConverge',
    purpose: '从两端向中间依次动画',
    description: '通过stagger: { from: "edges", amount: 0.4 }，实现元素从边缘向中心汇聚的动画效果。',
    techPoints: ['stagger: { from: "edges", amount: 0.4 }']
  },
  {
    id: 75,
    type: 'gsap',
    name: '网格波浪效果',
    componentName: 'G25_GridWave',
    purpose: '二维网格按行列产生波浪延迟',
    description: '使用stagger: { grid: [5,5], from: "center", axis: "y" }，实现二维网格按行列产生波浪延迟效果。',
    techPoints: ['stagger: { grid: [5,5], from: "center", axis: "y" }']
  },
  {
    id: 76,
    type: 'gsap',
    name: '文字字符逐个打印',
    componentName: 'G26_TextTypewriter',
    purpose: '每个字符独立延迟出现',
    description: '通过stagger: { each: 0.03 }应用于单个字符，实现打字机式的文字逐个打印效果。',
    techPoints: ['stagger: { each: 0.03 }', '单个字符']
  },
  {
    id: 77,
    type: 'gsap',
    name: '卡片堆叠展开',
    componentName: 'G27_CardFan',
    purpose: '一叠卡片扇形展开效果',
    description: '使用stagger: 0.1配合rotation和x属性，实现一叠卡片扇形展开的扑克牌效果。',
    techPoints: ['stagger: 0.1', 'rotation', 'x']
  },
  {
    id: 78,
    type: 'gsap',
    name: '圆形环绕入场',
    componentName: 'G28_CircleOrbit',
    purpose: '元素沿圆周位置依次进入',
    description: '通过stagger配合函数式x/y值(i) => Math.cos(i) * r，实现元素沿圆周位置依次入场。',
    techPoints: ['stagger', '函数式 x/y 值', '(i) => Math.cos(i) * r']
  },
  {
    id: 79,
    type: 'gsap',
    name: '瀑布流加载',
    componentName: 'G29_WaterfallLoad',
    purpose: '瀑布布局元素依次从下向上浮现',
    description: '使用stagger: { amount: 0.8, from: "start" }，实现瀑布流布局元素依次从下向上浮现。',
    techPoints: ['stagger: { amount: 0.8, from: "start" }']
  },
  {
    id: 80,
    type: 'gsap',
    name: '交错弹性缩放',
    componentName: 'G30_StaggerElasticScale',
    purpose: '元素以弹性缓动依次放大',
    description: '通过stagger: 0.05配合ease: "back.out(2)"，实现元素以弹性缓动依次放大的交错效果。',
    techPoints: ['stagger: 0.05', 'ease: "back.out(2)"']
  },
  {
    id: 81,
    type: 'gsap',
    name: '滚动视差背景',
    componentName: 'G31_ParallaxScroll',
    purpose: '背景图与内容不同速滚动',
    description: '使用ScrollTrigger.create()配合scrub: true和yPercent，实现背景与内容不同速的视差滚动效果。',
    techPoints: ['ScrollTrigger.create()', 'scrub: true', 'yPercent']
  },
  {
    id: 82,
    type: 'gsap',
    name: '滚动固定钉住',
    componentName: 'G32_PinSection',
    purpose: '区块滚动到视口后固定停留',
    description: '通过ScrollTrigger.pin和pinSpacing，实现区块滚动到视口后固定停留的钉住效果。',
    techPoints: ['ScrollTrigger.pin', 'pinSpacing']
  },
  {
    id: 83,
    type: 'gsap',
    name: '进度驱动动画',
    componentName: 'G33_ProgressDrive',
    purpose: '滚动位置直接映射动画进度',
    description: '使用scrub: 1配合长距离y/rotation，将滚动位置直接映射为动画进度，实现滚动驱动动画。',
    techPoints: ['scrub: 1', '长距离 y/rotation']
  },
  {
    id: 84,
    type: 'gsap',
    name: '进入视口触发',
    componentName: 'G34_ViewportTrigger',
    purpose: '元素进入视口时触发动画',
    description: '通过ScrollTrigger配合start: "top 80%"，实现元素进入视口时自动触发动画。',
    techPoints: ['ScrollTrigger', 'start: "top 80%"']
  },
  {
    id: 85,
    type: 'gsap',
    name: '滚动文字变色',
    componentName: 'G35_ScrollTextColor',
    purpose: '文字随滚动位置逐字变色',
    description: '使用ScrollTrigger配合splitText和stagger联动，实现文字随滚动位置逐字变色的效果。',
    techPoints: ['ScrollTrigger', 'splitText', 'stagger 联动']
  },
  {
    id: 86,
    type: 'gsap',
    name: '水平滚动容器',
    componentName: 'G36_HorizontalScroll',
    purpose: '垂直滚动转换为水平移动',
    description: '通过ScrollTrigger固定容器配合内部横向位移，将垂直滚动转换为水平移动的创意滚动效果。',
    techPoints: ['ScrollTrigger', '固定容器', '内部横向位移']
  },
  {
    id: 87,
    type: 'gsap',
    name: '滚动缩放揭示',
    componentName: 'G37_ScrollZoomReveal',
    purpose: '图片随滚动从缩放到全屏',
    description: '使用ScrollTrigger.scrub配合scale，实现图片随滚动从缩放到全屏的揭示效果。',
    techPoints: ['ScrollTrigger.scrub', 'scale']
  },
  {
    id: 88,
    type: 'gsap',
    name: '多区块依次固定',
    componentName: 'G38_MultiPin',
    purpose: '多个全屏区块依次固定切换',
    description: '通过多个ScrollTrigger.pin串联，实现多个全屏区块依次固定切换的滚动效果。',
    techPoints: ['多个 ScrollTrigger.pin', '串联']
  },
  {
    id: 89,
    type: 'gsap',
    name: '滚动速度响应',
    componentName: 'G39_ScrollVelocity',
    purpose: '根据滚动速度改变动画强度',
    description: '使用ScrollTrigger.getVelocity()动态调整动画参数，根据滚动速度改变动画强度。',
    techPoints: ['ScrollTrigger.getVelocity()', '动态调整']
  },
  {
    id: 90,
    type: 'gsap',
    name: '底部无限加载',
    componentName: 'G40_InfiniteLoad',
    purpose: '滚动到底部触发加载动画',
    description: '通过ScrollTrigger配合onEnter回调，实现滚动到底部触发加载动画和动态添加内容。',
    techPoints: ['ScrollTrigger', 'onEnter 回调', '动态添加内容']
  },
  {
    id: 91,
    type: 'gsap',
    name: 'SVG路径描边绘制',
    componentName: 'G41_SVGStrokeDraw',
    purpose: '线条沿SVG路径逐步绘制',
    description: '使用gsap.to配合stroke-dashoffset和drawSVG，实现线条沿SVG路径逐步绘制的动画。',
    techPoints: ['gsap.to()', 'stroke-dashoffset', 'drawSVG']
  },
  {
    id: 92,
    type: 'gsap',
    name: 'SVG形状变形',
    componentName: 'G42_SVGShapeMorph',
    purpose: '一个形状平滑过渡到另一个形状',
    description: '通过gsap.to配合attr: { d: "..." }（MorphSVG），实现SVG形状之间的平滑过渡变形。',
    techPoints: ['gsap.to()', 'attr: { d: "..." }', 'MorphSVG']
  },
  {
    id: 93,
    type: 'gsap',
    name: '文字乱码解密',
    componentName: 'G43_TextScramble',
    purpose: '文字从乱码字符解码为正确内容',
    description: '使用onUpdate回调配合随机字符替换算法，实现文字从乱码字符解码为正确内容的特效。',
    techPoints: ['onUpdate 回调', '随机字符替换']
  },
  {
    id: 94,
    type: 'gsap',
    name: '磁性吸附按钮',
    componentName: 'G44_MagneticButton',
    purpose: '鼠标靠近时按钮被吸引过去',
    description: '通过gsap.quickTo配合mousemove事件监听，实现鼠标靠近时按钮被磁性吸引的交互效果。',
    techPoints: ['gsap.quickTo()', 'mousemove 事件监听']
  },
  {
    id: 95,
    type: 'gsap',
    name: '物理弹跳落地',
    componentName: 'G45_PhysicsBounce',
    purpose: '物体下落并带多次反弹的物理感',
    description: '使用gsap.to配合bounce.out缓动和多段时间轴，模拟物体下落并带多次反弹的物理效果。',
    techPoints: ['gsap.to()', 'bounce.out', '多段时间轴']
  },
  {
    id: 96,
    type: 'gsap',
    name: '3D立方体旋转',
    componentName: 'G46_Cube3DRotate',
    purpose: '六面立方体3D空间旋转展示',
    description: '通过gsap.to配合rotationX/rotationY和transformOrigin/transformPerspective，实现3D立方体空间旋转。',
    techPoints: ['gsap.to()', 'rotationX/rotationY', 'transformOrigin', 'transformPerspective']
  },
  {
    id: 97,
    type: 'gsap',
    name: '分屏对比滑块',
    componentName: 'G47_BeforeAfterSlider',
    purpose: '拖动滑块对比前后两张图片',
    description: '使用gsap.quickTo配合clipPath或width绑定鼠标，实现拖动滑块对比前后图片的交互效果。',
    techPoints: ['gsap.quickTo()', 'clipPath', 'width 绑定鼠标']
  },
  {
    id: 98,
    type: 'gsap',
    name: '音频可视化条',
    componentName: 'G48_AudioVisualizer',
    purpose: '根据音频频率跳动的频谱条',
    description: '通过gsap.to配合函数式高度值和实时数据驱动，模拟音频频率跳动的频谱可视化效果。',
    techPoints: ['gsap.to()', '函数式高度值', '实时数据驱动']
  },
  {
    id: 99,
    type: 'gsap',
    name: '鼠标轨迹跟随',
    componentName: 'G49_MouseTrail',
    purpose: '元素延迟跟随鼠标移动轨迹',
    description: '使用gsap.quickTo配合delay累积或gsap.to动态目标，实现元素延迟跟随鼠标移动轨迹的效果。',
    techPoints: ['gsap.quickTo()', 'delay 累积', 'gsap.to() 动态目标']
  },
  {
    id: 100,
    type: 'gsap',
    name: '复杂电影片头',
    componentName: 'G50_CinematicIntro',
    purpose: '多图层、多时间轴组合的电影级开场',
    description: '通过gsap.timeline嵌套配合ScrollTrigger、stagger和labels综合编排，实现电影级的复杂开场动画。',
    techPoints: ['gsap.timeline() 嵌套', 'ScrollTrigger', 'stagger', 'labels', '综合编排']
  }
];
