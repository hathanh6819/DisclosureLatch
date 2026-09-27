$ErrorActionPreference = "Stop"
$env:PYTHONIOENCODING = "utf-8"

Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    python -m genvm_linter.cli check contracts\disclosure_latch.py
    python -m genvm_linter.cli check contracts\sec_source_probe.py
    python -m pytest -q -p no:cacheprovider
    Push-Location frontend
    try {
        npm test
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        npm run build
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    finally {
        Pop-Location
    }
}
finally {
    Pop-Location
}
