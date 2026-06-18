# render_all.ps1
# 一键渲染所有 Manim 视频并复制到 public/videos/
# 使用方法：在 manim_scripts 目录下运行：.\render_all.ps1

$ErrorActionPreference = "Continue"

# 添加 MiKTeX 路径（pdflatex 依赖）
$miktexPath = "C:\Users\Lenovo\AppData\Local\Programs\MiKTeX\miktex\bin\x64"
if (Test-Path $miktexPath) {
    $env:PATH = "$miktexPath;$env:PATH"
    Write-Host "✓ 已添加 MiKTeX 路径到 PATH" -ForegroundColor Green
} else {
    Write-Host "⚠ 未找到 MiKTeX，尝试从系统 PATH 查找 pdflatex..." -ForegroundColor Yellow
}

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PublicDir = Join-Path $ScriptDir "..\public\videos"

Write-Host "=== Manim 概率论视频批量渲染工具 ===" -ForegroundColor Cyan
Write-Host "渲染质量: 低质量预览（-ql），可改为 -qm 中等或 -qh 高质量" -ForegroundColor Yellow
Write-Host ""

$videos = @(
    @{ Script="ch03_convolution.py";   Scene="ConvolutionScene";       OutDir="ch03"; OutFile="convolution.mp4"       },
    @{ Script="ch04_expectation.py";   Scene="ExpectationVarianceScene"; OutDir="ch04"; OutFile="expectation_gravity.mp4" },
    @{ Script="ch05_clt.py";           Scene="CLTScene";                OutDir="ch05"; OutFile="clt_convergence.mp4"   },
    @{ Script="ch06_sampling_dist.py"; Scene="SamplingDistScene";       OutDir="ch06"; OutFile="t_distribution.mp4"    },
    @{ Script="ch07_confidence.py";    Scene="ConfidenceIntervalScene"; OutDir="ch07"; OutFile="confidence_interval.mp4"},
    @{ Script="ch08_hypothesis.py";    Scene="HypothesisErrorScene";    OutDir="ch08"; OutFile="hypothesis_errors.mp4"  },
    @{ Script="ch09_regression.py";    Scene="RegressionScene";         OutDir="ch09"; OutFile="regression_line.mp4"   }
)

$success = 0
$failed = 0

foreach ($v in $videos) {
    $scriptPath = Join-Path $ScriptDir $v.Script
    $targetDir  = Join-Path $PublicDir $v.OutDir
    $targetFile = Join-Path $targetDir $v.OutFile

    Write-Host "► 渲染 $($v.Script) [$($v.Scene)]..." -ForegroundColor White

    # 执行渲染（低质量，720p，适合本地预览）
    python -m manim -ql --disable_caching "$scriptPath" $v.Scene 2>&1 | ForEach-Object {
        if ($_ -match "Error|error") { Write-Host $_ -ForegroundColor Red }
        elseif ($_ -match "File ready") { Write-Host $_ -ForegroundColor Green }
    }

    # 查找生成的 mp4 文件（manim 输出路径）
    $searchPattern = "media\videos\*\480p15\$($v.Scene).mp4"
    $found = Get-ChildItem -Path $ScriptDir -Recurse -Filter "$($v.Scene).mp4" -ErrorAction SilentlyContinue | Select-Object -First 1

    if ($found) {
        # 确保目标目录存在
        if (!(Test-Path $targetDir)) {
            New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
        }
        Copy-Item $found.FullName $targetFile -Force
        Write-Host "  ✓ 已复制到 public/videos/$($v.OutDir)/$($v.OutFile)" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  ✗ 未找到渲染输出，请检查脚本错误" -ForegroundColor Red
        $failed++
    }
    Write-Host ""
}

Write-Host "=== 渲染完成 ===" -ForegroundColor Cyan
Write-Host "成功: $success / $($videos.Count)" -ForegroundColor Green
if ($failed -gt 0) {
    Write-Host "失败: $failed" -ForegroundColor Red
}
Write-Host ""
Write-Host "视频文件位置: $PublicDir" -ForegroundColor Yellow
Write-Host "现在可以在浏览器中查看视频效果！" -ForegroundColor Green
