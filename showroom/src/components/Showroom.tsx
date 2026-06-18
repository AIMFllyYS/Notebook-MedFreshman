import { useState, useCallback, lazy, Suspense, useMemo } from 'react';
import { showroomData } from '../data/showroomData';
import type { ShowroomItem } from '../data/showroomData';
import './Showroom.css';

// Lazy load all Three.js components
const threeComponents: Record<string, React.LazyExoticComponent<React.FC>> = {
  T1_RotatingCubes: lazy(() => import('./three/T1_RotatingCubes')),
  T2_GlassSphere: lazy(() => import('./three/T2_GlassSphere')),
  T3_EarthGlobe: lazy(() => import('./three/T3_EarthGlobe')),
  T4_MultiMaterialDice: lazy(() => import('./three/T4_MultiMaterialDice')),
  T5_MorphingBlob: lazy(() => import('./three/T5_MorphingBlob')),
  T6_WireframeTopology: lazy(() => import('./three/T6_WireframeTopology')),
  T7_MetalShowcase: lazy(() => import('./three/T7_MetalShowcase')),
  T8_NormalMapWall: lazy(() => import('./three/T8_NormalMapWall')),
  T9_VertexColorTerrain: lazy(() => import('./three/T9_VertexColorTerrain')),
  T10_MatCapSculpture: lazy(() => import('./three/T10_MatCapSculpture')),
  T11_ThreePointLighting: lazy(() => import('./three/T11_ThreePointLighting')),
  T12_VolumetricLight: lazy(() => import('./three/T12_VolumetricLight')),
  T13_DayNightCycle: lazy(() => import('./three/T13_DayNightCycle')),
  T14_DecalProjection: lazy(() => import('./three/T14_DecalProjection')),
  T15_SSAO: lazy(() => import('./three/T15_SSAO')),
  T16_Caustics: lazy(() => import('./three/T16_Caustics')),
  T17_IESLight: lazy(() => import('./three/T17_IESLight')),
  T18_DynamicSoftShadow: lazy(() => import('./three/T18_DynamicSoftShadow')),
  T19_SnowParticles: lazy(() => import('./three/T19_SnowParticles')),
  T20_FireSmoke: lazy(() => import('./three/T20_FireSmoke')),
  T21_MagicTrail: lazy(() => import('./three/T21_MagicTrail')),
  T22_ParticleText: lazy(() => import('./three/T22_ParticleText')),
  T23_WarpSpeed: lazy(() => import('./three/T23_WarpSpeed')),
  T24_ParticleFluid: lazy(() => import('./three/T24_ParticleFluid')),
  T25_PollenDust: lazy(() => import('./three/T25_PollenDust')),
  T26_WaterShader: lazy(() => import('./three/T26_WaterShader')),
  T27_HologramScan: lazy(() => import('./three/T27_HologramScan')),
  T28_DissolveEffect: lazy(() => import('./three/T28_DissolveEffect')),
  T29_ParallaxOcclusion: lazy(() => import('./three/T29_ParallaxOcclusion')),
  T30_ToonShading: lazy(() => import('./three/T30_ToonShading')),
  T31_BloomGlow: lazy(() => import('./three/T31_BloomGlow')),
  T32_DepthOfField: lazy(() => import('./three/T32_DepthOfField')),
  T33_ToneMapping: lazy(() => import('./three/T33_ToneMapping')),
  T34_SSR: lazy(() => import('./three/T34_SSR')),
  T35_MotionBlur: lazy(() => import('./three/T35_MotionBlur')),
  T36_CRTEffect: lazy(() => import('./three/T36_CRTEffect')),
  T37_OrbitViewer: lazy(() => import('./three/T37_OrbitViewer')),
  T38_FirstPersonRoam: lazy(() => import('./three/T38_FirstPersonRoam')),
  T39_RaycastAnnotation: lazy(() => import('./three/T39_RaycastAnnotation')),
  T40_GesturePainting: lazy(() => import('./three/T40_GesturePainting')),
  T41_ClothSimulation: lazy(() => import('./three/T41_ClothSimulation')),
  T42_RigidBodyPhysics: lazy(() => import('./three/T42_RigidBodyPhysics')),
  T43_SkeletalAnimation: lazy(() => import('./three/T43_SkeletalAnimation')),
  T44_SoftBodyJelly: lazy(() => import('./three/T44_SoftBodyJelly')),
  T45_VolumetricClouds: lazy(() => import('./three/T45_VolumetricClouds')),
  T46_PathTracing: lazy(() => import('./three/T46_PathTracing')),
  T47_TerrainLOD: lazy(() => import('./three/T47_TerrainLOD')),
  T48_SubsurfaceScattering: lazy(() => import('./three/T48_SubsurfaceScattering')),
  T49_ProceduralCity: lazy(() => import('./three/T49_ProceduralCity')),
  T50_MirrorReflection: lazy(() => import('./three/T50_MirrorReflection')),
};

// Lazy load all GSAP components
const gsapComponents: Record<string, React.LazyExoticComponent<React.FC>> = {
  G1_FadeIn: lazy(() => import('./gsap/G1_FadeIn')),
  G2_ElasticScale: lazy(() => import('./gsap/G2_ElasticScale')),
  G3_SmoothSlide: lazy(() => import('./gsap/G3_SmoothSlide')),
  G4_RotateIn: lazy(() => import('./gsap/G4_RotateIn')),
  G5_SkewAppear: lazy(() => import('./gsap/G5_SkewAppear')),
  G6_ColorTransition: lazy(() => import('./gsap/G6_ColorTransition')),
  G7_OpacityPulse: lazy(() => import('./gsap/G7_OpacityPulse')),
  G8_BorderRadiusMorph: lazy(() => import('./gsap/G8_BorderRadiusMorph')),
  G9_DimensionExpand: lazy(() => import('./gsap/G9_DimensionExpand')),
  G10_3DCardFlip: lazy(() => import('./gsap/G10_3DCardFlip')),
  G11_StepGuide: lazy(() => import('./gsap/G11_StepGuide')),
  G12_ChainIcons: lazy(() => import('./gsap/G12_ChainIcons')),
  G13_LabelJump: lazy(() => import('./gsap/G13_LabelJump')),
  G14_NestedTimeline: lazy(() => import('./gsap/G14_NestedTimeline')),
  G15_OverlapParallel: lazy(() => import('./gsap/G15_OverlapParallel')),
  G16_ReverseSequence: lazy(() => import('./gsap/G16_ReverseSequence')),
  G17_ProgressBar: lazy(() => import('./gsap/G17_ProgressBar')),
  G18_SpeedCurve: lazy(() => import('./gsap/G18_SpeedCurve')),
  G19_PauseResume: lazy(() => import('./gsap/G19_PauseResume')),
  G20_CallbackChain: lazy(() => import('./gsap/G20_CallbackChain')),
  G21_ListStaggerFade: lazy(() => import('./gsap/G21_ListStaggerFade')),
  G22_CenterSpread: lazy(() => import('./gsap/G22_CenterSpread')),
  G23_RandomOrder: lazy(() => import('./gsap/G23_RandomOrder')),
  G24_EdgesConverge: lazy(() => import('./gsap/G24_EdgesConverge')),
  G25_GridWave: lazy(() => import('./gsap/G25_GridWave')),
  G26_TextTypewriter: lazy(() => import('./gsap/G26_TextTypewriter')),
  G27_CardFan: lazy(() => import('./gsap/G27_CardFan')),
  G28_CircleOrbit: lazy(() => import('./gsap/G28_CircleOrbit')),
  G29_WaterfallLoad: lazy(() => import('./gsap/G29_WaterfallLoad')),
  G30_StaggerElasticScale: lazy(() => import('./gsap/G30_StaggerElasticScale')),
  G31_ParallaxScroll: lazy(() => import('./gsap/G31_ParallaxScroll')),
  G32_PinSection: lazy(() => import('./gsap/G32_PinSection')),
  G33_ProgressDrive: lazy(() => import('./gsap/G33_ProgressDrive')),
  G34_ViewportTrigger: lazy(() => import('./gsap/G34_ViewportTrigger')),
  G35_ScrollTextColor: lazy(() => import('./gsap/G35_ScrollTextColor')),
  G36_HorizontalScroll: lazy(() => import('./gsap/G36_HorizontalScroll')),
  G37_ScrollZoomReveal: lazy(() => import('./gsap/G37_ScrollZoomReveal')),
  G38_MultiPin: lazy(() => import('./gsap/G38_MultiPin')),
  G39_ScrollVelocity: lazy(() => import('./gsap/G39_ScrollVelocity')),
  G40_InfiniteLoad: lazy(() => import('./gsap/G40_InfiniteLoad')),
  G41_SVGStrokeDraw: lazy(() => import('./gsap/G41_SVGStrokeDraw')),
  G42_SVGShapeMorph: lazy(() => import('./gsap/G42_SVGShapeMorph')),
  G43_TextScramble: lazy(() => import('./gsap/G43_TextScramble')),
  G44_MagneticButton: lazy(() => import('./gsap/G44_MagneticButton')),
  G45_PhysicsBounce: lazy(() => import('./gsap/G45_PhysicsBounce')),
  G46_Cube3DRotate: lazy(() => import('./gsap/G46_Cube3DRotate')),
  G47_BeforeAfterSlider: lazy(() => import('./gsap/G47_BeforeAfterSlider')),
  G48_AudioVisualizer: lazy(() => import('./gsap/G48_AudioVisualizer')),
  G49_MouseTrail: lazy(() => import('./gsap/G49_MouseTrail')),
  G50_CinematicIntro: lazy(() => import('./gsap/G50_CinematicIntro')),
};

function LoadingFallback() {
  return (
    <div className="sr-loading">
      <div className="sr-loading-spinner" />
      <div className="sr-loading-text">加载效果中...</div>
    </div>
  );
}

function EffectViewer({ item }: { item: ShowroomItem }) {
  const Component = useMemo(() => {
    if (item.type === 'three') {
      return threeComponents[item.componentName];
    }
    return gsapComponents[item.componentName];
  }, [item]);

  if (!Component) {
    return (
      <div className="sr-error">
        组件未找到: {item.componentName}
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Component />
    </Suspense>
  );
}

export default function Showroom() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showDocs, setShowDocs] = useState(false);
  const [filter, setFilter] = useState<'all' | 'three' | 'gsap'>('all');

  const filteredData = useMemo(() => {
    if (filter === 'all') return showroomData;
    return showroomData.filter(item => item.type === filter);
  }, [filter]);

  const currentItem = filteredData[currentIndex] || filteredData[0];

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % filteredData.length);
  }, [filteredData.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + filteredData.length) % filteredData.length);
  }, [filteredData.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
    setShowDocs(false);
  }, []);

  // Reset index when filter changes
  useMemo(() => {
    setCurrentIndex(0);
  }, [filter]);

  return (
    <div className="sr-container">
      {/* Header */}
      <header className="sr-header">
        <div className="sr-header-left">
          <div className="sr-logo">
            <div className="sr-logo-mark">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <defs>
                  <linearGradient id="kimiGrad" x1="0" y1="0" x2="28" y2="28">
                    <stop offset="0%" stopColor="#64d2ff"/>
                    <stop offset="100%" stopColor="#a855f7"/>
                  </linearGradient>
                </defs>
                <rect x="2" y="2" width="24" height="24" rx="6" stroke="url(#kimiGrad)" strokeWidth="2" fill="none"/>
                <path d="M8 20L14 8L20 20" stroke="url(#kimiGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                <circle cx="14" cy="14" r="3" fill="url(#kimiGrad)"/>
              </svg>
            </div>
            <div className="sr-logo-text-wrap">
              <span className="sr-logo-brand">Kimi K2.6</span>
              <span className="sr-logo-text">效果展厅</span>
            </div>
          </div>
          <div className="sr-filter">
            {(['all', 'three', 'gsap'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`sr-filter-btn ${filter === f ? 'active' : ''}`}
              >
                {f === 'all' ? '全部' : f === 'three' ? 'Three.js' : 'GSAP'}
              </button>
            ))}
          </div>
        </div>
        <div className="sr-header-right">
          <span className="sr-counter">
            {currentIndex + 1} / {filteredData.length}
          </span>
          <button
            onClick={() => setShowDocs(!showDocs)}
            className={`sr-doc-toggle ${showDocs ? 'active' : ''}`}
          >
            {showDocs ? '关闭文档' : '查看文档'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="sr-main">
        {/* Effect Display Area */}
        <div className="sr-stage">
          {/* Info Overlay - Top Left */}
          <div className="sr-info-overlay">
            <div className="sr-info-badge">
              <span className={`sr-info-type ${currentItem?.type}`}>
                {currentItem?.type === 'three' ? 'Three.js' : 'GSAP'}
              </span>
              <span className="sr-info-id">#{currentItem?.id}</span>
            </div>
            <h2 className="sr-info-name">{currentItem?.name}</h2>
            <p className="sr-info-purpose">{currentItem?.purpose}</p>
            <div className="sr-info-tech">
              {currentItem?.techPoints.slice(0, 4).map((tech, i) => (
                <span key={i} className="sr-info-tag">{tech}</span>
              ))}
              {currentItem && currentItem.techPoints.length > 4 && (
                <span className="sr-info-tag more">+{currentItem.techPoints.length - 4}</span>
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button onClick={goPrev} className="sr-nav-arrow sr-nav-prev">
            &#9664;
          </button>
          <button onClick={goNext} className="sr-nav-arrow sr-nav-next">
            &#9654;
          </button>

          {/* Effect Container */}
          <div className="sr-effect-box">
            {currentItem && <EffectViewer item={currentItem} />}
          </div>
        </div>

        {/* Documentation Panel */}
        {showDocs && (
          <div className="sr-docs-panel">
            <div className="sr-docs-header">
              <h2 className="sr-docs-title">{currentItem?.name}</h2>
              <button onClick={() => setShowDocs(false)} className="sr-docs-close">&times;</button>
            </div>
            <div className="sr-docs-content">
              <div className="sr-docs-section">
                <span className={`sr-docs-type ${currentItem?.type}`}>
                  {currentItem?.type === 'three' ? 'Three.js' : 'GSAP'}
                </span>
                <span className="sr-docs-id">#{currentItem?.id}</span>
              </div>

              <div className="sr-docs-section">
                <h3 className="sr-docs-label">用途</h3>
                <p className="sr-docs-text">{currentItem?.purpose}</p>
              </div>

              <div className="sr-docs-section">
                <h3 className="sr-docs-label">详细介绍</h3>
                <p className="sr-docs-text">{currentItem?.description}</p>
              </div>

              <div className="sr-docs-section">
                <h3 className="sr-docs-label">核心技术点</h3>
                <div className="sr-docs-tags">
                  {currentItem?.techPoints.map((tech, i) => (
                    <span key={i} className="sr-docs-tag">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="sr-bottom-nav">
        <div className="sr-bottom-scroll">
          {filteredData.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToIndex(index)}
              className={`sr-bottom-item ${index === currentIndex ? 'active' : ''}`}
            >
              <div className="sr-bottom-num">
                {item.type === 'three' ? 'T' : 'G'}{item.id <= 50 ? item.id : item.id - 50}
              </div>
              <div className="sr-bottom-name">{item.name}</div>
              <div className={`sr-bottom-dot ${item.type}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
