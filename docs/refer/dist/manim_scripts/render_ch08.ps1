# render_ch08.ps1 - Render all Chapter 8 Manim videos
$ErrorActionPreference = "Continue"
$ScriptDir = "c:\gailvlun\manim_scripts"
$PublicDir = "c:\gailvlun\public\videos\ch08"

$videos = @(
    @{ Script="ch08_01_intuition.py";   Scene="HypothesisIntuitionScene"; OutFile="hypothesis_intuition.mp4" },
    @{ Script="ch08_02_setup.py";       Scene="HypothesisSetupScene";     OutFile="hypothesis_setup.mp4" },
    @{ Script="ch08_03_significance.py"; Scene="SignificanceLevelScene";  OutFile="significance_level.mp4" },
    @{ Script="ch08_hypothesis.py";     Scene="HypothesisErrorScene";     OutFile="hypothesis_errors.mp4" },
    @{ Script="ch08_05_rejection.py";   Scene="RejectionRegionScene";     OutFile="rejection_region.mp4" },
    @{ Script="ch08_06_pvalue.py";      Scene="PValueScene";              OutFile="p_value.mp4" },
    @{ Script="ch08_07_ztest.py";       Scene="ZTestScene";               OutFile="z_test.mp4" },
    @{ Script="ch08_08_ttest.py";       Scene="TTestScene";               OutFile="t_test.mp4" },
    @{ Script="ch08_09_twosample.py";   Scene="TwoSampleScene";           OutFile="two_sample.mp4" },
    @{ Script="ch08_10_paired.py";      Scene="PairedTestScene";          OutFile="paired_test.mp4" },
    @{ Script="ch08_11_chisquare.py";   Scene="ChiSquareTestScene";       OutFile="chi_square_test.mp4" },
    @{ Script="ch08_12_ftest.py";       Scene="FTestScene";               OutFile="f_test.mp4" },
    @{ Script="ch08_13_power.py";       Scene="PowerAnalysisScene";       OutFile="power_analysis.mp4" }
)

if (!(Test-Path $PublicDir)) { New-Item -ItemType Directory -Force -Path $PublicDir | Out-Null }

$success = 0
$failed = @()

foreach ($v in $videos) {
    $scriptPath = Join-Path $ScriptDir $v.Script
    $targetFile = Join-Path $PublicDir $v.OutFile

    Write-Host ">>> Rendering $($v.Script) [$($v.Scene)]..." -ForegroundColor Cyan
    Set-Location $ScriptDir
    python -m manim -qm $v.Script $v.Scene 2>&1 | Out-Null

    $found = Get-ChildItem -Path $ScriptDir -Recurse -Filter "$($v.Scene).mp4" -ErrorAction SilentlyContinue |
        Where-Object { $_.FullName -match "720p30" } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if ($found) {
        Copy-Item $found.FullName $targetFile -Force
        Write-Host "  OK -> $($v.OutFile)" -ForegroundColor Green
        $success++
    } else {
        Write-Host "  FAILED: output not found for $($v.Scene)" -ForegroundColor Red
        $failed += $v.Scene
    }
}

Write-Host ""
Write-Host "=== Done: $success / $($videos.Count) ===" -ForegroundColor Cyan
if ($failed.Count -gt 0) {
    Write-Host "Failed: $($failed -join ', ')" -ForegroundColor Red
}
