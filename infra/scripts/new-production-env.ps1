param(
    [Parameter(Mandatory = $true)]
    [string]$Domain,
    [Parameter(Mandatory = $true)]
    [string]$OpenAiApiKey,
    [Parameter(Mandatory = $true)]
    [string]$OpenAiModel
)

$ErrorActionPreference = 'Stop'
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$target = Join-Path $repositoryRoot '.env.production'
if (Test-Path -LiteralPath $target) {
    throw "Refusing to overwrite existing $target"
}

function New-Secret {
    $bytes = New-Object byte[] 32
    [Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    return [Convert]::ToHexString($bytes).ToLowerInvariant()
}

$mysqlPassword = New-Secret
$content = @(
    "VISAFY_DOMAIN=$Domain"
    'NEXT_PUBLIC_DEFAULT_LANGUAGE=ko'
    'MYSQL_DATABASE=visafy'
    'MYSQL_USER=visafy'
    "MYSQL_PASSWORD=$mysqlPassword"
    "MYSQL_ROOT_PASSWORD=$(New-Secret)"
    "DB_PASSWORD=$mysqlPassword"
    'ADMIN_USERNAME=admin'
    "ADMIN_PASSWORD=$(New-Secret)"
    "ADMIN_JWT_SECRET=$(New-Secret)"
    "RAG_INTERNAL_TOKEN=$(New-Secret)"
    'LLM_PROVIDER=openai'
    "OPENAI_API_KEY=$OpenAiApiKey"
    "OPENAI_MODEL=$OpenAiModel"
    'OPENAI_REASONING_EFFORT=medium'
    'EMBEDDING_PROVIDER=fastembed'
    'EMBEDDING_MODEL=intfloat/multilingual-e5-small'
    'EMBEDDING_DIMENSIONS=384'
)
[IO.File]::WriteAllLines($target, $content, [Text.UTF8Encoding]::new($false))
Write-Output "Created $target. This file is ignored by Git."
