param(
    [switch]$BuildImages,
    [switch]$RunServices
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$temporaryEnv = Join-Path ([IO.Path]::GetTempPath()) ("ssafin-preflight-{0}.env" -f [Guid]::NewGuid().ToString('N'))
$composeFiles = @(
    '-f', 'infra/docker-compose.yml',
    '-f', 'infra/docker-compose.prod.yml',
    '-f', 'infra/docker-compose.preflight.yml',
    '--env-file', $temporaryEnv
)
$started = $false
$locationPushed = $false
$names = @(
    'VISAFY_DOMAIN', 'NEXT_PUBLIC_DEFAULT_LANGUAGE', 'MYSQL_DATABASE', 'MYSQL_USER',
    'MYSQL_PASSWORD', 'MYSQL_ROOT_PASSWORD', 'DB_PASSWORD', 'ADMIN_USERNAME',
    'ADMIN_PASSWORD', 'ADMIN_JWT_SECRET', 'RAG_INTERNAL_TOKEN', 'LLM_PROVIDER',
    'OPENAI_API_KEY', 'OPENAI_MODEL', 'OPENAI_REASONING_EFFORT',
    'EMBEDDING_PROVIDER', 'EMBEDDING_MODEL', 'EMBEDDING_DIMENSIONS'
)
$original = @{}

function Invoke-Compose {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Arguments)
    & docker compose @composeFiles @Arguments
    if ($LASTEXITCODE -ne 0) { throw "docker compose failed: $($Arguments -join ' ')" }
}

try {
    & docker compose version | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Docker Engine with the Compose plugin is required.' }

    $values = [ordered]@{
        VISAFY_DOMAIN = 'localhost'
        NEXT_PUBLIC_DEFAULT_LANGUAGE = 'ko'
        MYSQL_DATABASE = 'visafy'
        MYSQL_USER = 'visafy'
        MYSQL_PASSWORD = 'preflight-db-0123456789abcdef'
        MYSQL_ROOT_PASSWORD = 'preflight-root-0123456789abcdef'
        DB_PASSWORD = 'preflight-db-0123456789abcdef'
        ADMIN_USERNAME = 'preflight_admin_0123456789'
        ADMIN_PASSWORD = 'preflight-admin-0123456789abcdef'
        ADMIN_JWT_SECRET = 'preflight-jwt-0123456789abcdef'
        RAG_INTERNAL_TOKEN = 'preflight-rag-0123456789abcdef'
        LLM_PROVIDER = 'none'
        OPENAI_API_KEY = 'preflight-not-a-real-key'
        OPENAI_MODEL = 'gpt-5.6-terra'
        OPENAI_REASONING_EFFORT = 'medium'
        EMBEDDING_PROVIDER = 'fastembed'
        EMBEDDING_MODEL = 'intfloat/multilingual-e5-small'
        EMBEDDING_DIMENSIONS = '384'
    }
    $lines = foreach ($entry in $values.GetEnumerator()) { "$($entry.Key)=$($entry.Value)" }
    [IO.File]::WriteAllLines($temporaryEnv, $lines, [Text.UTF8Encoding]::new($false))

    foreach ($name in $names) {
        $original[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
        [Environment]::SetEnvironmentVariable($name, $values[$name], 'Process')
    }

    Push-Location $repositoryRoot
    $locationPushed = $true
    python ai-service/scripts/validate_production_config.py
    if ($LASTEXITCODE -ne 0) { throw 'Production configuration validation failed.' }

    Invoke-Compose config --quiet
    $configuration = (Invoke-Compose config --format json | Out-String | ConvertFrom-Json)
    foreach ($service in 'mysql', 'backend', 'ai-service') {
        $ports = $configuration.services.$service.ports
        if ($null -ne $ports -and @($ports).Count -gt 0) {
            throw "Production service '$service' unexpectedly publishes a host port."
        }
    }
    if (@($configuration.services.caddy.ports).Count -lt 2) {
        throw 'Caddy must publish HTTP and HTTPS ports in the preflight topology.'
    }
    Write-Output 'PASS  Production Compose topology and private service ports'

    if ($BuildImages -or $RunServices) {
        Invoke-Compose build
        Write-Output 'PASS  Production images built successfully'
    }

    if ($RunServices) {
        Invoke-Compose up --detach --wait --wait-timeout 300
        $started = $true
        $health = & curl.exe --insecure --silent --show-error --fail --max-time 20 https://localhost:8443/api/health
        if ($LASTEXITCODE -ne 0) { throw 'Local production HTTPS health check failed.' }
        $adminStatus = & curl.exe --insecure --silent --output NUL --write-out '%{http_code}' https://localhost:8443/api/admin/auth/check
        $internalStatus = & curl.exe --insecure --silent --output NUL --write-out '%{http_code}' https://localhost:8443/internal/rag/retrieve
        $swaggerStatus = & curl.exe --insecure --silent --output NUL --write-out '%{http_code}' https://localhost:8443/v3/api-docs
        if ($adminStatus -ne '401' -or $internalStatus -ne '404' -or $swaggerStatus -ne '404') {
            throw "Security smoke failed: admin=$adminStatus internal=$internalStatus swagger=$swaggerStatus"
        }
        Write-Output "PASS  Local production HTTPS and security smoke ($health)"
    }
}
finally {
    if ($started) {
        & docker compose @composeFiles down --volumes --remove-orphans
    }
    if ($locationPushed) { Pop-Location }
    foreach ($name in $names) {
        [Environment]::SetEnvironmentVariable($name, $original[$name], 'Process')
    }
    if (Test-Path -LiteralPath $temporaryEnv) {
        Remove-Item -LiteralPath $temporaryEnv -Force
    }
}
